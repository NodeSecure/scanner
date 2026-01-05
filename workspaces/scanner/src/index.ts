// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

// Import Third-party Dependencies
import pacote from "pacote";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import * as tarball from "@nodesecure/tarball";
import type { PackageJSON } from "@nodesecure/npm-types";
import type Config from "@npmcli/config";

// Import Internal Dependencies
import { depWalker } from "./depWalker.ts";
import { NPM_TOKEN, urlToString } from "./utils/index.ts";
import { Logger, ScannerLoggerEvents } from "./class/logger.class.ts";
import { TempDirectory } from "./class/TempDirectory.class.ts";
import { comparePayloads } from "./comparePayloads.ts";
import type { Options } from "./types.ts";

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
};

export async function workingDir(
  location = process.cwd(),
  options: WorkingDirOptions = {},
  logger = new Logger()
) {
  const registry = options.registry ?
    urlToString(options.registry) :
    getLocalRegistryURL();

  const packageLock = options.packageLock ?? {
    location
  };

  const finalizedOptions = Object.assign(
    { location },
    kDefaultWorkingDirOptions,
    {
      ...options,
      packageLock,
      registry
    }
  );

  logger.start(ScannerLoggerEvents.manifest.read);
  const packagePath = path.join(location, "package.json");
  const str = await fs.readFile(packagePath, "utf-8");
  logger.end(ScannerLoggerEvents.manifest.read);

  return depWalker(
    JSON.parse(str) as PackageJSON,
    finalizedOptions,
    logger
  );
}

export type FromOptions = Omit<Options, "includeDevDeps">;

export async function from(
  packageName: string,
  options: FromOptions = {},
  logger = new Logger()
) {
  const registry = options.registry ?
    urlToString(options.registry) :
    getLocalRegistryURL();

  logger.start(ScannerLoggerEvents.manifest.fetch);
  const manifest = await pacote.manifest(packageName, {
    ...NPM_TOKEN, registry, cache: `${os.homedir()}/.npm`
  });
  logger.end(ScannerLoggerEvents.manifest.fetch);

  return depWalker(
    // FIX: find a way to merge pacote & registry interfaces
    manifest as pacote.AbbreviatedManifest,
    Object.assign(options, { registry }),
    logger
  );
}

export async function verify(
  packageName?: string
): Promise<tarball.ScannedPackageResult> {
  if (typeof packageName === "undefined") {
    return tarball.scanPackage(process.cwd());
  }

  await using tempDir = await TempDirectory.create();

  const mama = await tarball.extractAndResolve(tempDir.location, {
    spec: packageName,
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
