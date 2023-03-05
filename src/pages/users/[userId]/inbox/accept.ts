import { json } from "next-runtime";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

export const accept: InboxFunction = async (activity) => {
  logger.info(JSON.stringify(activity));
  return json({}, 400);
};
