import type { TypedResponse } from "next-runtime";

export type InboxFunction = (
  activity: unknown,
  options?: {
    undo: boolean;
  }
) => Promise<TypedResponse<object>>;
