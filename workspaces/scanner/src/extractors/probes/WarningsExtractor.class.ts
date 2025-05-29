// Import Third-party Dependencies
import type {
  WarningDefault,
  Warning,
  WarningName
} from "@nodesecure/js-x-ray";
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type WarningsExtractorResult = {
  warnings: {
    count: number;
    groups: Record<string, Warning<WarningDefault>[]>;
    uniqueKinds: Record<WarningName, number>;
  };
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
  #uniqueKinds = new FrequencySet<WarningName>();
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

    warnings
      .map((warn) => warn.kind)
      .forEach((kind) => this.#uniqueKinds.add(kind));

    if (key in this.#warnings) {
      this.#warnings[key].push(...warnings);
    }
    else {
      this.#warnings[key] = [...warnings];
    }
  }

  done() {
    return {
      warnings: {
        count: this.#count,
        uniqueKinds: Object.fromEntries(this.#uniqueKinds) as any,
        groups: this.#warnings
      }
    };
  }
}
