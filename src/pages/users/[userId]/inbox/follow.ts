import { json } from "next-runtime";
import { z } from "zod";
import { queue } from "../../../../server/background/queue";
import { prisma } from "../../../../server/db";
import { env } from "../../../../utils/env";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const followActivitySchema = z
  .object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z
      .string()
      .url()
      .transform((val, ctx) => {
        if (new URL(val).host != env.HOST) {
          ctx.addIssue({
            code: "custom",
            message: "フォロー先が自ホストではありません",
          });
          return z.NEVER;
        }
        return val;
      }),
  })
  .passthrough();

const resolveUserId = (actorId: URL) => {
  if (!actorId.pathname.startsWith("/users/")) {
    return null;
  }
  return actorId.pathname.split("/")[2];
};

export const follow: InboxFunction = async (activity, actorUser, options) => {
  const parsedFollow = followActivitySchema.safeParse(activity);
  if (!parsedFollow.success) {
    logger.info(
      // TODO: envディレクトリをts化してformatErrorsを切り出す
      "検証失敗: " + parsedFollow.error.issues[0]?.message
    );
    return json({}, 400);
  }
  const followeeId = resolveUserId(new URL(parsedFollow.data.object));
  if (!followeeId) {
    logger.info(
      "フォローリクエストで指定されたフォロイーURLが不正でした: " +
        parsedFollow.data.object
    );
    return json({}, 400);
  }
  const followee = await prisma.user.findFirst({
    where: { id: followeeId },
  });
  if (!followee) {
    logger.info("フォローリクエストで指定されたフォロイーが存在しませんでした");
    return json({}, 400);
  }
  if (!followee.privateKey) {
    logger.info(
      "フォローリクエストで指定されたフォロイーが秘密鍵を持っていませんでした"
    );
    // 自ホストのユーザーなら秘密鍵を持っているはずなので、異常な動作
    return json({}, 503);
  }
  try {
    if (options?.undo) {
      await prisma.follow.delete({
        where: {
          followeeId_followerId: {
            followeeId: followee.id,
            followerId: actorUser.id,
          },
        },
      });
      logger.info("完了: アンフォロー");
    } else {
      await prisma.follow.create({
        data: {
          followeeId: followee.id,
          followerId: actorUser.id,
        },
      });
      logger.info("完了: フォロー");
    }
  } catch (e) {
    logger.warn(`フォロー/アンフォローに失敗しました: ${e}`);
    return json({}, 400);
  }
  queue.push({
    runner: "relayActivity",
    params: {
      activity: {
        type: "Accept",
        actor: new URL(`https://${env.HOST}/users/${followee.id}`),
        object: {
          ...parsedFollow.data,
          actor: new URL(parsedFollow.data.actor),
          object: new URL(parsedFollow.data.object),
        },
      },
      publicKeyId: `https://${env.HOST}/users/${followee.id}#main-key`,
      privateKey: followee.privateKey,
    },
  });
  return json({}, 200);
};
