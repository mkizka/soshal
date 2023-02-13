import { z } from "zod";
import { env } from "../env/server.mjs";
import { prisma } from "../server/db";
import { fetchJson } from "./fetchJson";
import { logger } from "./logger";
import { safeUrl } from "./safeUrl";

const resolveWebFingerResponse = (data: object) => {
  const href =
    "links" in data &&
    Array.isArray(data.links) &&
    data.links.find((link) => link?.rel == "self")?.href;
  return safeUrl(href);
};

/**
 * `name`,`host`を元にWebFingerから`rel==="self"`の`href`を返す
 */
const fetchUserIdByWebFinger = async (name: string, host: string) => {
  const remoteUrl = safeUrl(`https://${host}`);
  if (!remoteUrl) {
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append("resource", `acct:${name}@${host}`);
  const response = await fetchJson(webFingerUrl);
  if (!response) {
    return null;
  }
  const userId = resolveWebFingerResponse(response.body);
  if (!userId) {
    logger.warn(
      `${name}@${host} のWebFingerから有効な値が取得できませんでした`
    );
  }
  return userId;
};

const personSchema = z.object({
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

const fetchValidPerson = async (url: URL) => {
  const response = await fetchJson(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  const parsed = personSchema.safeParse(response?.body);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
};

export const findOrFetchUserByUserId = async (url: URL) => {
  const person = await fetchValidPerson(url);
  if (!person) {
    logger.warn(`Personの値が不正です`);
    return null;
  }
  const existingUser = await prisma.user.findFirst({
    where: {
      // TODO: hostも合わせて調べる
      name: person.preferredUsername,
    },
  });
  if (existingUser) {
    return existingUser;
  }
  return prisma.user.create({
    data: {
      name: person.preferredUsername,
      image: person.icon.url,
      publicKey: person.publicKey.publicKeyPem,
    },
  });
};

export const findOrFetchUserByWebfinger = async (
  name: string,
  host?: string
) => {
  // hostが無いかenv.HOSTと一致するなら自サーバーのユーザー
  if (host == undefined || host == env.HOST) {
    return await prisma.user.findFirst({ where: { name } });
  }
  const userId = await fetchUserIdByWebFinger(name, host);
  if (!userId) {
    return null;
  }
  return findOrFetchUserByUserId(userId);
};
