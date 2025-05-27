// Import Third-party Dependencies
import type { WarningDefault, Warning } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type WarningsExtractorResult = {
  warnings: Record<string, Warning<WarningDefault>[]>;
  count: number;
};

export interface WarningsExtractorOptions {
  /**
   * @default true
   */
  useSpecAsKey?: boolean;
}

export class WarningsExtractor implements ManifestProbeExtractor<WarningsExtractorResult> {
  level = "manifest" as const;

  #warnings: Record<string, Warning<WarningDefault>[]> = Object.create(null);
  #count = 0;
  #useSpecAsKey: boolean;

  constructor(
    options: WarningsExtractorOptions = {}
  ) {
    this.#useSpecAsKey = options.useSpecAsKey ?? true;
  }

  next(
    version: string,
    depVersion: DependencyVersion,
    parent: ProbeExtractorManifestParent
  ) {
    const { warnings } = depVersion;
    if (warnings.length === 0) {
      return;
    }

    this.#count += warnings.length;
    const key = this.#useSpecAsKey ?
      `${parent.name}@${version}` :
      parent.name;

    if (key in this.#warnings) {
      this.#warnings[key].push(...warnings);
    }
    else {
      this.#warnings[key] = [...warnings];
    }
  }

  done() {
    return {
      count: this.#count,
      warnings: this.#warnings
    };
  }
}
