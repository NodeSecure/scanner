// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { getManifest, getEmojiFromTitle, getManifestEmoji, FlagDescriptor } from "../src/index.js";

describe("getManifest()", () => {
  it("should return a Record<string, flagObject>", () => {
    const manifest = getManifest();

    assert.equal(typeof manifest, "object");
    assert.notEqual(Object.keys(manifest).length, 0);

    for (const [key, flagObject] of Object.entries(manifest)) {
      assert.equal(typeof key, "string");
      assertFlagDescriptor(flagObject);
    }
  });
});

describe("getManifestEmoji()", () => {
  it("should return a Record<string, emoji>", () => {
    const manifestEmoji = Object.fromEntries(getManifestEmoji());

    assert.equal(typeof manifestEmoji, "object");
    assert.equal(manifestEmoji.hasNativeCode, "🐲");
  });
});

describe("getEmojiFromTitle()", () => {
  it("should return a emoji", () => {
    assert.equal(getEmojiFromTitle("foobar"), "🔴");
    assert.equal(getEmojiFromTitle("hasNativeCode"), "🐲");
  });
});

function assertFlagDescriptor(
  flagObject: FlagDescriptor
): void {
  assert.equal(typeof flagObject, "object");

  assert.equal("emoji" in flagObject, true);
  assert.equal("title" in flagObject, true);
  assert.equal("tooltipDescription" in flagObject, true);
}
