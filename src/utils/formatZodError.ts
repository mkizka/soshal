import type { z } from "zod";

export const formatZodError = (error: z.ZodError<unknown>) =>
  JSON.stringify(error.flatten().fieldErrors);
