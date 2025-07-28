// Import Third-party Dependencies
import type { Packument } from "@nodesecure/npm-types";
import { packageJSONIntegrityHash } from "@nodesecure/mama";

// Import Internal Dependencies
import type {
  Dependency
} from "../types.js";

export interface DateProvider {
  oneYearAgo(): Date;
}

export interface PackumentExtractorOptions {
  dateProvider?: DateProvider;
}

export class PackumentExtractor {
  #packument: Packument;
  #date: DateProvider;

  constructor(
    packument: Packument,
    options: PackumentExtractorOptions = {}
  ) {
    const {
      dateProvider = new SystemDateProvider()
    } = options;

    this.#packument = packument;
    this.#date = dateProvider;
  }

  getMetadata(
    version: string
  ): Dependency["metadata"] {
    const lastVersion = this.#packument["dist-tags"].latest!;
    const lastUpdateAt = new Date(this.#packument.time[lastVersion]);
    const oneYearAgoDate = this.#date.oneYearAgo();

    const { integrity } = packageJSONIntegrityHash(
      this.#packument.versions[version],
      { isFromRemoteRegistry: true }
    );

    return {
      homepage: this.#packument.homepage || null,
      publishedCount: Object.values(this.#packument.versions).length,
      lastVersion,
      lastUpdateAt,
      hasReceivedUpdateInOneYear: !(oneYearAgoDate > lastUpdateAt),
      hasChangedAuthor: false,
      integrity: {
        [version]: integrity
      },
      ...this.#extractMaintainers(
        this.#packument,
        this.#packument.author?.name ?? null
      )
    };
  }

  #extractMaintainers(
    packument: Packument,
    authorName: string | null
  ) {
    const publishers = new Set();
    const result: Pick<Dependency["metadata"], "author" | "publishers" | "maintainers" | "hasManyPublishers"> = {
      author: packument.author ?? null,
      publishers: [],
      maintainers: packument.maintainers ?? [],
      hasManyPublishers: false
    };
    let searchForMaintainersInVersions = result.maintainers.length === 0;

    for (const ver of Object.values(packument.versions).reverse()) {
      const { _npmUser = null, version, maintainers = [] } = ver;

      if (_npmUser !== null) {
        if (authorName === null) {
          result.author = _npmUser;
        }
        else if (authorName !== null && _npmUser.name !== authorName) {
          result.hasManyPublishers = true;
        }

        if (!publishers.has(_npmUser.name)) {
          publishers.add(_npmUser.name);
          result.publishers.push({
            ..._npmUser,
            version,
            at: new Date(packument.time[version]).toISOString()
          });
        }
      }

      if (searchForMaintainersInVersions) {
        result.maintainers.push(...maintainers);
        searchForMaintainersInVersions = false;
      }
    }

    return result;
  }
}

class SystemDateProvider implements DateProvider {
  oneYearAgo(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);

    return date;
  }
}
