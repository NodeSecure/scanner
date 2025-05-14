// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import {
  type Warning,
  type Dependency
} from "@nodesecure/js-x-ray";
import * as conformance from "@nodesecure/conformance";

// Import Internal Dependencies
import {
  isSensitiveFile,
  analyzeDependencies,
  filterDependencyKind,
  booleanToFlags
} from "./utils/index.js";
import { TarballExtractor } from "./class/TarballExtractor.class.js";
import * as warnings from "./warnings.js";

export interface DependencyRef {
  id: number;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  description: string;
  size: number;
  author: Record<string, any>;
  engines: Record<string, any>;
  repository: any;
  scripts: Record<string, string>;
  warnings: any;
  licenses: conformance.SpdxFileLicenseConformance[];
  uniqueLicenseIds: string[];
  gitUrl: string | null;
  alias: Record<string, string>;
  composition: {
    extensions: string[];
    files: string[];
    minified: string[];
    unused: string[];
    missing: string[];
    required_files: string[];
    required_nodejs: string[];
    required_thirdparty: string[];
    required_subpath: Record<string, string>;
  };
}

// CONSTANTS
const kNativeCodeExtensions = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);

export interface scanDirOrArchiveOptions {
  ref: DependencyRef;
  location?: string;
  tmpLocation?: null | string;
  registry: string;
}

export async function scanDirOrArchive(
  name: string,
  version: string,
  options: scanDirOrArchiveOptions
) {
  const { ref, location = process.cwd(), tmpLocation = null, registry } = options;
  const spec = `${name}@${version}`;

  let tarex: TarballExtractor;
  if (typeof tmpLocation === "string") {
    const location = path.join(tmpLocation, spec);

    tarex = ref.flags.includes("isGit") ?
      await TarballExtractor.fromGit(location, ref.gitUrl!, { registry }) :
      await TarballExtractor.fromNpm(location, spec, { registry });
  }
  else {
    tarex = await TarballExtractor.fromFileSystem(location);
  }
  const mama = tarex.manifest;

  const { composition, spdx } = await tarex.scan();

  {
    const { description, engines, repository, scripts } = mama.document;
    Object.assign(ref, {
      description, engines, repository, scripts,
      author: mama.author,
      integrity: mama.isWorkspace ? null : mama.integrity
    });
  }
  ref.licenses = spdx.licenses;
  ref.uniqueLicenseIds = spdx.uniqueLicenseIds;

  // Get the composition of the (extracted) directory
  if (composition.files.length === 1 && composition.files.includes("package.json")) {
    ref.warnings.push(warnings.getEmptyPackageWarning());
  }

  // Search for minified and runtime dependencies
  // Run a JS-X-Ray analysis on each JavaScript files of the project!
  const scannedFiles = await tarex.runJavaScriptSast(
    composition.files.filter(
      (name) => TarballExtractor.JS_EXTENSIONS.has(path.extname(name))
    )
  );

  ref.warnings.push(...scannedFiles.warnings);
  if (mama.hasZeroSemver) {
    ref.warnings.push(warnings.getSemVerWarning(version));
  }

  const files = new Set<string>();
  const dependencies = new Set<string>();
  const dependenciesInTryBlock = new Set<string>();

  for (const [file, fileDeps] of Object.entries(scannedFiles.dependencies)) {
    const filtered = filterDependencyKind(
      [...Object.keys(fileDeps)],
      path.dirname(file)
    );

    [...Object.entries(fileDeps)]
      .flatMap(([name, dependency]) => (dependency.inTry ? [name] : []))
      .forEach((name) => dependenciesInTryBlock.add(name));

    filtered.packages.forEach((name) => dependencies.add(name));
    filtered.files.forEach((file) => files.add(file));
  }

  const {
    nodeDependencies,
    thirdPartyDependencies,
    subpathImportsDependencies,
    missingDependencies,
    unusedDependencies,
    flags
  } = analyzeDependencies(
    [...dependencies],
    { mama, tryDependencies: dependenciesInTryBlock }
  );

  ref.size = composition.size;
  ref.composition.extensions.push(...composition.ext);
  ref.composition.files.push(...composition.files);
  ref.composition.required_thirdparty = thirdPartyDependencies;
  ref.composition.required_subpath = subpathImportsDependencies;
  ref.composition.unused.push(...unusedDependencies);
  ref.composition.missing.push(...missingDependencies);
  ref.composition.required_files = [...files];
  ref.composition.required_nodejs = nodeDependencies;
  ref.composition.minified = scannedFiles.minified;

  ref.flags.push(...booleanToFlags({
    ...flags,
    hasNoLicense: spdx.uniqueLicenseIds.length === 0,
    hasMultipleLicenses: spdx.uniqueLicenseIds.length > 1,
    hasMinifiedCode: scannedFiles.minified.length > 0,
    hasWarnings: ref.warnings.length > 0 && !ref.flags.includes("hasWarnings"),
    hasBannedFile: composition.files.some((path) => isSensitiveFile(path)),
    hasNativeCode: mama.flags.isNative ||
      composition.files.some((file) => kNativeCodeExtensions.has(path.extname(file))),
    hasScript: mama.flags.hasUnsafeScripts
  }));
}

export interface ScannedPackageResult {
  files: {
    /** Complete list of files for the given package */
    list: string[];
    /** Complete list of extensions (.js, .md etc.) */
    extensions: string[];
    /** List of minified javascript files */
    minified: string[];
  };
  /** Size of the directory in bytes */
  directorySize: number;
  /** Unique license contained in the tarball (MIT, ISC ..) */
  uniqueLicenseIds: string[];
  /** All licenses with their SPDX */
  licenses: conformance.SpdxFileLicenseConformance[];
  ast: {
    dependencies: Record<string, Record<string, Dependency>>;
    warnings: Warning[];
  };
}

export async function scanPackage(
  dest: string
): Promise<ScannedPackageResult> {
  const extractor = await TarballExtractor.fromFileSystem(dest);

  const {
    composition,
    spdx
  } = await extractor.scan();

  const {
    dependencies,
    warnings,
    minified
  } = await extractor.runJavaScriptSast(
    composition.files.filter(
      (name) => TarballExtractor.JS_EXTENSIONS.has(path.extname(name))
    )
  );

  return {
    files: {
      list: composition.files,
      extensions: [...composition.ext],
      minified
    },
    directorySize: composition.size,
    uniqueLicenseIds: spdx.uniqueLicenseIds,
    licenses: spdx.licenses,
    ast: { dependencies, warnings }
  };
}
