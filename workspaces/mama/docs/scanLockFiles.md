# scanLockFiles

Scans for lock files in the given path.

This function searches for common package manager lock files
such as package-lock.json, yarn.lock, pnpm-lock.yaml, etc.
returns an Object of found lock file with their paths

## Function Signature

```ts
export const LOCK_FILES = {
  npm: "package-lock.json",
  bun: "bun.lockb",
  pnpm: "pnpm-lock.yaml",
  yarn: "yarn.lock",
  deno: "deno.lock"
} as const;

export type LockFileProvider = keyof typeof LOCK_FILES;
export type LockFileName = typeof LOCK_FILES[LockFileProvider];

export function scanLockFiles(dirPath: string): Partial<Record<LockFileProvider, LockFileName>>;
```
