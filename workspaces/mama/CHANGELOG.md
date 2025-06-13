# @nodesecure/mama

## 1.3.0

### Minor Changes

- [#429](https://github.com/NodeSecure/scanner/pull/429) [`1833db7`](https://github.com/NodeSecure/scanner/commit/1833db7f3ae128be159cfcca29ee6352d516f34a) Thanks [@intincrab](https://github.com/intincrab)! - Allow `fromPackageJSON` to accept a `ManifestManager` instance

  This change allows the `fromPackageJSON` static method to accept either a string path or a `ManifestManager` instance. When a `ManifestManager` instance is provided, it will be returned directly, simplifying code that needs to handle both cases.

- [#424](https://github.com/NodeSecure/scanner/pull/424) [`d7c45c3`](https://github.com/NodeSecure/scanner/commit/d7c45c33c23cca5bbfa1d2c4bfa0f6d8987248a1) Thanks [@intincrab](https://github.com/intincrab)! - feat: add LocatedManifestManager type and isLocated type guard

  - Add new LocatedManifestManager type where location is required
  - Add static isLocated method to properly narrow the type
  - Update documentation with new type and method usage
  - Add type tests for the new functionality

### Patch Changes

- [#416](https://github.com/NodeSecure/scanner/pull/416) [`97a36b5`](https://github.com/NodeSecure/scanner/commit/97a36b523aa9b22900cd4ad822aa6a083e254121) Thanks [@fraxken](https://github.com/fraxken)! - Add optional ManifestManager dirname location

## 1.2.0

### Minor Changes

- [#397](https://github.com/NodeSecure/scanner/pull/397) [`3ee9a2e`](https://github.com/NodeSecure/scanner/commit/3ee9a2e17c877e7ea6fe23fc4ffc86578e6d0b72) Thanks [@fraxken](https://github.com/fraxken)! - implement Manifest module type detection (with cjs, esm, dual, faux esm and dts)
