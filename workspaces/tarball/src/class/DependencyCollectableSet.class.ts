// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { ManifestManager, parseNpmSpec } from "@nodesecure/mama";
import {
  type Dependency,
  type CollectableSet,
  type CollectableSetData,
  type CollectableInfos
} from "@nodesecure/js-x-ray";
import type { NodeImport } from "@nodesecure/npm-types";

export const NODE_BUILTINS = new Set([
  "assert",
  "assert/strict",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "dns/promises",
  "domain",
  "events",
  "fs",
  "fs/promises",
  "http",
  "https",
  "module",
  "net",
  "os",
  "smalloc",
  "path",
  "path/posix",
  "path/win32",
  "punycode",
  "querystring",
  "readline",
  "readline/promises",
  "repl",
  "stream",
  "stream/web",
  "stream/promises",
  "stream/consumers",
  "_stream_duplex",
  "_stream_passthrough",
  "_stream_readable",
  "_stream_transform",
  "_stream_writable",
  "_stream_wrap",
  "string_decoder",
  "sys",
  "timers",
  "timers/promises",
  "tls",
  "tty",
  "url",
  "util",
  "util/types",
  "vm",
  "zlib",
  "freelist",
  "v8",
  "v8/tools/arguments",
  "v8/tools/codemap",
  "v8/tools/consarray",
  "v8/tools/csvparser",
  "v8/tools/logreader",
  "v8/tools/profile_view",
  "v8/tools/splaytree",
  "process",
  "inspector",
  "inspector/promises",
  "async_hooks",
  "http2",
  "perf_hooks",
  "trace_events",
  "worker_threads",
  "node:test",
  "test/reporters",
  "test/mock_loader",
  "node:sea",
  "node:sqlite",
  "wasi",
  "diagnostics_channel"
]);

const kFileExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".node", ".json"];
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);
const kExternalThirdPartyDeps = new Set([
  "undici",
  "node-fetch",
  "execa",
  "cross-spawn",
  "got",
  "axios",
  "ky",
  "superagent",
  "cross-fetch"
]);
const kRelativeImportPath = new Set([".", "..", "./", "../"]);

export type DependencyCollectableSetMetadata = Dependency & {
  relativeFile: string;
};

export class DependencyCollectableSet implements CollectableSet<DependencyCollectableSetMetadata> {
  type = "dependency";
  dependencies: Record<
    string,
    Record<string, Dependency>
  > = Object.create(null);
  #values: Set<string> = new Set();
  #files: Set<string> = new Set();
  #dependenciesInTryBlock: Set<string> = new Set();
  #subpathImportsDependencies: Record<string, string> = {};
  #thirdPartyDependencies: Set<string> = new Set();
  #thirdPartyAliasedDependencies: Set<string> = new Set();
  #missingDependencies: Set<string> = new Set();
  #nodeDependencies: Set<string> = new Set();
  #mama: Pick<ManifestManager, "dependencies" | "devDependencies" | "nodejsImports">;
  #hasExternalCapacity: boolean = false;

  constructor(
    mama: Pick<ManifestManager, "dependencies" | "devDependencies" | "nodejsImports">
  ) {
    this.#mama = mama;
  }

  extract() {
    const unusedDependencies = this.#difference(
      this.#mama.dependencies.filter((name) => !name.startsWith("@types")),
      [...this.#thirdPartyDependencies, ...this.#thirdPartyAliasedDependencies]
    );
    const hasMissingOrUnusedDependency =
      unusedDependencies.length > 0 ||
      this.#missingDependencies.size > 0;

    return {
      files: this.#files,
      dependenciesInTryBlock: [...this.#dependenciesInTryBlock],
      dependencies: {
        nodeJs: [...this.#nodeDependencies],
        thirdparty: [...this.#thirdPartyDependencies],
        subpathImports: this.#subpathImportsDependencies,
        unused: unusedDependencies,
        missing: [...this.#missingDependencies]
      },
      flags: {
        hasExternalCapacity: this.#hasExternalCapacity,
        hasMissingOrUnusedDependency
      }
    };
  }

  add(
    value: string,
    { metadata }: CollectableInfos<DependencyCollectableSetMetadata>
  ) {
    if (!metadata) {
      return;
    }

    const relativeFile = metadata.relativeFile;
    if (!(relativeFile in this.dependencies)) {
      this.dependencies[relativeFile] = Object.create(null);
    }

    this.dependencies[relativeFile][value] = {
      unsafe: Boolean(metadata?.unsafe),
      inTry: Boolean(metadata?.inTry)
    };

    if (metadata?.inTry) {
      this.#dependenciesInTryBlock.add(value);
    }
    const filtered = this.#filerDependencyByKind(
      value,
      path.dirname(relativeFile)
    );

    if (filtered.file) {
      this.#files.add(filtered.file);
    }
    if (filtered.package) {
      this.#analyzeDependency(filtered.package, Boolean(metadata?.inTry));
    }
    this.#values.add(value);
  }

  #filerDependencyByKind(
    dependency: string,
    relativeFileLocation: string
  ) {
    const firstChar = dependency.charAt(0);

    /**
     * @example
     * require("..");
     * require("/home/marco/foo.js");
     */
    if (firstChar === "." || firstChar === "/") {
      // Note: condition only possible for CJS
      if (kRelativeImportPath.has(dependency)) {
        return { file: path.join(dependency, "index.js") };
      }

      // Note: we are speculating that the extension is .js (but it could be .json or .node)
      const fixedFileName = path.extname(dependency) === "" ?
        `${dependency}.js` : dependency;

      return { file: path.join(relativeFileLocation, fixedFileName) };
    }

    return { package: dependency };
  }

  #analyzeDependency(
    sourceDependency: string,
    inTry: boolean
  ) {
    if (this.#values.has(sourceDependency)) {
      return;
    }

    const {
      dependencies,
      devDependencies,
      nodejsImports = {}
    } = this.#mama;

    let thirdPartyAliasedDependency: string | undefined;
    // See: https://nodejs.org/api/packages.html#subpath-imports
    if (this.#isAliasFileModule(sourceDependency) && sourceDependency in nodejsImports) {
      const [alias, importEntry] = this.#buildSubpathDependency(sourceDependency, nodejsImports);
      this.#subpathImportsDependencies[alias] = importEntry;
      if (!this.#isFile(importEntry)) {
        this.#thirdPartyAliasedDependencies.add(importEntry);
        thirdPartyAliasedDependency = importEntry;
      }
    }

    const name = this.#extractDependencyName(sourceDependency, dependencies);

    let thirdPartyDependency: string | undefined;

    if (!this.#isFile(name) &&
      !this.#isCoreModule(name) &&
      !devDependencies.includes(name)
      && !inTry
    ) {
      thirdPartyDependency = name;
      this.#thirdPartyDependencies.add(name);
    }

    if (
      thirdPartyDependency &&
      this.#isMissingDependency(thirdPartyDependency, thirdPartyAliasedDependency)
    ) {
      this.#missingDependencies.add(thirdPartyDependency);
    }

    let isNodeDependency = false;

    if (this.#isCoreModule(sourceDependency)) {
      this.#nodeDependencies.add(sourceDependency);
      isNodeDependency = true;
    }

    if (this.#hasExternalCapacity) {
      return;
    }

    if (((isNodeDependency && kExternalModules.has(sourceDependency))
      || (thirdPartyDependency && kExternalThirdPartyDeps.has(thirdPartyDependency)))) {
      this.#hasExternalCapacity = true;
    }
  }

  #extractDependencyName(
    sourceDependency: string,
    dependencies: string[]
  ) {
    for (const dependency of dependencies) {
      if (dependency === sourceDependency) {
        return sourceDependency;
      }

      if (sourceDependency.startsWith(dependency)) {
        return dependency;
      }
    }

    return parseNpmSpec(sourceDependency)?.name ?? sourceDependency;
  }

  #isMissingDependency(
    thirdPartyDependency: string,
    thirdPartyAliasedDependency: string | undefined
  ) {
    const { dependencies, nodejsImports = {} } = this.#mama;

    return !dependencies.includes(thirdPartyDependency) &&
      !(thirdPartyDependency in nodejsImports) &&
      thirdPartyDependency !== thirdPartyAliasedDependency;
  }

  #difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter((item) => !arr2.includes(item));
  }

  #isFile(
    filePath: string
  ) {
    return filePath.startsWith(".")
      || kFileExtensions.some((extension) => filePath.endsWith(extension));
  }

  #isCoreModule(
    moduleName: string
  ): boolean {
    const cleanModuleName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName;

    // Note: We need to also check moduleName because builtins package only return true for 'node:test'.
    return NODE_BUILTINS.has(cleanModuleName) || NODE_BUILTINS.has(moduleName);
  }

  #isAliasFileModule(
    moduleName: string
  ): moduleName is `#${string}` {
    return moduleName.charAt(0) === "#";
  }

  #buildSubpathDependency(
    alias: string,
    nodeImports: Record<string, string | NodeImport>
  ): [string, string] {
    const importEntry = nodeImports[alias];

    return typeof importEntry === "string" ?
      [alias, importEntry] :
      [alias, "node" in importEntry ? importEntry.node : importEntry.default];
  }

  values() {
    return this.#values;
  }

  toJSON(): CollectableSetData<DependencyCollectableSetMetadata> {
    return {
      type: this.type,
      entries: []
    };
  }
}
