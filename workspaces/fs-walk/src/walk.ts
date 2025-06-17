// Import Node.js Dependencies
import * as fs from "node:fs/promises";
import * as path from "node:path";

// Import Internal Dependencies
import { EXCLUDED_DIRECTORY } from "./constants.js";
import type { WalkOptions, WalkEntry } from "./types.js";

/**
 * @example
 * import { walk } from "@nodesecure/fs-walk";
 *
 * for await (const [dirent, location] of walk(__dirname) {
 *  if (dirent.isFile()) {
 *    console.log(location);
 *  }
 * }
 */
export async function* walk(
  directory: string,
  options: WalkOptions = Object.create(null)
): AsyncIterableIterator<WalkEntry> {
  const extensions = options?.extensions ?? null;
  const dirents = await fs.opendir(directory);

  for await (const dirent of dirents) {
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
      yield* walk(subDirectoryLocation, options);
    }
  }
}
