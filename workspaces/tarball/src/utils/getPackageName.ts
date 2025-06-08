// CONSTANTS
const kPackageSeparator = "/";
const kPackageOrgSymbol = "@";

/**
 * @see https://github.com/npm/validate-npm-package-name#naming-rules
 * @example
 * getPackageName("foo"); // foo
 * getPackageName("foo/bar"); // foo
 * getPackageName("@org/bar"); // @org/bar
 */


interface ParsedPackageSpec {
  org: string | null;
  name: string;
  semver: string | null;
  spec: string;
}

export function getPackageName(input: string): ParsedPackageSpec {
  let org: string | null = null;
  let name: string;
  let semver: string | null = null;
  let spec = input;

  // Split version if present (e.g., express@5.1.0)
  const atSplit = input.startsWith(kPackageOrgSymbol) ? input.indexOf(kPackageOrgSymbol, 1) : input.indexOf(kPackageOrgSymbol);
  const hasVersion = atSplit !== -1 && !input.startsWith(kPackageOrgSymbol);

  if (hasVersion) {
    name = input.substring(0, atSplit);
    semver = input.substring(atSplit + 1);
  } else {
    name = input;
  }

  // Detect org for scoped packages (e.g., @org/name)
  if (name.startsWith(kPackageOrgSymbol)) {
    const parts = name.split(kPackageSeparator);
    if (parts.length === 2) {
      org = parts[0].substring(1); // remove '@'
    }
  }

  return {
    org,
    name,
    semver,
    spec
  };
}
