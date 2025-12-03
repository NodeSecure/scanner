<p align="center"><h1 align="center">
  @nodesecure/conformance
</h1>

<p align="center">
  SPDX license conformance for NodeSecure
</p>

## Features
- Fetches licenses and checks their SPDX conformance from a given NPM tarball.
- Verifies SPDX license expression conformance and provides meta information about license expressions.

## Requirements
- [Node.js](https://nodejs.org/en/) v24 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/conformance
# or
$ yarn add @nodesecure/conformance
```

## Usage example

Extract all licenses and their SPDX conformance from a given location

```js
import * as conformance from "@nodesecure/conformance";

// Asynchronous
{
  const licenses = await conformance.extractLicenses(
    process.cwd()
  );
  console.log(licenses);
}

// Synchronous
{
  const licenses = conformance.extractLicensesSync(
    process.cwd()
  );
  console.log(licenses);
}
```

Or detect SPDX conformance from a given Expression

```js
import { licenseIdConformance } from "@nodesecure/conformance";

const conformance = licenseIdConformance("MIT").unwrap();
console.log(conformance);

/*  
  {
    uniqueLicenseIds: ["MIT"],
    spdxLicenseLinks: ["https://spdx.org/licenses/MIT.html#licenseText"],
    spdx: {
      osi: true,
      fsf: true,
      fsfAndOsi: true,
      includesDeprecated: false
    }
  }
*/
```

## API

### licenseIdConformance(licenseID: string): Result< SpdxLicenseConformance, Error >

```ts
export interface SpdxLicenseConformance {
  licenses: Record<string, string>;
  spdx: {
    osi: boolean;
    fsf: boolean;
    fsfAndOsi: boolean;
    includesDeprecated: boolean;
  };
}
```

### searchSpdxLicenseId(contentStr: string): string | null

Extract License name from a given file content. Return `null` if it failed to detect the license.

### extractLicenses(manifestOrLocation: string | LocatedManifestManager, options?: extractAsyncOptions): Promise< SpdxExtractedResult >

Search and parse all licenses at the given string `location` or `LocatedManifestManager`.

Return all licenses with their SPDX conformance.

```ts
interface SpdxFileLicenseConformance extends SpdxLicenseConformance {
  fileName: string;
}

interface SpdxUnidentifiedLicense {
  licenseId: string;
  reason: string;
}

interface SpdxExtractedResult {
  /**
   * List of licenses, each with its SPDX conformance details.
   * This array includes all licenses found, conforming to the SPDX standards.
   */
  licenses: SpdxFileLicenseConformance[];

  /**
   * A unique list of license identifiers (e.g., 'MIT', 'ISC').
   * This list does not contain any duplicate entries.
   * It represents the distinct licenses identified.
   */
  uniqueLicenseIds: string[];

  /**
   * List of licenses that do not conform to SPDX standards or have invalid/unidentified identifiers.
   * This array includes licenses that could not be matched to valid SPDX identifiers.
   */
  unidentifiedLicenseIds?: SpdxUnidentifiedLicense[];
}
```

### extractLicensesSync(manifestOrLocation: string | LocatedManifestManager, options?: ExtractSyncOptions): SpdxExtractedResult
Same as `extractLicenses` but use synchronous FS API.

## Scripts

### Updating SPDX licenses

To update the `src/data/spdx.ts` file just run the following npm script:

```bash
$ npm run spdx:refresh
```

It will fetch SPDX licenses [here](https://github.com/spdx/license-list-data/blob/main/json/licenses.json).

## License

MIT
