// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { DnsResolver } from "../src/class/DnsResolver.class.ts";

describe("DnsResolver", () => {
  describe("IPv4", () => {
    it("should be a private host  for a private IPv4 address (10.x.x.x)", async() => {
      const resolver = new DnsResolver(makeLookup(["10.0.0.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a private addr for a private IPv4 address (192.168.x.x)", async() => {
      const resolver = new DnsResolver(makeLookup(["192.168.1.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should  be a private host IPv4 address (172.16.x.x)", async() => {
      const resolver = new DnsResolver(makeLookup(["172.16.0.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a private host for loopback IPv4 (127.0.0.1)", async() => {
      const resolver = new DnsResolver(makeLookup(["127.0.0.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a public host for a public IPv4 address", async() => {
      const resolver = new DnsResolver(makeLookup(["8.8.8.8"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    });

    it("should be a private host when mixed addresses contain at least one private IPv4", async() => {
      const resolver = new DnsResolver(makeLookup(["8.8.8.8", "192.168.1.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a public host when all addresses are public IPv4", async() => {
      const resolver = new DnsResolver(makeLookup(["8.8.8.8", "1.1.1.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    });
  });

  describe("IPv6", () => {
    it("should be a private host loopback IPv6 (::1)", async() => {
      const resolver = new DnsResolver(makeLookup(["::1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a private host for a private IPv4-mapped IPv6 address (::ffff:192.168.1.1)", async() => {
      const resolver = new DnsResolver(makeLookup(["::ffff:192.168.1.1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a public host for a public IPv4-mapped IPv6 address (::ffff:8.8.8.8)", async() => {
      const resolver = new DnsResolver(makeLookup(["::ffff:8.8.8.8"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    });

    it("should be a private host for unique local IPv6 address (fc00::/7)", async() => {
      const resolver = new DnsResolver(makeLookup(["fc00::1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a private host for link-local IPv6 address (fe80::)", async() => {
      const resolver = new DnsResolver(makeLookup(["fe80::1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a public host for a public IPv6 address", async() => {
      const resolver = new DnsResolver(makeLookup(["2606:4700:4700::1111"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    });

    it("should be a private host when mixed IPv6 addresses contain at least one private", async() => {
      const resolver = new DnsResolver(makeLookup(["2606:4700:4700::1111", "::1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });
  });

  describe("mixed IPv4 and IPv6", () => {
    it("should be a public host when all addresses (v4 and v6) are public", async() => {
      const resolver = new DnsResolver(makeLookup(["8.8.8.8", "2606:4700:4700::1111"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    });

    it("should be a private host when IPv4 is private and IPv6 is public", async() => {
      const resolver = new DnsResolver(makeLookup(["192.168.0.1", "2606:4700:4700::1111"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });

    it("should be a private host when IPv4 is public and IPv6 is private", async() => {
      const resolver = new DnsResolver(makeLookup(["8.8.8.8", "fc00::1"], "fake.host"));
      assert.strictEqual(await resolver.isPrivateHost("fake.host"), true);
    });
  });

  it("should be a public host when the address list is empty", async() => {
    const resolver = new DnsResolver(makeLookup([], "fake.host"));
    assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
  });

  it("should cache the result of the lookups", async(t) => {
    const lookupMock = t.mock.fn<(hostname: string) => Promise<string[]>>();
    lookupMock.mock.mockImplementation(async() => ["8.8.8.8"]);
    const resolver = new DnsResolver(lookupMock);
    assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    assert.strictEqual(await resolver.isPrivateHost("fake.host"), false);
    assert.deepEqual(lookupMock.mock.callCount(), 1);
  });
});

function makeLookup(addresses: string[], expectedHostname?: string) {
  return (hostname: string) => {
    if (expectedHostname !== undefined) {
      assert.strictEqual(hostname, expectedHostname);
    }

    return Promise.resolve(addresses);
  };
}
