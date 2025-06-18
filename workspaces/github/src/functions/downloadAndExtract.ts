// Import Node.js Dependencies
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createReadStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

// Import Third-party Dependencies
import tar from "tar-fs";

// Import Internal Dependencies
import {
  download,
  type DownloadOptions,
  type DownloadResult
} from "./download.js";

export interface DownloadExtractOptions extends DownloadOptions {
  /**
   * Remove the tar.gz archive after a succesfull extraction
   *
   * @default true
   */
  removeArchive?: boolean;
}

/**
 * @example
 * const { location } = await github.downloadAndExtract("NodeSecure.utils", {
 *  removeArchive: false
 * });
 * console.log(location);
 */
export async function downloadAndExtract(
  repository: string,
  options: DownloadExtractOptions = Object.create(null)
): Promise<DownloadResult> {
  const { removeArchive = true, ...downloadOptions } = options;
  const { dest = process.cwd(), branch } = downloadOptions;

  const result = await download(repository, downloadOptions);

  await pipeline(
    createReadStream(result.location),
    createGunzip(),
    tar.extract(dest)
  );

  if (removeArchive) {
    await fs.unlink(result.location);
  }

  result.location = path.join(dest, `${result.repository}-${branch}`);

  return result;
}
