import { z } from "zod";
import { activityStreams } from "../../../utils/activitypub";
import { env } from "../../../utils/env";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const followRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const followee = await prisma.user.findFirst({
        where: { id: input },
      });
      if (!followee) {
        return;
      }
      const isRemote = followee.host != env.HOST;
      await prisma.follow.create({
        data: {
          followeeId: followee.id,
          followerId: ctx.session.user.id,
          status: isRemote ? "SENT" : "ACCEPTED",
        },
      });
      if (!isRemote) {
        if (!followee.actorUrl) {
          throw new Error("フォロイーのactorUrlがありません");
        }
        queue.push({
          runner: "relayActivity",
          params: {
            activity: activityStreams.follow(
              ctx.session.user.id,
              followee.actorUrl
            ),
            privateKey: ctx.session.user.privateKey,
            // TODO: idだけ渡せばいいようにしたい
            publicKeyId: `https://${env.HOST}/users/${ctx.session.user.id}`,
          },
        });
      }
    }),
});
