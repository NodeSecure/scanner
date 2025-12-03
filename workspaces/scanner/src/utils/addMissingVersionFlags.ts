// Import Internal Dependencies
import type { Dependency } from "../types.ts";

// TODO: add strict flags type
export function* addMissingVersionFlags(
  flags: Set<string>,
  dep: Dependency
): IterableIterator<string> {
  const { metadata, vulnerabilities = [], versions } = dep;
  const semverVersions = Object.keys(versions);

  if (!metadata.hasReceivedUpdateInOneYear && flags.has("hasOutdatedDependency") && !flags.has("isDead")) {
    yield "isDead";
  }
  if (metadata.hasManyPublishers && !flags.has("hasManyPublishers")) {
    yield "hasManyPublishers";
  }
  if (metadata.hasChangedAuthor && !flags.has("hasChangedAuthor")) {
    yield "hasChangedAuthor";
  }
  if (vulnerabilities.length > 0 && !flags.has("hasVulnerabilities")) {
    yield "hasVulnerabilities";
  }
  if (semverVersions.length > 1 && !flags.has("hasDuplicate")) {
    yield "hasDuplicate";
  }
}
