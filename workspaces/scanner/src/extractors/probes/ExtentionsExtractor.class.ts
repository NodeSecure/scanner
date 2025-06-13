// Import Third-party Dependencies
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type ExtentionsResult = {
  extentions: Record<string, number>;
};

export class Extentions implements ManifestProbeExtractor<ExtentionsResult> {
  level = "manifest" as const;

  #extentions = new FrequencySet();

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { composition } = version;

    composition.extensions.forEach((extension) => {
      if (extension !== "") {
        this.#extentions.add(extension);
      }
    });
  }

  done() {
    return {
      extentions: Object.fromEntries(this.#extentions)
    };
  }
}
