import type { User } from "@prisma/client";
import { findOrFetchUserByWebfinger } from "../../utils/findOrFetchUser";
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

jest.mock("../../utils/findOrFetchUser");
const mockedFindOrFetchUserByWebFinger = jest.mocked(
  findOrFetchUserByWebfinger
);

describe("findOrFetchUserById", () => {
  test("@から始まらない場合はidとしてDBから引く", async () => {
    // arrange
    prismaMock.user.findFirst.mockResolvedValue(dummyUser);
    // act
    const user = await findOrFetchUserById("dummyId");
    // assert
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: "dummyId" },
    });
    expect(user).toEqual(dummyUser);
  });
  test("@が一つの場合はnameをfindOrFetchUserに渡す", async () => {
    // arrange
    mockedFindOrFetchUserByWebFinger.mockResolvedValue(dummyUser);
    // act
    const user = await findOrFetchUserById("@dummy");
    // assert
    expect(mockedFindOrFetchUserByWebFinger).toHaveBeenCalledWith(
      "dummy",
      undefined
    );
    expect(user).toEqual(dummyUser);
  });
  test("@が二つの場合は分割してname,hostをfindOrFetchUserに渡す", async () => {
    // arrange
    mockedFindOrFetchUserByWebFinger.mockResolvedValue(dummyUser);
    // act
    const user = await findOrFetchUserById("@dummy@myhost.example.com");
    // assert
    expect(mockedFindOrFetchUserByWebFinger).toHaveBeenCalledWith(
      "dummy",
      "myhost.example.com"
    );
    expect(user).toEqual(dummyUser);
  });
});
