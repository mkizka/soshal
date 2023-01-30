import { env } from "../env/server.mjs";
import { globalize } from "../utils/globalize";
import { logger } from "../utils/logger";

type QueueItem = object;

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
      if (item) this.doTask(item);
    } catch (e) {
      logger.error(`queue.runBackground: ${e}`);
    }
    setTimeout(() => {
      if (this.isActive) this.runBackground();
    }, 100);
  }

  private doTask(item: QueueItem) {
    logger.info(`doTask: ${JSON.stringify(item)}`);
    // TODO: タスクの処理を書く
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
