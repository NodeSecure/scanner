// Import Third-party Dependencies
import { parseNpmSpec } from "@nodesecure/mama";

// Import Internal Dependencies
import { type HighlightPackages } from "../types.ts";

export function parseSemverRange(packages: HighlightPackages) {
  const pkgs = Array.isArray(packages) ? parseSpecs(packages) : packages;

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

function parseSpecs(specs: string[]) {
  return specs.reduce((acc, spec) => {
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

