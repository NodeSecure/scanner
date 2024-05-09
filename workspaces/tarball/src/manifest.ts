// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// Import Third-party Dependencies
import type { PackageJson } from "@npm/types";
import { parseAuthor } from "@nodesecure/utils";

// Import Internal Dependencies
import { UNSAFE_SCRIPTS } from "./constants.js";

// CONSTANTS
// PR welcome to contribute to this list!
const kNativeNpmPackages = new Set([
  "node-gyp", "node-pre-gyp", "node-gyp-build", "node-addon-api"
]);
const kNodemodulesBinPrefix = "node_modules/.bin/";

export type PackageJSON = PackageJson & {
  type?: "script" | "module";
  gypfile?: boolean;
  imports?: Record<string, any>;
  exports?: Record<string, any>;
}

export async function read(
  location: string
): Promise<PackageJSON> {
  const packageStr = await fs.readFile(
    path.join(location, "package.json"),
    "utf-8"
  );

  return JSON.parse(packageStr);
}

export async function readAnalyze(location: string) {
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
    if (scriptValue.startsWith(kNodemodulesBinPrefix)) {
      scripts[scriptName] = scriptValue.replaceAll(kNodemodulesBinPrefix, "");
    }
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
      .some((value) => UNSAFE_SCRIPTS.has(value.toLowerCase())),
    packageDeps,
    packageDevDeps,
    nodejs: { imports },
    hasNativeElements: hasNativePackage || gypfile,
    integrity
  };
}
