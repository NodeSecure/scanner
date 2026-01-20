// Import Third-party Dependencies
import { AstAnalyser, type AstAnalyserOptions, type ReportOnFile } from "@nodesecure/js-x-ray";

interface WorkerMessage {
  files: string[];
  options: {
    astAnalyserOptions?: AstAnalyserOptions;
    fileOptions: {
      packageName?: string;
    };
  };
  isWarmup?: boolean;
}

interface WorkerResponse {
  /**
   * Success flag
   */
  s: boolean;
  /**
   * Result data
   */
  r?: ReportOnFile | null;
  /**
   * Error details
   */
  e?: {
    /**
     * Error code
     */
    c: string;
    /**
     * Error message
     */
    m: string;
    /**
     * File path
     */
    f: string;
  };
  /**
   * The specific file this result corresponds to
   */
  file: string;
}

let analyser: AstAnalyser | null = null;

export default async function analyzeBatch(message: WorkerMessage): Promise<WorkerResponse[]> {
  const { files, options } = message;
  const results: WorkerResponse[] = [];

  if (!analyser) {
    analyser = new AstAnalyser(options.astAnalyserOptions);
  }

  if (message.isWarmup) {
    // Just triggering instantiation is enough to warm up the module loading
    return [];
  }

  // Iterate synchronously to avoid context switching and cache thrashing
  for (const filePath of files) {
    try {
      const result = await analyser.analyseFile(filePath, options.fileOptions);

      results.push({
        s: true,
        r: result,
        file: filePath
      });
    }
    catch (error: any) {
      results.push({
        s: false,
        file: filePath,
        e: {
          c: error.code || "UNKNOWN_ERROR",
          m: error.message,
          f: filePath
        }
      });
    }
  }

  return results;
}
