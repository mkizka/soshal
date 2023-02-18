import { Matcher } from "jest-mock-extended";
import { logger } from "../../../../utils/logger";
import { prismaMock } from "../../../../__mocks__/db";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { queue } from "../../../../server/background/queue";
import { follow } from "./follow";

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

jest.mock("../../../../server/background/queue");
const mockedQueue = jest.mocked(queue);

const dummyLocalUser = {
  id: "dummyidlocal",
  name: "dummy_local",
  email: null,
  emailVerified: null,
  image: null,
  publicKey: null,
  privateKey: "privateKey",
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
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal",
    };
    prismaMock.user.findFirst // <-(2.)
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser);
    mockedFindOrFetchUserByActorId.mockResolvedValueOnce(dummyRemoteUser); // <-(3.)
    // act
    const response = await follow(activity);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: フォロー");
    expect(prismaMock.follow.create).toHaveBeenCalled();
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        activity: {
          type: "Accept",
          actor: new URL(activity.object),
          object: {
            type: "Follow",
            actor: new URL(activity.actor),
            object: new URL(activity.object),
          },
        },
        privateKey: "privateKey",
        publicKeyId: "https://myhost.example.com/users/dummyidlocal#main-key",
      },
    });
    expect(response.status).toBe(200);
  });
});

describe("アンフォロー", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal",
    };
    prismaMock.user.findFirst // <-(2.)
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser);
    mockedFindOrFetchUserByActorId.mockResolvedValueOnce(dummyRemoteUser); // <-(3.)
    // act
    const response = await follow(activity, { undo: true });
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: アンフォロー");
    expect(prismaMock.follow.delete).toHaveBeenCalled();
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        activity: {
          type: "Accept",
          actor: new URL(activity.object),
          object: {
            type: "Follow",
            actor: new URL(activity.actor),
            object: new URL(activity.object),
          },
        },
        privateKey: "privateKey",
        publicKeyId: "https://myhost.example.com/users/dummyidlocal#main-key",
      },
    });
    expect(response.status).toBe(200);
  });
});
