import { handle, json } from "next-runtime";
import { z } from "zod";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { logger } from "../../../../utils/logger";
import { follow } from "./follow";

const Noop = () => undefined;
export default Noop;

const inbox = {
  Follow: follow,
} as const;

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z.union([
  z
    .object({
      type: z.enum(keysOf(inbox)),
      actor: z
        .string()
        .url()
        .transform((val) => new URL(val)),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Undo"),
      actor: z
        .string()
        .url()
        .transform((val) => new URL(val)),
      object: z
        .object({
          type: z.enum(keysOf(inbox)),
        })
        .passthrough(),
    })
    .passthrough(),
]);

export const getServerSideProps = handle({
  async post({ req }) {
    const activity = anyActivitySchema.safeParse(req.body);
    if (!activity.success) {
      logger.info(`検証エラー: ${JSON.stringify(req.body)}`);
      return json({}, 400);
    }
    const actorUser = await findOrFetchUserByActorId(activity.data.actor);
    if (!actorUser) {
      logger.info("actorで指定されたユーザーが見つかりませんでした");
      return json({}, 400);
    }
    // TODO: 署名の検証
    if (activity.data.type == "Undo") {
      return inbox[activity.data.object.type](activity.data.object, actorUser, {
        undo: true,
      });
    }
    return inbox[activity.data.type](activity.data, actorUser);
  },
});
