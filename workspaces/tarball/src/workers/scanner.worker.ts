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
  success: boolean;
  result?: ReportOnFile | null;
  error?: {
    code: string;
    message: string;
    filePath: string;
  };
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
        success: true,
        result,
        file: filePath
      });
    }
    catch (err: any) {
      results.push({
        success: false,
        file: filePath,
        error: {
          code: err.code || "UNKNOWN_ERROR",
          message: err.message,
          filePath
        }
      });
    }
  }

  return results;
}
