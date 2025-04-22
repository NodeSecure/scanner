// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type LicensesExtractorResult = {
  licenses: Record<string, number>;
};

export class LicensesExtractor implements ManifestProbeExtractor<LicensesExtractorResult> {
  level = "manifest" as const;

  #licenses: LicensesExtractorResult["licenses"] = Object.create(null);

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { uniqueLicenseIds } = version;

    for (const licenseName of uniqueLicenseIds) {
      this.#licenses[licenseName] = licenseName in this.#licenses ?
        ++this.#licenses[licenseName] : 1;
    }
  }

  done() {
    return {
      licenses: this.#licenses
    };
  }
}
