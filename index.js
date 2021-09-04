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
import * as tarball from "./src/tarball.js";

export async function cwd(cwd = process.cwd(), options) {
  const packagePath = path.join(cwd, "package.json");
  const str = await fs.readFile(packagePath, "utf-8");

  options.forceRootAnalysis = true;
  if (!("usePackageLock" in options)) {
    options.usePackageLock = true;
  }

  return depWalker(JSON.parse(str), options);
}

export async function from(packageName, options) {
  const manifest = await pacote.manifest(packageName, constants.NPM_TOKEN);

  return depWalker(manifest, options);
}

export async function verify(packageName = null) {
  if (typeof packageName === "undefined" || packageName === null) {
    return await tarball.analyseGivenLocation(process.cwd());
  }

  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));
  const dest = path.join(tmpLocation, packageName);

  try {
    await pacote.extract(packageName, dest, {
      ...constants.NPM_TOKEN, registry: getLocalRegistryURL(), cache: `${os.homedir()}/.npm`
    });

    return await tarball.analyseGivenLocation(dest, packageName);
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}

export { depWalker, tarball };
