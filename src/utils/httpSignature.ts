import type { AP } from "activitypub-core-types";
import crypto from "crypto";
import { z } from "zod";

const createDigest = (activity: object) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(activity))
    .digest("base64");
};

const createHeaderToSign = (url: URL, activity: AP.Activity) => {
  return {
    "(request-target)": `post ${url.pathname}`,
    host: url.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(activity)}`,
  };
};

type HeaderToSign = ReturnType<typeof createHeaderToSign>;

const ORDER_OF_HEADER_TO_SIGN: (keyof HeaderToSign)[] = [
  "(request-target)",
  "host",
  "date",
  "digest",
];

const textOf = (header: HeaderToSign, order?: string[]) => {
  // 検証する時は order(リクエストヘッダーのSignatureをパースして取得したheadersの値) の順で文字列を作る
  return (order || ORDER_OF_HEADER_TO_SIGN)
    .filter((key): key is keyof HeaderToSign => key in header)
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
  data: AP.Activity,
  inboxUrl: URL,
  publicKeyId: string,
  privateKey: string
) => {
  const headerToSign = createHeaderToSign(inboxUrl, data);
  const signature = getSignature(textOf(headerToSign), privateKey);
  return {
    Host: headerToSign.host,
    Date: headerToSign.date,
    Digest: headerToSign.digest,
    Signature:
      `keyId="${publicKeyId}",` +
      `algorithm="rsa-sha256",` +
      `headers="${ORDER_OF_HEADER_TO_SIGN.join(" ")}",` +
      `signature="${signature}"`,
  };
};

const signatureSchema = z.object({
  keyId: z.string(),
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

export const verifyActivity = (
  inboxUrl: URL,
  header: ReturnType<typeof signActivity>,
  publicKey: string
) => {
  const parsedSignature = parse(header.Signature);
  if (!parsedSignature) {
    return false;
  }
  const headerToSign = {
    "(request-target)": `post ${inboxUrl.pathname}`,
    host: header.Host,
    date: header.Date,
    digest: header.Digest,
  };
  const textToSign = textOf(headerToSign, parsedSignature.headers.split(" "));
  return createVerify(textToSign).verify(
    publicKey,
    parsedSignature.signature,
    "base64"
  );
};
