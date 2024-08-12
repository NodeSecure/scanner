// Import Node.js Dependencies
import { readFileSync } from "node:fs";

export function readJSONSync(path: string, base?: string | URL) {
  const buf = readFileSync(typeof base === "string" ? new URL(path, base) : path);

  return JSON.parse(buf.toString());
}
