// Import Node.js Dependencies
import { Worker } from "node:worker_threads";

// Import Internal Dependencies
import type {
  WorkerTaskWithId,
  WorkerTaskResult
} from "./NpmTarballWorkerPool.class.ts";

export interface WorkerHandle {
  isAvailable: boolean;
  execute(
    task: WorkerTaskWithId
  ): void;
  terminate(): Promise<number>;
}

export interface PooledWorkerEvents {
  onComplete: (
    worker: WorkerHandle,
    result: WorkerTaskResult
  ) => void;
  onError: (
    worker: WorkerHandle,
    error: Error,
    taskId: string | null
  ) => void;
}

export class PooledWorker implements WorkerHandle {
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
      const taskId = this.#currentTaskId;
      this.#currentTaskId = null;
      this.#events.onError(this, error, taskId);
    });
  }

  get isAvailable(): boolean {
    return this.#currentTaskId === null;
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
