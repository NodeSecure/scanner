# Extractors APIs

A set of APIs to efficiently extract and aggregate data from a NodeSecure payload.

## Usage example

Here's how to extract a list of contacts (maintainers, authors) from the Fastify framework:

```ts
import { Extractors, from } from "@nodesecure/scanner";

const payload = await from("fastify");

const extractor = new Extractors.Payload(
  payload,
  [
    new Extractors.Probes.ContactExtractor()
  ]
);

const { contacts } = extractor.extractAndMerge();
console.log(contacts);
```

## Probes

A probe is a worker designed to collect a specific type of data from a NodeSecure payload.

Available probes include:


| name | level |
| --- | --- |
| ContactExtractor | manifest |
| LicensesExtractor | manifest |
| SizeExtractor | manifest |
| FlagsExtractor | manifest |
| VulnerabilitiesExtractor | packument |
| WarningsExtractor | manifest |

All probes follow the same `ProbeExtractor` interface, which acts as an iterator-like contract:

```ts
export interface ProbeExtractor<Defs> {
  level: ProbeExtractorLevel;
  next(...args: any[]): void;
  done(): Defs;
}
```

Depending on the scope of the data being processed, probes are implemented at two distinct levels:

- Packument (operates at the package registry level, across multiple versions of a package)
- Manifest (operates at the level of a specific dependency's package.json)

Each probe level defines its own `next()` method signature:

```ts
export interface PackumentProbeExtractor<Defs> extends ProbeExtractor<Defs> {
  level: "packument";
  next(name: string, dependency: Scanner.Dependency): void;
}

export interface ManifestProbeExtractor<Defs> extends ProbeExtractor<Defs> {
  level: "manifest";
  next(
    spec: string,
    dependencyVersion: Scanner.DependencyVersion,
    parent: ProbeExtractorManifestParent
  ): void;
}
```

## API

> [!NOTE]
> generic `T` is defined as extending from `ProbeExtractor<any>[]`

### constructor(data: Scanner.Payload | Scanner.Payload[ "dependencies" ], probes: [ ...T ])

Creates a new extractor instance using the provided payload and probes.

### extract(): ExtractProbeResult< T >

Executes each probe and returns their results as an array, for example:

```js
[
  { "probe1", "xxx" },
  { "probe2", "xxx" }
]
```

> [!WARNING]
> The method can only be used once because the result will be cached.

### extractAndMerge(): MergedExtractProbeResult< T >

Runs the probes and deeply merges their results into a single record, for example:

```js
{
  "probe1": "xxx",
  "probe2": "xxx"
}
```
