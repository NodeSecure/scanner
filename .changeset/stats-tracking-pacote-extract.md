---
"@nodesecure/tarball": minor
"@nodesecure/scanner": minor
---

feat: add stats tracking on pacote.extract through extractAndResolve

Add support for dependency injection of extractFn in extractAndResolve to enable tracking of pacote.extract calls using StatsCollector. This allows measuring extraction time for each package during scanning.
