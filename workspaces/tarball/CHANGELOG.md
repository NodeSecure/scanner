# @nodesecure/tarball

## 2.3.0

### Minor Changes

- [#548](https://github.com/NodeSecure/scanner/pull/548) [`d555469`](https://github.com/NodeSecure/scanner/commit/d555469e7bbc2818d6069eef51cd2494303b5703) Thanks [@fraxken](https://github.com/fraxken)! - Customize JS-X-Ray behavior/options when running the scan. Use it to enable optionalWarnings when the scan run localy.

## 2.2.0

### Minor Changes

- [#526](https://github.com/NodeSecure/scanner/pull/526) [`02f111e`](https://github.com/NodeSecure/scanner/commit/02f111e1feaca4233f3b631f79688e4fda0eafe1) Thanks [@fraxken](https://github.com/fraxken)! - Export custom warnings for the web platform

### Patch Changes

- Updated dependencies [[`b989ceb`](https://github.com/NodeSecure/scanner/commit/b989ceb68774afc63bcc61c3f08cf109e30f5b1e)]:
  - @nodesecure/conformance@1.2.0

## 2.1.0

### Minor Changes

- [#482](https://github.com/NodeSecure/scanner/pull/482) [`6db7b28`](https://github.com/NodeSecure/scanner/commit/6db7b28412a024d67281f16ddd7922fd032d192a) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tarball): flag third party package with hasExternalCapacity

- [#477](https://github.com/NodeSecure/scanner/pull/477) [`a4ab3f7`](https://github.com/NodeSecure/scanner/commit/a4ab3f72c161db1ee0e188eaea8073fcc513c825) Thanks [@intincrab](https://github.com/intincrab)! - feat(workspace: tarball): implement empty-package warning detection

### Patch Changes

- [#473](https://github.com/NodeSecure/scanner/pull/473) [`ad9ec3a`](https://github.com/NodeSecure/scanner/commit/ad9ec3aa9914d825f1b66aef2e1279c2e3497bcb) Thanks [@fraxken](https://github.com/fraxken)! - Add missing i18n warnings and fix the case for others

- Updated dependencies [[`26a1a4b`](https://github.com/NodeSecure/scanner/commit/26a1a4b49a701f2709309472a21f5c37bdc81e60)]:
  - @nodesecure/mama@2.0.0
  - @nodesecure/conformance@1.1.1

## 2.0.1

### Patch Changes

- [#472](https://github.com/NodeSecure/scanner/pull/472) [`9ef1ee6`](https://github.com/NodeSecure/scanner/commit/9ef1ee6bb0e1d1820a64f698bc32f3ca9fe43dc3) Thanks [@fraxken](https://github.com/fraxken)! - Upgrade JS-X-Ray to v9.2.0 and fix related TS breaking changes

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
