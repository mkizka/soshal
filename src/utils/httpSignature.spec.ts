import type { AP } from "activitypub-core-types";
import { signActivity, verifyActivity } from "./httpSignature";
import { mockedKeys } from "./fixtures/keys";
import { expectedHeader, invalidHeadersSortHeader } from "./fixtures/headers";

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));
  jest.mock("crypto");
});

afterAll(() => {
  jest.useRealTimers();
});

describe("signActivity", () => {
  test("署名されたヘッダーを返す", () => {
    // act
    const headers = signActivity(
      {} as AP.Create,
      new URL("https://remote.example.com/inbox"),
      "https://myhost.example.com/example#main-key",
      mockedKeys.privateKey
    );
    // assert
    expect(headers).toEqual(expectedHeader);
  });
});

describe("verifyActivity", () => {
  test.each`
    header                      | expected | description
    ${expectedHeader}           | ${true}  | ${"署名されたActivityを検証する"}
    ${invalidHeadersSortHeader} | ${false} | ${"headersの順序が異なればsignatureも異なる"}
  `("$description", ({ header, expected }) => {
    // act
    const actual = verifyActivity(
      {} as AP.Create,
      new URL("https://remote.example.com/inbox"),
      header,
      mockedKeys.publickKey
    );
    // assert
    expect(actual).toBe(expected);
  });
});
