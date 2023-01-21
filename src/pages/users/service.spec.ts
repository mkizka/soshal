import type { User } from "@prisma/client";
import { prismaMock } from "../../__mocks__/db";
import { findOrFetchUserById } from "./service";

const userMock: User = {
  id: "dummyId",
  name: "dummy",
  email: null,
  emailVerified: null,
  image: null,
  publicKey: null,
  privateKey: null,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  toString() {
    return this.name;
  },
};

jest.mock("../../env/server", () => ({
  env: {
    HOST: "myhost.example.com",
  },
}));

describe("getUserById", () => {
  test.each`
    userId                         | where                | expected
    ${"dummyId"}                   | ${{ id: "dummyId" }} | ${userMock}
    ${"@dummy"}                    | ${{ name: "dummy" }} | ${userMock}
    ${"@dummy@myhost.example.com"} | ${{ name: "dummy" }} | ${userMock}
  `("$userId", async ({ userId, where, expected }) => {
    prismaMock.user.findFirst.mockResolvedValue(userMock);
    const user = await findOrFetchUserById(userId);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where,
    });
    expect(user).toEqual(expected);
  });
});
