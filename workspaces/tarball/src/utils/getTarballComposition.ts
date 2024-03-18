// Import Node.js Dependencies
import { Stats, promises as fs } from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import { walk } from "@nodesecure/fs-walk";

export interface TarballComposition {
  ext: Set<string>;
  size: number;
  files: string[];
}

export async function getTarballComposition(
  tarballDir: string
): Promise<TarballComposition> {
  const ext = new Set<string>();
  const files: string[] = [];
  const dirs: string[] = [];
  let { size } = await fs.stat(tarballDir);

  for await (const [dirent, file] of walk(tarballDir)) {
    if (dirent.isFile()) {
      ext.add(path.extname(file));
      files.push(file);
    }
    else if (dirent.isDirectory()) {
      dirs.push(file);
    }
  }

  const sizeUnfilteredResult = await Promise.allSettled([
    ...files.map((file) => fs.stat(file)),
    ...dirs.map((file) => fs.stat(file))
  ]);
  const sizeAll = sizeUnfilteredResult
    .filter((promiseSettledResult) => promiseSettledResult.status === "fulfilled")
    .map((promiseSettledResult) => (promiseSettledResult as PromiseFulfilledResult<Stats>).value);
  size += sizeAll.reduce((prev, curr) => prev + curr.size, 0);

  return {
    ext,
    size,
    files: files.map((fileLocation) => path.relative(tarballDir, fileLocation)).sort()
  };
}
