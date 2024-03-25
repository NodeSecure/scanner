import Scanner, { Payload, PayloadComparison } from "./scanner.js";
import { Logger, LoggerEvents } from "./logger.js";

export {
  cwd,
  from,
  verify,
  comparePayloads,
  ScannerLoggerEvents,
}
declare const ScannerLoggerEvents: LoggerEvents;

declare function cwd(location: string, options?: Scanner.Options, logger?: Logger): Promise<Scanner.Payload>;
declare function from(packageName: string, options?: Omit<Scanner.Options, "includeDevDeps">, logger?: Logger): Promise<Scanner.Payload>;
declare function verify(packageName?: string | null): Promise<Scanner.VerifyPayload>;
declare function comparePayloads(original: Payload, toCompare: Payload): PayloadComparison


export interface DependencyRef {
  id: number;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  description: string;
  size: number;
  authors: Record<string, any>;
  engines: Record<string, any>;
  repository: any;
  scripts: Record<string, string>;
  warnings: any;
  license: any;
  gitUrl: string | null;
  composition: {
    extensions: string[];
    files: string[];
    minified: string[];
    unused: string[];
    missing: string[];
    alias: Record<string, any>;
    required_files: string[];
    required_nodejs: string[];
    required_thirdparty: string[];
    required_subpath: Record<string, string>;
  }
}

export interface PlainDependencyObject {
  versions: {
    [version: string]: {
      id: number;
      usedBy: { [name: string]: string };
      isDevDependency: boolean;
      existOnRemoteRegistry: boolean;
      flags: string[];
      description: string;
      size: number;
      author: {};
      engines: {};
      repository: {};
      scripts: {};
      warnings: string[];
      composition: {
        extensions: string[];
        files: string[];
        minified: string[];
        unused: string[];
        missing: string[];
        alias: { [name: string]: string };
        required_files: string[];
        required_nodejs: string[];
        required_thirdparty: string[];
        required_subpath: string[];
      };
      license: string;
      gitUrl: string | null;
    };
  };
  vulnerabilities: any[]; // Define a proper type for vulnerabilities if possible
  metadata: {
    dependencyCount: number;
    publishedCount: number;
    lastUpdateAt: Date | null;
    lastVersion: string | null;
    hasManyPublishers: boolean;
    hasReceivedUpdateInOneYear: boolean;
    homepage: string | null;
    author: {};
    publishers: string[];
    maintainers: string[];
  };
}

