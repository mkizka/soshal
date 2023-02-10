import crypto from "crypto";
import { z } from "zod";
import { textOf } from "./utils";

const signatureSchema = z.object({
  keyId: z.string().url(),
  algorithm: z.string(),
  headers: z.string(),
  signature: z.string(),
});

const parse = (signature: string) => {
  const result: { [key: string]: string } = {};
  for (const column of signature.split(",")) {
    const [k, ..._v] = column.split("=");
    // signature="..." の ... は base64 形式で = が含まれる可能性があるため元に戻す
    const v = _v.join("=");
    if (k && v && v.startsWith('"') && v.endsWith('"')) {
      result[k] = v.slice(1, v.length - 1);
    }
  }
  const parsedSignature = signatureSchema.safeParse(result);
  if (parsedSignature.success) {
    return parsedSignature.data;
  }
  return null;
};

const createVerify = (textToSign: string) => {
  const verify = crypto.createVerify("sha256");
  verify.write(textToSign);
  verify.end();
  return verify;
};

type VerifyResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: string;
    };

export const verifyActivity = (
  requestTarget: string,
  header: { [key: string]: string },
  publicKey: string
): VerifyResult => {
  if (!header.signature) {
    return {
      isValid: false,
      reason: "Signatureヘッダーがありませんでした",
    };
  }
  const parsedSignature = parse(header.signature);
  if (!parsedSignature) {
    return {
      isValid: false,
      reason: `ヘッダーの型が不正でした`,
    };
  }
  if (parsedSignature.algorithm != "rsa-sha256") {
    return {
      isValid: false,
      reason: `${parsedSignature.algorithm}はサポートしていないアルゴリズムです`,
    };
  }
  const headerToSign = {
    "(request-target)": requestTarget,
    ...header,
  };
  const order = parsedSignature.headers.split(" ");
  const textToSign = textOf(headerToSign, order);
  const isValid = createVerify(textToSign).verify(
    publicKey,
    parsedSignature.signature,
    "base64"
  );
  if (!isValid) {
    return { isValid, reason: "verifyの結果がfalseでした" };
  }
  return { isValid };
};
