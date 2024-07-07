// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import {
  runASTAnalysisOnFile,
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
}

export async function scanFile(
  destination: string,
  file: string,
  packageName: string
): Promise<scanFileReport> {
  const result = await runASTAnalysisOnFile(
    path.join(destination, file),
    { packageName }
  );

  const warnings = result.warnings.map((curr) => Object.assign({}, curr, { file }));
  if (result.ok) {
    const { packages, files } = filterDependencyKind(
      [...Object.keys(result.dependencies.dependencies)],
      path.dirname(file)
    );

    return {
      file,
      warnings,
      isMinified: result.isMinified,
      tryDependencies: [...result.dependencies.getDependenciesInTryStatement()],
      dependencies: packages,
      filesDependencies: files
    };
  }

  return {
    file,
    warnings,
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: []
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
