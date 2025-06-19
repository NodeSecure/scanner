// Import Node.js Dependencies
import path from "node:path";
import {
  createReadStream,
  promises as fs
} from "node:fs";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

// Import Third-party Dependencies
import tar from "tar-fs";

// Import Internal Dependencies
import {
  download,
  type DownloadResult,
  type DownloadOptions
} from "./download.js";

export interface DownloadExtractOptions extends DownloadOptions {
  /**
   * Remove the tar.gz archive after a succesfull extraction
   *
   * @default true
   */
  removeArchive?: boolean;
}

export async function downloadAndExtract(
  repository: string,
  options: DownloadExtractOptions = Object.create(null)
): Promise<DownloadResult> {
  const { removeArchive = true, ...downloadOptions } = options;

  const result = await download(
    repository,
    downloadOptions
  );

  const newLocation = path.join(
    downloadOptions.dest ?? process.cwd(),
    `${result.repository}-${result.branch}`
  );
  await pipeline(
    createReadStream(result.location),
    createGunzip(),
    tar.extract(newLocation)
  );
  if (removeArchive) {
    await fs.unlink(result.location);
  }

  result.location = newLocation;

  return result;
}
