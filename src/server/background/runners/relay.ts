import type { AP } from "activitypub-core-types";
import got from "got";
import { signActivity } from "../../../utils/httpSignature";
import { logger } from "../../../utils/logger";

export const relayActivity = async (params: {
  activity: AP.Activity;
  publicKeyId: string;
  privateKey: string;
}) => {
  // TODO: 連合先の各サーバーに送信するようにする
  const inboxUrl = new URL("https://misskey.paas.mkizka.dev/inbox");
  const signedHeaders = signActivity(
    params.activity,
    inboxUrl,
    params.publicKeyId,
    params.privateKey
  );
  const response = await got(inboxUrl, {
    method: "POST",
    json: params.activity,
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${inboxUrl}: ${response.body}`);
};
