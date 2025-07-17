<p align="center"><h1 align="center">
  @nodesecure/contact
</h1>

<p align="center">
  Utilities to extract/fetch data on NPM contacts (author, maintainers etc..)
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/contact
# or
$ yarn add @nodesecure/contact
```

## Usage example

Here is an example of usage from the Scanner. In this case, we are using **dependenciesMap**, which is a `Record<string, Dependency>`. However, you can build your own record of `ContactExtractorPackageMetadata`.

```ts
import {
  ContactExtractor,
  type ContactExtractorPackageMetadata
} from "@nodesecure/contact";

const dependencies: Record<string, ContactExtractorPackageMetadata> = Object.create(null);
for (const [packageName, dependency] of dependenciesMap) {
  const { author, maintainers } = dependency.metadata;

  dependencies[packageName] = {
    maintainers,
    ...( author === null ? {} : { author } )
  }
}

const extractor = new ContactExtractor({
  highlight: [
    {
      name: "Sindre Sorhus"
    }
  ]
});
const { illuminated, expired } = extractor.fromDependencies(
  dependencies
);
console.log({ illuminated, expired });
```

## API

Contact is defined by the following TypeScript interface:
```ts
interface Contact {
  email?: string;
  url?: string;
  name: string;
}
```

### ContactExtractor

The constructor take a list of contacts you want to find/extract.

```ts
interface ContactExtractorOptions {
  highlight: EnforcedContact[];
}

type EnforcedContact = RequireAtLeastOne<
  Contact,
  "name" | "email"
>;
```

> [!TIP]
> This package authorizes literal RegExp in the name property of `highlight` contacts

The method **fromDependencies** will return an Array of IlluminatedContact objects if any are found in the provided dependencies and the list of expired email domains.

```ts
interface ContactExtractorFromDependenciesResult {
  illuminated: IlluminatedContact[];
  /**
   * List of email domains that are expired
   */
  expired: string[];
}

type IlluminatedContact = Contact & {
  dependencies: string[];
}
```

### compareContact(contactA: Partial< Contact >, contactB: Partial< Contact >, options?: CompareOptions): boolean

Compare two contacts and return `true` if they are the same person

```ts
import {
  compareContact
} from "@nodesecure/contact";
import assert from "node:assert";

assert.ok(
  compareContact(
    { name: "john doe" },
    { name: "John  Doe" }
  )
);
```

Each string is trimmed, converted to lowercase, and any multiple spaces are reduced to a single space.

#### Options

```ts
interface CompareOptions {
  /**
   * @default true
   */
  compareName?: boolean;
}
```

## License
MIT
