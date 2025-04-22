// Import Third-party Dependencies
import { formatBytes } from "@nodesecure/utils";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type SizeExtractorResult = {
  size: {
    all: string;
    internal: string;
    external: string;
  };
};

export interface SizeExtractorOptions {
  organizationPrefix?: string;
}

export class SizeExtractor implements ManifestProbeExtractor<SizeExtractorResult> {
  level = "manifest" as const;

  #size = {
    all: 0,
    internal: 0,
    external: 0
  };
  #organizationPrefix: string | null = null;

  constructor(
    options: SizeExtractorOptions = {}
  ) {
    const { organizationPrefix = null } = options;

    this.#organizationPrefix = organizationPrefix;
  }

  next(
    _: string,
    version: DependencyVersion,
    parent: ProbeExtractorManifestParent
  ) {
    const { size } = version;

    const isExternal = this.#organizationPrefix === null ?
      true :
      !parent.name.startsWith(`${this.#organizationPrefix}/`);

    this.#size.all += size;
    this.#size[isExternal ? "external" : "internal"] += size;
  }

  done() {
    return {
      size: {
        all: formatBytes(this.#size.all),
        internal: formatBytes(this.#size.internal),
        external: formatBytes(this.#size.external)
      }
    };
  }
}
