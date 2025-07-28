// Import Third-party Dependencies
import semver from "semver";
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";
import { packageJSONIntegrityHash } from "@nodesecure/mama";
import type { Packument, PackumentVersion } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { PackumentExtractor, type DateProvider } from "./PackumentExtractor.js";
import { fetchNpmAvatars } from "./fetchNpmAvatars.js";
import type {
  Dependency
} from "../types.js";
import { Logger } from "../class/logger.class.js";
import { getLinks } from "../utils/getLinks.js";

export interface NpmApiClient {
  packument(name: string): Promise<Packument>;
  packumentVersion(name: string, version: string): Promise<PackumentVersion>;
}

export interface NpmRegistryProviderOptions {
  dateProvider?: DateProvider;
  npmApiClient?: NpmApiClient;
}

export class NpmRegistryProvider {
  #date: DateProvider | undefined;
  #npmApiClient: NpmApiClient;

  name: string;
  version: string;

  constructor(
    name: string,
    version: string,
    options: NpmRegistryProviderOptions = {}
  ) {
    const {
      dateProvider = undefined,
      npmApiClient = npmRegistrySDK
    } = options;

    this.name = name;
    this.version = version;

    this.#date = dateProvider;
    this.#npmApiClient = npmApiClient;
  }

  async collectPackageVersionData() {
    const packumentVersion = await this.#npmApiClient.packumentVersion(
      this.name,
      this.version
    );

    const { integrity } = packageJSONIntegrityHash(packumentVersion, {
      isFromRemoteRegistry: true
    });

    return {
      links: getLinks(packumentVersion),
      integrity,
      deprecated: packumentVersion.deprecated
    };
  }

  async collectPackageData() {
    const packument = await this.#npmApiClient.packument(this.name);
    const packumentVersion = packument.versions[this.version];

    const metadata = new PackumentExtractor(
      packument,
      { dateProvider: this.#date }
    ).getMetadata(this.version);

    const flags = {
      isOutdated: semver.neq(this.version, metadata.lastVersion),
      isDeprecated: packumentVersion.deprecated
    };

    return {
      metadata,
      flags: Object.keys(flags).filter((key) => flags[key]),
      version: {
        links: getLinks(packumentVersion),
        deprecated: packumentVersion.deprecated
      }
    };
  }

  async enrichDependency(
    logger: Logger,
    dependency: Dependency
  ): Promise<void> {
    try {
      const { metadata, flags, version } = await this.collectPackageData();

      await fetchNpmAvatars(metadata);

      const dependencyVersion = dependency.versions[this.version];

      dependency.metadata = metadata;
      dependencyVersion.flags = [...dependencyVersion.flags, ...flags];
      Object.assign(dependencyVersion, version);
    }
    catch {
      // ignore
    }
    finally {
      logger.tick("registry");
    }
  }

  async enrichDependencyVersion(
    dependency: Dependency
  ) {
    try {
      const { integrity, deprecated, links } = await this.collectPackageVersionData();

      Object.assign(
        dependency.versions[this.version],
        {
          links,
          deprecated
        }
      );
      dependency.metadata.integrity[this.version] = integrity;
    }
    catch {
      // ignore
    }
  }
}
