import { z } from "zod";
import got from "got";

import { prisma } from "../../db";
import { queue } from "../../queue";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logger } from "../../../utils/logger";
import { env } from "../../../env/server.mjs";
import { activityStreams } from "../../../utils/activitypub";
import { signHeaders } from "../../../utils/httpSignature";

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
      queue.push(async () => {
        const user = await prisma.user.findFirst({
          select: { name: true, privateKey: true },
          where: { id: ctx.session.user.id },
        });
        if (!user || !user.privateKey) {
          logger.warn(
            `ノートを作成したユーザー(id:${ctx.session.user.id}の秘密鍵が見つかりませんでした`
          );
          throw new Error();
        }
        // TODO: 連合先の各サーバーに送信するようにする
        const inboxUrl = new URL(
          "https://misskey.paas.mkizka.dev/users/97sz5gh3ut/inbox"
        );
        const apNote = activityStreams.note(note);
        const data = {
          "@context": "https://www.w3.org/ns/activitystreams",
          id: `${apNote.id}/activity`,
          type: "Create",
          actor: apNote.attributedTo,
          published: apNote.published,
          to: apNote.to,
          cc: apNote.cc,
          object: apNote,
        };
        const headers = signHeaders(
          data,
          inboxUrl,
          `https://${env.HOST}/@${user.name}#main-key`,
          user.privateKey
        );
        const response = await got(inboxUrl, {
          method: "POST",
          json: data,
          headers,
        });
        logger.info({ inboxUrl, response });
      });
    }),
});
