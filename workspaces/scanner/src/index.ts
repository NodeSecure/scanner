// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import timers from "node:timers/promises";
import os from "node:os";

// Import Third-party Dependencies
import pacote from "pacote";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import * as tarball from "@nodesecure/tarball";
import type { PackageJSON } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { depWalker } from "./depWalker.js";
import { NPM_TOKEN, urlToString } from "./utils/index.js";
import { Logger, ScannerLoggerEvents } from "./class/logger.class.js";
import { comparePayloads } from "./comparePayloads.js";
import type { Options } from "./types.js";

// CONSTANTS
const kDefaultCwdOptions = {
  forceRootAnalysis: true,
  usePackageLock: true,
  includeDevDeps: false
};

export * from "./types.js";
export * from "./extractors/index.js";

export async function cwd(
  location = process.cwd(),
  options: Options = {},
  logger = new Logger()
) {
  const registry = options.registry ?
    urlToString(options.registry) :
    getLocalRegistryURL();

  const finalizedOptions = Object.assign(
    { location },
    kDefaultCwdOptions,
    {
      ...options,
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

export async function from(
  packageName: string,
  options: Omit<Options, "includeDevDeps"> = {},
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

  const tmpLocation = await fs.mkdtemp(
    path.join(os.tmpdir(), "nsecure-")
  );
  const dest = path.join(tmpLocation, packageName);

  try {
    await pacote.extract(packageName, dest, {
      ...NPM_TOKEN, registry: getLocalRegistryURL(), cache: `${os.homedir()}/.npm`
    });

    const scanResult = await tarball.scanPackage(dest, packageName);

    return scanResult;
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}

export {
  depWalker,
  tarball,
  comparePayloads,
  Logger,
  ScannerLoggerEvents
};
