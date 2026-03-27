// Import Node.js Dependencies
import { EventEmitter } from "node:events";
import path from "node:path";

// Import Third-party Dependencies
import hyperid from "hyperid";
import type {
  AstAnalyserOptions,
  Type
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  PooledWorker,
  type WorkerHandle,
  type PooledWorkerEvents
} from "./PooledWorker.class.ts";
import type { ScanResultPayload } from "../types.ts";

export type WorkerFactory = (events: PooledWorkerEvents) => WorkerHandle;

export interface NpmTarballWorkerPoolOptions {
  /**
   * Number of workers in the pool
   * @default 4
   */
  workerCount?: number;

  /**
   * Factory used to create each worker in the pool.
   * Defaults to creating a real PooledWorker backed by a worker thread.
   * Override in tests to inject a mock without patching modules.
   */
  workerFactory?: WorkerFactory;
}

export interface WorkerTask {
  /**
   * Location of the package to scan (e.g. tarball path or directory path).
   */
  location: string;
  /**
   * Options for the AST analyser.
   * `collectables` is not supported and should not be provided,
   * as collectable sets are managed separately via the `collectableTypes` option.
   */
  astAnalyserOptions?: Omit<AstAnalyserOptions, "collectables">;
  /**
   * Collectable types to gather during scanning (e.g. "url", "hostname").
   * Results are serialized and returned in ScanResultPayload.collectables.
   */
  collectableTypes?: Type[];
}

export interface WorkerTaskWithId extends WorkerTask {
  id: string;
}

type WorkerTaskResultOk = {
  id: string;
  result: ScanResultPayload;
};

type WorkerTaskResultErr = {
  id: string;
  error: string;
};

export type WorkerTaskResult =
  | WorkerTaskResultOk
  | WorkerTaskResultErr;

interface TaskPromiseHandler {
  resolve: (result: ScanResultPayload) => void;
  reject: (error: Error) => void;
}

/**
 * O(1) amortized FIFO queue using a head-pointer to avoid
 * the O(n) cost of Array.shift().
 */
class TaskQueue {
  #items: WorkerTaskWithId[] = [];
  #head = 0;

  enqueue(
    task: WorkerTaskWithId
  ): void {
    this.#items.push(task);
  }

  dequeue(): WorkerTaskWithId | undefined {
    if (this.#head >= this.#items.length) {
      return undefined;
    }
    const item = this.#items[this.#head++];
    if (this.#head > 0 && this.#head >= this.#items.length / 2) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }

    return item;
  }

  clear(): void {
    this.#items = [];
    this.#head = 0;
  }
}

export class NpmTarballWorkerPool extends EventEmitter {
  #generateTaskId = hyperid();
  #workers: WorkerHandle[] = [];
  #availableWorkers: WorkerHandle[] = [];
  #processingTasks: Map<string, TaskPromiseHandler> = new Map();
  #waitingTasks = new TaskQueue();
  #isTerminated = false;

  constructor(
    options: NpmTarballWorkerPoolOptions = {}
  ) {
    super();

    const { workerCount = 4, workerFactory } = options;
    const workerPath = path.join(
      import.meta.dirname,
      "NpmTarballWorkerScript.js"
    );
    const factory: WorkerFactory = workerFactory ??
      ((events) => new PooledWorker(workerPath, events));

    for (let i = 0; i < workerCount; i++) {
      const worker = factory({
        onComplete: (
          worker,
          message
        ) => this.#onWorkerComplete(worker, message),
        onError: (
          worker,
          error,
          taskId
        ) => this.#onWorkerError(worker, error, taskId)
      });

      this.#workers.push(worker);
      this.#availableWorkers.push(worker);
    }
  }

  #onWorkerComplete(
    worker: WorkerHandle,
    message: WorkerTaskResult
  ): void {
    const handler = this.#processingTasks.get(message.id);
    if (handler) {
      this.#processingTasks.delete(message.id);

      if ("error" in message) {
        handler.reject(new Error(message.error));
      }
      else {
        handler.resolve(message.result);
      }
    }

    const nextTask = this.#waitingTasks.dequeue();
    if (nextTask) {
      worker.execute(nextTask);
    }
    else {
      this.#availableWorkers.push(worker);
    }
  }

  #onWorkerError(
    worker: WorkerHandle,
    error: Error,
    taskId: string | null
  ): void {
    if (taskId) {
      const handler = this.#processingTasks.get(taskId);
      if (handler) {
        this.#processingTasks.delete(taskId);
        handler.reject(error);
      }
    }

    this.emit("error", error);
    const nextTask = this.#waitingTasks.dequeue();
    if (nextTask) {
      worker.execute(nextTask);
    }
    else {
      this.#availableWorkers.push(worker);
    }
  }

  scan(
    task: WorkerTask
  ): Promise<ScanResultPayload> {
    if (this.#isTerminated) {
      return Promise.reject(
        new Error("NpmTarballWorkerPool has been terminated")
      );
    }

    const fullTask: WorkerTaskWithId = {
      id: this.#generateTaskId(),
      ...task
    };

    const {
      promise,
      resolve,
      reject
    } = Promise.withResolvers<ScanResultPayload>();
    this.#processingTasks.set(
      fullTask.id,
      { resolve, reject }
    );

    const availableWorker = this.#availableWorkers.pop() ?? null;
    if (availableWorker) {
      availableWorker.execute(fullTask);
    }
    else {
      this.#waitingTasks.enqueue(fullTask);
    }

    return promise;
  }

  async terminate(): Promise<void> {
    this.#isTerminated = true;

    const terminationError = new Error("NpmTarballWorkerPool terminated");
    for (const handler of this.#processingTasks.values()) {
      handler.reject(terminationError);
    }
    this.#processingTasks.clear();
    this.#waitingTasks.clear();
    this.#availableWorkers = [];

    await Promise.all(
      this.#workers.map((worker) => worker.terminate())
    );
    this.#workers = [];
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this.terminate();
  }
}
