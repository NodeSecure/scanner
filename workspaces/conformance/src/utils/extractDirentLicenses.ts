// Import Node.js Dependencies
import { Dirent } from "node:fs";

export function extractDirentLicenses(
  dirents: Dirent[]
): string[] {
  return dirents
    .flatMap((dirent) => (dirent.isFile() && dirent.name.toLowerCase().includes("license") ? [dirent.name] : []));
}
