// Import Node.js Dependencies
import fs from "node:fs";

export const LOCK_FILES = {
  npm: "package-lock.json",
  bun: "bun.lockb",
  pnpm: "pnpm-lock.yaml",
  yarn: "yarn.lock",
  deno: "deno.lock"
} as const;

export type LockFileProvider = keyof typeof LOCK_FILES;
export type LockFileName = typeof LOCK_FILES[LockFileProvider];

export function scanLockFiles(
  dirPath: string
): Partial<Record<LockFileProvider, LockFileName>> {
  const dir = fs.readdirSync(dirPath);
  if (dir.length === 0) {
    return {};
  }

  const filteredEntries = Object
    .entries(LOCK_FILES)
    .flatMap(([providerName, fileName]) => (dir.includes(fileName) ? [[providerName, fileName]] : []));

  return Object.fromEntries(filteredEntries);
}
