// Import Node.js Dependencies
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

export function getDirNameFromUrl(url: string | URL): string {
  const __filename = fileURLToPath(url);

  return dirname(__filename);
}
