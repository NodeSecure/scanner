// Import Third-party Dependencies
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import type {
  Dependency,
  Maintainer,
  Publisher
} from "../types.js";

type Contributor = Maintainer | Publisher;

export async function fetchNpmAvatars(
  metadata: Dependency["metadata"]
): Promise<void> {
  const contributors: Contributor[] = [
    ...metadata.maintainers,
    ...metadata.publishers,
    ...(metadata.author ? [metadata.author] : [])
  ];
  const avatarCache = new Map<string, string>();

  await Promise.all(
    contributors.map((contributor) => enrichContributorWithAvatar(contributor, avatarCache))
  );

  // Backfill missing avatars: some contributors may have failed username lookup
  // but their email might match a cached avatar from a successful contributor
  contributors
    .filter((contributor) => !contributor.npmAvatar && contributor.email)
    .forEach((contributor) => {
      const cachedAvatar = avatarCache.get(contributor.email!);
      if (cachedAvatar) {
        contributor.npmAvatar = cachedAvatar;
      }
    });
}

async function enrichContributorWithAvatar(
  contributor: Contributor,
  avatarCache: Map<string, string>
): Promise<void> {
  if (trySetAvatarFromCache(contributor, avatarCache)) {
    return;
  }

  try {
    const profile = await npmRegistrySDK.user(
      contributor.name,
      { perPage: 1 }
    );
    contributor.npmAvatar = profile.avatars.small;

    if (contributor.email && contributor.npmAvatar) {
      avatarCache.set(contributor.email, contributor.npmAvatar);
    }
  }
  catch {
    contributor.npmAvatar = undefined;
  }
}

function trySetAvatarFromCache(
  contributor: Contributor,
  avatarCache: Map<string, string>
): boolean {
  if (!contributor.email) {
    return false;
  }

  const cachedAvatar = avatarCache.get(contributor.email);
  if (cachedAvatar) {
    contributor.npmAvatar = cachedAvatar;

    return true;
  }

  return false;
}
