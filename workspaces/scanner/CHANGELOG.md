# @nodesecure/scanner

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
