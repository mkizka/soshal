import nock from "nock";
import { Matcher } from "jest-mock-extended";
import { logger } from "../../../../utils/logger";
import { prismaMock } from "../../../../__mocks__/db";
import { createMockedContext } from "../../../__mocks__/context";
import { getServerSideProps } from "./index.page";

jest.mock("../../../../env/server.mjs", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyLocalUser = {
  id: "dummyidlocal",
  name: "dummy_local",
  email: null,
  emailVerified: null,
  image: null,
  publicKey: null,
  privateKey: null,
};

const dummyRemoteUser = {
  id: "dummyidremote",
  name: "dummy_remote",
  email: null,
  emailVerified: null,
  image: null,
  publicKey: null,
  privateKey: null,
};

export const object = <T>(expectedValue: T) =>
  new Matcher((actualValue) => {
    return JSON.stringify(expectedValue) == JSON.stringify(actualValue);
  }, "");

/**
 * フォローは以下の手順で行われる
 * 1. フォローのリクエストが来る
 * 2. フォロイー(id: dummyidlocal)が DB にいることを確認
 * 3. フォロワーの actor を fetch
 *   3-1. actor が DB にあればそれを返す
 *   3-2. actor が DBになければ新規作成
 * 4. フォロー関係を保存
 * 5. Acceptを返す
 */
describe("フォロー", () => {
  test("フォロワーがDBに存在していた場合", async () => {
    // arrange
    const ctx = createMockedContext({
      method: "POST", // <-(1.)
      headers: { accept: "application/activity+json" },
      body: {
        type: "Follow",
        actor: "https://remote.example.com/u/dummy_remote",
        object: "https://myhost.example.com/users/dummyidlocal",
      },
    });
    prismaMock.user.findFirst // <-(2.)
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser);
    nock("https://remote.example.com") // <-(3.)
      .get("/u/dummy_remote")
      .reply(200, {
        preferredUsername: "dummy_remote",
      });
    prismaMock.user.findFirst // <-(3-1.)
      .calledWith(object({ where: { name: "dummy_remote" } }))
      .mockResolvedValueOnce(dummyRemoteUser);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: フォロー");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.follow.create).toHaveBeenCalled();
    expect(ctx.res.statusCode).toBe(200);
  });
  test("フォロワーがDBに無かった場合", async () => {
    // arrange
    const ctx = createMockedContext({
      method: "POST", // <-(1.)
      headers: { accept: "application/activity+json" },
      body: {
        type: "Follow",
        actor: "https://remote.example.com/u/dummy_remote",
        object: "https://myhost.example.com/users/dummyidlocal",
      },
    });
    prismaMock.user.findFirst // <-(2.)
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser);
    nock("https://remote.example.com") // <-(3.)
      .get("/u/dummy_remote")
      .reply(200, {
        preferredUsername: "dummy_remote",
      });
    prismaMock.user.findFirst // <-(3-2.)
      .calledWith(object({ where: { name: "dummy_remote" } }))
      .mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValue(dummyRemoteUser);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: フォロー");
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.follow.create).toHaveBeenCalled();
    expect(ctx.res.statusCode).toBe(200);
  });
});
