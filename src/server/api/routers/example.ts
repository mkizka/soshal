import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  changeMyName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  resetMe: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.delete({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),

  addNote: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          content: input,
        },
      });
    }),

  getAllNotes: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany();
  }),

  deleteNote: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.note.delete({ where: { id: input } });
    }),

  getAllFollows: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.follow.findMany({
      where: { followeeId: ctx.session.user.id },
      include: { follower: true },
    });
  }),
});
