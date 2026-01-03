// Import Node.js Dependencies
import { lookup } from "node:dns/promises";
import { type LookupAddress } from "node:dns";

// Import Third-party Dependencies
import ipaddress from "ipaddr.js";

export class DnsResolver {
  #hostnameToIpAddresses = new Map<string, LookupAddress[]>();

  async isPrivateHost(hostname: string) {
    const ipAddressListDetails: LookupAddress[] = await this.#resolve(hostname);
    const ipAddressList = ipAddressListDetails.map((ipAddressDetails) => ipAddressDetails.address);

    return ipAddressList.some(this.#isPrivateIPAddress);
  }

  async #resolve(hostname: string) {
    if (!this.#hostnameToIpAddresses.has(hostname)) {
      this.#hostnameToIpAddresses.set(hostname, await lookup(hostname, { all: true }));
    }

    return this.#hostnameToIpAddresses.get(hostname)!;
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
