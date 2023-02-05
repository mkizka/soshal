import { z } from "zod";
import { env } from "../../../env/server.mjs";

import { activityStreams } from "../../../utils/activitypub";
import { logger } from "../../../utils/logger";
import { prisma } from "../../db";
import { queue } from "../../background/queue";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const note = await prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          content: input.text,
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
