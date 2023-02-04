import crypto from "crypto";

// TODO: 理解する
// https://docs.joinmastodon.org/spec/security/
export const signHeaders = (
  data: object,
  inboxUrl: URL,
  publicKeyId: string,
  privateKey: string
) => {
  const date = new Date().toUTCString();
  const s256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("base64");
  const sig = crypto
    .createSign("sha256")
    .update(
      `(request-target): post ${inboxUrl.pathname}\n` +
        `host: ${inboxUrl.host}\n` +
        `date: ${date}\n` +
        `digest: SHA-256=${s256}`
    )
    .end();
  const b64 = sig.sign(privateKey, "base64");
  const headers = {
    Host: inboxUrl.host,
    Date: date,
    Digest: `SHA-256=${s256}`,
    Signature:
      `keyId="${publicKeyId}",` +
      `algorithm="rsa-sha256",` +
      `headers="(request-target) host date digest",` +
      `signature="${b64}"`,
    Accept: "application/activity+json",
    "Content-Type": "application/activity+json",
    "Accept-Encoding": "gzip",
  };
  return headers;
};
