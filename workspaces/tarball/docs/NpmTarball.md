# NpmTarball

## Usage example

```ts
import { ManifestManager } from "@nodesecure/mama";
import { NpmTarball } from "@nodesecure/tarball";

const mama = await ManifestManager.fromPackageJSON(
  location
);
const extractor = new NpmTarball(mama);

const {
  composition,
  conformance,
  code
} = await extractor.scanFiles();
```

## API

### constructor(manifest: ManifestManager)

Create a new NpmTarball instance.

> [!CAUTION]
> ManifestManager instance must have a location defined

### scanFiles(astAnalyserOptions?: AstAnalyserOptions, options?: NpmTarballScanFilesOptions): Promise< ScannedFilesResult >

Scan all the files contained in the tarball and obtain a complete report, including detection of JavaScript threats.

```ts
interface NpmTarballScanFilesOptions {
  /**
   * List of files and directories to exclude from the scan.
   * Support glob patterns (e.g., "node_modules/**", "dist/**")
   */
  exclude?: string[];
}
```

The function return the following object as response:

```ts
interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: conformance.SpdxExtractedResult;
  code: SourceCodeReport;
}
```
