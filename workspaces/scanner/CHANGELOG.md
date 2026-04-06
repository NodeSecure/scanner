# @nodesecure/scanner

## 10.11.0

### Minor Changes

- [#715](https://github.com/NodeSecure/scanner/pull/715) [`76543c3`](https://github.com/NodeSecure/scanner/commit/76543c398418a36d8c7d02bc257adcafec0a2320) Thanks [@ErwanRaulo](https://github.com/ErwanRaulo)! - Add possibility to highlight all packageas under a scope

- [#714](https://github.com/NodeSecure/scanner/pull/714) [`6b6fa55`](https://github.com/NodeSecure/scanner/commit/6b6fa555d369a5c637e02323c37c9cb650b5cbad) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: add path and file number for tarball stats

### Patch Changes

- Updated dependencies [[`398bf42`](https://github.com/NodeSecure/scanner/commit/398bf42b15b8e217fc6725377ea6903687b124d1), [`acd9105`](https://github.com/NodeSecure/scanner/commit/acd9105dfbfa906bafe2f0d43e01529739bd68e0), [`6b6fa55`](https://github.com/NodeSecure/scanner/commit/6b6fa555d369a5c637e02323c37c9cb650b5cbad)]:
  - @nodesecure/tarball@4.1.0
  - @nodesecure/mama@2.3.1
  - @nodesecure/tree-walker@4.0.1

## 10.10.0

### Minor Changes

- [#704](https://github.com/NodeSecure/scanner/pull/704) [`7178972`](https://github.com/NodeSecure/scanner/commit/71789723b69915903f41440066daf56c8998e5a4) Thanks [@fraxken](https://github.com/fraxken)! - Implement ManifestManager class deep into scanner and tree-walker. Implement documentDigest into ManifestManager class and fix issue with pacote.manifest type.

- [#700](https://github.com/NodeSecure/scanner/pull/700) [`1e3c971`](https://github.com/NodeSecure/scanner/commit/1e3c9719da3a0b113aa31a20f606f44d80050ed1) Thanks [@fraxken](https://github.com/fraxken)! - Add integrity as second argument of cacheLookup for workingDir API.

### Patch Changes

- [#705](https://github.com/NodeSecure/scanner/pull/705) [`05c5331`](https://github.com/NodeSecure/scanner/commit/05c5331223575de9a575fa874af9ac207a86b3aa) Thanks [@fraxken](https://github.com/fraxken)! - Rename packageName argument in from and verify APIs to spec

- Updated dependencies [[`7178972`](https://github.com/NodeSecure/scanner/commit/71789723b69915903f41440066daf56c8998e5a4)]:
  - @nodesecure/tree-walker@4.0.0
  - @nodesecure/npm-types@1.4.0
  - @nodesecure/mama@2.3.0

## 10.9.0

### Minor Changes

- [#695](https://github.com/NodeSecure/scanner/pull/695) [`623b682`](https://github.com/NodeSecure/scanner/commit/623b682b24bfe73fdcb2261792e3c6344434cf55) Thanks [@fraxken](https://github.com/fraxken)! - Remove getDirNameFromUrl utilities in favor of import.meta.dirname

- [#697](https://github.com/NodeSecure/scanner/pull/697) [`325c1a0`](https://github.com/NodeSecure/scanner/commit/325c1a0bb84d58a47b4aab71565f62a2e210d0c0) Thanks [@fraxken](https://github.com/fraxken)! - Refactor workspace README and re-implement proper scanner docs

- [#693](https://github.com/NodeSecure/scanner/pull/693) [`694ff61`](https://github.com/NodeSecure/scanner/commit/694ff61172e73bb6c4dbede95d4487d24f7dfe5a) Thanks [@fraxken](https://github.com/fraxken)! - Implement cache lookup for from and workingDir APIs

### Patch Changes

- [#691](https://github.com/NodeSecure/scanner/pull/691) [`e16c644`](https://github.com/NodeSecure/scanner/commit/e16c6446015df8743432685047c465890370a10f) Thanks [@fraxken](https://github.com/fraxken)! - Enhance error resilience and add missing pacote (npm) userAgent for all HTTP requests

- Updated dependencies [[`e16c644`](https://github.com/NodeSecure/scanner/commit/e16c6446015df8743432685047c465890370a10f)]:
  - @nodesecure/tree-walker@3.0.0
  - @nodesecure/tarball@4.0.1

## 10.8.0

### Minor Changes

- [#687](https://github.com/NodeSecure/scanner/pull/687) [`d656c7b`](https://github.com/NodeSecure/scanner/commit/d656c7bb68649ace01ee21c0d9398bfacbd1e5af) Thanks [@fraxken](https://github.com/fraxken)! - Implement Node.js worker_threads with a custom Pool to scan packages tarball with JS-X-Ray

### Patch Changes

- [#690](https://github.com/NodeSecure/scanner/pull/690) [`39bd5ce`](https://github.com/NodeSecure/scanner/commit/39bd5ce1fba5eef4ca7f8968c27d69dc31914a03) Thanks [@PierreDemailly](https://github.com/PierreDemailly)! - Add attestations on first dependency enrichment

- Updated dependencies [[`d656c7b`](https://github.com/NodeSecure/scanner/commit/d656c7bb68649ace01ee21c0d9398bfacbd1e5af)]:
  - @nodesecure/tarball@4.0.0
  - @nodesecure/rc@5.6.0
  - @nodesecure/tree-walker@2.8.0

## 10.7.0

### Minor Changes

- [#684](https://github.com/NodeSecure/scanner/pull/684) [`5c44211`](https://github.com/NodeSecure/scanner/commit/5c44211f8da550e194f073bff91426b243ff078b) Thanks [@PierreDemailly](https://github.com/PierreDemailly)! - feat(scanner): read .npmrc scoped registries for private package resolution

### Patch Changes

- [#685](https://github.com/NodeSecure/scanner/pull/685) [`633493b`](https://github.com/NodeSecure/scanner/commit/633493bf68683b34030e347c018d3ae355215b4c) Thanks [@fraxken](https://github.com/fraxken)! - Remove snyk from hydratable strategy as it's no more available

- [#681](https://github.com/NodeSecure/scanner/pull/681) [`44761b8`](https://github.com/NodeSecure/scanner/commit/44761b8069b3840d6ed7748a62a1ec0359e44087) Thanks [@PierreDemailly](https://github.com/PierreDemailly)! - Prioritize repository over homepage in package.json to generate repository link

## 10.6.0

### Minor Changes

- [#675](https://github.com/NodeSecure/scanner/pull/675) [`dc40fb3`](https://github.com/NodeSecure/scanner/commit/dc40fb3f263ce9866188cc463f8c52682e226c8c) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): log error only in verbose mode

- [#677](https://github.com/NodeSecure/scanner/pull/677) [`cef7c24`](https://github.com/NodeSecure/scanner/commit/cef7c24b1c1ec95833c4c323829e6b0a410a7513) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new maxConcurrency options to configure how much NPM tarballs we scan/limit in depWalker

### Patch Changes

- Updated dependencies [[`7937d38`](https://github.com/NodeSecure/scanner/commit/7937d386de2dfdcf615e710e7f50382ce1a37d1a), [`c839e46`](https://github.com/NodeSecure/scanner/commit/c839e46769e9b0dcc1be09e9f3a6e780fb0bbb6d)]:
  - @nodesecure/tree-walker@2.7.0
  - @nodesecure/mama@2.2.0
  - @nodesecure/tarball@3.7.0

## 10.5.1

### Patch Changes

- [#669](https://github.com/NodeSecure/scanner/pull/669) [`6075920`](https://github.com/NodeSecure/scanner/commit/60759208e0fdbe46558f884a2c51f67f99a94cac) Thanks [@fraxken](https://github.com/fraxken)! - Comment NPM avatar hydratation because the .user() API in the SDK is deprecated and cannot be used anymore

- Updated dependencies [[`d6f9487`](https://github.com/NodeSecure/scanner/commit/d6f948728f9c3e960172240a434e5190bd0b4ac2)]:
  - @nodesecure/tarball@3.6.1

## 10.5.0

### Minor Changes

- [#662](https://github.com/NodeSecure/scanner/pull/662) [`4b2b834`](https://github.com/NodeSecure/scanner/commit/4b2b834389cc9db3b9357944f2330d42a772cbb9) Thanks [@fraxken](https://github.com/fraxken)! - Update vulnera to v3.x.x

- [#659](https://github.com/NodeSecure/scanner/pull/659) [`8673a44`](https://github.com/NodeSecure/scanner/commit/8673a44e308cf2dc3641214659a5a0dc26e55b23) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): sync config with pacote when config is present

- [#664](https://github.com/NodeSecure/scanner/pull/664) [`fe0a69f`](https://github.com/NodeSecure/scanner/commit/fe0a69fb6a0a38c513e6ac0701ea2e4f0c7df644) Thanks [@fraxken](https://github.com/fraxken)! - Update JS-X-Ray to v14.1.0

### Patch Changes

- Updated dependencies [[`e852fe1`](https://github.com/NodeSecure/scanner/commit/e852fe1a27386957bfb3c0cd552b2c006e3bdfef), [`4b2b834`](https://github.com/NodeSecure/scanner/commit/4b2b834389cc9db3b9357944f2330d42a772cbb9), [`fe0a69f`](https://github.com/NodeSecure/scanner/commit/fe0a69fb6a0a38c513e6ac0701ea2e4f0c7df644), [`fbc6023`](https://github.com/NodeSecure/scanner/commit/fbc6023d710a9c9291cd8ab8bb128438c068c250)]:
  - @nodesecure/tarball@3.6.0
  - @nodesecure/rc@5.5.0
  - @nodesecure/tree-walker@2.6.0

## 10.4.0

### Minor Changes

- [#648](https://github.com/NodeSecure/scanner/pull/648) [`94167b4`](https://github.com/NodeSecure/scanner/commit/94167b464f7818ae648bb41b0ad7900add5b0699) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor: upgrade to js-x-ray 13

### Patch Changes

- Updated dependencies [[`45eb26a`](https://github.com/NodeSecure/scanner/commit/45eb26aa6edf3857b13ce8539640f097a91203a3), [`94167b4`](https://github.com/NodeSecure/scanner/commit/94167b464f7818ae648bb41b0ad7900add5b0699)]:
  - @nodesecure/tarball@3.5.0
  - @nodesecure/tree-walker@2.5.0
  - @nodesecure/rc@5.4.0

## 10.3.0

### Minor Changes

- [#643](https://github.com/NodeSecure/scanner/pull/643) [`8afa3a4`](https://github.com/NodeSecure/scanner/commit/8afa3a48c2943ddf15b5bf80c0917b6f7985352f) Thanks [@clemgbld](https://github.com/clemgbld)! - chore: upgrade js-x-ray

### Patch Changes

- Updated dependencies [[`8afa3a4`](https://github.com/NodeSecure/scanner/commit/8afa3a48c2943ddf15b5bf80c0917b6f7985352f)]:
  - @nodesecure/tree-walker@2.4.0
  - @nodesecure/tarball@3.4.0
  - @nodesecure/rc@5.3.0

## 10.2.0

### Minor Changes

- [#632](https://github.com/NodeSecure/scanner/pull/632) [`36dc1fc`](https://github.com/NodeSecure/scanner/commit/36dc1fca73ed74bcba0b272b2eecdb66f24e2b30) Thanks [@clemgbld](https://github.com/clemgbld)! - feat: highlight infrastructure components

- [#641](https://github.com/NodeSecure/scanner/pull/641) [`3870425`](https://github.com/NodeSecure/scanner/commit/38704255896e0483a0473b5a21a47a6f0da366c2) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): emit stat event when api call is a success

- [#639](https://github.com/NodeSecure/scanner/pull/639) [`2ddafa0`](https://github.com/NodeSecure/scanner/commit/2ddafa024130be089a03adb5bd3ad05a3fa12199) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): emit an error event when an IO fails

- [#635](https://github.com/NodeSecure/scanner/pull/635) [`b32ee1a`](https://github.com/NodeSecure/scanner/commit/b32ee1ab773e98ed2ddc646c8ae7fb67055ec632) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): improve error handling for depwalker

### Patch Changes

- [#624](https://github.com/NodeSecure/scanner/pull/624) [`e338410`](https://github.com/NodeSecure/scanner/commit/e33841050a13a79f49ab27696ae025746387576d) Thanks [@7amed3li](https://github.com/7amed3li)! - fix: support string format for 'repository' field in comparePayloads

- Updated dependencies [[`ce22eb8`](https://github.com/NodeSecure/scanner/commit/ce22eb8161278eacdf993bc3e3cb4b6235ad7910), [`442b364`](https://github.com/NodeSecure/scanner/commit/442b364b8a5d568e267a11f91bd6360f341a24ff), [`36dc1fc`](https://github.com/NodeSecure/scanner/commit/36dc1fca73ed74bcba0b272b2eecdb66f24e2b30)]:
  - @nodesecure/i18n@4.1.0
  - @nodesecure/tree-walker@2.3.0
  - @nodesecure/tarball@3.3.0
  - @nodesecure/rc@5.2.0

## 10.1.0

### Minor Changes

- [#616](https://github.com/NodeSecure/scanner/pull/616) [`82c6f80`](https://github.com/NodeSecure/scanner/commit/82c6f805c609c5bbd12023a0f324468ff2984093) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): depWalker add stats on tarball.scanDirOrArchive

- [#618](https://github.com/NodeSecure/scanner/pull/618) [`a5377e9`](https://github.com/NodeSecure/scanner/commit/a5377e9b95d3b5f07aaecf65350bc6f8d4f5d39d) Thanks [@7amed3li](https://github.com/7amed3li)! - feat: add stats tracking on pacote.extract through extractAndResolve

  Add support for dependency injection of extractFn in extractAndResolve to enable tracking of pacote.extract calls using StatsCollector. This allows measuring extraction time for each package during scanning.

### Patch Changes

- Updated dependencies [[`a5377e9`](https://github.com/NodeSecure/scanner/commit/a5377e9b95d3b5f07aaecf65350bc6f8d4f5d39d)]:
  - @nodesecure/tarball@3.2.0

## 10.0.0

### Major Changes

- [#606](https://github.com/NodeSecure/scanner/pull/606) [`2afafb7`](https://github.com/NodeSecure/scanner/commit/2afafb71835347208ce57ec0ed52041f2e7486bc) Thanks [@fraxken](https://github.com/fraxken)! - refactor: rename cwd() to workingDir()

### Minor Changes

- [#603](https://github.com/NodeSecure/scanner/pull/603) [`5b237e2`](https://github.com/NodeSecure/scanner/commit/5b237e22ccee184855188ff1a94c9d5bc29920e4) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(tarball): add warning when hostname resolve to a private ip

- [#612](https://github.com/NodeSecure/scanner/pull/612) [`7330ef9`](https://github.com/NodeSecure/scanner/commit/7330ef937925da95680e188e04a34fdc033aa288) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): integrate built-in stats in the response of depWalker

### Patch Changes

- Updated dependencies [[`5b71ff9`](https://github.com/NodeSecure/scanner/commit/5b71ff9ef8663b03af0ff2950a3532ade428b66d), [`e013b49`](https://github.com/NodeSecure/scanner/commit/e013b4907c8f7f4046ecbf079ae529011b17c597), [`5b237e2`](https://github.com/NodeSecure/scanner/commit/5b237e22ccee184855188ff1a94c9d5bc29920e4)]:
  - @nodesecure/mama@2.1.1
  - @nodesecure/tarball@3.1.0
  - @nodesecure/tree-walker@2.2.0
  - @nodesecure/rc@5.1.0

## 9.0.0

### Major Changes

- [#593](https://github.com/NodeSecure/scanner/pull/593) [`5a91b4d`](https://github.com/NodeSecure/scanner/commit/5a91b4d9baf0376072ab37cb57dbffa0fb845a06) Thanks [@fraxken](https://github.com/fraxken)! - Update JS-X-Ray to major v11

### Minor Changes

- [#590](https://github.com/NodeSecure/scanner/pull/590) [`388ee3d`](https://github.com/NodeSecure/scanner/commit/388ee3d8b9f5a1645eabed87467bf91accd69ad5) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): support more formats for highlight.packages

- [#596](https://github.com/NodeSecure/scanner/pull/596) [`98b9705`](https://github.com/NodeSecure/scanner/commit/98b970521015867acf5652fd37d74bb3e79b1dd7) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(scanner): make highlight contacts optional

- [#584](https://github.com/NodeSecure/scanner/pull/584) [`df67b07`](https://github.com/NodeSecure/scanner/commit/df67b07bae789fef3c3ac1241323a34293258c5b) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(deepWalker): highlight packages

### Patch Changes

- [#586](https://github.com/NodeSecure/scanner/pull/586) [`e5e09b2`](https://github.com/NodeSecure/scanner/commit/e5e09b2ceb1a6acf8dd5ff2b983cd036de93a683) Thanks [@ErwanRaulo](https://github.com/ErwanRaulo)! - fix(extractor): improve error handling for event listener

- [#597](https://github.com/NodeSecure/scanner/pull/597) [`eb51d04`](https://github.com/NodeSecure/scanner/commit/eb51d044eb3abc31280612fc21e6f07e6ebd0ea4) Thanks [@ErwanRaulo](https://github.com/ErwanRaulo)! - feat(extractor): use standard error event hook

- Updated dependencies [[`c04c8d7`](https://github.com/NodeSecure/scanner/commit/c04c8d785e71610fe701092417218c45784e5b92), [`407db4d`](https://github.com/NodeSecure/scanner/commit/407db4d86162e796030369781db285454249573e), [`3365790`](https://github.com/NodeSecure/scanner/commit/33657903e66a9bdb8ff5fb02673bec7211061d14), [`d6c08cb`](https://github.com/NodeSecure/scanner/commit/d6c08cba0548cc54eb38601ad273a4c3a1900184), [`e920b6d`](https://github.com/NodeSecure/scanner/commit/e920b6d6c5b37221774058c47403c6a0a957767d), [`5a91b4d`](https://github.com/NodeSecure/scanner/commit/5a91b4d9baf0376072ab37cb57dbffa0fb845a06)]:
  - @nodesecure/conformance@1.2.1
  - @nodesecure/rc@5.0.2
  - @nodesecure/mama@2.1.0
  - @nodesecure/tarball@3.0.0

## 8.2.0

### Minor Changes

- [#575](https://github.com/NodeSecure/scanner/pull/575) [`7e266b5`](https://github.com/NodeSecure/scanner/commit/7e266b537f88f208bf53784fbc1b92a1ebb0c7fa) Thanks [@fraxken](https://github.com/fraxken)! - Refactor extractors imports to ensure web compatibility

- [#571](https://github.com/NodeSecure/scanner/pull/571) [`a06ba7c`](https://github.com/NodeSecure/scanner/commit/a06ba7c2fef96141642094476ddf2bcac48c5db3) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new error event in the logger

### Patch Changes

- Updated dependencies [[`d280c39`](https://github.com/NodeSecure/scanner/commit/d280c39c61cfe4cd6559d894524c54dd0431584c)]:
  - @nodesecure/tree-walker@2.1.0

## 8.1.0

### Minor Changes

- [#569](https://github.com/NodeSecure/scanner/pull/569) [`1e2d654`](https://github.com/NodeSecure/scanner/commit/1e2d65444ee29436051e3543e258b8f335361e66) Thanks [@fraxken](https://github.com/fraxken)! - Add a standalone export for extractors (for usage such as web imports)

### Patch Changes

- [#567](https://github.com/NodeSecure/scanner/pull/567) [`8a7d42b`](https://github.com/NodeSecure/scanner/commit/8a7d42bd8132e4922d7743677591c1ac13e22c7a) Thanks [@fraxken](https://github.com/fraxken)! - Fix an issue with the monorepo build command. Now each workspace build script is executed in CI and before publishing.

## 8.0.0

### Major Changes

- [#554](https://github.com/NodeSecure/scanner/pull/554) [`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add manifest integrity of root dependency in payload

- [#565](https://github.com/NodeSecure/scanner/pull/565) [`62464a4`](https://github.com/NodeSecure/scanner/commit/62464a47fa2951ff50767e0faad414b5874deaf5) Thanks [@fraxken](https://github.com/fraxken)! - Move payload integrity into rootDependency

- [#563](https://github.com/NodeSecure/scanner/pull/563) [`c009145`](https://github.com/NodeSecure/scanner/commit/c00914597430f956b57ae1381e1f07d984fb528d) Thanks [@fraxken](https://github.com/fraxken)! - Refactor payload rootDependency to include name and version

### Minor Changes

- [#564](https://github.com/NodeSecure/scanner/pull/564) [`c91b2c6`](https://github.com/NodeSecure/scanner/commit/c91b2c698fe31147e9de6ad7b1d5fca5104a29f3) Thanks [@fraxken](https://github.com/fraxken)! - Add a new metadata property in the scanner payload

- [#554](https://github.com/NodeSecure/scanner/pull/554) [`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add manifest integrity of root dependency in payload

- [#556](https://github.com/NodeSecure/scanner/pull/556) [`14cc3cd`](https://github.com/NodeSecure/scanner/commit/14cc3cd5c065c09055754ad967802da963b6dc0e) Thanks [@fraxken](https://github.com/fraxken)! - Update scanner API documentation & add FromOptions interface to match CwdOptions

- [#562](https://github.com/NodeSecure/scanner/pull/562) [`dbc2562`](https://github.com/NodeSecure/scanner/commit/dbc256229e37471cea7a8905a4f728f8995786e9) Thanks [@ErwanRaulo](https://github.com/ErwanRaulo)! - feat(extractor): Extends eventTarget instead of eventEmitter for browser compatibility

- [#548](https://github.com/NodeSecure/scanner/pull/548) [`d555469`](https://github.com/NodeSecure/scanner/commit/d555469e7bbc2818d6069eef51cd2494303b5703) Thanks [@fraxken](https://github.com/fraxken)! - Customize JS-X-Ray behavior/options when running the scan. Use it to enable optionalWarnings when the scan run localy.

- [#560](https://github.com/NodeSecure/scanner/pull/560) [`3b653ee`](https://github.com/NodeSecure/scanner/commit/3b653ee08be8a2625e943db51a8ae04db80af684) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(depWalker): do not add integrity to payload in cwd for workspace

### Patch Changes

- [#555](https://github.com/NodeSecure/scanner/pull/555) [`1ecbe92`](https://github.com/NodeSecure/scanner/commit/1ecbe92b53008c0bb63376344f99a42e899f86e6) Thanks [@fraxken](https://github.com/fraxken)! - Properly walk NPM tree using arborist with package-lock.json or node_modules when using the CWD().

- Updated dependencies [[`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061), [`3c32fb6`](https://github.com/NodeSecure/scanner/commit/3c32fb6fdc43e2bc0af508737047a6a23f170061), [`d555469`](https://github.com/NodeSecure/scanner/commit/d555469e7bbc2818d6069eef51cd2494303b5703), [`914132b`](https://github.com/NodeSecure/scanner/commit/914132bb423ab2e2f85b7a84a39c79bc58a54255), [`1ecbe92`](https://github.com/NodeSecure/scanner/commit/1ecbe92b53008c0bb63376344f99a42e899f86e6)]:
  - @nodesecure/tree-walker@2.0.0
  - @nodesecure/tarball@2.3.0

## 7.2.0

### Minor Changes

- [#544](https://github.com/NodeSecure/scanner/pull/544) [`281c720`](https://github.com/NodeSecure/scanner/commit/281c72081f9ce767cf6cfc4e3ff0faca9c5bcb53) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add npm token based on registry for sdk calls

- [#542](https://github.com/NodeSecure/scanner/pull/542) [`49c5bbb`](https://github.com/NodeSecure/scanner/commit/49c5bbb71fc3cf2cc15f48856e67ec901ba31eb8) Thanks [@fraxken](https://github.com/fraxken)! - Improve type-squatting global-warning by removing it on remote scan and also when there is to much similar packages

## 7.1.0

### Minor Changes

- [#535](https://github.com/NodeSecure/scanner/pull/535) [`746c0fd`](https://github.com/NodeSecure/scanner/commit/746c0fdfda787d8927537b78945388484dc95b94) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): implement dependency confusion detection

- [#540](https://github.com/NodeSecure/scanner/pull/540) [`6105c7f`](https://github.com/NodeSecure/scanner/commit/6105c7fe735483208d45fd58667fa63d4c4fcf58) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(scanner): add dependency warning only when getting a 404 from the public npm registry

- [#541](https://github.com/NodeSecure/scanner/pull/541) [`dadb7fb`](https://github.com/NodeSecure/scanner/commit/dadb7fb2de82dd856b254e23774888bd96b589da) Thanks [@fraxken](https://github.com/fraxken)! - Keep NPM provenance (attestations) in Dependency version

### Patch Changes

- Updated dependencies [[`02f111e`](https://github.com/NodeSecure/scanner/commit/02f111e1feaca4233f3b631f79688e4fda0eafe1), [`b989ceb`](https://github.com/NodeSecure/scanner/commit/b989ceb68774afc63bcc61c3f08cf109e30f5b1e)]:
  - @nodesecure/tarball@2.2.0
  - @nodesecure/conformance@1.2.0

## 7.0.0

### Major Changes

- [#509](https://github.com/NodeSecure/scanner/pull/509) [`979c469`](https://github.com/NodeSecure/scanner/commit/979c469fbb51846da7b7fe0d7ab2ce149ce6759b) Thanks [@fraxken](https://github.com/fraxken)! - Extend global warning with multi-properties objects

### Patch Changes

- Updated dependencies [[`06b599f`](https://github.com/NodeSecure/scanner/commit/06b599f9d98190e2879b02106ff909f984cf642e), [`045c378`](https://github.com/NodeSecure/scanner/commit/045c378a801c62c0a1cde3d0b7d05128bdd71acf)]:
  - @nodesecure/npm-types@1.3.0
  - @nodesecure/mama@2.0.2

## 6.12.1

### Patch Changes

- [#510](https://github.com/NodeSecure/scanner/pull/510) [`fc0b91f`](https://github.com/NodeSecure/scanner/commit/fc0b91fd7916d4a8bbc3f190c0d5e870e76e34a1) Thanks [@fraxken](https://github.com/fraxken)! - Assign 'workspace' as default name if name is missing in package.json

## 6.12.0

### Minor Changes

- [#498](https://github.com/NodeSecure/scanner/pull/498) [`f305271`](https://github.com/NodeSecure/scanner/commit/f30527190375c00665d66992606b561add3fc527) Thanks [@fraxken](https://github.com/fraxken)! - Revamp NPM registry metadata fetching and extraction

### Patch Changes

- [#503](https://github.com/NodeSecure/scanner/pull/503) [`81772da`](https://github.com/NodeSecure/scanner/commit/81772da75fc4682da0528333e523a68379cf754a) Thanks [@fraxken](https://github.com/fraxken)! - Add missing ./src/data when building TypeScript source

- Updated dependencies [[`eb751d8`](https://github.com/NodeSecure/scanner/commit/eb751d83df84d69d7229116a7409bc80896bc78c)]:
  - @nodesecure/mama@2.0.1

## 6.11.0

### Minor Changes

- [#486](https://github.com/NodeSecure/scanner/pull/486) [`26a1a4b`](https://github.com/NodeSecure/scanner/commit/26a1a4b49a701f2709309472a21f5c37bdc81e60) Thanks [@fraxken](https://github.com/fraxken)! - Update mama packageJSONIntegrityHash response to include both object and integrity hash

- [#490](https://github.com/NodeSecure/scanner/pull/490) [`86cbf14`](https://github.com/NodeSecure/scanner/commit/86cbf147562429ac1e196146854b9cfd88d1fde2) Thanks [@fraxken](https://github.com/fraxken)! - Throw a global warning when a potential typo-squatting is found

- [#476](https://github.com/NodeSecure/scanner/pull/476) [`cf6498d`](https://github.com/NodeSecure/scanner/commit/cf6498deb9a4d83d6fce3ff10af4df1c98999a6f) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(depWalker): use using to auto free lock

- [#487](https://github.com/NodeSecure/scanner/pull/487) [`c0feea6`](https://github.com/NodeSecure/scanner/commit/c0feea60818a783750b088909c7d0283beb8ecda) Thanks [@fraxken](https://github.com/fraxken)! - Extract expired email domains

### Patch Changes

- [#473](https://github.com/NodeSecure/scanner/pull/473) [`ad9ec3a`](https://github.com/NodeSecure/scanner/commit/ad9ec3aa9914d825f1b66aef2e1279c2e3497bcb) Thanks [@fraxken](https://github.com/fraxken)! - Add missing i18n warnings and fix the case for others

- Updated dependencies [[`7217289`](https://github.com/NodeSecure/scanner/commit/72172897bb1b75d98d2c8797e077d20f7e15ab4d), [`26a1a4b`](https://github.com/NodeSecure/scanner/commit/26a1a4b49a701f2709309472a21f5c37bdc81e60), [`0dc170f`](https://github.com/NodeSecure/scanner/commit/0dc170f2641bcce18499f0ba38a019768ef4e4a3), [`6db7b28`](https://github.com/NodeSecure/scanner/commit/6db7b28412a024d67281f16ddd7922fd032d192a), [`ad9ec3a`](https://github.com/NodeSecure/scanner/commit/ad9ec3aa9914d825f1b66aef2e1279c2e3497bcb), [`c0feea6`](https://github.com/NodeSecure/scanner/commit/c0feea60818a783750b088909c7d0283beb8ecda), [`a4ab3f7`](https://github.com/NodeSecure/scanner/commit/a4ab3f72c161db1ee0e188eaea8073fcc513c825)]:
  - @nodesecure/contact@3.0.0
  - @nodesecure/mama@2.0.0
  - @nodesecure/tarball@2.1.0
  - @nodesecure/i18n@4.0.2
  - @nodesecure/conformance@1.1.1

## 6.10.0

### Minor Changes

- [#461](https://github.com/NodeSecure/scanner/pull/461) [`c94285f`](https://github.com/NodeSecure/scanner/commit/c94285f5b28d5b0d71398617d90578d547831ec7) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(TempDirectory): use Symbol.asyncDispose for automatic async cleanup

- [#464](https://github.com/NodeSecure/scanner/pull/464) [`ec55ce9`](https://github.com/NodeSecure/scanner/commit/ec55ce9ff4263c3b2e41b11af6f5c84461ac8631) Thanks [@clemgbld](https://github.com/clemgbld)! - refactor(scanner): remove useless try finally surrounding extractAndResolve in verify

### Patch Changes

- [#472](https://github.com/NodeSecure/scanner/pull/472) [`9ef1ee6`](https://github.com/NodeSecure/scanner/commit/9ef1ee6bb0e1d1820a64f698bc32f3ca9fe43dc3) Thanks [@fraxken](https://github.com/fraxken)! - Upgrade JS-X-Ray to v9.2.0 and fix related TS breaking changes

- Updated dependencies [[`9ef1ee6`](https://github.com/NodeSecure/scanner/commit/9ef1ee6bb0e1d1820a64f698bc32f3ca9fe43dc3)]:
  - @nodesecure/tree-walker@1.3.1
  - @nodesecure/tarball@2.0.1
  - @nodesecure/rc@5.0.1

## 6.9.0

### Minor Changes

- [#379](https://github.com/NodeSecure/scanner/pull/379) [`de110df`](https://github.com/NodeSecure/scanner/commit/de110df63090296a45ef89b290c73bd58c69c0be) Thanks [@fraxken](https://github.com/fraxken)! - Implement new major JS-X-Ray API and completely refactor tarball package

### Patch Changes

- Updated dependencies [[`713263f`](https://github.com/NodeSecure/scanner/commit/713263f185e53edd819fd939f2a76731a918e499), [`fba460a`](https://github.com/NodeSecure/scanner/commit/fba460ad264a2775aad6b198c5434e5ebd207641), [`de110df`](https://github.com/NodeSecure/scanner/commit/de110df63090296a45ef89b290c73bd58c69c0be)]:
  - @nodesecure/mama@1.6.0
  - @nodesecure/tarball@2.0.0

## 6.8.0

### Minor Changes

- [#446](https://github.com/NodeSecure/scanner/pull/446) [`08fa158`](https://github.com/NodeSecure/scanner/commit/08fa1586b0cc42aad0a6116cfb1e07edd75f73c3) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(extractors): add node dependencies extractor

- [#442](https://github.com/NodeSecure/scanner/pull/442) [`41b1de2`](https://github.com/NodeSecure/scanner/commit/41b1de2641581d90aac21743733d6d5c6ffe2d31) Thanks [@fraxken](https://github.com/fraxken)! - Update all interfaces to start with a Maj

### Patch Changes

- [#449](https://github.com/NodeSecure/scanner/pull/449) [`a233dfd`](https://github.com/NodeSecure/scanner/commit/a233dfd8f0ad0a3bd82592181bfee4a59414a380) Thanks [@fraxken](https://github.com/fraxken)! - Only assert for package.json in ManifestManager

- Updated dependencies [[`53df5b6`](https://github.com/NodeSecure/scanner/commit/53df5b6840a20b9dc8379ba44ffb5c9e4816d535), [`a233dfd`](https://github.com/NodeSecure/scanner/commit/a233dfd8f0ad0a3bd82592181bfee4a59414a380), [`41b1de2`](https://github.com/NodeSecure/scanner/commit/41b1de2641581d90aac21743733d6d5c6ffe2d31)]:
  - @nodesecure/utils@2.3.0
  - @nodesecure/mama@1.5.0
  - @nodesecure/rc@5.0.0
  - @nodesecure/tarball@1.3.0

## 6.7.0

### Minor Changes

- [#435](https://github.com/NodeSecure/scanner/pull/435) [`fb5494f`](https://github.com/NodeSecure/scanner/commit/fb5494f669029772d6bea9b86074634e0692ca9d) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(extractors) added extenstions extractor

### Patch Changes

- Updated dependencies [[`9eb15e2`](https://github.com/NodeSecure/scanner/commit/9eb15e233b85546b06bbcb10d66f98a71deba7eb), [`39cf2a9`](https://github.com/NodeSecure/scanner/commit/39cf2a92568aff3cbb44ba3dccf44c323f971119), [`f362a3b`](https://github.com/NodeSecure/scanner/commit/f362a3b75db69e961d85758b9ca7c56849ceaf4a)]:
  - @nodesecure/conformance@1.1.0
  - @nodesecure/contact@2.0.0
  - @nodesecure/mama@1.4.0

## 6.6.0

### Minor Changes

- [#433](https://github.com/NodeSecure/scanner/pull/433) [`25d86e3`](https://github.com/NodeSecure/scanner/commit/25d86e371ac8381b226953b89611f177fba3525e) Thanks [@clemgbld](https://github.com/clemgbld)! - feat(extractors): keep only wanted flags

### Patch Changes

- [#431](https://github.com/NodeSecure/scanner/pull/431) [`04ca391`](https://github.com/NodeSecure/scanner/commit/04ca39127a0f64121ad862cff286ead045f28492) Thanks [@fraxken](https://github.com/fraxken)! - remove faulty manifestAuthor helper for utils.parseAuthor

- Updated dependencies [[`1833db7`](https://github.com/NodeSecure/scanner/commit/1833db7f3ae128be159cfcca29ee6352d516f34a), [`97a36b5`](https://github.com/NodeSecure/scanner/commit/97a36b523aa9b22900cd4ad822aa6a083e254121), [`d7c45c3`](https://github.com/NodeSecure/scanner/commit/d7c45c33c23cca5bbfa1d2c4bfa0f6d8987248a1), [`c91032d`](https://github.com/NodeSecure/scanner/commit/c91032d5aa24ae08d0822790e96c83d3a614b4f3)]:
  - @nodesecure/mama@1.3.0
  - @nodesecure/contact@1.0.2

## 6.5.0

### Minor Changes

- [#415](https://github.com/NodeSecure/scanner/pull/415) [`dd35d78`](https://github.com/NodeSecure/scanner/commit/dd35d78f159a70a5ec5e8f2a1cfb326e0a522247) Thanks [@fraxken](https://github.com/fraxken)! - Simplify extractors name & add way to inject fast probes with callbacks"

- [#406](https://github.com/NodeSecure/scanner/pull/406) [`5e8beea`](https://github.com/NodeSecure/scanner/commit/5e8beead9fc1d2b3516dd410f4d0c8f2088655e4) Thanks [@fraxken](https://github.com/fraxken)! - Enhance warnings extractor by adding unique kinds & refactoring response

- [#391](https://github.com/NodeSecure/scanner/pull/391) [`cd7ea18`](https://github.com/NodeSecure/scanner/commit/cd7ea1892a06af8cdf0b4cf651cc39b9252f1651) Thanks [@clemgbld](https://github.com/clemgbld)! - (Scanner) Implement Packument 'deprecated' property in DependencyVersion

  to include the message which come with the property when we detect it

- [#407](https://github.com/NodeSecure/scanner/pull/407) [`3baa212`](https://github.com/NodeSecure/scanner/commit/3baa212d0caf6de0e9b792fbad03b94990450156) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new Probe extractor for flags

- [#409](https://github.com/NodeSecure/scanner/pull/409) [`0fc1156`](https://github.com/NodeSecure/scanner/commit/0fc11567e916a67066b149dea4a71d7cdf18b0fc) Thanks [@clemgbld](https://github.com/clemgbld)! - Implement EventEmitter with two events on Payload class (Extractors)

- [#404](https://github.com/NodeSecure/scanner/pull/404) [`40a9350`](https://github.com/NodeSecure/scanner/commit/40a93507e20e1002059f71a40539dfd058879257) Thanks [@fraxken](https://github.com/fraxken)! - Implement new DependencyVersion type to detect the kind of module (cjs/esm/dual..)

- [#402](https://github.com/NodeSecure/scanner/pull/402) [`d02c1e8`](https://github.com/NodeSecure/scanner/commit/d02c1e833f0c38dfc6dfb7dea481cae4c1ec0d1d) Thanks [@fraxken](https://github.com/fraxken)! - Add a new Extraction probe for vulnerabilities

- [#399](https://github.com/NodeSecure/scanner/pull/399) [`cee3398`](https://github.com/NodeSecure/scanner/commit/cee3398da6610476991fcedae0efba98f83c46e5) Thanks [@fraxken](https://github.com/fraxken)! - Implement a new extraction probe for warnings

- [#414](https://github.com/NodeSecure/scanner/pull/414) [`414d6da`](https://github.com/NodeSecure/scanner/commit/414d6dad49535ba84adf15c18f8f58b67bbb3e16) Thanks [@fraxken](https://github.com/fraxken)! - update @nodesecure/flags to major v3.x

### Patch Changes

- Updated dependencies [[`3ee9a2e`](https://github.com/NodeSecure/scanner/commit/3ee9a2e17c877e7ea6fe23fc4ffc86578e6d0b72), [`0137bc6`](https://github.com/NodeSecure/scanner/commit/0137bc6060fe56c673b1ab92214debe63ce35958), [`55af858`](https://github.com/NodeSecure/scanner/commit/55af858f993520bca6f0fc5b0dbddf0b329ab5e0), [`40a9350`](https://github.com/NodeSecure/scanner/commit/40a93507e20e1002059f71a40539dfd058879257)]:
  - @nodesecure/mama@1.2.0
  - @nodesecure/tarball@1.2.0
  - @nodesecure/tree-walker@1.3.0
