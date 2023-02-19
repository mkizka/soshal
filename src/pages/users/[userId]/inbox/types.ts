import type { User } from "@prisma/client";
import type { TypedResponse } from "next-runtime";

export type InboxFunction = (
  activity: unknown,
  actorUser: User,
  options?: {
    undo: boolean;
  }
) => Promise<TypedResponse<object>>;
