import type { AP } from "activitypub-core-types";
import { signActivity, verifyActivity } from "./httpSignature";
import { expectedHeader, mockedKeys } from "./__mocks__/mockedKeys";

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
  test("署名されたヘッダーを検証する", () => {
    // act
    const actual = verifyActivity(
      {} as AP.Create,
      new URL("https://remote.example.com/inbox"),
      expectedHeader.Signature,
      mockedKeys.publickKey
    );
    // assert
    expect(actual).toBe(true);
  });
});
