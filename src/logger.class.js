// Import Node.js Dependencies
import { EventEmitter } from "events";
import { performance } from "perf_hooks";

export default class Logger extends EventEmitter {
  constructor() {
    super();

    this.runningEvents = new Map();
  }

  start(eventName) {
    if (this.runningEvents.has(eventName)) {
      return this;
    }

    this.runningEvents.set(eventName, {
      startedAt: performance.now(),
      count: 0
    });
    this.emit("start", eventName);

    return this;
  }

  tick(eventName) {
    if (!this.runningEvents.has(eventName)) {
      return this;
    }

    this.runningEvents.get(eventName).count++;
    this.emit("tick", eventName);

    return this;
  }

  count(eventName) {
    return this.runningEvents.get(eventName)?.count ?? 0;
  }

  end(eventName) {
    if (!this.runningEvents.has(eventName)) {
      return this;
    }

    const data = this.runningEvents.get(eventName);
    this.emit("end", eventName, {
      executionTime: Date.now() - data.startedAt
    });
    this.runningEvents.delete(eventName);

    return this;
  }
}
