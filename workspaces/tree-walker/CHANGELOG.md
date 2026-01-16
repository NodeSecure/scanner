# @nodesecure/tree-walker

## 2.2.0

### Minor Changes

- [#603](https://github.com/NodeSecure/scanner/pull/603) [`5b237e2`](https://github.com/NodeSecure/scanner/commit/5b237e22ccee184855188ff1a94c9d5bc29920e4) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tarball): add warning when hostname resolve to a private ip

## 2.1.0

### Minor Changes

- [#566](https://github.com/NodeSecure/scanner/pull/566) [`d280c39`](https://github.com/NodeSecure/scanner/commit/d280c39c61cfe4cd6559d894524c54dd0431584c) Thanks [@fraxken](https://github.com/fraxken)! - Re-abstract tree loading with NPM arborist

## 2.0.0

### Major Changes

- [#554](https://github.com/NodeSecure/scanner/pull/554) [`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add manifest integrity of root dependency in payload

### Minor Changes

- [#554](https://github.com/NodeSecure/scanner/pull/554) [`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add manifest integrity of root dependency in payload

### Patch Changes

- [#555](https://github.com/NodeSecure/scanner/pull/555) [`1ecbe92`](https://github.com/NodeSecure/scanner/commit/1ecbe92b53008c0bb63376344f99a42e899f86e6) Thanks [@fraxken](https://github.com/fraxken)! - Properly walk NPM tree using arborist with package-lock.json or node_modules when using the CWD().

## 1.3.1

### Patch Changes

- [#472](https://github.com/NodeSecure/scanner/pull/472) [`9ef1ee6`](https://github.com/NodeSecure/scanner/commit/9ef1ee6bb0e1d1820a64f698bc32f3ca9fe43dc3) Thanks [@fraxken](https://github.com/fraxken)! - Upgrade JS-X-Ray to v9.2.0 and fix related TS breaking changes

## 1.3.0

### Minor Changes

- [#404](https://github.com/NodeSecure/scanner/pull/404) [`40a9350`](https://github.com/NodeSecure/scanner/commit/40a93507e20e1002059f71a40539dfd058879257) Thanks [@fraxken](https://github.com/fraxken)! - Implement new DependencyVersion type to detect the kind of module (cjs/esm/dual..)
