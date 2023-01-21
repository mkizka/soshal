import { z } from "zod";
import { logger } from "../../utils/logger";

export const safeUrl = (...args: ConstructorParameters<typeof URL>) => {
  try {
    return new URL(...args);
  } catch {
    return null;
  }
};

export const fetchJson = (...[input, ...args]: Parameters<typeof fetch>) => {
  return fetch(input, ...args)
    .then((response) => {
      if (!response.ok) {
        logger.warn(
          `${input} へのリクエストで${response.status}が返されました`
        );
        return null;
      }
      return response.json() as Promise<object>;
    })
    .catch(() => {
      logger.warn(
        `${input} への通信に失敗したかレスポンスがパース出来ませんでした: `
      );
      return null;
    });
};

export const personSchema = z.object({
  preferredUsername: z.string().min(1),
  icon: z
    .object({
      url: z.string().default(""),
    })
    .default({}),
  publicKey: z
    .object({
      publicKeyPem: z.string().default(""),
    })
    .default({}),
});
