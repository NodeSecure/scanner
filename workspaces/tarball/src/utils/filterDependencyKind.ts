// Import Node.js Dependencies
import path from "node:path";

// CONSTANTS
const kRelativeImportPath = new Set([".", "..", "./", "../"]);

/**
 * @see https://nodejs.org/docs/latest/api/modules.html#file-modules
 */
export function filterDependencyKind(
  dependencies: string[],
  relativeFileLocation: string
): { packages: string[]; files: string[]; } {
  const packages: string[] = [];
  const files: string[] = [];

  for (const moduleNameOrPath of dependencies) {
    const firstChar = moduleNameOrPath.charAt(0);

    /**
     * @example
     * require("..");
     * require("/home/marco/foo.js");
     */
    if (firstChar === "." || firstChar === "/") {
      // Note: condition only possible for CJS
      if (kRelativeImportPath.has(moduleNameOrPath)) {
        files.push(path.join(moduleNameOrPath, "index.js"));
      }
      else {
        // Note: we are speculating that the extension is .js (but it could be .json or .node)
        const fixedFileName = path.extname(moduleNameOrPath) === "" ?
          `${moduleNameOrPath}.js` : moduleNameOrPath;

        files.push(path.join(relativeFileLocation, fixedFileName));
      }
    }
    else {
      packages.push(moduleNameOrPath);
    }
  }

  return { packages, files };
}
