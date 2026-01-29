# @nodesecure/scanner

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
