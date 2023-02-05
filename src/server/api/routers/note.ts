import { z } from "zod";
import { env } from "../../../env/server.mjs";

import { activityStreams } from "../../../utils/activitypub";
import { logger } from "../../../utils/logger";
import { prisma } from "../../db";
import { queue } from "../../queue";
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
        select: { privateKey: true },
        where: { id: ctx.session.user.id },
      });
      if (!user || !user.privateKey) {
        logger.error(
          `ノートを作成したユーザー(id:${ctx.session.user.id}の秘密鍵が見つかりませんでした`
        );
        return;
      }
      const apNote = activityStreams.note(note);
      const data = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: new URL(`${apNote.id}/activity`),
        type: "Create",
        actor: apNote.attributedTo!,
        published: apNote.published,
        to: apNote.to,
        cc: apNote.cc,
        object: apNote,
      } as const;
      queue.pushRelayActivity(
        data,
        data.actor.toString() + "#main-key",
        user.privateKey
      );
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: noteId, ctx }) => {
      await prisma.note.delete({ where: { id: noteId } });
      const user = await prisma.user.findFirst({
        select: { privateKey: true },
        where: { id: ctx.session.user.id },
      });
      if (!user || !user.privateKey) {
        logger.error(
          `ノートを削除するユーザー(id:${ctx.session.user.id}の秘密鍵が見つかりませんでした`
        );
        return;
      }
      const data = {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Delete",
        actor: new URL(`https://${env.HOST}/users/${ctx.session.user.id}`),
        object: new URL(`https://${env.HOST}/notes/${noteId}`),
      } as const;
      queue.pushRelayActivity(
        data,
        data.actor.toString() + "#main-key",
        user.privateKey
      );
    }),
});
