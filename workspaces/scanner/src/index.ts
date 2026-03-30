// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

// Import Third-party Dependencies
import pacote from "pacote";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import * as tarball from "@nodesecure/tarball";
import { ManifestManager } from "@nodesecure/mama";
import type { PackageJSON } from "@nodesecure/npm-types";
import type Config from "@npmcli/config";

// Import Internal Dependencies
import {
  depWalker
} from "./depWalker.ts";
import {
  NPM_TOKEN,
  urlToString,
  readNpmRc
} from "./utils/index.ts";
import {
  Logger,
  ScannerLoggerEvents
} from "./class/logger.class.ts";
import { TempDirectory } from "./class/TempDirectory.class.ts";
import { comparePayloads } from "./comparePayloads.ts";
import type {
  Options,
  Payload
} from "./types.ts";

// CONSTANTS
const kDefaultWorkingDirOptions = {
  forceRootAnalysis: true,
  includeDevDeps: false
};

export * from "./types.ts";
export * from "./extractors/index.ts";

export type WorkingDirOptions = Options & {
  /**
   * NPM runtime configuration (such as local .npmrc file)
   * It is optionally used to fetch registry authentication tokens
   */
  npmRcConfig?: Config;
  cacheLookup?: (
    packageJSON: PackageJSON,
    integrity: string | null
  ) => Promise<Payload | null>;
};

export async function workingDir(
  location = process.cwd(),
  options: WorkingDirOptions = {},
  logger = new Logger()
): Promise<Payload> {
  const registry = options.registry ?
    urlToString(options.registry) :
    getLocalRegistryURL();

  const packageLock = options.packageLock ?? {
    location
  };

  const npmRcEntries = await readNpmRc(location);

  const finalizedOptions = Object.assign(
    { location },
    kDefaultWorkingDirOptions,
    {
      ...options,
      packageLock,
      registry,
      npmRcEntries
    }
  );

  logger.start(ScannerLoggerEvents.manifest.read);
  const packagePath = path.join(location, "package.json");
  const str = await fs.readFile(packagePath, "utf-8");
  logger.end(ScannerLoggerEvents.manifest.read);

  const packageJSON = JSON.parse(str) as PackageJSON;
  const mama = new ManifestManager(packageJSON, { location });

  const integrity = mama.documentDigest;
  const cachedPayload = await options.cacheLookup?.(packageJSON, integrity);
  if (cachedPayload) {
    return cachedPayload;
  }

  return depWalker(
    mama,
    Object.assign(finalizedOptions, { integrity }),
    logger
  );
}

export type FromOptions = Omit<Options, "includeDevDeps"> & {
  cacheLookup?: (
    manifest: pacote.AbbreviatedManifest & pacote.ManifestResult
  ) => Promise<Payload | null>;
};

export async function from(
  spec: string,
  options: FromOptions = {},
  logger = new Logger()
): Promise<Payload> {
  const registry = options.registry ?
    urlToString(options.registry) :
    getLocalRegistryURL();

  logger.start(ScannerLoggerEvents.manifest.fetch);
  const manifest = await pacote.manifest(spec, {
    ...NPM_TOKEN, registry, cache: `${os.homedir()}/.npm`,
    userAgent: `@nodesecure/scanner node/${process.version}`
  });
  logger.end(ScannerLoggerEvents.manifest.fetch);

  const cachedPayload = await options.cacheLookup?.(manifest);
  if (cachedPayload) {
    return cachedPayload;
  }

  const mama = new ManifestManager(manifest);

  return depWalker(
    mama,
    Object.assign(options, { registry }),
    logger
  );
}

export async function verify(
  spec?: string
): Promise<tarball.ScannedPackageResult> {
  if (typeof spec === "undefined") {
    return tarball.scanPackage(process.cwd());
  }

  await using tempDir = await TempDirectory.create();

  const mama = await tarball.extractAndResolve(tempDir.location, {
    spec,
    registry: getLocalRegistryURL()
  });

  const scanResult = await tarball.scanPackage(mama);

  return scanResult;
}

export {
  depWalker,
  tarball,
  comparePayloads,
  Logger,
  ScannerLoggerEvents
};
