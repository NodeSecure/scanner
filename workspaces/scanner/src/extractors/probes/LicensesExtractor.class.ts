// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type LicensesResult = {
  licenses: Record<string, number>;
};

export class Licenses implements ManifestProbeExtractor<LicensesResult> {
  level = "manifest" as const;

  #licenses: LicensesResult["licenses"] = Object.create(null);

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
