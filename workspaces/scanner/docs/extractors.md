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
    new Extractors.Probes.Contacts()
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
| Contacts | manifest |
| Licenses | manifest |
| Size | manifest |
| Flags | manifest |
| Vulnerabilities | packument |
| Warnings | manifest |
| Extentions | manifest |
| NodeDependencies | manifest |

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
The `Payload` class extends Node.js `EventEmitter`, allowing you to listen for extraction events and implement custom behavior during the extraction process.

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

### Events

Since `Payload` extends `EventEmitter`, you can listen for events that are emitted during the extraction process, the parameters signature of each listener is the same as the `next()` method of its corresponding probe.


### packument

Emitted for each dependency when processing at the packument level, the event signature is:

```ts
extractor.on('packument', (name: string, dependency: Scanner.Dependency) => {
  // Handle packument-level processing
});
```

#### manifest

Emitted for each dependency version when processing at the manifest level, the event signature is:

```ts
extractor.on('manifest', (
  spec: string, 
  depVersion: Scanner.DependencyVersion, 
  parent: { name: string, dependency: Scanner.Dependency }
) => {
  // Handle manifest-level processing
});
```
