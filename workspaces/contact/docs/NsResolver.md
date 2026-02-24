# NsResolver

`NsResolver` is a utility class that collects email addresses and detects which ones have **expired domain names** by performing DNS NS record lookups.

It is used internally by `ContactExtractor` but is also exported for direct use.

## Usage example

```ts
import { NsResolver } from "@nodesecure/contact";

const resolver = new NsResolver();

resolver.registerEmail("alice@valid-domain.com");
resolver.registerEmail("bob@expired-domain.xyz");

const expired = await resolver.getExpired();
console.log(expired); // ["bob@expired-domain.xyz"] (if NS lookup fails)
```

## API

### `new NsResolver()`

Creates a new instance. The DNS resolver is pre-configured to use Cloudflare (`1.1.1.1`) and Google (`8.8.8.8`) public DNS servers.

### `registerEmail(email: string | undefined | null): void`

Registers an email address for later NS resolution. Silently ignores `null`, `undefined`, and blank strings.

### `getExpired(): Promise<string[]>`

Resolves NS records for the domain of every registered email in parallel. Returns the list of emails whose domain **failed** the NS lookup (i.e. the domain is expired or does not exist).
