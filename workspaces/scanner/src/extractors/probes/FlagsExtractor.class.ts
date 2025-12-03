// Import Third-party Dependencies
import FrequencySet from "frequency-set";
import { getFlags } from "@nodesecure/flags/web";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.ts";
import type { DependencyVersion } from "../../types.ts";

export type FlagsResult = {
  flags: Record<string, number>;
};

// CONSTANTS
const kWantedFlags = getFlags();

export class Flags implements ManifestProbeExtractor<FlagsResult> {
  level = "manifest" as const;

  #flags = new FrequencySet();

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { flags } = version;

    flags.forEach((flagName) => {
      if (kWantedFlags.has(flagName)) {
        this.#flags.add(flagName);
      }
    });
  }

  done() {
    return {
      flags: Object.fromEntries(this.#flags)
    };
  }
}
