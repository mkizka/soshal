import { json } from "next-runtime";
import { z } from "zod";
import { env } from "../../../../env/server.mjs";
import { queue } from "../../../../server/background/queue";
import { prisma } from "../../../../server/db";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { logger } from "../../../../utils/logger";
import { InboxFunction } from "./types.js";

const followActivitySchema = z.object({
  type: z.literal("Follow"),
  actor: z
    .string()
    .url()
    .transform((val) => new URL(val)),
  object: z
    .string()
    .url()
    .transform((val, ctx) => {
      const url = new URL(val);
      if (url.host != env.HOST) {
        ctx.addIssue({
          code: "custom",
          message: "フォロー先が自ホストではありません",
        });
        return z.NEVER;
      }
      return url;
    }),
});

const resolveUserId = (actorId: URL) => {
  if (!actorId.pathname.startsWith("/users/")) {
    return null;
  }
  return actorId.pathname.split("/")[2];
};

export const follow: InboxFunction = async (activity, options) => {
  // TODO: 署名の検証
  const parsedFollow = followActivitySchema.safeParse(activity);
  if (!parsedFollow.success) {
    logger.info(
      // TODO: envディレクトリをts化してformatErrorsを切り出す
      "検証失敗: " + parsedFollow.error.issues[0]?.message
    );
    return json({}, 400);
  }
  const followeeId = resolveUserId(parsedFollow.data.object);
  if (!followeeId) {
    logger.info("フォローリクエストで指定されたフォロイーURLが不正でした");
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
  const follower = await findOrFetchUserByActorId(parsedFollow.data.actor);
  if (!follower) {
    logger.info(
      "フォローリクエストで指定されたフォロワーの有効なデータが取得できませんでした"
    );
    return json({}, 404);
  }
  try {
    if (options?.undo) {
      await prisma.follow.delete({
        where: {
          followeeId_followerId: {
            followeeId: followee.id,
            followerId: follower.id,
          },
        },
      });
      logger.info("完了: アンフォロー");
    } else {
      await prisma.follow.create({
        data: {
          followeeId: followee.id,
          followerId: follower.id,
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
        object: parsedFollow.data,
      },
      publicKeyId: `https://${env.HOST}/users/${followee.id}#main-key`,
      privateKey: followee.privateKey,
    },
  });
  return json({}, 200);
};
