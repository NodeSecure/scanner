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

### scanFiles(): Promise< ScannedFilesResult >

Scan all the files contained in the tarball and obtain a complete report, including detection of JavaScript threats.

```ts
interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: SpdxExtractedResult;
  code: SourceCodeReport;
}
```
