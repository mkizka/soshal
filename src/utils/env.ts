import { z } from "zod";
import { logger } from "./logger";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url(),
  HOST: z
    .string()
    .default(new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").host),
  EMAIL_SERVER_USER: z.string(),
  EMAIL_SERVER_PASS: z.string(),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.coerce.number(),
  EMAIL_FROM: z.string().email(),
});

let env = process.env as unknown as z.infer<typeof serverEnvSchema>;

if (!process.env.SKIP_ENV_VALIDATION) {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (parsed.success === false) {
    logger.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }
  env = parsed.data;
}

export { env };
