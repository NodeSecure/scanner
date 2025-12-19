// Import Node.js Dependencies
import fs from "node:fs";

export const LOCK_FILES = [
  ["npm", "package-lock.json"],
  ["bun", "bun.lockb"],
  ["pnpm", "pnpm-lock.yaml"],
  ["yarn", "yarn.lock"],
  ["deno", "deno.lock"]
];

export function scanLockFiles(dirPath: string): null | Record<string, string> {
  const dir = fs.readdirSync(dirPath);
  if (dir.length === 0) {
    return null;
  }

  const filteredEntries = Array.from(LOCK_FILES).flatMap(function x([k, v]) {
    return dir.includes(v) ? [[k, v]] : [];
  });

  return filteredEntries.length === 0
    ? null
    : Object.fromEntries(filteredEntries);
}
