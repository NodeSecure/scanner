// Import Third-party Dependencies
import type * as conformance from "@nodesecure/conformance";
import type {
  CollectableSetData
} from "@nodesecure/js-x-ray";
import type {
  PackageModuleType
} from "@nodesecure/mama";

// Import Internal Dependencies
import type { Path } from "./class/SourceCodeScanner.class.ts";

export type { Path } from "./class/SourceCodeScanner.class.ts";

export interface Composition {
  extensions: string[];
  files: string[];
  minified: string[];
  unused: string[];
  missing: string[];
  required_files: string[];
  required_nodejs: string[];
  required_thirdparty: string[];
  required_subpath: Record<string, string>;
}

export interface ScanResultPayload {
  description?: string;
  engines?: Record<string, any>;
  repository?: any;
  scripts?: Record<string, string>;
  author?: any;
  integrity?: string | null;
  type: string;
  size: number;
  licenses: conformance.SpdxFileLicenseConformance[];
  uniqueLicenseIds: string[];
  warnings: any[];
  flags: string[];
  composition: Composition;
  /**
   * Serialized collectable entries populated by the worker thread.
   * Only present when `collectableTypes` was specified in the WorkerTask.
   */
  collectables?: CollectableSetData[];
  path: Path;
}

export interface DependencyRef {
  id: number;
  type: PackageModuleType;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  description: string;
  size: number;
  author: Record<string, any>;
  engines: Record<string, any>;
  repository: any;
  scripts: Record<string, string>;
  warnings: any;
  licenses: conformance.SpdxFileLicenseConformance[];
  uniqueLicenseIds: string[];
  gitUrl: string | null;
  alias: Record<string, string>;
  composition: Composition;
  path?: Path;
}
