# Utilities

Contact is defined by the following TypeScript interface:
```ts
interface Contact {
  email?: string;
  url?: string;
  name: string;
}
```

## compareContact(contactA: Partial< Contact > | ContactWithMetadata, contactB: Partial< Contact > | ContactWithMetadata, options?: CompareOptions): boolean

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

### Options

```ts
interface CompareOptions {
  /**
   * @default true
   */
  compareName?: boolean;
}
```

## toContactWithMetadata<T extends Partial<Contact>>(contact: T): T & { flags: ContactFlag[] }

Apply some transformation on a contact such as adding a flag when the contact use a free email service

```ts
import {
  toContactWithMetadata
} from "@nodesecure/contact";
import assert from "node:assert";

assert.deepEqual(
toContactWithMetadata({
    name:"john doe",
    email: "johndoe@gmail.com"
  }),
  {
  name:"john doe",
  email: "johndoe@gmail.com",
  flags: ["free-email-service"]
  }
);
```

## extractMetadataContacts(metadata: ContactPackageMetaData): ContactWithMetadata[]

Extract the author (if any) and maintainers of a package metadata object as a flat array of `ContactWithMetadata`, applying `toContactWithMetadata` on each of them. The author (when present) is always returned first, followed by the maintainers.

```ts
import {
  extractMetadataContacts
} from "@nodesecure/contact";
import assert from "node:assert";

assert.deepEqual(
  extractMetadataContacts({
    author: { name: "john doe", email: "john@gmail.com" },
    maintainers: [{ name: "jane doe" }]
  }),
  [
    { name: "john doe", email: "john@gmail.com", flags: ["free-email-service"] },
    { name: "jane doe", flags: [] }
  ]
);
```

```ts
interface ContactExtractorPackageMetadata {
  author?: Contact | null;
  maintainers: Contact[];
}

type ContactPackageMetaData = Partial<ContactExtractorPackageMetadata>;
```

## parseRegExp(input: string): RegExp | null

Parse a string containing a literal RegExp (e.g. `"/^hello/i"`) into a `RegExp` instance. Returns `null` when the input doesn't match the literal RegExp syntax. Only the `gimsuy` flags are kept, any other character found after the closing slash is ignored.

```ts
import {
  parseRegExp
} from "@nodesecure/contact";
import assert from "node:assert";

const regexp = parseRegExp("/^hello/i");

assert.ok(regexp instanceof RegExp);
assert.ok(regexp.test("Hello World"));

assert.strictEqual(parseRegExp("hello"), null);
```
