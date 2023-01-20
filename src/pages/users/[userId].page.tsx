import type { GetServerSideProps } from "next";
import type { AP } from "activitypub-core-types";
import { prisma } from "../../server/db";
import { activityStreams } from "../../utils/activitypub";
import { env } from "../../env/server.mjs";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const User = (props: any) => {
  return (
    <pre>
      <code>{props.user}</code>
    </pre>
  );
};

export default User;

type WebFingerResponse = {
  subject?: string;
  links?: {
    rel?: string;
    href?: string;
  }[];
};

const safeUrl = (...args: ConstructorParameters<typeof URL>) => {
  try {
    return new URL(...args);
  } catch {
    return null;
  }
};

/**
 * `name`,`host`を元にWebFingerから`rel==="self"`の`href`を返す
 */
const fetchHrefByWebFinger = async (name: string, host: string) => {
  const targetUrl = safeUrl(`https://${host}`);
  if (!targetUrl) {
    return null;
  }
  const url = new URL("/.well-known/webfinger", targetUrl);
  url.searchParams.append("resource", `acct:${name}@${targetUrl.hostname}`);
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as WebFingerResponse;
  const href =
    Array.isArray(data.links) &&
    data.links.find((link) => link?.rel == "self")?.href;
  if (!href) {
    return null;
  }
  return safeUrl(href);
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
  const response = await fetch(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  if (!response.ok) {
    return null;
  }
  const person = (await response.json()) as AP.Person;
  const parsed = personSchema.safeParse(person);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
};

const getOrFetchRemoteUser = async (name: string, host?: string) => {
  // hostが無いかenv.HOSTと一致するなら自サーバーのユーザー
  if (host == undefined || host == env.HOST) {
    return prisma.user.findFirst({ where: { name } });
  }
  // 外部サーバーの場合は、
  // 1. WebFingerを叩いてhrefを取得
  // 2. hrefを叩いてActivityを取得
  // 3. ActivityのpreferredUsernameとhostを見て既存ユーザーか新規作成データを返す
  const url = await fetchHrefByWebFinger(name, host);
  if (!url) {
    return null;
  }
  const person = await fetchValidPerson(url);
  if (!person) {
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

/**
 * userIdは以下のパターンを想定
 * - ${id}                ... DBからidで検索
 * - @${name}             ... DBからnameで検索
 * - @${name}@${env.HOST} ... DBからnameで検索
 * - @${name}@${他サーバー} ... 他サーバーのwebFingerから取得
 */
const getUserById = async (userId: string) => {
  if (userId.startsWith("@")) {
    const [name, host] = userId.split("@").slice(1);
    if (!name) {
      return null;
    }
    return getOrFetchRemoteUser(name, host);
  }
  return prisma.user.findFirst({ where: { id: userId } });
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (typeof params?.userId != "string") {
    return { notFound: true };
  }
  const user = await getUserById(params.userId);
  if (user == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+json");
    res.write(JSON.stringify(activityStreams.user(user)));
    res.end();
  }
  return {
    props: {
      user: JSON.stringify(user, null, 2),
    },
  };
};
