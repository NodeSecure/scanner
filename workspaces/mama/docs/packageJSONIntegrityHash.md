# packageJSONIntegrityHash

Compute a integrity hash from a package.json-like manifest, whether it's retrieved from the NPM registry, a tarball, or a local project.

> [!NOTE]
> 🛡️ This utility helps detect inconsistencies or tampering between a published package and its manifest on the registry, see: [The Massive Hole in the npm Ecosystem](https://blog.vlt.sh/blog/the-massive-hole-in-the-npm-ecosystem).

## Signature

```ts
export interface PackageJSONIntegrityHashOptions {
  /**
   * Indicates whether the document originates from the NPM registry.
   *
   * @default false
   */
  isFromRemoteRegistry?: boolean;
}

function packageJSONIntegrityHash(
  document: PackumentVersion | PackageJSON | WorkspacesPackageJSON,
  options: PackageJSONIntegrityHashOptions = {}
): string
```

## Usage example

Using the `@nodesecure/npm-registry-sdk` SDK to fetch a manifest from the NPM registry:

```ts
import { packageJSONIntegrityHash } from "@nodesecure/mama";
import * as NpmRegistrySDK from "@nodesecure/npm-registry-sdk";

const manifest = await NpmRegistrySDK.packumentVersion(
  "axios",
  "latest"
);

const { integrity, object } = await packageJSONIntegrityHash(manifest, {
  isFromRemoteRegistry: true
});
console.log({ integrity, object, });
```

## How It Works

Internally, the following fields are extracted from the manifest and passed to the `object-hash` library to generate the integrity hash:

* `name`
* `version`
* `dependencies` (defaults to `{}` if undefined)
* `scripts` (defaults to `{}` if undefined)
* `license` (defaults to `"NONE"` if undefined)

If the `isFromRemoteRegistry` option is set to `true`, an additional normalization is applied:

* If the manifest's `dependencies` includes a key `"install"` with the value `"node-gyp rebuild"`, it is removed before hashing.
  This is to account for a known NPM quirk in some registry responses. ([npm/cli#5234](https://github.com/npm/cli/issues/5234))

This ensures that remote and local manifests yield consistent hashes for identical package content.
