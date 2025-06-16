// Import Node.js Dependencies
import fs from "node:fs";
import path from "node:path";
import * as consumers from "node:stream/consumers";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

// Import Internal Dependencies
import { getFlags } from "./web.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFlagsPath = path.join(__dirname, "flags");

/**
 * @description lazy read a flag file by getting a Node.js Readable Stream
 */
export function lazyFetchFlagFile(
  name: string
): Readable {
  if (typeof name !== "string") {
    throw new TypeError("You should provide a flag name");
  }

  const flags = getFlags();
  if (!flags.has(name)) {
    throw new Error("There is no file associated with that name");
  }

  const fileName = path.extname(name) === ".html" ?
    name :
    `${name}.html`;

  return fs.createReadStream(
    path.join(kFlagsPath, fileName)
  );
}

export function eagerFetchFlagFile(
  name: string
): Promise<string> {
  return consumers.text(
    lazyFetchFlagFile(name)
  );
}
