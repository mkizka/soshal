import type { User, Note } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { env } from "../env/server.mjs";

const required = <T>(value: T | null | undefined) => {
  if (value === null || value === undefined) throw new Error("値が必要です");
  return value;
};

type CustomPerson = AP.Person & {
  featured?: AP.OrderedCollectionReference;
};

const convertUser = (user: User): CustomPerson => {
  const userAddress = `${env.HOST}/users/${user.id}`;
  return {
    "@context": [
      new URL("https://www.w3.org/ns/activitystreams"),
      new URL("https://w3id.org/security/v1"),
    ],
    id: new URL(userAddress),
    type: "Person",
    inbox: new URL(`${userAddress}/inbox`),
    outbox: new URL(`${userAddress}/outbox`),
    following: new URL(`${userAddress}/following`),
    followers: new URL(`${userAddress}/followers`),
    featured: new URL(`${userAddress}/collections/featured`),
    preferredUsername: required(user.name),
    name: required(user.name),
    url: new URL(userAddress),
    publicKey: {
      id: userAddress,
      owner: userAddress,
      publicKeyPem: required(user.publicKey),
    },
    // TODO: user.iconを追加する
    icon: {
      type: "Image",
      url: new URL("https://github.com/mkizka.png"),
    } as AP.Image, // なぜか型エラーになる,
  };
};

const convertNote = (note: Note): AP.Note => {
  const userAddress = `${env.HOST}/users/${note.userId}`;
  return {
    "@context": new URL("https://www.w3.org/ns/activitystreams"),
    id: new URL(`${env.HOST}/notes/${note.id}`),
    type: "Note",
    content: note.content,
    attributedTo: new URL(userAddress),
    published: note.createdAt,
    to: [new URL("https://www.w3.org/ns/activitystreams#Public")],
    cc: [new URL(`${userAddress}/followers`)],
  };
};

const convertCreate = (apNote: AP.Note): AP.Create => {
  return {
    // TODO: wip
    type: "Create",
    id: new URL(`${apNote.id}/activity`),
    actor: required(apNote.attributedTo),
    object: apNote,
  };
};

export const activityStreams = {
  user: convertUser,
  note: convertNote,
};
