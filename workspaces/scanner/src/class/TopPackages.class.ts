// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import { distance } from "fastest-levenshtein";

// Import Internal Dependencies
import { getDirNameFromUrl } from "../utils/index.js";

// CONSTANTS
const __dirname = getDirNameFromUrl(import.meta.url);

/**
 * This implementation take inspiration from npq
 * @see https://github.com/lirantal/npq/blob/c11e5425707ae992fcd6fb0878abe01ccd77399b/lib/marshalls/typosquatting.marshall.js#L23
 */
export class TopPackages {
  #packages: string[] = [];

  async loadJSON() {
    const rawPackageStr = await fs.readFile(
      path.join(__dirname, "..", "data", "top-packages.json"),
      "utf-8"
    );

    this.#packages = JSON.parse(rawPackageStr) as string[];
  }

  getSimilarPackages(
    packageName: string
  ): string[] {
    const similarPackages: string[] = [];
    for (const popularPackageNameInRepository of this.#packages) {
      // If the package to be installed is itself found within the Top Packages dataset
      // then we don't report on it
      if (packageName === popularPackageNameInRepository) {
        return [];
      }

      const levenshteinDistance = distance(
        packageName,
        popularPackageNameInRepository
      );

      if (levenshteinDistance > 0 && levenshteinDistance < 3) {
        similarPackages.push(popularPackageNameInRepository);
      }
    }

    return [...new Set(similarPackages)];
  }
}
