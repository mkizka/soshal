import type { AP } from "activitypub-core-types";
import crypto from "crypto";

const getHeaderToSign = (url: URL, activity: AP.Activity) => {
  const date = new Date().toUTCString();
  const s256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(activity))
    .digest("base64");
  return {
    "(request-target)": `post ${url.pathname}`,
    host: url.host,
    date: date,
    digest: `SHA-256=${s256}`,
  };
};

const textOf = (header: ReturnType<typeof getHeaderToSign>) => {
  return Object.entries(header)
    .map(([k, v]) => `${k}: ${v}`)
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
  const headerToSign = getHeaderToSign(inboxUrl, data);
  const signature = getSignature(textOf(headerToSign), privateKey);
  return {
    Host: headerToSign.host,
    Date: headerToSign.date,
    Digest: headerToSign.digest,
    Signature:
      `keyId="${publicKeyId}",` +
      `algorithm="rsa-sha256",` +
      `headers="(request-target) host date digest",` +
      `signature="${signature}"`,
    Accept: "application/activity+json",
    "Content-Type": "application/activity+json",
    "Accept-Encoding": "gzip",
  };
};

const parse = (signature: string) => {
  for (const column of signature.split(",")) {
    const [k, ..._v] = column.split("=");
    // signature="..." の ... は base64 形式で = が含まれる可能性があるため元に戻す
    const v = _v.join("=");
    if (k && k == "signature" && v && v.startsWith('"') && v.endsWith('"')) {
      return v.slice(1, v.length - 1);
    }
  }
  return null;
};

export const verifyActivity = (
  data: AP.Activity,
  inboxUrl: URL,
  signature: string,
  publicKey: string
) => {
  const header = getHeaderToSign(inboxUrl, data);
  const verify = crypto.createVerify("sha256");
  verify.write(textOf(header));
  verify.end();
  const parsedSignature = parse(signature);
  if (!parsedSignature) {
    return false;
  }
  return verify.verify(publicKey, parsedSignature, "base64");
};
