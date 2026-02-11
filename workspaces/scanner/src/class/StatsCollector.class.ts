// Import Node.js Dependencies
import { EventEmitter } from "node:events";

// Import Third-party Dependencies
import { isHTTPError } from "@openally/httpie";

// Import Internal Dependencies
import { SystemDateProvider, type DateProvider } from "./DateProvider.class.ts";
import type { LoggerEventsMap } from "./logger.class.ts";
import type { ApiStats, Stats, Error } from "../types.ts";

export class StatsCollector {
  #logger: EventEmitter<LoggerEventsMap>;
  #dateProvider: DateProvider;
  #apiCalls: ApiStats[] = [];
  #startedAt: number;
  #errors: Error[] = [];

  constructor(logger: EventEmitter<LoggerEventsMap>, dateProvider: DateProvider = new SystemDateProvider()) {
    this.#logger = logger;
    this.#dateProvider = dateProvider;
    this.#startedAt = this.#dateProvider.now();
  }

  track<T extends () => any>(name: string, phase: string, fn: T): ReturnType<T> {
    const startedAt = this.#dateProvider.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .then((res: ReturnType<T>) => {
            this.#addApiStat(name, startedAt, this.#calcExecutionTime(startedAt));

            return res;
          })
          .catch((err) => {
            const executionTime = this.#calcExecutionTime(startedAt);
            this.#addError({
              name, err, executionTime, phase
            });
            this.#addApiStat(name, startedAt, executionTime);

            throw err;
          }) as ReturnType<T>;
      }

      this.#addApiStat(name, startedAt, this.#calcExecutionTime(startedAt));

      return result;
    }
    catch (err) {
      const executionTime = this.#calcExecutionTime(startedAt);
      this.#addApiStat(name, startedAt, executionTime);
      this.#addError({
        name, err, executionTime, phase
      });
      throw err;
    }
  }

  #calcExecutionTime(startedAt: number) {
    return this.#dateProvider.now() - startedAt;
  }

  #addApiStat(name: string, startedAt: number, executionTime: number) {
    this.#apiCalls.push({
      name,
      startedAt,
      executionTime
    });
  }

  #addError(params: {
    name: string;
    executionTime: number;
    err: unknown;
    phase: string | undefined;
  }) {
    const { name, executionTime, err, phase } = params;
    const error: Error = {
      name
    };
    if (err instanceof Error) {
      error.message = err.message;
      error.stack = err.stack;
    }
    if (isHTTPError(err)) {
      error.statusCode = err.statusCode;
    }
    this.#errors.push(error);
    this.#logger.emit("error", { ...error, executionTime }, phase);
  }

  getStats(): Stats {
    return {
      startedAt: this.#startedAt,
      executionTime: this.#dateProvider.now() - this.#startedAt,
      apiCalls: this.#apiCalls,
      apiCallsCount: this.#apiCalls.length,
      errorCount: this.#errors.length,
      errors: this.#errors
    };
  }
}
