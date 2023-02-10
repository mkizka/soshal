import type { AP } from "activitypub-core-types";
import crypto from "crypto";
import { textOf } from "./utils";

const createDigest = (activity: object) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(activity))
    .digest("base64");
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
