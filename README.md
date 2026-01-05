<img align="center" alt="# Nodesecure Scanner" src="https://user-images.githubusercontent.com/4438263/226018084-113c49e6-6c69-4baa-8f84-87e6d695be6d.jpg">

![version](https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/scanner/master/workspaces/scanner/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/scanner/graphs/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner)
[![mit](https://img.shields.io/github/license/NodeSecure/scanner.svg?style=for-the-badge)](https://github.com/NodeSecure/scanner/blob/master/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/scanner/node.js.yml?style=for-the-badge)

⚡️ Run a static analysis of your module's dependencies.

## Requirements

- [Node.js](https://nodejs.org/en/) version 22 or higher

## Features

Scanner builds on [JS-X-Ray](https://github.com/NodeSecure/js-x-ray) (SAST) and [Vulnera](https://github.com/NodeSecure/vulnera) (CVE detection), and adds additional detections such as:

- Detects:
  - [Manifest confusion](https://blog.vlt.sh/blog/the-massive-hole-in-the-npm-ecosystem)
  - [Dependency confusion](https://www.landh.tech/blog/20250610-netflix-vulnerability-dependency-confusion/)
  - Typosquatting of popular package names
  - Install scripts (e.g. `install`, `preinstall`, `postinstall`, `preuninstall`, `postuninstall`)
- Highlights packages by name, version(s), or maintainer
- Supports NPM and Yarn lockfiles

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/scanner
# or
$ yarn add @nodesecure/scanner
```

## Usage example

```js
import * as scanner from "@nodesecure/scanner";
import fs from "node:fs/promises";

// CONSTANTS
const kPackagesToAnalyze = ["mocha", "cacache", "is-wsl"];

const payloads = await Promise.all(
  kPackagesToAnalyze.map((name) => scanner.from(name))
);

const promises = [];
for (let i = 0; i < kPackagesToAnalyze.length; i++) {
  const data = JSON.stringify(payloads[i], null, 2);

  promises.push(fs.writeFile(`${kPackagesToAnalyze[i]}.json`, data));
}
await Promise.allSettled(promises);
```

## API

See [types.ts](https://github.com/NodeSecure/scanner/blob/master/workspaces/scanner/src/types.ts) for a complete TypeScript definition.

```ts
function workingDir(
  location: string,
  options?: Scanner.WorkingDirOptions,
  logger?: Scanner.Logger
): Promise<Scanner.Payload>;
function from(
  packageName: string,
  options?: Scanner.FromOptions,
  logger?: Scanner.Logger
): Promise<Scanner.Payload>;
function verify(
  packageName?: string
): Promise<tarball.ScannedPackageResult>;
```

`WorkingDirOptions` and `FromOptions` are described with the following TypeScript interfaces:

```ts

type WorkingDirOptions = Options & {
  /**
   * NPM runtime configuration (such as local .npmrc file)
   * It is optionally used to fetch registry authentication tokens
   */
  npmRcConfig?: Config;
};

type FromOptions = Omit<Options, "includeDevDeps">;

interface Options {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * A value of 2 would mean only traversing deps and their immediate deps.
   *
   * @default Infinity
   */
  maxDepth?: number;

  /**
   * Includes development dependencies in the walk.
   * Note that enabling this option can significantly increase I/O and processing time.
   *
   * @default false
   */
  includeDevDeps?: boolean;

  readonly registry?: string | URL;

  /**
   * Enables the use of Arborist for rapidly walking over the dependency tree.
   * When enabled, it triggers different methods based on the presence of `node_modules`:
   * - `loadActual()` if `node_modules` is available.
   * - `loadVirtual()` otherwise.
   *
   * When disabled, it will iterate on all dependencies by using pacote
   */
  packageLock?: {
    /**
     * Fetches all manifests for additional metadata.
     *
     * @default false
     */
    fetchManifest?: boolean;

    /**
     * Specifies the location of the manifest file for Arborist.
     * This is typically the path to the `package.json` file.
     */
    location: string;
  };

  highlight?: {
    contacts: Contact[];
  };

  /**
   * Vulnerability strategy name (npm, snyk, node)
   *
   * @default NONE
   */
  readonly vulnerabilityStrategy?: Vuln.Strategy.Kind;

  /**
   * Analyze root package.
   *
   * @default false for from() API
   * @default true  for cwd()  API
   */
  readonly scanRootNode?: boolean;
}
```

Additional APIs are available at:

- [from](./workspaces/scanner/docs/from.md)
- [extractors](./workspaces/scanner/docs/extractors.md)

## Workspaces

Click on one of the links to access the documentation of the workspace:

| name | package and link |
| --- | --- |
| tarball | [@nodesecure/tarball](./workspaces/tarball) |
| tree-walker | [@nodesecure/tree-walker](./workspaces/tree-walker) |
| flags | [@nodesecure/flags](./workspaces/flags) |
| mama | [@nodesecure/mama](./workspaces/mama) |
| contact | [@nodesecure/contact](./workspaces/contact) |
| conformance | [@nodesecure/conformance](./workspaces/conformance) |
| npm-types | [@nodesecure/npm-types](./workspaces/npm-types) |
| i18n | [@nodesecure/i18n](./workspaces/i18n) |
| rc | [@nodesecure/rc](./workspaces/rc) |
| utils | [@nodesecure/utils](./workspaces/utils) |
| fs-walk | [@nodesecure/fs-walk](./workspaces/fs-walk) |
| github | [@nodesecure/github](./workspaces/github) |
| gitlab | [@nodesecure/gitlab](./workspaces/gitlab) |

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-30-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/thomas-gentilhomme/"><img src="https://avatars.githubusercontent.com/u/4438263?v=4?s=100" width="100px;" alt="Gentilhomme"/><br /><sub><b>Gentilhomme</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=fraxken" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=fraxken" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Afraxken" title="Reviewed Pull Requests">👀</a> <a href="#security-fraxken" title="Security">🛡️</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Afraxken" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://tonygo.dev"><img src="https://avatars.githubusercontent.com/u/22824417?v=4?s=100" width="100px;" alt="Tony Gorez"/><br /><sub><b>Tony Gorez</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tony-go" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=tony-go" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Atony-go" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Atony-go" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://mickaelcroquet.fr"><img src="https://avatars.githubusercontent.com/u/23740372?v=4?s=100" width="100px;" alt="Haze"/><br /><sub><b>Haze</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=CroquetMickael" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mbalabash"><img src="https://avatars.githubusercontent.com/u/16868922?v=4?s=100" width="100px;" alt="Maksim Balabash"/><br /><sub><b>Maksim Balabash</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=mbalabash" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Ambalabash" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/antoinecoulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine Coulon"/><br /><sub><b>Antoine Coulon</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=antoine-coulon" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3Aantoine-coulon" title="Bug reports">🐛</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3Aantoine-coulon" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-antoine-coulon" title="Maintenance">🚧</a> <a href="#security-antoine-coulon" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/nicolas-hallaert/"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Rossb0b" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://sofiand.github.io/portfolio-client/"><img src="https://avatars.githubusercontent.com/u/39944043?v=4?s=100" width="100px;" alt="Yefis"/><br /><sub><b>Yefis</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=SofianD" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ange-tekeu-a155811b4/"><img src="https://avatars.githubusercontent.com/u/35274201?v=4?s=100" width="100px;" alt="Ange TEKEU"/><br /><sub><b>Ange TEKEU</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tekeuange23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Kawacrepe" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=Kawacrepe" title="Documentation">📖</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3AKawacrepe" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3AKawacrepe" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PierreDemailly"><img src="https://avatars.githubusercontent.com/u/39910767?v=4?s=100" width="100px;" alt="PierreDemailly"/><br /><sub><b>PierreDemailly</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=PierreDemailly" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/pulls?q=is%3Apr+reviewed-by%3APierreDemailly" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/NodeSecure/scanner/issues?q=author%3APierreDemailly" title="Bug reports">🐛</a> <a href="https://github.com/NodeSecure/scanner/commits?author=PierreDemailly" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kishore881"><img src="https://avatars.githubusercontent.com/u/49707819?v=4?s=100" width="100px;" alt="Kishore"/><br /><sub><b>Kishore</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=kishore881" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=kishore881" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clementgombauld.netlify.app/"><img src="https://avatars.githubusercontent.com/u/91478082?v=4?s=100" width="100px;" alt="Clement Gombauld"/><br /><sub><b>Clement Gombauld</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=clemgbld" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/intincrab"><img src="https://avatars.githubusercontent.com/u/93028153?v=4?s=100" width="100px;" alt="Ajāy "/><br /><sub><b>Ajāy </b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=intincrab" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=intincrab" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Rossb0b"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Rossb0b" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MaximeMRF"><img src="https://avatars.githubusercontent.com/u/57860498?v=4?s=100" width="100px;" alt="Maxime"/><br /><sub><b>Maxime</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=MaximeMRF" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ange-tekeu-a155811b4/"><img src="https://avatars.githubusercontent.com/u/35274201?v=4?s=100" width="100px;" alt="Ange TEKEU"/><br /><sub><b>Ange TEKEU</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tekeuange23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AlexandreMalaj"><img src="https://avatars.githubusercontent.com/u/32218832?v=4?s=100" width="100px;" alt="Alexandre Malaj"/><br /><sub><b>Alexandre Malaj</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=AlexandreMalaj" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=AlexandreMalaj" title="Documentation">📖</a> <a href="#translation-AlexandreMalaj" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/FredGuiou"><img src="https://avatars.githubusercontent.com/u/99122562?v=4?s=100" width="100px;" alt="FredGuiou"/><br /><sub><b>FredGuiou</b></sub></a><br /><a href="#maintenance-FredGuiou" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jochri3"><img src="https://avatars.githubusercontent.com/u/23065918?v=4?s=100" width="100px;" alt="Christian Lisangola"/><br /><sub><b>Christian Lisangola</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=jochri3" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/QuentinLpy"><img src="https://avatars.githubusercontent.com/u/31780359?v=4?s=100" width="100px;" alt="Quentin Lepateley"/><br /><sub><b>Quentin Lepateley</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=QuentinLpy" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://antoineneff.me"><img src="https://avatars.githubusercontent.com/u/9216777?v=4?s=100" width="100px;" alt="Antoine Neff"/><br /><sub><b>Antoine Neff</b></sub></a><br /><a href="#translation-antoineneff" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.linkedin.com/in/kvoyer"><img src="https://avatars.githubusercontent.com/u/33313541?v=4?s=100" width="100px;" alt="Kévin VOYER"/><br /><sub><b>Kévin VOYER</b></sub></a><br /><a href="#translation-kecsou" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Mathieuka"><img src="https://avatars.githubusercontent.com/u/34446722?v=4?s=100" width="100px;" alt="Mathieu"/><br /><sub><b>Mathieu</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Mathieuka" title="Code">💻</a> <a href="#translation-Mathieuka" title="Translation">🌍</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://codebreaker.fr/"><img src="https://avatars.githubusercontent.com/u/53506859?v=4?s=100" width="100px;" alt="im_codebreaker"/><br /><sub><b>im_codebreaker</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=im-codebreaker" title="Code">💻</a> <a href="https://github.com/NodeSecure/scanner/commits?author=im-codebreaker" title="Documentation">📖</a> <a href="#design-im-codebreaker" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ayushmaanshrotriya"><img src="https://avatars.githubusercontent.com/u/65903307?v=4?s=100" width="100px;" alt="Ayushmaan Shrotriya"/><br /><sub><b>Ayushmaan Shrotriya</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=ayushmaanshrotriya" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Ineslujan"><img src="https://avatars.githubusercontent.com/u/65076833?v=4?s=100" width="100px;" alt="Inès & Mélu"/><br /><sub><b>Inès & Mélu</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Ineslujan" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zwOk9"><img src="https://avatars.githubusercontent.com/u/18079239?v=4?s=100" width="100px;" alt="zwOk9"/><br /><sub><b>zwOk9</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=zwOk9" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pmartin-dev"><img src="https://avatars.githubusercontent.com/u/45450501?v=4?s=100" width="100px;" alt="Pierre Martin"/><br /><sub><b>Pierre Martin</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=pmartin-dev" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
