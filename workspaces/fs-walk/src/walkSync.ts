// Import Node.js Dependencies
import * as fs from "node:fs";
import * as path from "node:path";

// Import Internal Dependencies
import { EXCLUDED_DIRECTORY } from "./constants.js";
import type { WalkOptions, WalkEntry } from "./types.js";

/**
 * @example
 * import { walkSync, FILE } from "@nodesecure/fs-walk";
 *
 * for (const [type, location] of walkSync(__dirname) {
 *  if (type === FILE) {
 *    console.log(location);
 *  }
 * }
 */
export function* walkSync(
  directory: string,
  options: WalkOptions = Object.create(null)
): IterableIterator<WalkEntry> {
  const extensions = options?.extensions ?? null;
  const dirents = fs.readdirSync(directory, { withFileTypes: true });

  for (const dirent of dirents) {
    if (EXCLUDED_DIRECTORY.has(dirent.name)) {
      continue;
    }

    if (dirent.isFile()) {
      if (extensions !== null && !extensions.has(path.extname(dirent.name))) {
        continue;
      }

      yield [dirent, path.join(directory, dirent.name)];
    }
    else if (dirent.isDirectory()) {
      const subDirectoryLocation = path.join(directory, dirent.name);

      yield [dirent, subDirectoryLocation];
      yield* walkSync(subDirectoryLocation, options);
    }
  }
}
