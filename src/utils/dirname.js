// Import Node.js Dependencies
import { fileURLToPath } from "url";
import { dirname } from "path";

export function getDirNameFromUrl(url = import.meta.url) {
  const __filename = fileURLToPath(url);

  return dirname(__filename);
}
