// Import Node.js Dependencies
import { resolve4, resolve6 } from "node:dns/promises";

// Import Third-party Dependencies
import ipaddress from "ipaddr.js";

export interface Resolver {
  isPrivateHost(hostname: string): Promise<boolean>;
}

export type Lookup = (hostname: string) => Promise<string[]>;

async function lookupAll(hostname: string) {
  const ips = await Promise.allSettled([
    resolve4(hostname),
    resolve6(hostname)
  ]);

  const ipv4 = ips[0].status === "fulfilled"
    ? ips[0].value
    : [];

  const ipv6 = ips[1].status === "fulfilled"
    ? ips[1].value
    : [];

  return [...ipv4, ...ipv6];
}

export class DnsResolver implements Resolver {
  #memo: Map<string, boolean> = new Map();
  #lookup: Lookup;
  constructor(lookup?: Lookup) {
    this.#lookup = lookup ?? lookupAll;
  }
  async isPrivateHost(hostname: string) {
    if (this.#memo.has(hostname)) {
      return this.#memo.get(hostname)!;
    }
    const ipAddressList = await this.#lookup(hostname);

    const isPrivate = ipAddressList.some(this.#isPrivateIPAddress);
    this.#memo.set(hostname, isPrivate);

    return isPrivate;
  }

  #isPrivateIPAddress(ipAddress: string): boolean {
    let ip = ipaddress.parse(ipAddress);

    if (ip instanceof ipaddress.IPv6 && ip.isIPv4MappedAddress()) {
      ip = ip.toIPv4Address();
    }

    const range = ip.range();
    if (range !== "unicast") {
      return true;
    }

    return false;
  }
}
