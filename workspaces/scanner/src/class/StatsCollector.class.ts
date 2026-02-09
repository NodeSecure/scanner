// Import Third-party Dependencies
import { isHTTPError } from "@openally/httpie";

// Import Internal Dependencies
import { SystemDateProvider, type DateProvider } from "./DateProvider.class.ts";
import type { ApiStats, Stats, Error } from "../types.ts";

export class StatsCollector {
  #apiCalls: ApiStats[] = [];
  #dateProvider: DateProvider;
  #startedAt: number;
  #errors: Error[] = [];

  constructor(dateProvider: DateProvider = new SystemDateProvider()) {
    this.#dateProvider = dateProvider;
    this.#startedAt = this.#dateProvider.now();
  }

  track<T extends () => any>(name: string, fn: T): ReturnType<T> {
    const startedAt = this.#dateProvider.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .catch((err) => {
            this.#addError(name, err);
            throw err;
          })
          .finally(() => this.#addApiStat(name, startedAt)
          ) as ReturnType<T>;
      }

      this.#addApiStat(name, startedAt);

      return result;
    }
    catch (err) {
      this.#addApiStat(name, startedAt);
      this.#addError(name, err);
      throw err;
    }
  }

  #addApiStat(name: string, startedAt: number) {
    this.#apiCalls.push({
      name,
      startedAt,
      executionTime: this.#dateProvider.now() - startedAt
    });
  }

  #addError(name: string, err: unknown) {
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
