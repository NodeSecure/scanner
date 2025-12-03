// Import Third-party Dependencies
import type {
  Warning,
  WarningName
} from "@nodesecure/js-x-ray";
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.ts";
import type { DependencyVersion } from "../../types.ts";

export type WarningsResult = {
  warnings: {
    count: number;
    groups: Record<string, Warning[]>;
    uniqueKinds: Record<WarningName, number>;
  };
};

export interface WarningsOptions {
  /**
   * @default true
   */
  useSpecAsKey?: boolean;
}

export class Warnings implements ManifestProbeExtractor<WarningsResult> {
  level = "manifest" as const;

  #warnings: Record<string, Warning[]> = Object.create(null);
  #uniqueKinds = new FrequencySet<WarningName | (string & {})>();
  #count = 0;
  #useSpecAsKey: boolean;

  constructor(
    options: WarningsOptions = {}
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
