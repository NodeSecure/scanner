// Ported and modified from: https://github.com/wooorm/npm-esm-vs-cjs/blob/main/script/crawl.js
// AND https://github.com/antfu/node-modules-inspector/blob/main/packages/node-modules-tools/src/analyze-esm.ts#L8
// Copyright (c) Titus Wormer <tituswormer@gmail.com>
// MIT Licensed

// Import Third-party Dependencies
import type {
  PackageJSON,
  WorkspacesPackageJSON,
  PackumentVersion
} from "@nodesecure/npm-types";

export type PackageModuleType = "dts" | "faux" | "dual" | "esm" | "cjs";

export function inspectModuleType(
  packageJson: PackageJSON | WorkspacesPackageJSON | PackumentVersion
): PackageModuleType {
  // We aggressively assume `@types/` are all type-only packages.
  if (packageJson.name?.startsWith("@types/")) {
    return "dts";
  }

  const { exports, main, type } = packageJson;
  let cjs: boolean | undefined;
  let esm: boolean | undefined;
  const fauxEsm = Boolean(packageJson.module);

  // Check exports map.
  if (exports && typeof exports === "object") {
    for (const exportId in exports) {
      if (Object.hasOwn(exports, exportId) && typeof exportId === "string") {
        const value = exports[exportId];
        analyzeThing(value, `${packageJson.name}#exports`);
      }
    }
  }

  // Explicit `commonjs` set, with a explicit `import` or `.mjs` too.
  if (esm && type === "commonjs") {
    cjs = true;
  }

  // Explicit `module` set, with explicit `require` or `.cjs` too.
  if (cjs && type === "module") {
    esm = true;
  }

  // If there are no explicit exports:
  if (cjs === undefined && esm === undefined) {
    if (type === "module" || (main && /\.mjs$/.test(main))) {
      esm = true;
    }
    else if (main) {
      cjs = true;
    }
    // If main is not yet, it might be a type only/cli only package.
  }

  if (esm && cjs) {
    return "dual";
  }
  if (esm) {
    return "esm";
  }
  if (fauxEsm) {
    return "faux";
  }
  if (!esm && !cjs && !packageJson.main && !packageJson.exports && packageJson.types) {
    return "dts";
  }

  return "cjs";

  function analyzeThing(value: any, path: string): void {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        const values = value;
        let index = -1;
        while (++index < values.length) {
          analyzeThing(values[index], `${path}[${index}]`);
        }
      }
      else {
        let dots = false;
        const record = value;
        for (const [key, subvalue] of Object.entries(value)) {
          if (key.charAt(0) !== ".") {
            break;
          }
          analyzeThing(subvalue, `${path}["${key}"]`);
          dots = true;
        }

        if (dots) {
          return;
        }

        let explicit = false;
        const conditionImport = Boolean("import" in record && record.import);
        const conditionRequire = Boolean("require" in record && record.require);
        const conditionDefault = Boolean("default" in record && record.default);

        if (conditionImport || conditionRequire) {
          explicit = true;
        }

        if (conditionImport || (conditionRequire && conditionDefault)) {
          esm = true;
        }

        if (conditionRequire || (conditionImport && conditionDefault)) {
          cjs = true;
        }

        const defaults = record.node || record.default;

        if (typeof defaults === "string" && !explicit) {
          if (/\.mjs$/.test(defaults)) {
            esm = true;
          }
          if (/\.cjs$/.test(defaults)) {
            cjs = true;
          }
        }
      }
    }
    else if (typeof value === "string") {
      if (/\.mjs$/.test(value)) {
        esm = true;
      }
      if (/\.cjs$/.test(value)) {
        cjs = true;
      }
    }
  }
}
