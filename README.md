<img align="center" alt="# Nodesecure Scanner" src="https://user-images.githubusercontent.com/4438263/226018084-113c49e6-6c69-4baa-8f84-87e6d695be6d.jpg">

![version](https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/scanner/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/NodeSecure/scanner/graphs/commit-activity)
[![OpenSSF
Scorecard](https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=for-the-badge)](https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner)
[![mit](https://img.shields.io/github/license/NodeSecure/scanner.svg?style=for-the-badge)](https://github.com/NodeSecure/scanner/blob/master/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/NodeSecure/scanner/node.js.yml?style=for-the-badge)

⚡️ Run a static analysis of your module's dependencies.

## Requirements

- [Node.js](https://nodejs.org/en/) version 18 or higher

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
import fs from "fs/promises";

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

See `types/api.d.ts` for a complete TypeScript definition.

```ts
function cwd(
  location: string,
  options?: Scanner.Options
): Promise<Scanner.Payload>;
function from(
  packageName: string,
  options?: Omit<Scanner.Options, "includeDevDeps">
): Promise<Scanner.Payload>;
function verify(packageName?: string | null): Promise<Scanner.VerifyPayload>;
```

`Options` is described with the following TypeScript interface:

```ts
interface Options {
  readonly maxDepth?: number;
  readonly registry?: string | URL;
  readonly usePackageLock?: boolean;
  readonly includeDevDeps?: boolean;
  readonly vulnerabilityStrategy: Strategy.Kind;
  readonly forceRootAnalysis?: boolean;
  readonly fullLockMode?: boolean;
}
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-11-orange.svg?style=flat-square)](#contributors-)
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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mbalabash"><img src="https://avatars.githubusercontent.com/u/16868922?v=4?s=100" width="100px;" alt="Maksim Balabash"/><br /><sub><b>Maksim Balabash</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=mbalabash" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://dev.to/antoinecoulon"><img src="https://avatars.githubusercontent.com/u/43391199?v=4?s=100" width="100px;" alt="Antoine Coulon"/><br /><sub><b>Antoine Coulon</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=antoine-coulon" title="Code">💻</a> <a href="#security-antoine-coulon" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/nicolas-hallaert/"><img src="https://avatars.githubusercontent.com/u/39910164?v=4?s=100" width="100px;" alt="Nicolas Hallaert"/><br /><sub><b>Nicolas Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Rossb0b" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://sofiand.github.io/portfolio-client/"><img src="https://avatars.githubusercontent.com/u/39944043?v=4?s=100" width="100px;" alt="Yefis"/><br /><sub><b>Yefis</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=SofianD" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/franck-hallaert/"><img src="https://avatars.githubusercontent.com/u/110826655?v=4?s=100" width="100px;" alt="Franck Hallaert"/><br /><sub><b>Franck Hallaert</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Aekk0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/ange-tekeu-a155811b4/"><img src="https://avatars.githubusercontent.com/u/35274201?v=4?s=100" width="100px;" alt="Ange TEKEU"/><br /><sub><b>Ange TEKEU</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=tekeuange23" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Kawacrepe"><img src="https://avatars.githubusercontent.com/u/40260517?v=4?s=100" width="100px;" alt="Vincent Dhennin"/><br /><sub><b>Vincent Dhennin</b></sub></a><br /><a href="https://github.com/NodeSecure/scanner/commits?author=Kawacrepe" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabnguess"><img src="https://avatars.githubusercontent.com/u/72697416?v=4?s=100" width="100px;" alt="Kouadio Fabrice Nguessan"/><br /><sub><b>Kouadio Fabrice Nguessan</b></sub></a><br /><a href="#maintenance-fabnguess" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
