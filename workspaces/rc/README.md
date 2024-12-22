<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/216045720-779bf16d-1d35-409f-a0e6-4019bda8edde.jpg" alt="@nodesecure/rc">
</p>

<p align="center">
    <a href="https://github.com/NodeSecure/blob/master/workspaces/rc">
      <img src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&url=https://raw.githubusercontent.com/NodeSecure/scanner/blob/master/workspaces/rc/package.json&query=$.version&label=Version" alt="npm version">
    </a>
    <a href="https://github.com/NodeSecure/scanner/blob/master/workspaces/rc/LICENSE">
      <img src="https://img.shields.io/github/license/NodeSecure/scanner.svg?style=for-the-badge" alt="license">
    </a>
    <a href="https://api.securityscorecards.dev/projects/github.com/NodeSecure/blob/master/workspaces/rc">
      <img src="https://api.securityscorecards.dev/projects/github.com/NodeSecure/scanner/badge?style=for-the-badge" alt="ossf scorecard">
    </a>
    <a href="https://github.com/NodeSecure/scanner/actions?query=workflow%3A%22Node.js+CI%22">
      <img src="https://img.shields.io/github/actions/workflow/status/NodeSecure/scanner/node.js.yml?style=for-the-badge" alt="github ci workflow">
    </a>
</p>

NodeSecure runtime configuration.

## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/rc
# or
$ yarn add @nodesecure/rc
```

## Usage example

read:

```ts
import * as RC from "@nodesecure/rc";

const configurationPayload = (
  await RC.read(void 0, { createIfDoesNotExist: true })
).unwrap();
console.log(configurationPayload);
```

write:

```ts
import assert from "node:assert/strict";
import * as RC from "@nodesecure/rc";

const writeOpts: RC.writeOptions = {
  payload: { version: "2.0.0" },
  partialUpdate: true,
};

const result = (await RC.write(void 0, writeOpts)).unwrap();
assert.strictEqual(result, void 0);
```

memoize/memoized:

```ts
import * as RC from "@nodesecure/rc";
import assert from "node:assert";

const configurationPayload = (
    await RC.read(void 0, { createMode: "ci" })
).unwrap()

RC.memoize(configurationPayload, { overwrite: true });

const memoizedPayload = RC.memoized();
assert.deepEqual(configurationPayload, memoizedPayload);
```

> 👀 .read and .write return Rust like [Result](https://doc.rust-lang.org/std/result/) object.

## API

> [!NOTE]
> If `undefined`, the location will be assigned to `process.cwd()`.

### read(location?: string, options?: readOptions): Promise< Result< RC, NodeJS.ErrnoException > >

```ts
interface createReadOptions {
  /**
   * If enabled, the file will be created if it does not exist on disk.
   *
   * @default false
   */
  createIfDoesNotExist?: boolean;
  /**
   * Generate a more or less complete configuration.
   *
   * @default `minimal`
   */
  createMode?: RCGenerationMode | RCGenerationMode[];
  /**
   * Automatically cache the configuration when enabled.
   *
   * @default false
   */
  memoize?: boolean;
}

export type readOptions = RequireAtLeastOne<
  createReadOptions,
  "createIfDoesNotExist" | "createMode"
>;
```

The `createIfDoesNotExist` argument can be ignored if `createMode` is provided.

```ts
import * as RC from "@nodesecure/rc";

const configurationPayload = (
  await RC.read(void 0, { createMode: "ci" })
).unwrap();
console.log(configurationPayload);
```

### write(location?: string, options: writeOptions): Promise< Result< void, NodeJS.ErrnoException > >

By default the write API will overwrite the current payload with the provided one. When the `partialUpdate` option is enabled it will merge the new properties with the existing one.

```ts
/**
 * Overwrite the complete payload. partialUpdate property is mandatory.
 */
export interface writeCompletePayload {
  payload: RC;
  partialUpdate?: false;
}

/**
 * Partially update the payload. This implies not to rewrite the content of the file when enabled.
 **/
export interface writePartialPayload {
  payload: Partial<RC>;
  partialUpdate: true;
}

export type writeOptions = writeCompletePayload | writePartialPayload;
```
### memoize(payload: Partial< RC >, options: memoizeOptions = {}): void
By default, the memory API overwrites the previous stored payload. When the `OVERWRITE` option is `false`, it merges new properties with existing properties.

```ts
export interface memoizeOptions {
  overwrite?: boolean;
}
```
The `overwrite` option is used to specify whether data should be overwritten or merged.

### memoized(options: memoizedOptions): Partial< RC > | null
This method returns null, when the default value is null, otherwise, it returns the current value of `memoizedValue`.

```ts
export interface memoizedOptions {
  defaultValue: Partial<RC>;
}
```
If the `defaultValue` property is at null, then this value will be returned when `memoized` is called.

### maybeMemoized(): Option< Partial< RC > >

Same as memoized but return an Option monad.

```ts
import * as RC from "@nodesecure/rc";

const memoized = RC.maybeMemoized()
  .unwrapOr({}); // Some default RC here
```

### clearMemoized(): void
Clear/reset memoized RC

### homedir(): string

Dedicated directory for NodeSecure to store the configuration in the os HOME directory.

```ts
import * as RC from "@nodesecure/rc";

const homedir = RC.homedir();
```

### CONSTANTS

```ts
import assert from "node:assert/strict";
import * as RC from "@nodesecure/rc";

assert.strictEqual(RC.CONSTANTS.CONFIGURATION_NAME, ".nodesecurerc");
```

### Generation Mode

We provide by default a configuration generation that we consider `minimal`. On the contrary, a `complete` value will indicate the generation with all possible default keys.

```ts
export type RCGenerationMode = "minimal" | "ci" | "report" | "scanner" | "complete";
```

However, depending on the NodeSecure tool you are working on, it can be interesting to generate a configuration with some property sets specific to your needs.

Note that you can combine several modes:

```ts
import * as RC from "@nodesecure/rc";

await RC.read(void 0, { createMode: ["ci", "report"] });
```

## JSON Schema

The runtime configuration is validated using a JSON Schema: `./src/schema/nodesecurerc.json`.

It can be retrieved via API if needed:

```ts
import * as RC from "@nodesecure/rc";

console.log(RC.JSONSchema);
```

The JSON schema is a composition of multiple definitions for each tool:

- [ci](./src/schema/defs/ci.json)
  - [ciWarnings](./src/schema/defs/ciWarnings.json)
  - [contact](./src/schema/defs/contact.json)
- [report](./src/schema/defs/report.json)
  - [reportChart](./src/schema/defs/reportChart.json)
- [scanner](./src/schema/defs/scanner.json)

## License

MIT
