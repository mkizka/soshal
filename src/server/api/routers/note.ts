import { z } from "zod";
// @ts-ignore
import { Sha256Signer } from "activitypub-http-signatures";
import got from "got";

import { prisma } from "../../db";
import { queue } from "../../queue";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { logger } from "../../../utils/logger";
import { env } from "../../../env/server.mjs";

export const noteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.note.create({
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
        const url = "https://misskey.paas.mkizka.dev/users/97sz5gh3ut/inbox";
        // TODO: 以下を関数化
        const headers = {
          host: new URL(url).host,
          date: new Date().toUTCString(),
        };
        const signer = new Sha256Signer({
          publicKeyId: `https://${env.HOST}/@${user.name}#main-key`,
          privateKey: user?.privateKey,
        });

        const signature = signer.sign({
          url,
          method: "POST",
          headers,
        });
        const response = await got(url, {
          method: "POST",
          headers: {
            ...headers,
            signature,
            accept: "application/ld+json",
          },
        });
        logger.info(`POST:${url}`);
        logger.info(`RES :${response.body.slice(0, 20)}`);
      });
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});
