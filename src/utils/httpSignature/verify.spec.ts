import { verifyActivity } from "./verify";
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

describe("verifyActivity", () => {
  test.each`
    header                        | expectedIsValid | expectedReason                                    | description
    ${expectedHeader}             | ${true}         | ${undefined}                                      | ${"署名されたActivityを検証する"}
    ${noKeyIdHeader}              | ${false}        | ${"Required"}                                     | ${"検証に必要な公開鍵がない"}
    ${noAlgorithmHeader}          | ${false}        | ${'Invalid literal value, expected "rsa-sha256"'} | ${"検証に必要なアルゴリズム名がない"}
    ${noHeadersHeader}            | ${false}        | ${"Required"}                                     | ${"検証に必要なヘッダー順指定がない"}
    ${noSignatureHeader}          | ${false}        | ${"Required"}                                     | ${"検証に必要なシグネチャーがない"}
    ${invalidDateHeader}          | ${false}        | ${"verifyの結果がfalseでした"}                    | ${"Dateが異なればsignatureも異なる"}
    ${invalidDigestHeader}        | ${false}        | ${"verifyの結果がfalseでした"}                    | ${"Digestが異なればsignatureも異なる"}
    ${invalidHostHeader}          | ${false}        | ${"verifyの結果がfalseでした"}                    | ${"Hostが異なればsignatureも異なる"}
    ${invalidSignatureHeader}     | ${false}        | ${"verifyの結果がfalseでした"}                    | ${"Signatureが異なればsignatureも異なる"}
    ${unSupportedAlgorithmHeader} | ${false}        | ${'Invalid literal value, expected "rsa-sha256"'} | ${"アルゴリズムがrsa-sha256でない"}
  `("$description", ({ header, expectedIsValid, expectedReason }) => {
    // act
    const actual = verifyActivity("/inbox", header, mockedKeys.publickKey);
    // assert
    expect(actual).toEqual({
      isValid: expectedIsValid,
      reason: expectedReason,
    });
  });
});
