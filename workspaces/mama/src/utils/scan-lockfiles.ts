// Import Node.js Dependencies
import fs from "node:fs";
import path from "node:path";

export const LOCK_FILES = {
  npm: "package-lock.json",
  bun: "bun.lockb",
  yarn: "yarn.lock",
  pnpm: "pnpm-lock.yaml"
};

export function scanLockFiles(dirPath: string) {
  const result: { [k: string]: string; } = {};
  for (const [k, v] of Object.entries(LOCK_FILES)) {
    const filePath = path.join(dirPath, v);
    if (fs.existsSync(filePath)) {
      result[k] = filePath;
    }
  }

  return result;
}
