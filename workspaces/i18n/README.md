<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/226019205-7d86a8d5-345f-416f-bc8d-c4aef6f12868.jpg" alt="@nodesecure/i18n">
</p>

<p align="center">
  Internationalization (**i18n**) utilities for NodeSecure tools like [CLI](https://github.com/NodeSecure/cli). 
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/i18n
# or
$ yarn add @nodesecure/i18n
```

## Usage example

```js
import * as i18n from "@nodesecure/i18n";

await i18n.setLocalLang("french");

console.log(i18n.getToken("depWalker.dep_tree"));

// Using parameters
console.log(i18n.getToken("depWalker.success_tarball", "14", "15ms"));
```

You can consult the real use case of the API in the following codes: [here](https://github.com/NodeSecure/cli/blob/master/src/commands/lang.js) and [here](https://github.com/NodeSecure/cli/blob/master/src/commands/vulnerability.js).

## Supported languages

- french
- english

> [!NOTE]
> Feel free to open a PR to push a new language

## API

See TypeScript definition file.

```ts
type languages = "french" | "english";

export function getLocalLang(): Promise<languages>;
export function setLocalLang(newLanguage: languages): Promise<void>;
export function getToken(token: string, ...parameters): Promise<string>;
export function getTokenSync(token: string, ...parameters): string;
export function getLanguages(): Promise<languages[]>;
export function taggedString(str: string, ...keys: any[]): (...keys: any[]) => string;
export function extend(language: string, tokens: Record<string, any>): void;
export function extendFromSystemPath(path: string): Promise<void>;
```

> [!NOTE]
> Local lang must be updated otherwise `getTokenSync()` will throws. Make sure to use `await i18n.getLocalLang()` before any synchronous usage.

## Generate documentation

You can generate a static webpage by using the `build:documentation` npm script:

```bash
$ npm run build:documentation
```

## Contributing
Feel free to add a new language. You need to take inspiration from the two supported languages and replicate the same keys.

Then export it in the `index.js` file (example if we want to add a chinese translation).

```js
export * as chinese  from "./chinese.js";
```
## License
MIT
