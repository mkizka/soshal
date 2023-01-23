import pino from "pino";
import { env } from "../env/server.mjs";

export const logger = pino({
  enabled: env.NODE_ENV != "test",
  transport: {
    target: "pino-pretty",
  },
});
