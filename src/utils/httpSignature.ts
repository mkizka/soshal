import type { AP } from "activitypub-core-types";
import crypto from "crypto";
import { z } from "zod";

const createDigest = (activity: object) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(activity))
    .digest("base64");
};

const textOf = (header: { [key: string]: string }, order: string[]) => {
  // 検証する時は order(リクエストヘッダーのSignatureをパースして取得したheadersの値) の順で文字列を作る
  return order
    .filter((key) => key in header)
    .map((key) => `${key}: ${header[key]}`)
    .join("\n");
};

const getSignature = (textToSign: string, privateKey: string) => {
  const sig = crypto.createSign("sha256").update(textToSign).end();
  return sig.sign(privateKey, "base64");
};

// TODO: 理解する
// https://docs.joinmastodon.org/spec/security/
export const signActivity = (
  activity: AP.Activity,
  inboxUrl: URL,
  publicKeyId: string,
  privateKey: string
) => {
  const order = ["(request-target)", "host", "date", "digest"];
  const header = {
    host: inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(activity)}`,
  };
  const headerToSign = {
    "(request-target)": `post ${inboxUrl.pathname}`,
    ...header,
  };
  const textToSign = textOf(headerToSign, order);
  const signature = getSignature(textToSign, privateKey);
  return {
    ...header,
    signature:
      `keyId="${publicKeyId}",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};

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
