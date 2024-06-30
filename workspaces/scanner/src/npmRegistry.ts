// Import Node.js Dependencies
import crypto from "node:crypto";

// Import Third-party Dependencies
import semver from "semver";
import { parseAuthor } from "@nodesecure/utils";
import {
  packument,
  packumentVersion,
  user as npmUserProfile,
  type PackumentVersion
} from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { getLinks } from "./utils/index.js";
import { Logger } from "./class/logger.class.js";
import type {
  Author,
  Maintainer,
  Publisher,
  Dependency
} from "./types.js";

export async function manifestMetadata(
  name: string,
  version: string,
  dependency: any
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

export interface PackageMetadataOptions {
  logger: Logger;
  dependency: Dependency;
}

export async function packageMetadata(
  name: string,
  version: string,
  options: PackageMetadataOptions
): Promise<void> {
  const { dependency, logger } = options;
  const packageSpec = `${name}:${version}`;

  try {
    const pkg = await packument(name);

    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() - 1);

    const lastVersion = pkg["dist-tags"].latest!;
    const lastUpdateAt = new Date(pkg.time[lastVersion]!);
    const metadata: Dependency["metadata"] = {
      author: parseAuthor(pkg.author),
      homepage: pkg.homepage || null,
      publishedCount: Object.values(pkg.versions).length,
      lastVersion,
      lastUpdateAt,
      hasReceivedUpdateInOneYear: !(oneYearFromToday > lastUpdateAt),
      hasManyPublishers: false,
      hasChangedAuthor: false,
      maintainers: pkg.maintainers
        .map((maintainer) => parseAuthor(maintainer)!) ?? [],
      publishers: [],
      integrity: {}
    };

    const isOutdated = semver.neq(version, lastVersion);
    const flags = dependency.versions[version]!.flags;
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

      const parsedNpmUser = parseAuthor(npmUser);
      if (parsedNpmUser === null) {
        continue;
      }

      const authorName = metadata.author?.name ?? null;
      if (authorName === null) {
        metadata.author = parsedNpmUser;
      }
      else if (parsedNpmUser.name !== metadata.author?.name) {
        metadata.hasManyPublishers = true;
      }

      // TODO: add npmUser.email
      if (!publishers.has(parsedNpmUser.name)) {
        publishers.add(parsedNpmUser.name);
        metadata.publishers.push({
          ...parsedNpmUser,
          version,
          at: new Date(pkg.time[version]!).toISOString()
        });
      }

      if (searchForMaintainersInVersions) {
        metadata.maintainers.push(
          ...maintainers.map((maintainer) => parseAuthor(maintainer)!)
        );
        searchForMaintainersInVersions = false;
      }
    }

    await addNpmAvatar(metadata);
    Object.assign(
      dependency.versions[version]!,
      { links: getLinks(pkg.versions[version]!) }
    );
    dependency.metadata = metadata;
  }
  catch {
    // ignore
  }
  finally {
    logger.tick("registry");
  }
}

function getPackumentVersionIntegrity(
  packumentVersion: PackumentVersion
): string {
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

async function addNpmAvatar(
  metadata: Dependency["metadata"]
): Promise<void> {
  const contributors: (Maintainer | Publisher | Author)[] = [
    ...metadata.maintainers,
    ...metadata.publishers
  ];
  if (metadata.author !== null) {
    contributors.push(metadata.author);
  }
  const emailToAvatar: Record<string, string> = {};

  const promises = contributors.map((contributor) => {
    if (contributor.email && emailToAvatar[contributor.email]) {
      contributor.npmAvatar = emailToAvatar[contributor.email];

      return Promise.resolve();
    }

    return npmUserProfile(contributor.name, { perPage: 1 })
      .then((profile) => {
        contributor.npmAvatar = profile.avatars.small;
        if (contributor.email && contributor.npmAvatar) {
          emailToAvatar[contributor.email] = contributor.npmAvatar;
        }
      }).catch(() => {
        contributor.npmAvatar = undefined;
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
