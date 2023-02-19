import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(
      (log) => `${log.timestamp} - [${log.level.toUpperCase()}] ${log.message}`
    )
  ),
  transports: [
    new transports.Console({
      // env.tsでもloggerを使いたいのでprocess.envを参照する
      silent: process.env.NODE_ENV == "test",
    }),
  ],
});
