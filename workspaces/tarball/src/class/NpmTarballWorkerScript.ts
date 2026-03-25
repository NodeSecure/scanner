// Import Node.js Dependencies
import { parentPort } from "node:worker_threads";

// Import Third-party Dependencies
import {
  DefaultCollectableSet
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { scanPackageCore } from "../tarball.ts";

import type {
  WorkerTaskWithId,
  WorkerTaskResult
} from "./NpmTarballWorkerPool.class.ts";

if (!parentPort) {
  throw new Error("This script must be run as a worker thread.");
}

parentPort.on("message", onWorkerMessage);

async function onWorkerMessage(
  task: WorkerTaskWithId
) {
  let message: WorkerTaskResult;

  try {
    const collectables = (task.collectableTypes ?? []).map(
      (type) => new DefaultCollectableSet(type)
    );

    const result = await scanPackageCore(
      task.location,
      {
        ...task.astAnalyserOptions,
        collectables
      }
    );

    message = {
      id: task.id,
      result: {
        ...result,
        collectables: collectables.map((set) => set.toJSON())
      }
    };
  }
  catch (error) {
    const messageError = error instanceof Error ?
      error.message :
      String(error);

    message = {
      id: task.id,
      error: messageError
    };
  }

  parentPort?.postMessage(message);
}
