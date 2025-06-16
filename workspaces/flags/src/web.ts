// Import Internal Dependencies
import {
  FLAGS,
  type Flag,
  type FlagDescriptor
} from "./manifest.js";

// CONSTANTS
const kNotFoundFlags = "🔴";
const kManifestEmoji = Object.fromEntries(
  getManifestEmoji()
);

/**
 * @description Export src/manifest.json
 */
export function getManifest() {
  return structuredClone(FLAGS);
}

/**
 * @example
 * const kManifestEmoji = Object.fromEntries(getManifestEmoji());
 */
export function* getManifestEmoji(): IterableIterator<[string, string]> {
  for (const { title, emoji } of Object.values(FLAGS)) {
    yield [title, emoji];
  }
}

export function getEmojiFromTitle(
  title: Flag
): string {
  return kManifestEmoji[title] ?? kNotFoundFlags;
}

/**
 * @description Complete list of flags title (as an ES6 Set)
 */
export function getFlags(): Set<Flag> {
  return new Set(
    Object
      .values(FLAGS)
      .map((descriptor) => descriptor.title)
  );
}

export type {
  Flag,
  FlagDescriptor
};
