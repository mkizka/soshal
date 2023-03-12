import type { User } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import nock from "nock";
import { prismaMock } from "../__mocks__/db";
import { findOrFetchUserByWebfinger } from "./findOrFetchUser";

const dummyUser: User = {
  id: "dummyId",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  email: null,
  emailVerified: null,
  image: null,
  icon: null,
  publicKey: null,
  privateKey: null,
  actorUrl: null,
  inboxUrl: null,
};

const dummyPerson: AP.Person = {
  id: new URL("https://remote.example.com/u/dummyId"),
  type: "Person",
  name: "Dummy",
  preferredUsername: "dummy",
  inbox: new URL("https://remote.example.com/u/dummyId/inbox"),
  outbox: new URL("https://remote.example.com/u/dummyId/outbox"),
  publicKey: {
    id: "https://remote.example.com/u/dummyId#main-key",
    owner: "https://remote.example.com/u/dummyId",
    publicKeyPem: "publicKey",
  },
};

jest.mock("../utils/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));

describe("findOrFetchUser", () => {
  test("foo", () => {
    expect(true).toBe(true);
  });
});
