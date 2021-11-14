// CONSTANTS
const kPackageSeparator = "/";
const kPackageOrgSymbol = "@";

/**
 * @see https://github.com/npm/validate-npm-package-name#naming-rules
 *
 * @param {!string} name full package name
 * @returns {string}
 *
 * @example
 * getPackageName("foo"); // foo
 * getPackageName("foo/bar"); // foo
 * getPackageName("@org/bar"); // @org/bar
 */
export function getPackageName(name) {
  const parts = name.split(kPackageSeparator);

  // Note: only scoped package are allowed to start with @
  return name.startsWith(kPackageOrgSymbol) ? `${parts[0]}/${parts[1]}` : parts[0];
}
