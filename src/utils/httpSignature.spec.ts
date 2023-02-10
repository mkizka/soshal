import type { AP } from "activitypub-core-types";
import { signActivity, verifyActivity } from "./httpSignature";
import { mockedKeys } from "./fixtures/keys";
import {
  expectedHeader,
  invalidDateHeader,
  invalidDigestHeader,
  invalidHostHeader,
  invalidSignatureHeader,
} from "./fixtures/headers";

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
    header                    | expected | description
    ${expectedHeader}         | ${true}  | ${"署名されたActivityを検証する"}
    ${invalidDateHeader}      | ${false} | ${"Dateが異なればsignatureも異なる"}
    ${invalidDigestHeader}    | ${false} | ${"Digestが異なればsignatureも異なる"}
    ${invalidHostHeader}      | ${false} | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader} | ${false} | ${"Signatureが異なればsignatureも異なる"}
  `("$description", ({ header, expected }) => {
    // act
    const actual = verifyActivity(
      new URL("https://remote.example.com/inbox"),
      header,
      mockedKeys.publickKey
    );
    // assert
    expect(actual).toBe(expected);
  });
});
