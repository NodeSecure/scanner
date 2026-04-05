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

export type OnSuccess<T extends () => any> = (
  res: Awaited<ReturnType<T>>,
  stat: ApiStats
) => void;

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

  track<T extends () => any>(options: {
    name: string;
    phase: string;
    fn: T;
    onSuccess?: OnSuccess<T>;
  }): ReturnType<T> {
    const { name, phase, fn, onSuccess } = options;
    const startedAt = this.#dateProvider.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .then((res: ReturnType<T>) => {
            this.#addApiStatVerbose<T>({
              name,
              startedAt,
              executionTime: this.#calcExecutionTime(startedAt),
              result: res,
              onSuccess
            });

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

      this.#addApiStatVerbose({
        name,
        startedAt,
        executionTime: this.#calcExecutionTime(startedAt),
        result,
        onSuccess
      });

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

  #addApiStatVerbose<T extends () => any>({ name, startedAt, executionTime, result, onSuccess }: {
    name: string;
    startedAt: number;
    executionTime: number;
    onSuccess?: OnSuccess<T>;
    result: ReturnType<T>;
  }) {
    const stat = {
      name,
      startedAt,
      executionTime
    };
    if (onSuccess) {
      onSuccess(result as Awaited<ReturnType<T>>, stat);
    }
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
    if (this.#isVerbose) {
      this.#logger.emit("error", { ...error, executionTime }, phase);
    }
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
