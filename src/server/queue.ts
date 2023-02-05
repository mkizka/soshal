import got from "got";
import type { AP } from "activitypub-core-types";
import { env } from "../env/server.mjs";
import { globalize } from "../utils/globalize";
import { signHeaders } from "../utils/httpSignature";
import { logger } from "../utils/logger";

type QueueItem = () => void | Promise<void>;

class Queue {
  private isActive = true;
  private isStarted = false;
  private queue: QueueItem[] = [];

  constructor() {
    logger.info("Queueが初期化されました");
    this.startBackground();
  }

  public push(item: QueueItem) {
    this.queue.push(item);
  }

  public async pushRelayActivity(
    data: AP.Activity,
    publicKeyId: string,
    privateKey: string
  ) {
    this.push(async () => {
      // TODO: 連合先の各サーバーに送信するようにする
      const inboxUrl = new URL("https://misskey.paas.mkizka.dev/inbox");
      const headers = signHeaders(data, inboxUrl, publicKeyId, privateKey);
      const response = await got(inboxUrl, {
        method: "POST",
        json: data,
        headers,
      });
      //logger.info(`${inboxUrl}: ${response.body}`);
    });
  }

  public startBackground() {
    if (this.isStarted) {
      logger.error("Queueは開始済みです");
      throw new Error();
    }
    this.isStarted = true;
    this.runBackground();
  }

  private runBackground() {
    try {
      const item = this.queue.shift();
      if (item) item();
    } catch (e) {
      logger.error(`queue.runBackground: ${e}`);
    }
    setTimeout(() => {
      if (this.isActive) this.runBackground();
    }, 100);
  }

  public stopBackground() {
    if (env.NODE_ENV != "test") {
      throw new Error(
        "テスト以外でqueue.stopBackground()を使用しないでください"
      );
    }
    this.isActive = false;
  }
}

export const queue = globalize("queue", () => new Queue());
