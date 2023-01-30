import { env } from "../env/server.mjs";

declare const global: {
  [key: string]: unknown;
};

export const globalize = <T>(key: string, factory: () => T) => {
  if (global[`_${key}`]) {
    return global[`_${key}`] as T;
  }
  const cache = factory();
  if (env.NODE_ENV !== "production") {
    global[`_${key}`] = cache;
  }
  return cache;
};
