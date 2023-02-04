import crypto from "crypto";
import { signHeaders } from "./httpSignature";

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date("2023-01-01"));
  jest.mock("crypto");
});

afterAll(() => {
  jest.useRealTimers();
});

test("署名されたヘッダーを返す", () => {
  // arrange
  const privateKey = "privateKey";
  const mockedDigest = jest
    .spyOn(crypto.Hash.prototype, "digest")
    .mockImplementation(() => "digest");
  const mockedSign = jest
    .spyOn(crypto.Sign.prototype, "sign")
    .mockImplementation(() => "signature");
  // act
  const headers = signHeaders(
    {},
    new URL("https://remote.example.com/inbox"),
    "https://myhost.example.com/example#main-key",
    privateKey
  );
  // assert
  expect(mockedDigest).toBeCalledWith("base64");
  expect(mockedSign).toBeCalledWith(privateKey, "base64");
  expect(headers).toEqual({
    Accept: "application/activity+json",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/activity+json",
    Date: "Sun, 01 Jan 2023 00:00:00 GMT",
    Digest: "SHA-256=digest",
    Host: "remote.example.com",
    Signature:
      `keyId="https://myhost.example.com/example#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="(request-target) host date digest",` +
      `signature="signature"`,
  });
});
