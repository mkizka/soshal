import { env } from "../env/server.mjs";
import { logger } from "../utils/logger";

type QueueItem = object;

class Queue {
  private isActive = true;
  private isStarted = false;
  private queue: QueueItem[] = [];

  constructor() {
    logger.info("Queueが初期化されました");
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

// prisma のベストプラクティスを参考
declare global {
  // eslint-disable-next-line no-var
  var _queue: Queue | undefined;
}

export const queue = (() => {
  if (global._queue) {
    return global._queue;
  }
  const newQueue = new Queue();
  newQueue.startBackground();
  return newQueue;
})();

if (env.NODE_ENV !== "production") {
  global._queue = queue;
}
