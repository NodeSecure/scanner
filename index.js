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
import { constants } from "./src/utils/index.js";
import Logger from "./src/logger.class.js";
import * as tarball from "./src/tarball.js";

// CONSTANTS
const kDefaultCwdOptions = { forceRootAnalysis: true, usePackageLock: true };

export async function cwd(cwd = process.cwd(), options = {}, logger = new Logger()) {
  const finalizedOptions = Object.assign({}, kDefaultCwdOptions, options);

  logger.start("readManifest");
  const packagePath = path.join(cwd, "package.json");
  const str = await fs.readFile(packagePath, "utf-8");
  logger.end("readManifest");

  return depWalker(JSON.parse(str), finalizedOptions, logger);
}

export async function from(packageName, options, logger = new Logger()) {
  logger.start("fetchManifest");
  const manifest = await pacote.manifest(packageName, {
    ...constants.NPM_TOKEN, registry: getLocalRegistryURL(), cache: `${os.homedir()}/.npm`
  });
  logger.end("fetchManifest");

  return depWalker(manifest, options, logger);
}

export async function verify(packageName = null) {
  if (typeof packageName === "undefined" || packageName === null) {
    return await tarball.scanPackage(process.cwd());
  }

  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));
  const dest = path.join(tmpLocation, packageName);

  try {
    await pacote.extract(packageName, dest, {
      ...constants.NPM_TOKEN, registry: getLocalRegistryURL(), cache: `${os.homedir()}/.npm`
    });

    return await tarball.scanPackage(dest, packageName);
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}

export { depWalker, tarball, Logger };
