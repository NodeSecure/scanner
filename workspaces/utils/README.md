<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/287494046-1121d658-3adb-4cca-9751-659e530f5a93.jpg" alt="@nodesecure/utils">
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/blob/master/workspaces/utils">
      <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/utils/master/package.json&query=$.version&label=Version" alt="npm version">
    </a>
    <a href="https://github.com/NodeSecure/blob/master/workspaces/utils/graphs/commit-activity">
      <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge" alt="maintenance">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/utils">
      <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/NodeSecure/blob/master/workspaces/utils/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/NodeSecure/scanner.svg?style=for-the-badge" alt="license">
    </a>
    <a href="https://github.com/NodeSecure/blob/master/workspaces/utils/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/scanner/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
</p>

NodeSecure utilities.

## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/utils
# or
$ yarn add @nodesecure/utils
```

## Usage example

```js
import * as utils from "@nodesecure/utils";

console.log(utils.parseAuthor("GENTILHOMME Thomas <foo.bar@gmail.com>"));
```

## API

See TypeScript definition file.

## License

MIT
