# verify API

Scan a single package tarball for security issues using [JS-X-Ray](https://github.com/NodeSecure/js-x-ray).

```ts
import * as scanner from "@nodesecure/scanner";

const result = await scanner.verify("fastify");
console.log(result);
```

## Signature

```ts
function verify(
  packageName?: string
): Promise<tarball.ScannedPackageResult>
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `packageName` | `string` | — | Name (and optional version) of the npm package to verify. If omitted, the current working directory is scanned instead. |

## Behavior

- **With `packageName`:** Downloads the package tarball from the npm registry into a temporary directory, then scans its contents.
- **Without `packageName`:** Scans the current working directory (`process.cwd()`) directly.

Unlike `from()` and `workingDir()`, `verify()` does **not** recursively walk the dependency tree. It scans the package files of a single package only.

## Return value

Returns `Promise<tarball.ScannedPackageResult>` from [`@nodesecure/tarball`](https://github.com/NodeSecure/tarball). The result contains the JS-X-Ray analysis of each file in the package, including detected warnings such as obfuscated code, unsafe regex, encoded literals, and more.
