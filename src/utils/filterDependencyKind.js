// Import Node.js Dependencies
import path from "path";

// CONSTANTS
const kRelativeImportPath = new Set([".", "..", "./", "../"]);

/**
 * @see https://nodejs.org/docs/latest/api/modules.html#file-modules
 *
 * @param {IterableIterator<string>} dependencies
 * @param {!string} relativeFileLocation
 */
export function filterDependencyKind(dependencies, relativeFileLocation) {
  const packages = [];
  const files = [];

  for (const moduleNameOrPath of dependencies) {
    const firstChar = pattern.charAt(0);

    /**
     * @example
     * require("..");
     * require("/home/marco/foo.js");
     */
    if (firstChar === "." || firstChar === "/") {
      // Note: condition only possible for CJS
      const relativePathToFile = kRelativeImportPath.has(moduleNameOrPath) ?
        path.join(moduleNameOrPath, "index.js") :
        path.join(relativeFileLocation, moduleNameOrPath);

      files.push(relativePathToFile);
    }
    else {
      packages.push(moduleNameOrPath);
    }
  }

  return { packages, files };
}
