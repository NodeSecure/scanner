// Import Node.js Dependencies
import { EventEmitter } from "events";
import { performance } from "perf_hooks";

export default class Logger extends EventEmitter {
  constructor() {
    super();

    this.events = new Map();
  }

  start(eventName) {
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

  tick(eventName) {
    if (!this.events.has(eventName)) {
      return this;
    }

    this.events.get(eventName).count++;
    this.emit("tick", eventName);

    return this;
  }

  count(eventName) {
    return this.events.get(eventName)?.count ?? 0;
  }

  end(eventName) {
    if (!this.events.has(eventName)) {
      return this;
    }

    const data = this.events.get(eventName);
    this.emit("end", eventName, {
      ...data,
      executionTime: performance.now() - data.startedAt
    });

    return this;
  }
}
