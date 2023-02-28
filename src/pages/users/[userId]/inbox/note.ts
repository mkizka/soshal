import { json } from "next-runtime";
import { z } from "zod";
import { prisma } from "../../../../server/db";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const noteSchema = z.object({
  type: z.literal("Note"),
  id: z.string().url(),
  content: z.string(),
  published: z.string().datetime(),
});

export const note: InboxFunction = async (activity, actorUser) => {
  const parsedNote = noteSchema.safeParse(activity);
  if (!parsedNote.success) {
    logger.info("検証失敗: " + formatZodError(parsedNote.error));
    return json({}, 400);
  }
  await prisma.note.create({
    data: {
      url: parsedNote.data.id,
      userId: actorUser.id,
      content: parsedNote.data.content,
      published: parsedNote.data.published,
    },
  });
  logger.info("完了: ノート");
  return json({}, 200);
};
