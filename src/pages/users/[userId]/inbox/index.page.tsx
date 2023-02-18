import { handle, json } from "next-runtime";
import { z } from "zod";
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
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Undo"),
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
      logger.info(`検証エラー: ${req.body}`);
      return json({}, 400);
    }
    if (activity.data.type == "Undo") {
      const options = { undo: true };
      return inbox[activity.data.object.type](activity.data.object, options);
    }
    return inbox[activity.data.type](activity.data);
  },
});
