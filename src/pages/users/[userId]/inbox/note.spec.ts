import type { User } from "@prisma/client";
import { logger } from "../../../../utils/logger";
import { prismaMock } from "../../../../__mocks__/db";
import { note } from "./note";

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyRemoteUser: User = {
  id: "dummyidremote",
  name: "dummyRemote",
  preferredUsername: "dummy_remote",
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

describe("ノート", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      id: "https://remote.example.com/n/12345",
      type: "Note",
      attributedTo: "https://remote.example.com/u/remote_user",
      summary: null,
      content: "<p>text</p>",
      published: "2023-01-01T00:00:00.000Z",
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: ["https://remote.example.com/u/remote_user/followers"],
      inReplyTo: null,
    };
    // act
    const response = await note(activity, dummyRemoteUser);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: ノート");
    expect(prismaMock.note.create).toHaveBeenCalledWith({
      data: {
        url: activity.id,
        userId: dummyRemoteUser.id,
        content: activity.content,
        published: activity.published,
      },
    });
    expect(response.status).toBe(200);
  });
});
