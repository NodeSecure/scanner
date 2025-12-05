// Import Node.js Dependencies
import { parentPort } from "node:worker_threads";
import path from "node:path";

// Import Third-party Dependencies
import { ManifestManager } from "@nodesecure/mama";
import { type Warning } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { NpmTarball } from "./NpmTarball.class.ts";
import {
  isSensitiveFile,
  booleanToFlags
} from "../utils/index.ts";
import {
  getEmptyPackageWarning,
  getSemVerWarning
} from "../warnings.ts";

import type {
  WorkerTaskWithId,
  WorkerTaskResult,
  ScanResultPayload
} from "./NpmTarballWorkerPool.class.ts";

// CONSTANTS
const kNativeCodeExtensions = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);

async function scanPackageInWorker(
  task: WorkerTaskWithId
): Promise<ScanResultPayload> {
  const { location, astAnalyserOptions } = task;

  const mama = await ManifestManager.fromPackageJSON(
    location
  );
  const tarex = new NpmTarball(mama);

  const {
    composition,
    conformance,
    code
  } = await tarex.scanFiles(astAnalyserOptions);

  const warnings: Warning[] = [];

  // Check for empty package
  if (
    composition.files.length === 1 &&
    composition.files.includes("package.json")
  ) {
    warnings.push(getEmptyPackageWarning());
  }

  // Check for zero semver
  if (mama.hasZeroSemver) {
    warnings.push(getSemVerWarning(mama.document.version!));
  }

  warnings.push(...code.warnings);

  const {
    files,
    dependencies,
    flags
  } = code.groupAndAnalyseDependencies(mama);

  const computedFlags = booleanToFlags({
    ...flags,
    hasExternalCapacity: code.flags.hasExternalCapacity || flags.hasExternalCapacity,
    hasNoLicense: conformance.uniqueLicenseIds.length === 0,
    hasMultipleLicenses: conformance.uniqueLicenseIds.length > 1,
    hasMinifiedCode: code.minified.length > 0,
    hasWarnings: warnings.length > 0,
    hasBannedFile: composition.files.some((filePath) => isSensitiveFile(filePath)),
    hasNativeCode: mama.flags.isNative ||
      composition.files.some((file) => kNativeCodeExtensions.has(path.extname(file))),
    hasScript: mama.flags.hasUnsafeScripts
  });
  const {
    description, engines, repository, scripts
  } = mama.document;

  return {
    description,
    engines,
    repository,
    scripts,
    author: mama.author,
    integrity: mama.isWorkspace ? null : mama.integrity,
    type: mama.moduleType,
    size: composition.size,
    licenses: conformance.licenses,
    uniqueLicenseIds: conformance.uniqueLicenseIds,
    warnings,
    flags: Array.from(computedFlags),
    composition: {
      extensions: [...composition.ext],
      files: composition.files,
      minified: code.minified,
      unused: dependencies.unused,
      missing: dependencies.missing,
      required_files: [...files],
      required_nodejs: dependencies.nodejs,
      required_thirdparty: dependencies.thirdparty,
      required_subpath: dependencies.subpathImports
    }
  };
}

parentPort?.on("message", async(task: WorkerTaskWithId) => {
  let message: WorkerTaskResult;

  try {
    const result = await scanPackageInWorker(task);

    message = { id: task.id, result };
  }
  catch (error) {
    const messageError = error instanceof Error ?
      error.message :
      String(error);

    message = { id: task.id, error: messageError };
  }

  message && parentPort?.postMessage(message);
});
