// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import semver from "semver";
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";
import { packageJSONIntegrityHash } from "@nodesecure/mama";
import type { Packument, PackumentVersion, Signature } from "@nodesecure/npm-types";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";
import * as i18n from "@nodesecure/i18n";

// Import Internal Dependencies
import { PackumentExtractor, type DateProvider } from "./PackumentExtractor.js";
import { fetchNpmAvatars } from "./fetchNpmAvatars.js";
import type {
  Dependency,
  DependencyConfusionWarning
} from "../types.js";
import { Logger } from "../class/logger.class.js";
import { getLinks } from "../utils/getLinks.js";
import { getDirNameFromUrl } from "../utils/dirname.js";

await i18n.extendFromSystemPath(
  path.join(getDirNameFromUrl(import.meta.url), "..", "i18n")
);

type PackumentNpmApiOptions = {
  registry: string;
};

export interface NpmApiClient {
  packument(name: string, options?: PackumentNpmApiOptions): Promise<Packument>;
  packumentVersion(name: string, version: string, options?: PackumentNpmApiOptions): Promise<PackumentVersion>;
  org(namespace: string): Promise<npmRegistrySDK.NpmPackageOrg>;
}

export interface NpmRegistryProviderOptions {
  dateProvider?: DateProvider;
  npmApiClient?: NpmApiClient;
  registry?: string;
}

export class NpmRegistryProvider {
  #date: DateProvider | undefined;
  #npmApiClient: NpmApiClient;
  #registry: string;

  name: string;
  version: string;

  constructor(
    name: string,
    version: string,
    options: NpmRegistryProviderOptions = {}
  ) {
    const {
      dateProvider = undefined,
      npmApiClient = npmRegistrySDK,
      registry = npmRegistrySDK.getLocalRegistryURL()
    } = options;

    this.name = name;
    this.version = version;

    this.#date = dateProvider;
    this.#npmApiClient = npmApiClient;
    this.#registry = registry;
  }

  async collectPackageVersionData() {
    const packumentVersion = await this.#npmApiClient.packumentVersion(
      this.name,
      this.version,
      {
        registry: this.#registry
      }
    );

    const { integrity } = packageJSONIntegrityHash(packumentVersion, {
      isFromRemoteRegistry: true
    });

    return {
      links: getLinks(packumentVersion),
      integrity,
      deprecated: packumentVersion.deprecated,
      signatures: packumentVersion.dist.signatures
    };
  }

  async collectPackageData() {
    const packument = await this.#npmApiClient.packument(this.name, {
      registry: this.#registry
    });
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
      // ignored
    }
    finally {
      logger.tick("registry");
    }
  }

  async enrichDependencyVersion(
    dependency: Dependency,
    warnings: DependencyConfusionWarning[]
  ) {
    try {
      const { integrity, deprecated, links, signatures } = await this.collectPackageVersionData();

      Object.assign(
        dependency.versions[this.version],
        {
          links,
          deprecated
        }
      );
      dependency.metadata.integrity[this.version] = integrity;
      if (this.#registry === getNpmRegistryURL()) {
        return;
      }
      const packumentVersionFromPublicRegistry = await this.#npmApiClient.packumentVersion(this.name, this.version, {
        registry: getNpmRegistryURL()
      });
      if (!this.#hasSameSignatures(signatures, packumentVersionFromPublicRegistry.dist.signatures)) {
        this.#addDependencyConfusionWarning(warnings, await i18n.getToken("scanner.dependency_confusion"));
      }
    }
    catch {
      // ignore
    }
  }

  #hasSameSignatures(signatures: Signature[] | undefined, signaturesFromPublicRegistry: Signature[] | undefined) {
    if (!signatures || !signaturesFromPublicRegistry) {
      return false;
    }

    const sortedSignaturesFromPublic = signaturesFromPublicRegistry.sort((a, b) => a.keyid.localeCompare(b.keyid));
    const sortedSignaturesFromPrivate = signatures.sort((a, b) => a.keyid.localeCompare(b.keyid));

    return sortedSignaturesFromPrivate.length === signaturesFromPublicRegistry.length &&
      sortedSignaturesFromPrivate?.every((signature, index) => signature.keyid === sortedSignaturesFromPublic[index].keyid
        && signature.sig === sortedSignaturesFromPublic[index].sig);
  }

  async enrichScopedDependencyConfusionWarnings(warnings: DependencyConfusionWarning[], org: string) {
    try {
      await this.#npmApiClient.org(this.name);
    }
    catch {
      await this.#addDependencyConfusionWarning(warnings, await i18n.getToken("scanner.dependency_confusion_missing_org", org));
    }
  }

  async #addDependencyConfusionWarning(warnings: DependencyConfusionWarning[], message: string) {
    warnings.push({
      type: "dependency-confusion",
      message,
      metadata: {
        name: this.name
      }
    });
  }
}
