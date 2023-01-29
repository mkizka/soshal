import { createLogger, format, transports } from "winston";
import { env } from "../env/server.mjs";

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(
      (log) => `${log.timestamp} - [${log.level.toUpperCase()}] ${log.message}` // 出力内容をカスタマイズする
    )
  ),
  transports: [
    new transports.Console({
      silent: env.NODE_ENV == "test",
    }),
  ],
});
