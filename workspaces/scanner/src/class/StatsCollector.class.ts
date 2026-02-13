// Import Node.js Dependencies
import { EventEmitter } from "node:events";

// Import Third-party Dependencies
import { isHTTPError } from "@openally/httpie";

// Import Internal Dependencies
import { SystemDateProvider, type DateProvider } from "./DateProvider.class.ts";
import { type LoggerEventsMap, Logger } from "./logger.class.ts";
import type { ApiStats, Stats, Error } from "../types.ts";

export type Providers = {
  dateProvider?: DateProvider;
  logger?: EventEmitter<LoggerEventsMap>;
};

export type Options = {
  isVerbose: boolean;
};

export class StatsCollector {
  #logger: EventEmitter<LoggerEventsMap>;
  #dateProvider: DateProvider;
  #apiCalls: ApiStats[] = [];
  #startedAt: number;
  #errors: Error[] = [];
  #isVerbose: boolean;

  constructor(providers: Providers, options: Options) {
    const { dateProvider = new SystemDateProvider(), logger = new Logger() } = providers;
    this.#logger = logger;
    this.#dateProvider = dateProvider;
    this.#startedAt = this.#dateProvider.now();
    this.#isVerbose = options.isVerbose;
  }

  track<T extends () => any>(name: string, phase: string, fn: T): ReturnType<T> {
    const startedAt = this.#dateProvider.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .then((res: ReturnType<T>) => {
            this.#addApiStatVerbose(name, startedAt, this.#calcExecutionTime(startedAt));

            return res;
          })
          .catch((err) => {
            const executionTime = this.#calcExecutionTime(startedAt);
            this.#addError({
              name, err, executionTime, phase
            });
            this.#apiCalls.push({
              name,
              startedAt,
              executionTime
            });
            throw err;
          }) as ReturnType<T>;
      }

      this.#addApiStatVerbose(name, startedAt, this.#calcExecutionTime(startedAt));

      return result;
    }
    catch (err) {
      const executionTime = this.#calcExecutionTime(startedAt);
      this.#apiCalls.push({
        name,
        startedAt,
        executionTime
      });
      this.#addError({
        name, err, executionTime, phase
      });
      throw err;
    }
  }

  #calcExecutionTime(startedAt: number) {
    return this.#dateProvider.now() - startedAt;
  }

  #addApiStatVerbose(name: string, startedAt: number, executionTime: number) {
    const stat = {
      name,
      startedAt,
      executionTime
    };
    this.#apiCalls.push(stat);
    if (this.#isVerbose) {
      this.#logger.emit("stat", stat);
    }
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
