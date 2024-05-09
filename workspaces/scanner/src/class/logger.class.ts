// Import Node.js Dependencies
import { EventEmitter } from "node:events";
import { performance } from "node:perf_hooks";

export const ScannerLoggerEvents = {
  done: "depWalkerFinished",
  analysis: {
    tree: "walkTree",
    tarball: "tarball",
    registry: "registry"
  },
  manifest: {
    read: "readManifest",
    fetch: "fetchManifest"
  }
} as const;

export interface LoggerEventData {
  /** UNIX Timestamp */
  startedAt: number;
  /** Count of triggered event */
  count: number;
}

export class Logger extends EventEmitter {
  public events: Map<string, LoggerEventData> = new Map();

  start(eventName: string): this {
    if (this.events.has(eventName)) {
      return this;
    }

    this.events.set(eventName, {
      startedAt: performance.now(),
      count: 0
    });
    this.emit("start", eventName);

    return this;
  }

  tick(eventName: string): this {
    if (!this.events.has(eventName)) {
      return this;
    }

    this.events.get(eventName)!.count++;
    this.emit("tick", eventName);

    return this;
  }

  count(eventName: string): number {
    return this.events.get(eventName)?.count ?? 0;
  }

  end(eventName: string): this {
    if (!this.events.has(eventName)) {
      return this;
    }

    const data = this.events.get(eventName)!;
    this.emit("end", eventName, {
      ...data,
      executionTime: performance.now() - data.startedAt
    });

    return this;
  }
}
