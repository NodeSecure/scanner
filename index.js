// Import Node.js Dependencies
import path from "path";
import fs from "fs/promises";
import timers from "timers/promises";
import os from "os";

// Import Third-party Dependencies
import pacote from "pacote";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { depWalker } from "./src/depWalker.js";
import { NPM_TOKEN } from "./src/utils/index.js";
import { hasSomethingChanged } from "./src/utils/hasSomethingChanged.js";
import { ScannerLoggerEvents } from "./src/constants.js";
import Logger from "./src/class/logger.class.js";
import * as tarball from "./src/tarball.js";

// CONSTANTS
const kDefaultCwdOptions = { forceRootAnalysis: true, usePackageLock: true, includeDevDeps: false };

export async function cwd(location = process.cwd(), options = {}, logger = new Logger()) {
  const registry = options.registry ? new URL(options.registry).toString() : getLocalRegistryURL();

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

  return depWalker(JSON.parse(str), finalizedOptions, logger);
}

export async function from(packageName, options, logger = new Logger()) {
  const registry = options.registry ? new URL(options.registry).toString() : getLocalRegistryURL();

  logger.start(ScannerLoggerEvents.manifest.fetch);
  const manifest = await pacote.manifest(packageName, {
    ...NPM_TOKEN, registry, cache: `${os.homedir()}/.npm`
  });
  logger.end(ScannerLoggerEvents.manifest.fetch);

  return depWalker(manifest, Object.assign(options, { registry }), logger);
}

export async function verify(packageName = null) {
  if (typeof packageName === "undefined" || packageName === null) {
    return await tarball.scanPackage(process.cwd());
  }

  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));
  const dest = path.join(tmpLocation, packageName);

  try {
    await pacote.extract(packageName, dest, {
      ...NPM_TOKEN, registry: getLocalRegistryURL(), cache: `${os.homedir()}/.npm`
    });

    return await tarball.scanPackage(dest, packageName);
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}

export function compare(payload1, payload2) {
  const [obj1, obj2] = [JSON.parse(payload1), JSON.parse(payload2)];
  const [obj1Keys, obj2Keys] = [Object.keys(obj1).sort(), Object.keys(obj2).sort()];
  const objKeys = obj1Keys.concat(obj2Keys);

  const comparison = new Map();

  // changes
  const changes = [];
  for (const key of objKeys) {
    if (hasSomethingChanged(obj1, obj2, key) && changes.indexOf(key) === -1) {
      changes.push(key);
    }
  }

  // same package ?
  const [obj1name, obj2name, samePackage] = obj1.name === obj2.name
    ? [obj1.version, obj2.version, true]
    : [obj1.name, obj2.name, false];

  comparison.set("changes", changes);

  return comparison;
}

export { depWalker, tarball, Logger, ScannerLoggerEvents };
