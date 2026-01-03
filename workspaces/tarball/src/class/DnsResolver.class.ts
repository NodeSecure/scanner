// Import Node.js Dependencies
import { lookup } from "node:dns/promises";
import { type LookupAddress } from "node:dns";

// Import Third-party Dependencies
import ipaddress from "ipaddr.js";

export interface Resolver {
  isPrivateHost(hostname: string): Promise<boolean>;
}

export class DnsResolver implements Resolver {
  async isPrivateHost(hostname: string) {
    const ipAddressListDetails: LookupAddress[] = await lookup(hostname, { all: true });
    const ipAddressList = ipAddressListDetails.map((ipAddressDetails) => ipAddressDetails.address);

    return ipAddressList.some(this.#isPrivateIPAddress);
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
