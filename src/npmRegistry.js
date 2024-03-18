// Import Node.js Dependencies
import crypto from "node:crypto";

// Import Third-party Dependencies
import semver from "semver";
import { parseAuthor } from "@nodesecure/utils";
import {
  packument,
  packumentVersion,
  user as npmUserProfile
} from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { getLinks } from "./utils/index.js";

export async function manifestMetadata(
  name,
  version,
  dependency
) {
  try {
    const pkgVersion = await packumentVersion(name, version);

    const integrity = getPackumentVersionIntegrity(pkgVersion);
    Object.assign(
      dependency.versions[version],
      {
        links: getLinks(pkgVersion)
      }
    );

    dependency.metadata.integrity[version] = integrity;
  }
  catch {
    // Ignore
  }
}

export async function packageMetadata(name, version, options) {
  const { ref, logger } = options;
  const packageSpec = `${name}:${version}`;

  try {
    const pkg = await packument(name);

    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() - 1);

    const lastVersion = pkg["dist-tags"].latest;
    const lastUpdateAt = new Date(pkg.time[lastVersion]);
    const metadata = {
      author: parseAuthor(pkg.author),
      homepage: pkg.homepage || null,
      publishedCount: Object.values(pkg.versions).length,
      lastVersion,
      lastUpdateAt,
      hasReceivedUpdateInOneYear: !(oneYearFromToday > lastUpdateAt),
      maintainers: pkg.maintainers ?? [],
      publishers: [],
      integrity: {}
    };

    const isOutdated = semver.neq(version, lastVersion);
    const flags = ref.versions[version].flags;
    if (isOutdated) {
      flags.push("isOutdated");
    }

    const publishers = new Set();
    let searchForMaintainersInVersions = metadata.maintainers.length === 0;
    for (const ver of Object.values(pkg.versions).reverse()) {
      const versionSpec = `${ver.name}:${ver.version}`;
      if (packageSpec === versionSpec) {
        if (ver.deprecated && !flags.includes("isDeprecated")) {
          flags.push("isDeprecated");
        }

        metadata.integrity[ver.version] = getPackumentVersionIntegrity(
          ver
        );
      }

      const { _npmUser: npmUser, version, maintainers = [] } = ver;

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

      if (searchForMaintainersInVersions) {
        metadata.maintainers.push(...maintainers);
        searchForMaintainersInVersions = false;
      }
    }

    await addNpmAvatar(metadata);
    Object.assign(ref.versions[version], { links: getLinks(pkg.versions[version]) });
    Object.assign(ref.metadata, metadata);
  }
  catch {
    // ignore
  }
  finally {
    logger.tick("registry");
  }
}

function getPackumentVersionIntegrity(packumentVersion) {
  const { name, version, dependencies = {}, license = "", scripts = {} } = packumentVersion;

  // See https://github.com/npm/cli/issues/5234
  if ("install" in dependencies && dependencies.install === "node-gyp rebuild") {
    delete dependencies.install;
  }

  const integrityObj = {
    name,
    version,
    dependencies,
    license,
    scripts
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(integrityObj))
    .digest("hex");
}

async function addNpmAvatar(metadata) {
  const contributors = [metadata.author, ...metadata.maintainers, ...metadata.publishers];
  const emailToAvatar = {};

  const promises = contributors.map((contributor) => {
    if (contributor.email && emailToAvatar[contributor.email]) {
      contributor.npmAvatar = emailToAvatar[contributor.email];

      return Promise.resolve();
    }

    return npmUserProfile(contributor.name, { perPage: 1 }).then((profile) => {
      contributor.npmAvatar = profile.avatars.small;
      if (contributor.email && contributor.npmAvatar) {
        emailToAvatar[contributor.email] = contributor.npmAvatar;
      }
    }).catch(() => {
      contributor.npmAvatar = null;
    });
  });

  await Promise.all(promises);

  // back fill npmAvatar if any name property was not npm username in first pass
  for (const contributor of contributors) {
    if (!contributor.npmAvatar && contributor.email && emailToAvatar[contributor.email]) {
      contributor.npmAvatar = emailToAvatar[contributor.email];
    }
  }
}
