// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { parseManifestAuthor } from "@nodesecure/utils";

// CONSTANTS
// PR welcome to contribute to this list!
const kNativeNpmPackages = new Set([
  "node-gyp", "node-pre-gyp", "node-gyp-build", "node-addon-api"
]);

/**
 * @see https://www.nerdycode.com/prevent-npm-executing-scripts-security/
 */
const kUnsafeNpmScripts = new Set([
  "install",
  "preinstall", "postinstall",
  "preuninstall", "postuninstall"
]);

/**
 * @param {!string} location
 * @returns {import("@npm/types").PackageJson}
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
    description = "", author = {}, scripts = {},
    dependencies = {}, devDependencies = {}, gypfile = false,
    engines = {},
    repository = {},
    imports = {}
  } = await read(location);

  const packageDeps = Object.keys(dependencies);
  const packageDevDeps = Object.keys(devDependencies);
  const hasNativePackage = [...packageDevDeps, ...packageDeps]
    .some((pkg) => kNativeNpmPackages.has(pkg));

  return {
    author: typeof author === "string" ? parseManifestAuthor(author) : author,
    description,
    engines,
    repository,
    scripts,
    hasScript: Object.keys(scripts)
      .some((value) => kUnsafeNpmScripts.has(value.toLowerCase())),
    packageDeps,
    packageDevDeps,
    nodejs: { imports },
    hasNativeElements: hasNativePackage || gypfile
  };
}
