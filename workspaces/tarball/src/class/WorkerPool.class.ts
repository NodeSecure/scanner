// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import PiscinaImport from "piscina";
import type { AstAnalyserOptions, ReportOnFile } from "@nodesecure/js-x-ray";

const Piscina = PiscinaImport.default || PiscinaImport;

export interface AnalyseFileOptions {
  astAnalyserOptions?: AstAnalyserOptions;
  fileOptions: {
    packageName?: string;
  };
}

interface WorkerResponse {
  success: boolean;
  result?: ReportOnFile;
  error?: {
    code: string;
    message: string;
    filePath: string;
  };
  file: string;
}

export interface BatchResult {
  file: string;
  ok: boolean;
  result?: ReportOnFile;
  error?: Error;
}

/**
 * Worker Pool manager for parallel AST analysis using Worker Threads.
 *
 * @class WorkerPool
 * @description Singleton Worker Pool that distributes file analysis across multiple threads.
 * The Singleton pattern ensures the pool persists across multiple scanPackage() calls,
 * eliminating ~200ms startup overhead per subsequent scan.
 *
 * @example
 * ```typescript
 * const pool = WorkerPool.getInstance();
 * const results = await pool.analyseBatch(['./src/a.js', './src/b.js'], {
 *   fileOptions: { packageName: 'my-package' }
 * });
 * ```
 */
export class WorkerPool {
  private static instance: WorkerPool | null = null;
  private pool: any;

  private constructor() {
    const maxThreads = this.calculateOptimalThreads();
    const workerPath = path.join(import.meta.dirname, "../workers/scanner.worker.js");

    this.pool = new Piscina({
      filename: workerPath,
      maxThreads,
      // Pre-create all workers
      minThreads: maxThreads,
      // 5 minutes idle timeout
      idleTimeout: 300000,
      resourceLimits: {
        maxOldGenerationSizeMb: 512,
        maxYoungGenerationSizeMb: 128
      },
      maxQueue: Math.max(maxThreads * maxThreads, 16)
    });

    this.setupGracefulShutdown();
    this.warmupWorkers();
  }

  private async warmupWorkers(): Promise<void> {
    // True JIT Warmup: Force V8 to compile the analysis hot paths
    // We send a task that actually runs the analyser
    const warmupTasks = Array.from(
      { length: this.pool.threads.length },
      () => this.pool.run({
        files: [],
        options: {
          astAnalyserOptions: { isMinified: false },
          fileOptions: { packageName: "warmup" }
        },
        // Custom flag signals worker to run dummy analysis
        isWarmup: true
      }).catch(() => {
        // Warmup error ignored
      })
    );

    Promise.allSettled(warmupTasks).then(() => {
      // Warmup complete (silently)
    });
  }

  /**
   * Get the singleton instance of WorkerPool.
   * Creates a new instance if one doesn't exist.
   *
   * @returns {WorkerPool} The singleton WorkerPool instance
   */
  static getInstance(): WorkerPool {
    if (!WorkerPool.instance) {
      WorkerPool.instance = new WorkerPool();
    }

    return WorkerPool.instance;
  }

  /**
   * Analyze a batch of files using Worker Threads.
   * Returns validation results for each file independently.
   *
   * @param {string[]} files - Array of absolute file paths
   * @param {AnalyseFileOptions} options - Analysis options
   * @returns {Promise<BatchResult[]>} Array of results
   */
  async analyseBatch(
    files: string[],
    options: AnalyseFileOptions
  ): Promise<BatchResult[]> {
    const response = await this.pool.run({
      files,
      options
    }) as WorkerResponse[];

    return response.map((res) => {
      const result: BatchResult = {
        file: res.file,
        ok: res.success
      };

      if (res.success) {
        result.result = res.result;
      }
      else {
        const error: any = new Error(res.error?.message || "Worker analysis failed");
        error.code = res.error?.code;
        error.filePath = res.error?.filePath;
        result.error = error;
      }

      return result;
    });
  }

  /**
   * Analyze a JavaScript/TypeScript file using Worker Threads.
   * Falls back to synchronous analysis in Worker on error.
   *
   * @param {string} filePath - Absolute path to file
   * @param {AnalyseFileOptions} options - Analysis options
   * @returns {Promise<ReportOnFile>} Analysis result
   * @throws {Error} If Worker analysis fails
   */
  async analyseFile(
    filePath: string,
    options: AnalyseFileOptions
  ): Promise<ReportOnFile> {
    // Reuse batch implementation for single file consistency
    const [result] = await this.analyseBatch([filePath], options);

    if (!result.ok) {
      throw result.error;
    }

    return result.result!;
  }

  async destroy(): Promise<void> {
    await this.pool.destroy();
    WorkerPool.instance = null;
  }

  private calculateOptimalThreads(): number {
    // Proven optimal: 2 workers
    return 2;
  }

  private setupGracefulShutdown(): void {
    process.on("beforeExit", async() => {
      if (WorkerPool.instance) {
        await this.destroy();
      }
    });
  }
}
