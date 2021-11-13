// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import { walk } from "@nodesecure/fs-walk";

export async function getTarballComposition(tarballDir) {
  const ext = new Set();
  const files = [];
  const dirs = [];
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
    .map((promiseSettledResult) => promiseSettledResult.value);
  size += sizeAll.reduce((prev, curr) => prev + curr.size, 0);

  return {
    ext,
    size,
    files: files.map((fileLocation) => path.relative(tarballDir, fileLocation)).sort()
  };
}
