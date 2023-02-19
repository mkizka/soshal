import { z } from "zod";
import { env } from "../utils/env";
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

const fetchActorIdByWebFinger = async (name: string, host: string) => {
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
  const actorId = resolveWebFingerResponse(response.body);
  if (!actorId) {
    logger.warn(
      `${name}@${host} のWebFingerから有効な値が取得できませんでした`
    );
  }
  return actorId;
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

export const findOrFetchUserByActorId = async (actorId: URL) => {
  const person = await fetchValidPerson(actorId);
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
  const actorId = await fetchActorIdByWebFinger(name, host);
  if (!actorId) {
    return null;
  }
  return findOrFetchUserByActorId(actorId);
};
