// Import Node.js Dependencies
import { EventEmitter } from "node:events";
import path from "node:path";

// Import Third-party Dependencies
import hyperid from "hyperid";
// import { type Result, Ok, Err } from "@openally/result";
import type { AstAnalyserOptions } from "@nodesecure/js-x-ray";
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { PooledWorker } from "./PooledWorker.class.ts";

export interface NpmTarballWorkerPoolOptions {
  /**
   * Number of workers in the pool
   * @default 4
   */
  workerCount?: number;
}

export interface WorkerTask {
  location: string;
  astAnalyserOptions?: AstAnalyserOptions;
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

export type WorkerTaskResult = WorkerTaskResultOk | WorkerTaskResultErr;

export interface ScanResultPayload {
  description?: string;
  engines?: Record<string, any>;
  repository?: any;
  scripts?: Record<string, string>;
  author?: Contact | null;
  integrity?: string | null;
  type: string;
  size: number;
  licenses: any[];
  uniqueLicenseIds: string[];
  warnings: any[];
  flags: string[];
  composition: {
    extensions: string[];
    files: string[];
    minified: string[];
    unused: string[];
    missing: string[];
    required_files: string[];
    required_nodejs: string[];
    required_thirdparty: string[];
    required_subpath: Record<string, string>;
  };
}

interface TaskPromiseHandler {
  resolve: (result: ScanResultPayload) => void;
  reject: (error: Error) => void;
}

export class NpmTarballWorkerPool extends EventEmitter {
  #generateTaskId = hyperid();
  #workers: PooledWorker[] = [];
  #processingTasks: Map<string, TaskPromiseHandler> = new Map();
  #waitingTasks: WorkerTaskWithId[] = [];
  #isTerminated = false;

  constructor(
    options: NpmTarballWorkerPoolOptions = {}
  ) {
    super();

    const { workerCount = 4 } = options;
    const workerPath = path.join(
      import.meta.dirname,
      "NpmTarballWorkerScript.js"
    );

    for (let i = 0; i < workerCount; i++) {
      const worker = new PooledWorker(workerPath, {
        onComplete: (worker, message) => this.#onWorkerComplete(worker, message),
        onError: (worker, error) => this.#onWorkerError(worker, error)
      });

      this.#workers.push(worker);
    }
  }

  #onWorkerComplete(
    worker: PooledWorker,
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

    const nextTask = this.#waitingTasks.shift();
    if (nextTask) {
      worker.execute(nextTask);
    }
  }

  #onWorkerError(
    worker: PooledWorker,
    error: Error
  ): void {
    const taskId = worker.currentTaskId;
    if (taskId) {
      const handler = this.#processingTasks.get(taskId);
      if (handler) {
        this.#processingTasks.delete(taskId);
        handler.reject(error);
      }
    }

    this.emit("error", error);
    const nextTask = this.#waitingTasks.shift();
    if (nextTask) {
      worker.execute(nextTask);
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

    const { promise, resolve, reject } = Promise.withResolvers<ScanResultPayload>();
    this.#processingTasks.set(fullTask.id, { resolve, reject });

    const availableWorker = this.#workers.find((worker) => worker.isAvailable) ?? null;
    if (availableWorker) {
      availableWorker.execute(fullTask);
    }
    else {
      this.#waitingTasks.push(fullTask);
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
    this.#waitingTasks = [];

    await Promise.all(
      this.#workers.map((worker) => worker.terminate())
    );
    this.#workers = [];
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this.terminate();
  }
}
