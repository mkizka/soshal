import got from "got";
import type { Options } from "got";
import { logger } from "./logger";

export const fetchJson = async <T extends object>(
  url: string | URL,
  options?: Options
) => {
  try {
    return await got<T>(url, {
      ...options,
      isStream: false,
      resolveBodyOnly: false,
      responseType: "json",
    });
  } catch (e) {
    if (e instanceof got.HTTPError) {
      logger.warn(`${e.code}: ${url}`);
      return null;
    }
    // nockのエラーを想定
    throw e;
  }
};
