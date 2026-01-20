import { AstAnalyser } from '@nodesecure/js-x-ray';
import type { AstAnalyserOptions, ReportOnFile } from '@nodesecure/js-x-ray';

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
  s: boolean; // success
  r?: ReportOnFile | null; // result
  e?: {
    c: string; // code
    m: string; // message
    f: string; // filepath
  };
  file: string; // The specific file this result corresponds to
}

let analyser: AstAnalyser | null = null;

export default async function analyzeBatch(message: WorkerMessage): Promise<WorkerResponse[]> {
  const { files, options } = message;
  const results: WorkerResponse[] = [];

  if (!analyser) {
    analyser = new AstAnalyser(options.astAnalyserOptions);
  }

  if (message.isWarmup) {
    // Just triggering instantiation (line 31) is enough to warm up the module loading
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
    } catch (error: any) {
      results.push({
        s: false,
        file: filePath,
        e: {
          c: error.code || 'UNKNOWN_ERROR',
          m: error.message,
          f: filePath
        }
      });
    }
  }

  return results;
}
