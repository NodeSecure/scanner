// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import {
  runASTAnalysisOnFile,
  WarningName,
  WarningDefault
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  filterDependencyKind
} from "../utils/index.js";

export interface scanFileReport {
  file: string;
  warnings: (Omit<WarningDefault<WarningName>, "value"> & { file: string; })[];
  isMinified: boolean;
  tryDependencies: string[];
  dependencies: string[];
  filesDependencies: string[];
}

export async function scanFile(
  dest: string,
  file: string,
  packageName: string
): Promise<scanFileReport> {
  const result = await runASTAnalysisOnFile(
    path.join(dest, file),
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
