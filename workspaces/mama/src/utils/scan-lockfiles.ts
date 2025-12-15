// Import Node.js Dependencies
import fs from "node:fs";

export const LOCK_FILES = [
  ["npm", "package-lock.json"],
  ["bun", "bun.lockb"],
  ["pnpm", "pnpm-lock.yaml"],
  ["yarn", "yarn.lock"],
  ["deno", "deno.lock"]
];

export function scanLockFiles(dirPath: string): null | object {
  const dir = fs.readdirSync(dirPath);
  if (dir.length === 0) {
    return null;
  }

  const result: [string, string][] = [];
  for (const [k, v] of LOCK_FILES) {
    if (dir.includes(v)) {
      result.push([k, v]);
    }
  }

  return result.length === 0 ? null : result;
}
