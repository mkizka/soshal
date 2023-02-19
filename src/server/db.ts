import { PrismaClient } from "@prisma/client";
import { env } from "../utils/env";
import { globalize } from "../utils/globalize";

export const prisma = globalize(
  "prisma",
  () =>
    new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
);
