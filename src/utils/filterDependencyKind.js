// Import Node.js Dependencies
import path from "path";

// CONSTANTS
const kRelativeImportPath = new Set([".", "..", "./", "../"]);

export function filterDependencyKind(dependencies, relativeFileLocation) {
  const packages = [];
  const files = [];

  for (const pattern of dependencies) {
    /**
     * @example
     * const dep = require("..");
     */
    if (pattern.charAt(0) === ".") {
      // Note: condition only possible for CJS
      const relativePathToFile = kRelativeImportPath.has(pattern) ?
        path.join(pattern, "index.js") :
        path.join(relativeFileLocation, pattern);

      files.push(relativePathToFile);
    }
    else {
      packages.push(pattern);
    }
  }

  return { packages, files };
}
