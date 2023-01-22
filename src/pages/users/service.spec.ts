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
    `("$userId: $description", async ({ userId, where, expected }) => {
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
    test.each`
      userId                         | findFirstResult | createCalledTimes | expected     | description
      ${"@dummy@remote.example.com"} | ${null}         | ${1}              | ${dummyUser} | ${"他ホストの場合はWebFingerを叩いて、新規ユーザーなら保存する"}
      ${"@dummy@remote.example.com"} | ${dummyUser}    | ${0}              | ${dummyUser} | ${"他ホストの場合はWebFingerを叩いて、既存ユーザーならDBから引く"}
    `(
      "$userId: $description",
      async ({ userId, findFirstResult, createCalledTimes, expected }) => {
        // arrange
        nock("https://remote.example.com")
          .get("/.well-known/webfinger")
          .query({
            resource: "acct:dummy@remote.example.com",
          })
          .reply(200, {
            links: [
              { rel: "self", href: "https://remote.example.com/users/dummyId" },
            ],
          })
          .get("/users/dummyId")
          .reply(200, { preferredUsername: "dummy" });
        prismaMock.user.findFirst.mockResolvedValue(findFirstResult);
        prismaMock.user.create.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserById(userId);
        // assert
        expect(prismaMock.user.create).toBeCalledTimes(createCalledTimes);
        expect(user).toEqual(expected);
      }
    );
  });
});
