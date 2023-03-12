import type { User } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { prismaMock } from "../../../__mocks__/db";
import { queue } from "../../background/queue";
import { appRouter } from "../root";

jest.mock("../../background/queue");
const mockedQueue = jest.mocked(queue);

const dummyRemoteUser = {
  id: "dummy_remote",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  email: null,
  emailVerified: null,
  image: null,
  icon: null,
  publicKey: null,
  privateKey: null,
  actorUrl: "https://remote.example.com/users/dummy_remote",
  inboxUrl: null,
} satisfies User;

type TRPCContext = Parameters<typeof appRouter.createCaller>[0];

const dummyLocalUser: NonNullable<TRPCContext["session"]>["user"] = {
  id: "dummy_local",
  privateKey: "privateKey",
};

test("follow", async () => {
  // arrange
  const ctx = mockDeep<TRPCContext>();
  ctx.session = {
    user: dummyLocalUser,
    expires: "",
  };
  prismaMock.user.findFirst.mockResolvedValue(dummyRemoteUser);
  prismaMock.follow.create.mockResolvedValue({
    id: "followId",
    followeeId: dummyRemoteUser.id,
    followerId: dummyLocalUser.id,
    status: "SENT",
    createdAt: new Date(),
  });
  // act
  const caller = appRouter.createCaller(ctx);
  await caller.follow.create("userId");
  // assert
  expect(prismaMock.follow.create).toHaveBeenCalledWith({
    data: {
      followeeId: dummyRemoteUser.id,
      followerId: dummyLocalUser.id,
      status: "SENT",
    },
  });
  expect(mockedQueue.push).toHaveBeenCalledWith({
    runner: "relayActivity",
    params: {
      activity: {
        "@context": new URL("https://www.w3.org/ns/activitystreams"),
        actor: new URL("https://myhost.example.com/users/dummy_local"),
        id: new URL("https://myhost.example.com/follows/followId"),
        object: new URL("https://remote.example.com/users/dummy_remote"),
        type: "Follow",
      },
      privateKey: "privateKey",
      publicKeyId: "https://myhost.example.com/users/dummy_local#main-key",
    },
  });
});
