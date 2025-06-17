export interface PackageSpec {
  org: string | null;
  name: string;
  semver: string | null;
  spec: string;
}

// CONSTANTS
const kPackageSpecRegex = /^(?:@([^/]+)\/)?.+?(?:@(.+))?$/;

export function parseNpmSpec(spec: string): PackageSpec | null {
  const match = spec.match(kPackageSpecRegex);
  if (!match) {
    return null;
  }

  return {
    org: match[1] || null,
    name: match[2] ? spec.replace(`@${match[2]}`, "") : spec,
    semver: match[2] || null,
    spec
  };
}
