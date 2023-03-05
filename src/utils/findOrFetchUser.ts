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

const fetchActorIdByWebFinger = async (
  preferredUsername: string,
  host: string
) => {
  const remoteUrl = safeUrl(`https://${host}`);
  if (!remoteUrl) {
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append(
    "resource",
    `acct:${preferredUsername}@${host}`
  );
  const response = await fetchJson(webFingerUrl);
  if (!response) {
    return null;
  }
  const actorId = resolveWebFingerResponse(response.body);
  if (!actorId) {
    logger.warn(
      `${preferredUsername}@${host} のWebFingerから有効な値が取得できませんでした`
    );
  }
  return actorId;
};

const personSchema = z.object({
  id: z.string().url(),
  name: z.string().nullable().default(null),
  preferredUsername: z.string().min(1),
  inbox: z.string().url(),
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
      preferredUsername: person.preferredUsername,
      host: actorId.host,
    },
  });
  if (existingUser) {
    return existingUser;
  }
  return prisma.user.create({
    data: {
      name: person.name,
      preferredUsername: person.preferredUsername,
      host: actorId.host,
      //image: person.image.url,
      //icon: person.icon.url,
      actorUrl: person.id,
      inboxUrl: person.inbox,
      publicKey: person.publicKey.publicKeyPem,
    },
  });
};

export const findOrFetchUserByWebfinger = async (
  preferredUsername: string,
  host?: string
) => {
  // hostが無いかenv.HOSTと一致するなら自サーバーのユーザー
  if (host == undefined || host == env.HOST) {
    return await prisma.user.findFirst({ where: { preferredUsername } });
  }
  const actorId = await fetchActorIdByWebFinger(preferredUsername, host);
  if (!actorId) {
    return null;
  }
  return findOrFetchUserByActorId(actorId);
};
