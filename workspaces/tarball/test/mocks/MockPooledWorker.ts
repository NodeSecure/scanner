// Import Internal Dependencies
import type {
  WorkerHandle,
  PooledWorkerEvents
} from "../../src/class/PooledWorker.class.ts";
import type {
  ScanResultPayload
} from "../../src/types.ts";

export const capturedWorkers: MockPooledWorker[] = [];
export let terminateCallCount = 0;

export function resetMockState(): void {
  capturedWorkers.length = 0;
  terminateCallCount = 0;
}

export class MockPooledWorker implements WorkerHandle {
  currentTaskId: string | null = null;
  #events: PooledWorkerEvents;

  constructor(
    events: PooledWorkerEvents
  ) {
    this.#events = events;
    capturedWorkers.push(this);
  }

  get isAvailable(): boolean {
    return this.currentTaskId === null;
  }

  execute(
    task: { id: string; }
  ): void {
    if (!this.isAvailable) {
      throw new Error(`Worker is busy with task ${this.currentTaskId}`);
    }
    this.currentTaskId = task.id;
  }

  simulateSuccess(
    result: ScanResultPayload
  ): void {
    const id = this.currentTaskId!;
    this.currentTaskId = null;
    this.#events.onComplete(this, { id, result });
  }

  simulateErrorResult(
    errorMsg: string
  ): void {
    const id = this.currentTaskId!;
    this.currentTaskId = null;
    this.#events.onComplete(this, { id, error: errorMsg });
  }

  simulateCrash(
    error: Error
  ): void {
    const taskId = this.currentTaskId;
    this.currentTaskId = null;
    this.#events.onError(this, error, taskId);
  }

  terminate(): Promise<number> {
    terminateCallCount++;

    return Promise.resolve(0);
  }
}
