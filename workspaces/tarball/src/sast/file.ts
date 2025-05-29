// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import {
  AstAnalyser,
  type WarningName,
  type WarningDefault
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  filterDependencyKind
} from "../utils/index.js";

// CONSTANTS
const kJsExtname = new Set([".js", ".mjs", ".cjs"]);

export interface scanFileReport {
  file: string;
  warnings: (Omit<WarningDefault<WarningName>, "value"> & { file: string; })[];
  isMinified: boolean;
  tryDependencies: string[];
  dependencies: string[];
  filesDependencies: string[];
  filesFlags: {
    hasExternalCapacity: boolean;
  };
}

export async function scanFile(
  destination: string,
  file: string,
  packageName: string
): Promise<scanFileReport> {
  const result = await new AstAnalyser().analyseFile(
    path.join(destination, file),
    {
      packageName
    }
  );

  const warnings = result.warnings.map((curr) => Object.assign({}, curr, { file }));
  if (result.ok) {
    const { packages, files } = filterDependencyKind(
      [...result.dependencies.keys()],
      path.dirname(file)
    );

    const tryDependencies = [...result.dependencies.entries()]
      .flatMap(([name, dependency]) => (dependency.inTry ? [name] : []));

    return {
      file,
      warnings,
      isMinified: result.isMinified,
      tryDependencies,
      dependencies: packages,
      filesDependencies: files,
      filesFlags: {
        hasExternalCapacity: result.flags.has("fetch")
      }
    };
  }

  return {
    file,
    warnings,
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: [],
    filesFlags: {
      hasExternalCapacity: false
    }
  };
}

export async function scanManyFiles(
  files: string[],
  destination: string,
  packageName: string
): Promise<scanFileReport[]> {
  const scannedFiles = await Promise.allSettled(
    files
      .filter((fileName) => kJsExtname.has(path.extname(fileName)))
      .map((file) => scanFile(destination, file, packageName))
  );

  return scannedFiles
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}
