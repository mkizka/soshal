import type { User, Note } from "@prisma/client";
import type { AP } from "activitypub-core-types";

const required = <T>(value: T | null | undefined) => {
  if (value === null || value === undefined) throw new Error("値が必要です");
  return value;
};

const convertUser = (user: User, host: string): AP.Person => {
  const userAddress = `https://${host}/users/${user.id}`;
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
    preferredUsername: required(user.name),
    name: required(user.name),
    url: new URL(userAddress),
    publicKey: {
      id: userAddress,
      owner: userAddress,
      publicKeyPem: required(user.publicKey),
    },
    // TODO: user.iconを追加する
    icon: new URL("https://github.com/mkizka.png"),
  };
};

const convertNote = (note: Note, host: string): AP.Note => {
  const userAddress = `https://${host}/users/${note.userId}`;
  return {
    "@context": new URL("https://www.w3.org/ns/activitystreams"),
    id: new URL(`https://${host}/n/${note.id}`),
    type: "Note",
    content: note.content,
    attributedTo: new URL(userAddress),
    published: note.createdAt,
    to: [new URL("https://www.w3.org/ns/activitystreams#Public")],
    cc: [new URL(`${userAddress}/followers`)],
  };
};

const convertCreate = (apNote: AP.Note, host: string): AP.Create => {
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
