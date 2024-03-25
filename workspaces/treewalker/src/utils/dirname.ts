// Import Node.js Dependencies
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export function getDirNameFromUrl(url) {
  const __filename = fileURLToPath(url);

  return dirname(__filename);
}
