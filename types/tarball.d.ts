import ntlp from "@nodesecure/ntlp";
import Locker from "@slimio/lock";
import Logger from "../src/logger.class";

export = tarball;

declare namespace tarball {
  export interface ManifestData {
    /** Dependencies in package.json */
    packageDeps: string[];
    /** DevDependencies in package.json */
    packageDevDeps: string[];
    /** Does package.json contain a 'gypfile' property ? */
    packageGyp: boolean;
  }

  export interface ScannedFileResult {
    /** Dependencies in try/catch block (probably optional dependencies) */
    inTryDeps: string[];
    /** Dependencies required or imported */
    dependencies: string[];
    /** Required or imported javascript files */
    filesDependencies: string[];
  }

  export interface ScannedPackageResult {
    files: {
      /** Complete list of files for the given package */
      list: string[];
      /** Complete list of extensions (.js, .md etc.) */
      extensions: string[];
      /** List of minified javascript files */
      minified: string[];
    };
    /** Size of the directory in bytes */
    directorySize: number;
    /** Unique license contained in the tarball (MIT, ISC ..) */
    uniqueLicenseIds: string[];
    /** All licenses with their SPDX */
    licenses: ntlp.license[];
    ast: {
      dependencies: any;
      warnings: any[];
    };
  }

  export interface ScanDirOrArchiveOptions {
    ref: any;
    locker: Locker;
    tmpLocation: string;
    logger: Logger;
  }

  export interface ScanFileOptions {
    name: string;
    ref: any;
  }

  export function readManifest(dest: string, ref: any): Promise<ManifestData>;
  export function scanFile(dest: string, file: string, options: ScanFileOptions): Promise<ScannedFileResult | null>;
  export function scanPackage(dest: string, packageName?: string): Promise<ScannedPackageResult>;
  export function scanDirOrArchive(name: string, version: string, options: ScanDirOrArchiveOptions): Promise<void>;
}
