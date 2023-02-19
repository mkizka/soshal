import { createNextApiHandler } from "@trpc/server/adapters/next";
 
import { createTRPCContext } from "../../../server/api/trpc";
import { appRouter } from "../../../server/api/root";
import { env } from "../../../utils/env";
import { logger } from "../../../utils/logger";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          logger.error(`❌ tRPC failed on ${path}: ${error}`);
        }
      : undefined,
});
