// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Import Internal Dependencies
import { parseAuthor } from "./utils/index.js";

// CONSTANTS
// PR welcome to contribute to this list!
const kNativeNpmPackages = new Set([
  "node-gyp", "node-pre-gyp", "node-gyp-build", "node-addon-api"
]);
const kNodemodulesBinPrefix = "node_modules/.bin/";

/**
 * @see https://www.nerdycode.com/prevent-npm-executing-scripts-security/
 */
const kUnsafeNpmScripts = new Set([
  "install",
  "preinstall",
  "postinstall",
  "preuninstall",
  "postuninstall"
]);

/**
 * @param {!string} location
 * @returns {Promise<import("@npm/types").PackageJson>}
 */
export async function read(location) {
  const packageStr = await fs.readFile(
    path.join(location, "package.json"),
    "utf-8"
  );

  return JSON.parse(packageStr);
}

export async function readAnalyze(location) {
  const {
    name,
    version,
    description = "",
    author = {},
    scripts = {},
    dependencies = {},
    devDependencies = {},
    gypfile = false,
    engines = {},
    repository = {},
    imports = {},
    license = ""
  } = await read(location);

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    scripts[scriptName] = scriptValue.replaceAll(kNodemodulesBinPrefix, "");
  }

  const integrityObj = {
    name,
    version,
    dependencies,
    license,
    scripts
  };

  const integrity = crypto
    .createHash("sha256")
    .update(JSON.stringify(integrityObj))
    .digest("hex");

  const packageDeps = Object.keys(dependencies);
  const packageDevDeps = Object.keys(devDependencies);
  const hasNativePackage = [...packageDevDeps, ...packageDeps]
    .some((pkg) => kNativeNpmPackages.has(pkg));

  return {
    author: parseAuthor(author),
    description,
    engines,
    repository,
    scripts,
    hasScript: Object.keys(scripts)
      .some((value) => kUnsafeNpmScripts.has(value.toLowerCase())),
    packageDeps,
    packageDevDeps,
    nodejs: { imports },
    hasNativeElements: hasNativePackage || gypfile,
    integrity
  };
}
