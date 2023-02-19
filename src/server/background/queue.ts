import { env } from "../../utils/env";
import { globalize } from "../../utils/globalize";
import { logger } from "../../utils/logger";
import { relayActivity } from "./runners/relay";

const runners = {
  relayActivity,
};

type Runner = typeof runners;

type QueueItem<RunnerType extends keyof Runner = keyof Runner> = {
  runner: RunnerType;
  params: Parameters<Runner[RunnerType]>[0];
};

class Queue {
  private isActive = true;
  private isStarted = false;
  private queue: QueueItem[] = [];

  constructor() {
    logger.info("Queueが初期化されました");
    this.startBackground();
  }

  public push<T extends keyof Runner>(item: QueueItem<T>) {
    this.queue.push(item);
  }

  public startBackground() {
    if (env.NODE_ENV == "test") {
      // テスト時はQueueを開始しない
      return;
    }
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
      if (item) runners[item.runner](item.params);
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
