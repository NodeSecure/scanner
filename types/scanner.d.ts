import { Warning, Dependency, BaseWarning } from "@nodesecure/js-x-ray";
import { license as License } from "@nodesecure/ntlp";
import { Strategy, NpmStrategy, NodeStrategy } from "@nodesecure/vuln";
import { Flags } from "@nodesecure/flags";
import { Maintainer } from "@npm/types";

export = Scanner;

declare namespace Scanner {
  export interface Publisher {
    name: string;
    version: string;
    at: string;
  }

  export interface VersionDescriptor {
    metadata: {
      dependencyCount: number;
      publishedCount: number;
      lastUpdateAt: number;
      lastVersion: number;
      hasChangedAuthor: boolean;
      hasManyPublishers: boolean;
      hasReceivedUpdateInOneYear: boolean;
      author: string | null;
      homepage: string | null;
      maintainers: Maintainer[];
      publishers: Publisher[];
    }
    versions: string[];
    vulnerabilities: (NpmStrategy.Vulnerability | NodeStrategy.Vulnerability)[];
    [version: string]: {
      id: number;
      usedBy: Record<string, string>;
      size: number;
      description: string;
      author: string | Maintainer;
      warnings: Warning<BaseWarning>[];
      composition: {
        extensions: string[];
        files: string[];
        minified: string[];
        required_files: string[];
        required_thirdparty: string[];
        required_nodejs: string[];
        unused: string[];
        missing: string[];
      };
      license: string | License[];
      flags: Flags;
      gitUrl: null | string;
    };
  }

  export interface Payload {
    id: string;
    rootDependencyName: string;
    warnings: [];
    dependencies: Record<string, VersionDescriptor>;
    version: string;
    vulnerabilityStrategy: Strategy.Kind;
  }

  export interface VerifyPayload {
    files: {
      list: string[];
      extensions: string[];
      minified: string[];
    };
    directorySize: number;
    uniqueLicenseIds: string[];
    licenses: License[];
    ast: {
      dependencies: Record<string, Dependency>;
      warnings: Warning<BaseWarning>[];
    };
  }

  export interface Options {
    readonly verbose?: boolean;
    readonly registry?: string | URL;
    readonly maxDepth?: number;
    readonly usePackageLock?: boolean;
    readonly vulnerabilityStrategy: Strategy.Kind;
  }
}
