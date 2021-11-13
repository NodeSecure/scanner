// CONSTANTS
const kRelativeImportPath = new Set([".", "..", "./", "../"]);

export function filterDependencyKind(dependencies) {
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
        join(pattern, "index.js") :
        join(dirname(file), pattern);

      files.push(relativePathToFile);
    }
    else {
      packages.push(pattern);
    }
  }

  return { packages, files };
}
