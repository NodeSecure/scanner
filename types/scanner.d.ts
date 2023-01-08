// Import NodeSecure Dependencies
import * as JSXRay from "@nodesecure/js-x-ray";
import { license as License } from "@nodesecure/ntlp";
import * as Vuln from "@nodesecure/vuln";

// Import Third-party Dependencies
import { Maintainer } from "@npm/types";

export = Scanner;

declare namespace Scanner {
  export interface Publisher {
    /**
     * Publisher npm user name.
     */
    name: string;
    /**
     * Publisher npm user email.
     */
    email: string;
    /**
     * First version published.
     */
    version: string;
    /**
     * Date of the first publication
     * @example 2021-08-10T20:45:08.342Z
     */
    at: string;
  }

  export interface DependencyVersion {
    /** Id of the package (useful for usedBy relation) */
    id: number;
    isDevDependency: boolean;
    /**
     * Tell if the given package exist on the configured remote registry (npm by default)
     * @default true
     */
    existOnRemoteRegistry: boolean;
    /** By whom (id) is used the package */
    usedBy: Record<string, string>;
    /** Size on disk of the extracted tarball (in bytes) */
    size: number;
    /** Package description */
    description: string;
    /** Author of the package. This information is not trustable and can be empty. */
    author: Maintainer;
    engines: {
      node?: string;
      npm?: string;
    };
    repository: {
      type: string;
      url: string;
    };
    scripts: Record<string, string>;
    /**
     * JS-X-Ray warnings
     *
     * @see https://github.com/NodeSecure/js-x-ray/blob/master/WARNINGS.md
     */
    warnings: JSXRay.Warning<JSXRay.WarningDefault>[];
    /** Tarball composition (files and dependencies) */
    composition: {
      /** Files extensions (.js, .md, .exe etc..) */
      extensions: string[];
      files: string[];
      /** Minified files (foo.min.js etc..) */
      minified: string[];
      alias: Record<string, string>;
      required_files: string[];
      required_thirdparty: string[];
      required_nodejs: string[];
      required_subpath: string[];
      unused: string[];
      missing: string[];
    };
    /**
     * Package licenses with SPDX expression.
     *
     * @see https://github.com/NodeSecure/licenses-conformance
     * @see https://github.com/NodeSecure/npm-tarball-license-parser
     */
    license: License[];
    /**
     * Flags (Array of string)
     *
     * @see https://github.com/NodeSecure/flags/blob/main/FLAGS.md
     */
    flags: string[];
    /**
     * If the dependency is a GIT repository
     */
    gitUrl: null | string;
  }

  export interface Dependency {
    /** NPM Registry metadata */
    metadata: {
      /** Count of dependencies */
      dependencyCount: number;
      /** Number of releases published on npm */
      publishedCount: number;
      lastUpdateAt: number;
      /** Last version SemVer */
      lastVersion: number;
      hasChangedAuthor: boolean;
      hasManyPublishers: boolean;
      hasReceivedUpdateInOneYear: boolean;
      /** Author of the package. This information is not trustable and can be empty. */
      author: Maintainer;
      /** Package home page */
      homepage: string | null;
      /**
       * List of maintainers (list of people in the organization related to the package)
       */
      maintainers: { name: string, email: string }[];
      /**
       * List of people who published this package
       */
      publishers: Publisher[];
    }
    /** List of versions of this package available in the dependency tree (In the payload) */
    versions: Record<string, DependencyVersion>;
    /**
     * Vulnerabilities fetched dependending on the selected vulnerabilityStrategy
     *
     * @see https://github.com/NodeSecure/vuln
     */
    vulnerabilities: Vuln.Strategy.StandardVulnerability[];
  }

  export type GlobalWarning = string[];
  export type Dependencies = Record<string, Dependency>;

  export interface Payload {
    /** Payload unique id */
    id: string;
    /** Name of the analyzed package */
    rootDependencyName: string;
    /** Global warnings list */
    warnings: GlobalWarning[];
    /** All the dependencies of the package (flattened) */
    dependencies: Dependencies;
    /** Version of the scanner used to generate the result */
    scannerVersion: string;
    /** Vulnerability strategy name (npm, snyk, node) */
    vulnerabilityStrategy: Vuln.Strategy.Kind;
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
      dependencies: Record<string, JSXRay.Dependency>;
      warnings: JSXRay.Warning<JSXRay.WarningDefault>[];
    };
  }

  export interface Options {
    /**
     * Maximum tree depth
     *
     * @default 4
     */
    readonly maxDepth?: number;
    readonly registry?: string | URL;
    /**
     * Use root package-lock.json. This will have the effect of triggering the Arborist package.
     *
     * @default false for from() API
     * @default true  for cwd()  API
     */
    readonly usePackageLock?: boolean;
    /**
     * Include project devDependencies (only available for cwd command)
     *
     * @default false
     */
    readonly includeDevDeps?: boolean;
    /**
     * Vulnerability strategy name (npm, snyk, node)
     *
     * @default NONE
     */
    readonly vulnerabilityStrategy: Vuln.Strategy.Kind;
    /**
     * Analyze root package.
     *
     * @default false for from() API
     * @default true  for cwd()  API
     */
    readonly forceRootAnalysis?: boolean;
    /**
     * Deeper dependencies analysis with cwd() API.
     *
     * @default false
     */
    readonly fullLockMode?: boolean;
  }
}
