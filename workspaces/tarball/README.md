<p align="center"><h1 align="center">
  @nodesecure/tarball
</h1>

<p align="center">
  Utilities to extract and deeply analyze NPM tarball
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v20 or higher

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

### scanDirOrArchive

Method created for Scanner (to be refactored soon)

```ts
export interface ScanDirOrArchiveOptions {
  ref: DependencyRef;
  location?: string;
  tmpLocation?: null | string;
  locker: Locker;
  registry: string;
}
```

### scanPackage(dest: string, packageName?: string): Promise< ScannedPackageResult > 

Scan a given tarball archive or a local project.

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
  licenses: ntlp.SpdxLicenseConformance[];
  ast: {
    dependencies: Record<string, Record<string, Dependency>>;
    warnings: Warning[];
  };
}
```

## License
MIT
