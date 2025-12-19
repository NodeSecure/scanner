# scanLockFiles

Scans for lock files in the given path.

This function searches for common package manager lock files
such as package-lock.json, yarn.lock, pnpm-lock.yaml, etc.
returns an Object of found lock file with their paths

## Function Signature

```ts
export function scanLockFiles(dirPath: string): null | Record<string, string>;
```
