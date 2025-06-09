---
"@nodesecure/mama": patch
---

feat: add LocatedManifestManager type and isLocated type guard

- Add new LocatedManifestManager type where location is required
- Add static isLocated method to properly narrow the type
- Update documentation with new type and method usage
- Add type tests for the new functionality 