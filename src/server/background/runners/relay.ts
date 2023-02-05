import type { AP } from "activitypub-core-types";
import got from "got";
import { signHeaders } from "../../../utils/httpSignature";
import { logger } from "../../../utils/logger";

export const relayActivity = async (params: {
  activity: AP.Activity;
  publicKeyId: string;
  privateKey: string;
}) => {
  // TODO: 連合先の各サーバーに送信するようにする
  const inboxUrl = new URL("https://misskey.paas.mkizka.dev/inbox");
  const headers = signHeaders(
    params.activity,
    inboxUrl,
    params.publicKeyId,
    params.privateKey
  );
  const response = await got(inboxUrl, {
    method: "POST",
    json: params.activity,
    headers,
  });
  logger.info(`${inboxUrl}: ${response.body}`);
};
