// Import Node.js Dependencies
import { Worker } from "node:worker_threads";

// Import Internal Dependencies
import type {
  WorkerTaskWithId,
  WorkerTaskResult
} from "./NpmTarballWorkerPool.class.ts";

export interface PooledWorkerEvents {
  onComplete: (worker: PooledWorker, result: WorkerTaskResult) => void;
  onError: (worker: PooledWorker, error: Error) => void;
}

export class PooledWorker {
  #worker: Worker;
  #currentTaskId: string | null = null;
  #events: PooledWorkerEvents;

  constructor(
    workerPath: string,
    events: PooledWorkerEvents
  ) {
    this.#events = events;
    this.#worker = new Worker(workerPath);

    this.#worker.on("message", (message: WorkerTaskResult) => {
      this.#currentTaskId = null;
      this.#events.onComplete(this, message);
    });

    this.#worker.on("error", (error: Error) => {
      this.#currentTaskId = null;
      this.#events.onError(this, error);
    });
  }

  get isAvailable(): boolean {
    return this.#currentTaskId === null;
  }

  get currentTaskId(): string | null {
    return this.#currentTaskId;
  }

  execute(
    task: WorkerTaskWithId
  ): void {
    if (!this.isAvailable) {
      throw new Error(`Worker is busy with task ${this.#currentTaskId}`);
    }

    this.#currentTaskId = task.id;
    this.#worker.postMessage(task);
  }

  terminate(): Promise<number> {
    return this.#worker.terminate();
  }
}
