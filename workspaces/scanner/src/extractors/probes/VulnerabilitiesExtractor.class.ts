// Import Third-party Dependencies
import type { StandardVulnerability } from "@nodesecure/vulnera";

// Import Internal Dependencies
import type {
  PackumentProbeExtractor
} from "../payload.ts";
import type { Dependency } from "../../types.ts";

export type VulnerabilitiesResult = {
  vulnerabilities: StandardVulnerability[];
};

export class Vulnerabilities implements PackumentProbeExtractor<VulnerabilitiesResult> {
  level = "packument" as const;

  #vulnerabilities: StandardVulnerability[] = [];

  next(
    _: string,
    dependency: Dependency
  ) {
    const { vulnerabilities = [] } = dependency;

    this.#vulnerabilities.push(
      ...vulnerabilities
    );
  }

  done() {
    return {
      vulnerabilities: this.#vulnerabilities
    };
  }
}
