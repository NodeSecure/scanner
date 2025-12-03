// Import Third-party Dependencies
import FrequencySet from "frequency-set";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.ts";
import type { DependencyVersion } from "../../types.ts";

export type ExtensionsResult = {
  extensions: Record<string, number>;
};

export class Extensions implements ManifestProbeExtractor<ExtensionsResult> {
  level = "manifest" as const;

  #extensions = new FrequencySet();

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { composition } = version;

    composition.extensions.forEach((extension) => {
      if (extension !== "") {
        this.#extensions.add(extension);
      }
    });
  }

  done() {
    return {
      extensions: Object.fromEntries(this.#extensions)
    };
  }
}
