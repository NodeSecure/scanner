// Import Node.js Dependencies
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export function getDirNameFromUrl(url: string | URL): string {
  const filename = fileURLToPath(url);

  return dirname(filename);
}
