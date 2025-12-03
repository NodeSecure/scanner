// Import Third-party Dependencies
import { formatBytes } from "@nodesecure/utils";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.ts";
import type { DependencyVersion } from "../../types.ts";

export type SizeResult = {
  size: {
    all: string;
    internal: string;
    external: string;
  };
};

export interface SizeOptions {
  organizationPrefix?: string;
}

export class Size implements ManifestProbeExtractor<SizeResult> {
  level = "manifest" as const;

  #size = {
    all: 0,
    internal: 0,
    external: 0
  };
  #organizationPrefix: string | null = null;

  constructor(
    options: SizeOptions = {}
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
