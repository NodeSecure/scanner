---
"@nodesecure/tarball": patch
---

Fix and enhance package name parsing for NPM spec compliance

This change completely reimplements the package name parsing logic to fix critical issues and adds comprehensive NPM specification compliance:

**Major Fixes:**
- **Fixed scoped package with version parsing**: Now correctly handles `@org/package@version` format
- **Proper @ symbol disambiguation**: Correctly distinguishes between scope (@org/) and version (@version) usage
- **NPM spec compliance**: Follows official npm package naming and versioning rules

**New Features:**
- **New `parsePackageSpec()` function**: Provides comprehensive parsing with org, name, semver, and spec fields
- **Input validation**: Type checking and error handling for invalid inputs
- **Comprehensive documentation**: JSDoc with examples and npm specification references

**Enhanced Test Coverage (52 tests):**
- All original issue #419 test cases
- Complex semver versions (prerelease, build metadata)
- npm dist-tags (latest, next, etc.)
- Edge cases and error conditions
- Package names with numbers, hyphens, and special characters

**Backward Compatibility:**
- `getPackageName()` maintains its string return type for existing usage
- All existing functionality preserved

**Examples of fixed cases:**
- `@nodesecure/scanner@1.2.3` → `{ org: "nodesecure", name: "@nodesecure/scanner", semver: "1.2.3" }`
- `@babel/core@7.22.0-beta.1` → Handles prerelease versions correctly
- `react@latest` → Supports npm tags
- `@types/node@18.15.11` → Complex real-world scoped packages