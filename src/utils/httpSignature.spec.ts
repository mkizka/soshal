import { signActivity, verifyActivity } from "./httpSignature";
import { mockedKeys } from "./fixtures/keys";
import {
  expectedHeader,
  invalidDateHeader,
  invalidDigestHeader,
  invalidHostHeader,
  invalidSignatureHeader,
  noAlgorithmHeader,
  noHeadersHeader,
  noKeyIdHeader,
  noSignatureHeader,
  unSupportedAlgorithmHeader,
} from "./fixtures/headers";

afterAll(() => {
  jest.useRealTimers();
});

describe("signActivity", () => {
  test.each`
    url                                                      | date            | activity              | description
    ${new URL("https://remote1.example.com/inbox")}          | ${"2023-01-01"} | ${{}}                 | ${"url"}
    ${new URL("https://remote.example.com/users/foo/inbox")} | ${"2023-01-01"} | ${{}}                 | ${"path"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-02"} | ${{}}                 | ${"date"}
    ${new URL("https://remote.example.com/inbox")}           | ${"2023-01-01"} | ${{ type: "Create" }} | ${"activity"}
  `("署名されたヘッダーを返す: $description", ({ url, date, activity }) => {
    // arrange
    jest.useFakeTimers().setSystemTime(new Date(date));
    // act
    const headers = signActivity(
      activity,
      url,
      "https://myhost.example.com/example#main-key",
      mockedKeys.privateKey
    );
    // assert
    expect(headers).toMatchSnapshot();
  });
});

describe("verifyActivity", () => {
  test.each`
    header                        | expectedIsValid | expectedReason                                       | description
    ${expectedHeader}             | ${true}         | ${undefined}                                         | ${"署名されたActivityを検証する"}
    ${noKeyIdHeader}              | ${false}        | ${"ヘッダーの型が不正でした"}                        | ${"検証に必要な公開鍵がない"}
    ${noAlgorithmHeader}          | ${false}        | ${"ヘッダーの型が不正でした"}                        | ${"検証に必要なアルゴリズム名がない"}
    ${noHeadersHeader}            | ${false}        | ${"ヘッダーの型が不正でした"}                        | ${"検証に必要なヘッダー順指定がない"}
    ${noSignatureHeader}          | ${false}        | ${"ヘッダーの型が不正でした"}                        | ${"検証に必要なシグネチャーがない"}
    ${invalidDateHeader}          | ${false}        | ${"verifyの結果がfalseでした"}                       | ${"Dateが異なればsignatureも異なる"}
    ${invalidDigestHeader}        | ${false}        | ${"verifyの結果がfalseでした"}                       | ${"Digestが異なればsignatureも異なる"}
    ${invalidHostHeader}          | ${false}        | ${"verifyの結果がfalseでした"}                       | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader}     | ${false}        | ${"verifyの結果がfalseでした"}                       | ${"Signatureが異なればsignatureも異なる"}
    ${unSupportedAlgorithmHeader} | ${false}        | ${"unsupportedはサポートしていないアルゴリズムです"} | ${"アルゴリズムがrsa-sha256でない"}
  `("$description", ({ header, expectedIsValid, expectedReason }) => {
    // act
    const actual = verifyActivity(
      new URL("https://remote.example.com/inbox"),
      header,
      mockedKeys.publickKey
    );
    // assert
    expect(actual).toEqual({
      isValid: expectedIsValid,
      reason: expectedReason,
    });
  });
});
