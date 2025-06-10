---
"@nodesecure/mama": minor
---

Allow `fromPackageJSON` to accept a `ManifestManager` instance

This change allows the `fromPackageJSON` static method to accept either a string path or a `ManifestManager` instance. When a `ManifestManager` instance is provided, it will be returned directly, simplifying code that needs to handle both cases.