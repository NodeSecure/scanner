<p align="center"><h1 align="center">
  @nodesecure/tarball
</h1>

<p align="center">
  Utilities to extract and deeply analyze NPM tarball
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v24 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/tarball
# or
$ yarn add @nodesecure/tarball
```

## Usage example

```ts
import * as tarball from "@nodesecure/tarball";

const scanResult = await tarball.scanPackage(
  process.cwd()
);
console.log(scanResult);
```

> [!NOTE]
> This package has been designed to be used by the Scanner package/workspace.

## API

- [SourceCode](./docs/SourceCode.md)
- [NpmTarball](./docs/NpmTarball.md)
- [WorkerThreads](./docs/WorkerThreads.md) ⚡ Performance & Architecture

---

> [!CAUTION]
> The following APIs are considered legacy and are waiting for deprecation in future releases.

### scanDirOrArchive(locationOrManifest: string | ManifestManager, ref: DependencyRef, options?: ScanOptions): Promise< void >

Scan a given local project or tarball (by providing the path or directly the ManifestManager instance).

`options` allow to customize the behavior of JS-X-Ray

```ts
export interface ScanOptions {
  astAnalyserOptions?: AstAnalyserOptions;
}
```

### scanPackage(manifestOrLocation: string | ManifestManager, options?: ScanOptions): Promise< ScannedPackageResult > 

Scan a given local project containing a Manifest (package.json).

```ts
interface ScannedPackageResult {
  files: {
    /** Complete list of files for the given package */
    list: string[];
    /** Complete list of extensions (.js, .md etc.) */
    extensions: string[];
    /** List of minified javascript files */
    minified: string[];
  };
  /** Size of the directory in bytes */
  directorySize: number;
  /** Unique license contained in the tarball (MIT, ISC ..) */
  uniqueLicenseIds: string[];
  /** All licenses with their SPDX */
  licenses: conformance.SpdxFileLicenseConformance[];
  ast: {
    dependencies: Record<string, Record<string, Dependency>>;
    warnings: Warning[];
  };
}
```

### extractAndResolve(location: string, options: TarballResolutionOptions): Promise< ManifestManager >

Extract a given remote package.

## License
MIT
