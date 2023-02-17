import { Matcher } from "jest-mock-extended";
import { logger } from "../../../../utils/logger";
import { prismaMock } from "../../../../__mocks__/db";
import { createMockedContext } from "../../../__mocks__/context";
import { getServerSideProps } from "./index.page";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";

jest.mock("../../../../env/server.mjs", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

jest.mock("../../../../utils/findOrFetchUser");
const mockedFindOrFetchUserByActorId = jest.mocked(findOrFetchUserByActorId);

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
 * 3. フォロワー(name: dummy_remote)の actor を fetch
 *   - fetch した actor がDBにいればそれを返す/なければ保存 (findOrFetchUserByActorId)
 * 4. フォロー関係を保存
 * 5. Acceptを返す
 */
describe("フォロー", () => {
  test("正常系", async () => {
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
    mockedFindOrFetchUserByActorId.mockResolvedValueOnce(dummyRemoteUser); // <-(3.)
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: フォロー");
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.follow.create).toHaveBeenCalled();
    expect(ctx.res.statusCode).toBe(200);
  });
});
