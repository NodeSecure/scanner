# @nodesecure/tarball

## 2.0.0

### Major Changes

- [#379](https://github.com/NodeSecure/scanner/pull/379) [`de110df`](https://github.com/NodeSecure/scanner/commit/de110df63090296a45ef89b290c73bd58c69c0be) Thanks [@fraxken](https://github.com/fraxken)! - Implement new major JS-X-Ray API and completely refactor tarball package

### Minor Changes

- [#456](https://github.com/NodeSecure/scanner/pull/456) [`fba460a`](https://github.com/NodeSecure/scanner/commit/fba460ad264a2775aad6b198c5434e5ebd207641) Thanks [@fraxken](https://github.com/fraxken)! - Remove getPackageName and use parseNpmSpec from mama

### Patch Changes

- Updated dependencies [[`713263f`](https://github.com/NodeSecure/scanner/commit/713263f185e53edd819fd939f2a76731a918e499), [`fba460a`](https://github.com/NodeSecure/scanner/commit/fba460ad264a2775aad6b198c5434e5ebd207641)]:
  - @nodesecure/mama@1.6.0

## 1.3.0

### Minor Changes

- [#442](https://github.com/NodeSecure/scanner/pull/442) [`41b1de2`](https://github.com/NodeSecure/scanner/commit/41b1de2641581d90aac21743733d6d5c6ffe2d31) Thanks [@fraxken](https://github.com/fraxken)! - Update all interfaces to start with a Maj

### Patch Changes

- Updated dependencies [[`53df5b6`](https://github.com/NodeSecure/scanner/commit/53df5b6840a20b9dc8379ba44ffb5c9e4816d535), [`a233dfd`](https://github.com/NodeSecure/scanner/commit/a233dfd8f0ad0a3bd82592181bfee4a59414a380), [`41b1de2`](https://github.com/NodeSecure/scanner/commit/41b1de2641581d90aac21743733d6d5c6ffe2d31)]:
  - @nodesecure/utils@2.3.0
  - @nodesecure/mama@1.5.0

## 1.2.0

### Minor Changes

- [#401](https://github.com/NodeSecure/scanner/pull/401) [`0137bc6`](https://github.com/NodeSecure/scanner/commit/0137bc6060fe56c673b1ab92214debe63ce35958) Thanks [@clemgbld](https://github.com/clemgbld)! - (Tarball) detect and flag with hasExternalCapacity when native fetch is used

- [#404](https://github.com/NodeSecure/scanner/pull/404) [`40a9350`](https://github.com/NodeSecure/scanner/commit/40a93507e20e1002059f71a40539dfd058879257) Thanks [@fraxken](https://github.com/fraxken)! - Implement new DependencyVersion type to detect the kind of module (cjs/esm/dual..)

### Patch Changes

- [#400](https://github.com/NodeSecure/scanner/pull/400) [`55af858`](https://github.com/NodeSecure/scanner/commit/55af858f993520bca6f0fc5b0dbddf0b329ab5e0) Thanks [@fraxken](https://github.com/fraxken)! - fix file import detection and avoid confusion with package with dots

- Updated dependencies [[`3ee9a2e`](https://github.com/NodeSecure/scanner/commit/3ee9a2e17c877e7ea6fe23fc4ffc86578e6d0b72)]:
  - @nodesecure/mama@1.2.0
