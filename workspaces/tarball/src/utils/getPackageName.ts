// CONSTANTS
const kPackageSeparator = "/";
const kPackageOrgSymbol = "@";

/**
 * Interface representing a parsed package specification
 */
export interface ParsedPackageSpec {
  org: string | null;
  name: string;
  semver: string | null;
  spec: string;
}

/**
 * Parse a package specification string into its components according to npm naming rules
 * @param input - Package specification string to parse
 * @returns Parsed package specification with org, name, semver, and original spec
 * 
 * @example
 * // Simple package
 * parsePackageSpec("express@4.18.2")
 * // { org: null, name: "express", semver: "4.18.2", spec: "express@4.18.2" }
 * 
 * @example
 * // Scoped package with version
 * parsePackageSpec("@nodesecure/scanner@1.2.3")
 * // { org: "nodesecure", name: "@nodesecure/scanner", semver: "1.2.3", spec: "@nodesecure/scanner@1.2.3" }
 * 
 * @example
 * // Package with npm tag
 * parsePackageSpec("react@latest")
 * // { org: null, name: "react", semver: "latest", spec: "react@latest" }
 * 
 * @example
 * // Scoped package without version
 * parsePackageSpec("@babel/core")
 * // { org: "babel", name: "@babel/core", semver: null, spec: "@babel/core" }
 * 
 * @see https://docs.npmjs.com/cli/v10/configuring-npm/package-json#name
 * @see https://github.com/npm/validate-npm-package-name#naming-rules
 */
export function parsePackageSpec(input: string): ParsedPackageSpec {
  // Handle edge case of empty or whitespace-only input
  if (typeof input !== 'string') {
    throw new TypeError('Package specification must be a string');
  }
  
  let org: string | null = null;
  let name: string;
  let semver: string | null = null;
  const spec = input;

  // Handle version parsing
  let nameWithoutVersion: string;
  
  if (input.startsWith(kPackageOrgSymbol)) {
    // For scoped packages (@org/package@version), find the second @ for version
    const secondAtIndex = input.indexOf(kPackageOrgSymbol, 1);
    if (secondAtIndex !== -1) {
      nameWithoutVersion = input.substring(0, secondAtIndex);
      semver = input.substring(secondAtIndex + 1);
    } else {
      nameWithoutVersion = input;
    }
  } else {
    // For regular packages (package@version), find the first @ for version
    const atIndex = input.indexOf(kPackageOrgSymbol);
    if (atIndex !== -1) {
      nameWithoutVersion = input.substring(0, atIndex);
      semver = input.substring(atIndex + 1);
    } else {
      nameWithoutVersion = input;
    }
  }

  // Extract package name (remove any path components)
  if (nameWithoutVersion.startsWith(kPackageOrgSymbol)) {
    // For scoped packages, keep @org/package format
    const parts = nameWithoutVersion.split(kPackageSeparator);
    if (parts.length >= 2) {
      org = parts[0].substring(1); // remove '@' prefix
      name = `${parts[0]}${kPackageSeparator}${parts[1]}`;
    } else {
      name = nameWithoutVersion;
    }
  } else {
    // For regular packages, take only the first part before '/'
    const slashIndex = nameWithoutVersion.indexOf(kPackageSeparator);
    name = slashIndex !== -1 ? nameWithoutVersion.substring(0, slashIndex) : nameWithoutVersion;
  }

  return {
    org,
    name,
    semver,
    spec
  };
}

/**
 * Extract package name from a package specification
 * @param input - Package specification string
 * @returns Package name as string (for backward compatibility)
 * @example
 * getPackageName("foo"); // "foo"
 * getPackageName("foo/bar"); // "foo"
 * getPackageName("@org/bar"); // "@org/bar"
 * getPackageName("express@4.18.2"); // "express"
 * getPackageName("@org/package@1.0.0"); // "@org/package"
 */
export function getPackageName(input: string): string {
  return parsePackageSpec(input).name;
}
