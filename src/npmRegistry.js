// Import Third-party Dependencies
import semver from "semver";
import { parseManifestAuthor } from "@nodesecure/utils";
import { packument } from "@nodesecure/npm-registry-sdk";

export function parseAuthor(author) {
  return typeof author === "string" ? parseManifestAuthor(author) : author;
}

export async function packageMetadata(name, version, options) {
  const { ref, logger } = options;

  try {
    const pkg = await packument(name);

    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() - 1);

    const lastVersion = pkg["dist-tags"].latest;
    const lastUpdateAt = new Date(pkg.time[lastVersion]);
    const metadata = {
      author: parseAuthor(pkg.author) ?? {},
      homepage: pkg.homepage || null,
      publishedCount: Object.values(pkg.versions).length,
      lastVersion,
      lastUpdateAt,
      hasReceivedUpdateInOneYear: !(oneYearFromToday > lastUpdateAt),
      maintainers: pkg.maintainers,
      publishers: []
    };

    const isOutdated = semver.neq(version, lastVersion);
    if (isOutdated) {
      ref.versions[version].flags.push("isOutdated");
    }

    const publishers = new Set();
    for (const ver of Object.values(pkg.versions).reverse()) {
      const { _npmUser: npmUser, version } = ver;
      const isNullOrUndefined = typeof npmUser === "undefined" || npmUser === null;
      if (isNullOrUndefined || !("name" in npmUser) || typeof npmUser.name !== "string") {
        continue;
      }

      const authorName = metadata.author?.name ?? null;
      if (authorName === null) {
        metadata.author = npmUser;
      }
      else if (npmUser.name !== metadata.author.name) {
        metadata.hasManyPublishers = true;
      }

      // TODO: add npmUser.email
      if (!publishers.has(npmUser.name)) {
        publishers.add(npmUser.name);
        metadata.publishers.push({ ...npmUser, version, at: new Date(pkg.time[version]) });
      }
    }

    Object.assign(ref.metadata, metadata);
  }
  catch {
    // ignore
  }
  finally {
    logger.tick("registry");
  }
}
