import type { User } from "@prisma/client";
import nock from "nock";
import { prismaMock } from "../../__mocks__/db";
import { findOrFetchUserById } from "./service";

const dummyUser: User = {
  id: "dummyId",
  name: "dummy",
  email: null,
  emailVerified: null,
  image: null,
  publicKey: null,
  privateKey: null,
};

jest.mock("../../env/server", () => ({
  env: {
    HOST: "myhost.example.com",
  },
}));

describe("getUserById", () => {
  describe("正常系(ローカルユーザー)", () => {
    test.each`
      userId                         | where                | expected     | description
      ${"dummyId"}                   | ${{ id: "dummyId" }} | ${dummyUser} | ${"@から始まらない場合はidとしてDBから引く"}
      ${"@dummy"}                    | ${{ name: "dummy" }} | ${dummyUser} | ${"@が一つだけの場合はnameとしてDBから引く"}
      ${"@dummy@myhost.example.com"} | ${{ name: "dummy" }} | ${dummyUser} | ${"@が一つで自ホストの場合はnameとしてDBから引く"}
    `("$description", async ({ userId, where, expected }) => {
      // arrange
      prismaMock.user.findFirst.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserById(userId);
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where,
      });
      expect(user).toEqual(expected);
    });
  });
  describe("正常系(リモートユーザー)", () => {
    test("他ホストの場合はWebFingerを叩いて、新規ユーザーなら保存する", async () => {
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
        .reply(200, { preferredUsername: "dummy" });
      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserById("@dummy@remote.example.com");
      // assert
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "dummy",
          image: "",
          publicKey: "",
        },
      });
      expect(webFingerScope.isDone()).toBe(true);
      expect(remoteUserScope.isDone()).toBe(true);
      expect(user).toEqual(dummyUser);
    });
    test("他ホストの場合はWebFingerを叩いて、既存ユーザーなら保存する", async () => {
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
        .reply(200, { preferredUsername: "dummy" });
      prismaMock.user.findFirst.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserById("@dummy@remote.example.com");
      // assert
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          name: "dummy",
        },
      });
      expect(webFingerScope.isDone()).toBe(true);
      expect(remoteUserScope.isDone()).toBe(true);
      expect(user).toEqual(dummyUser);
    });
  });
  describe("異常系", () => {
    test("@のみはnullを返す", async () => {
      // act
      const user = await findOrFetchUserById("@");
      // assert
      expect(user).toEqual(null);
    });
    test("不正なhostの場合はnullを返す", async () => {
      // act
      const user = await findOrFetchUserById("@dummmy@\\");
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
      const user = await findOrFetchUserById("@dummy@remote.example.com");
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
      const user = await findOrFetchUserById("@dummy@remote.example.com");
      // assert
      expect(scope.isDone()).toBe(true);
      expect(user).toEqual(null);
    });
  });
});
