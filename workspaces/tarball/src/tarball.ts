// Import Node.js Dependencies
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import {
  AstAnalyser,
  type Warning,
  type Dependency
} from "@nodesecure/js-x-ray";
import pacote from "pacote";
import * as conformance from "@nodesecure/conformance";
import { ManifestManager } from "@nodesecure/mama";

// Import Internal Dependencies
import {
  getTarballComposition,
  isSensitiveFile,
  analyzeDependencies,
  booleanToFlags
} from "./utils/index.js";
import * as warnings from "./warnings.js";
import * as sast from "./sast/index.js";

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
const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};

const kNativeCodeExtensions = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);
const kJsExtname = new Set([".js", ".mjs", ".cjs"]);

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

  const isNpmTarball = !(tmpLocation === null);
  const dest = isNpmTarball ? path.join(tmpLocation, `${name}@${version}`) : location;

  // If this is an NPM tarball then we extract it on the disk with pacote.
  if (isNpmTarball) {
    await pacote.extract(
      ref.flags.includes("isGit") ? ref.gitUrl! : `${name}@${version}`,
      dest,
      {
        ...NPM_TOKEN,
        registry,
        cache: `${os.homedir()}/.npm`
      }
    );
  }

  // Read the package.json at the root of the directory or archive.
  const [
    mama,
    composition,
    spdx
  ] = await Promise.all([
    ManifestManager.fromPackageJSON(dest),
    getTarballComposition(dest),
    conformance.extractLicenses(dest)
  ]);

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
  const scannedFiles = await sast.scanManyFiles(composition.files, dest, name);

  ref.warnings.push(...scannedFiles.flatMap((row) => row.warnings));
  if (/^0(\.\d+)*$/.test(version)) {
    ref.warnings.push(warnings.getSemVerWarning(version));
  }

  const dependencies = [...new Set(scannedFiles.flatMap((row) => row.dependencies))];
  const filesDependencies = [...new Set(scannedFiles.flatMap((row) => row.filesDependencies))];
  const tryDependencies = new Set(scannedFiles.flatMap((row) => row.tryDependencies));
  const minifiedFiles = scannedFiles.filter((row) => row.isMinified).flatMap((row) => row.file);

  const {
    nodeDependencies,
    thirdPartyDependencies,
    subpathImportsDependencies,
    missingDependencies,
    unusedDependencies,
    flags
  } = analyzeDependencies(
    dependencies,
    { mama, tryDependencies }
  );

  ref.size = composition.size;
  ref.composition.extensions.push(...composition.ext);
  ref.composition.files.push(...composition.files);
  ref.composition.required_thirdparty = thirdPartyDependencies;
  ref.composition.required_subpath = subpathImportsDependencies;
  ref.composition.unused.push(...unusedDependencies);
  ref.composition.missing.push(...missingDependencies);
  ref.composition.required_files = filesDependencies;
  ref.composition.required_nodejs = nodeDependencies;
  ref.composition.minified = minifiedFiles;

  ref.flags.push(...booleanToFlags({
    ...flags,
    hasNoLicense: spdx.uniqueLicenseIds.length === 0,
    hasMultipleLicenses: spdx.uniqueLicenseIds.length > 1,
    hasMinifiedCode: minifiedFiles.length > 0,
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
  dest: string,
  packageName?: string
): Promise<ScannedPackageResult> {
  const [
    mama,
    composition,
    spdx
  ] = await Promise.all([
    ManifestManager.fromPackageJSON(dest),
    getTarballComposition(dest),
    conformance.extractLicenses(dest)
  ]);
  const { type = "script" } = mama.document;

  // Search for runtime dependencies
  const dependencies: Record<string, Record<string, Dependency>> = Object.create(null);
  const minified: string[] = [];
  const warnings: Warning[] = [];

  const JSFiles = composition.files
    .filter((name) => kJsExtname.has(path.extname(name)));
  for (const file of JSFiles) {
    const result = await new AstAnalyser().analyseFile(
      path.join(dest, file),
      {
        packageName: packageName ?? mama.document.name,
        module: type === "module"
      }
    );

    warnings.push(
      ...result.warnings.map((curr) => Object.assign({}, curr, { file }))
    );
    if (result.ok) {
      dependencies[file] = Object.fromEntries(result.dependencies);
      if (result.isMinified) {
        minified.push(file);
      }
    }
  }

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
