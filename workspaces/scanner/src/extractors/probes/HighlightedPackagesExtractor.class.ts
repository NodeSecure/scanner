// Import Third-party Dependencies
import { parseNpmSpec } from "@nodesecure/mama";
import semver from "semver";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.ts";
import type { DependencyVersion, HighlightPackages } from "../../types.ts";

export type HighlightedPackagesResult = {
  highlightedPackages: string[];
};

export class HighlightedPackages implements ManifestProbeExtractor<HighlightedPackagesResult> {
  level = "manifest" as const;
  #semverRanges: Record<string, string>;
  #highlightedPackages = new Set<string>();

  constructor(packages: HighlightPackages) {
    this.#semverRanges = this.#parseSemverRange(packages);
  }

  #parseSemverRange(packages: HighlightPackages) {
    const pkgs = Array.isArray(packages) ? this.#parseSpecs(packages) : packages;

    return Object.entries(pkgs).reduce((acc, [name, semverRange]) => {
      if (Array.isArray(semverRange)) {
        acc[name] = semverRange.join(" || ");
      }
      else {
        acc[name] = semverRange;
      }

      return acc;
    }, {});
  }

  #parseSpecs(specs: string[]) {
    return specs.reduce((acc, spec) => {
      // Handle scope-only entries like "@fastify", matching all packages under that scope
      if (/^@[^/@]+$/.test(spec)) {
        acc[spec] = ["*"];

        return acc;
      }

      const parsedSpec = parseNpmSpec(spec);
      if (!parsedSpec) {
        return acc;
      }
      const { name, semver } = parsedSpec;
      const version = semver || "*";
      if (name in acc) {
        acc[name].push(version);
      }
      else {
        acc[name] = [version];
      }

      return acc;
    }, {});
  }

  next(
    version: string,
    _: DependencyVersion,
    parent: ProbeExtractorManifestParent
  ) {
    const packageRange = this.#semverRanges?.[parent.name];
    const org = parseNpmSpec(parent.name)?.org;
    const isScopeHighlighted = org !== null && `@${org}` in this.#semverRanges;

    if (
      (packageRange && semver.satisfies(version, packageRange)) ||
      isScopeHighlighted
    ) {
      this.#highlightedPackages.add(`${parent.name}@${version}`);
    }
  }

  done() {
    return {
      highlightedPackages: [...this.#highlightedPackages]
    };
  }
}

