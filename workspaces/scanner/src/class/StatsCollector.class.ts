// Import Internal Dependencies
import { SystemDateProvider, type DateProvider } from "./DateProvider.class.ts";

export interface ApiStats {
  name: string;
  startedAt: number;
  executionTime: number;
}

export interface Stats {
  startedAt: number;
  executionTime: number;
  apiCalls: ApiStats[];
  apiCallsCount: number;
}

export class StatsCollector {
  #apiCalls: ApiStats[] = [];
  #dateProvider: DateProvider;
  #startedAt: number;

  constructor(dateProvider: DateProvider = new SystemDateProvider()) {
    this.#dateProvider = dateProvider;
    this.#startedAt = this.#dateProvider.now();
  }

  track<T extends () => any>(name: string, fn: T): ReturnType<T> {
    const startedAt = this.#dateProvider.now();
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => this.#addApiStat(name, startedAt)
        ) as ReturnType<T>;
      }

      this.#addApiStat(name, startedAt);

      return result;
    }
    catch (err) {
      this.#addApiStat(name, startedAt);
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

  getStats(): Stats {
    return {
      startedAt: this.#startedAt,
      executionTime: this.#dateProvider.now() - this.#startedAt,
      apiCalls: this.#apiCalls,
      apiCallsCount: this.#apiCalls.length
    };
  }
}
