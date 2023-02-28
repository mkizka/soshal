import { z } from "zod";

import { activityStreams } from "../../../utils/activitypub";
import { logger } from "../../../utils/logger";
import { prisma } from "../../db";
import { queue } from "../../background/queue";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { env } from "../../../utils/env";

export const noteRouter = createTRPCRouter({
  find: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      include: {
        user: {
          select: {
            preferredUsername: true,
            host: true,
          },
        },
      },
    });
  }),
  findSelf: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const note = await prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          content: input.text,
          published: new Date(),
        },
      });
      const user = await prisma.user.findFirst({
        select: { id: true, privateKey: true },
        where: { id: ctx.session.user.id },
      });
      if (!user || !user.privateKey) {
        logger.error(
          `ノートを作成したユーザー(id:${ctx.session.user.id}の秘密鍵が見つかりませんでした`
        );
        return;
      }
      queue.push({
        runner: "relayActivity",
        params: {
          activity: activityStreams.create(note),
          publicKeyId: `https://${env.HOST}/users/${user.id}#main-key`,
          privateKey: user.privateKey,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: noteId, ctx }) => {
      await prisma.note.delete({ where: { id: noteId } });
      const user = await prisma.user.findFirst({
        select: { id: true, privateKey: true },
        where: { id: ctx.session.user.id },
      });
      if (!user || !user.privateKey) {
        logger.error(
          `ノートを削除するユーザー(id:${ctx.session.user.id}の秘密鍵が見つかりませんでした`
        );
        return;
      }
      // TODO: 自分のじゃなかったらエラー吐く
      queue.push({
        runner: "relayActivity",
        params: {
          activity: activityStreams.delete({ id: noteId, userId: user.id }),
          publicKeyId: `https://${env.HOST}/users/${user.id}#main-key`,
          privateKey: user.privateKey,
        },
      });
    }),
});
