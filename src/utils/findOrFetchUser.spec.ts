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
  describe("正常系(ローカルユーザー)", () => {
    test("hostの指定がなければDBから取得する", async () => {
      // arrange
      prismaMock.user.findFirst.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByWebfinger("dummy");
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { preferredUsername: "dummy" },
      });
      expect(user).toEqual(dummyUser);
    });
    test("指定されたhostが自ホストならDBから取得する", async () => {
      // arrange
      prismaMock.user.findFirst.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "myhost.example.com"
      );
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { preferredUsername: "dummy" },
      });
      expect(user).toEqual(dummyUser);
    });
    test("存在しないユーザーならnullを返す", async () => {
      // arrange
      prismaMock.user.findFirst.mockResolvedValue(null);
      // act
      const user = await findOrFetchUserByWebfinger("dummy");
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { preferredUsername: "dummy" },
      });
      expect(user).toBeNull();
    });
  });
  describe("正常系(リモートユーザー)", () => {
    test("WebFingerを叩いて新規ユーザーなら保存する", async () => {
      // arrange
      const webFingerScope = nock("https://remote.example.com")
        .get("/.well-known/webfinger")
        .query({
          resource: "acct:dummy@remote.example.com",
        })
        .reply(200, {
          links: [
            { rel: "self", href: "https://remote.example.com/users/dummyId" },
          ],
        });
      const remoteUserScope = nock("https://remote.example.com")
        .get("/users/dummyId")
        .reply(200, dummyPerson);
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "Dummy",
          host: "remote.example.com",
          preferredUsername: "dummy",
          publicKey: "publicKey",
          actorUrl: "https://remote.example.com/u/dummyId",
          inboxUrl: "https://remote.example.com/u/dummyId/inbox",
        },
      });
      expect(webFingerScope.isDone()).toBe(true);
      expect(remoteUserScope.isDone()).toBe(true);
      expect(user).toEqual(dummyUser);
    });
    test("WebFingerを叩いて既存ユーザーならそのまま返す", async () => {
      // arrange
      const webFingerScope = nock("https://remote.example.com")
        .get("/.well-known/webfinger")
        .query({
          resource: "acct:dummy@remote.example.com",
        })
        .reply(200, {
          links: [
            { rel: "self", href: "https://remote.example.com/users/dummyId" },
          ],
        });
      const remoteUserScope = nock("https://remote.example.com")
        .get("/users/dummyId")
        .reply(200, dummyPerson);
      prismaMock.user.findFirst.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          preferredUsername: "dummy",
          host: "remote.example.com",
        },
      });
      expect(webFingerScope.isDone()).toBe(true);
      expect(remoteUserScope.isDone()).toBe(true);
      expect(user).toEqual(dummyUser);
    });
  });
  describe("異常系", () => {
    test("hostが不正ならnullを返す", async () => {
      // act
      const user = await findOrFetchUserByWebfinger("dummmy", "\\");
      // assert
      expect(user).toEqual(null);
    });
    test("hostのWebFingerが200を返さない場合はnullを返す", async () => {
      // arrange
      const scope = nock("https://remote.example.com")
        .get("/.well-known/webfinger")
        .query({
          resource: "acct:dummy@remote.example.com",
        })
        .reply(404);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(scope.isDone()).toBe(true);
      expect(user).toEqual(null);
    });
    test("hostのWebFingerにhrefがなかった場合はnullを返す", async () => {
      // arrange
      const scope = nock("https://remote.example.com")
        .get("/.well-known/webfinger")
        .query({
          resource: "acct:dummy@remote.example.com",
        })
        .reply(200, {
          links: [],
        });
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(scope.isDone()).toBe(true);
      expect(user).toEqual(null);
    });
    test("hostのhrefから有効なデータが返されなかった場合はnullを返す", async () => {
      // arrange
      const webFingerScope = nock("https://remote.example.com")
        .get("/.well-known/webfinger")
        .query({
          resource: "acct:dummy@remote.example.com",
        })
        .reply(200, {
          links: [
            { rel: "self", href: "https://remote.example.com/users/dummyId" },
          ],
        });
      const remoteUserScope = nock("https://remote.example.com")
        .get("/users/dummyId")
        .reply(200, { invalid: "dummy" });
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(webFingerScope.isDone()).toBe(true);
      expect(remoteUserScope.isDone()).toBe(true);
      expect(user).toEqual(null);
    });
  });
});
