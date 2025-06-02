// Import Third-party Dependencies
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type FlagsResult = {
  flags: Record<string, number>;
};

export class Flags implements ManifestProbeExtractor<FlagsResult> {
  level = "manifest" as const;

  #flags = new FrequencySet();

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { flags } = version;

    flags.forEach((flagName) => this.#flags.add(flagName));
  }

  done() {
    return {
      flags: Object.fromEntries(this.#flags)
    };
  }
}
