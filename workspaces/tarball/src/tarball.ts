// Import Node.js Dependencies
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import {
  type Warning,
  type Dependency,
  type AstAnalyserOptions
} from "@nodesecure/js-x-ray";
import * as conformance from "@nodesecure/conformance";
import { ManifestManager, type PackageModuleType } from "@nodesecure/mama";
import pacote from "pacote";

// Import Internal Dependencies
import {
  isSensitiveFile,
  booleanToFlags
} from "./utils/index.ts";
import { NpmTarball } from "./class/NpmTarball.class.ts";
import { DependencyCollectableSet } from "./class/DependencyCollectableSet.class.ts";
import {
  getEmptyPackageWarning,
  getSemVerWarning
} from "./warnings.ts";
import {
  NATIVE_CODE_EXTENSIONS,
  NPM_TOKEN
} from "./constants.ts";
import type {
  ScanResultPayload,
  DependencyRef
} from "./types.ts";
import type { Path } from "./class/SourceCodeScanner.class.ts";

export interface ScanOptions {
  astAnalyserOptions?: AstAnalyserOptions;
}

export async function scanPackageCore(
  locationOrManifest: string | ManifestManager,
  astAnalyserOptions?: AstAnalyserOptions
): Promise<ScanResultPayload> {
  const mama = await ManifestManager.fromPackageJSON(locationOrManifest);
  const dependencySet = new DependencyCollectableSet(mama);
  const tarex = new NpmTarball(mama);

  const {
    composition,
    conformance: conformanceResult,
    code
  } = await tarex.scanFiles({
    ...astAnalyserOptions,
    collectables: [
      ...astAnalyserOptions?.collectables ?? [],
      dependencySet
    ]
  });

  const warnings: Warning[] = [];
  if (composition.files.length === 1 && composition.files.includes("package.json")) {
    warnings.push(getEmptyPackageWarning());
  }
  if (mama.hasZeroSemver) {
    warnings.push(getSemVerWarning(mama.document.version!));
  }
  warnings.push(...code.warnings);

  const { files, dependencies, flags } = dependencySet.extract();
  const { description, engines, repository, scripts } = mama.document;

  return {
    description,
    engines,
    repository,
    scripts,
    author: mama.author,
    integrity: mama.isWorkspace ? null : mama.integrity,
    type: mama.moduleType,
    size: composition.size,
    licenses: conformanceResult.licenses,
    uniqueLicenseIds: conformanceResult.uniqueLicenseIds,
    warnings,
    flags: Array.from(booleanToFlags({
      ...flags,
      hasExternalCapacity: code.flags.hasExternalCapacity || flags.hasExternalCapacity,
      hasNoLicense: conformanceResult.uniqueLicenseIds.length === 0,
      hasMultipleLicenses: conformanceResult.uniqueLicenseIds.length > 1,
      hasMinifiedCode: code.minified.length > 0,
      hasWarnings: warnings.length > 0,
      hasBannedFile: composition.files.some((filePath) => isSensitiveFile(filePath)),
      hasNativeCode: mama.flags.isNative ||
        composition.files.some((file) => NATIVE_CODE_EXTENSIONS.has(path.extname(file))),
      hasScript: mama.flags.hasUnsafeScripts
    })),
    composition: {
      extensions: [...composition.ext],
      files: composition.files,
      minified: code.minified,
      unused: dependencies.unused,
      missing: dependencies.missing,
      required_files: [...files],
      required_nodejs: dependencies.nodeJs,
      required_thirdparty: dependencies.thirdparty,
      required_subpath: dependencies.subpathImports
    },
    path: code.path
  };
}

export async function scanDirOrArchive(
  locationOrManifest: string | ManifestManager,
  ref: DependencyRef,
  options: ScanOptions = {}
): Promise<void> {
  const result = await scanPackageCore(locationOrManifest, options.astAnalyserOptions);

  const { description, engines, repository, scripts, author, integrity } = result;
  Object.assign(ref, { description, engines, repository, scripts, author, integrity });

  ref.warnings.push(...result.warnings);
  ref.licenses = result.licenses;
  ref.uniqueLicenseIds = result.uniqueLicenseIds;
  ref.type = result.type as PackageModuleType;
  ref.size = result.size;
  ref.composition.extensions.push(...result.composition.extensions);
  ref.composition.files.push(...result.composition.files);
  ref.composition.minified = result.composition.minified;
  ref.composition.unused.push(...result.composition.unused);
  ref.composition.missing.push(...result.composition.missing);
  ref.composition.required_files = result.composition.required_files;
  ref.composition.required_nodejs = result.composition.required_nodejs;
  ref.composition.required_thirdparty = result.composition.required_thirdparty;
  ref.composition.required_subpath = result.composition.required_subpath;
  ref.path = result.path;

  const flags = result.flags.filter((flag) => flag !== "hasWarnings" || !ref.flags.includes("hasWarnings"));
  ref.flags.push(...flags);
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
  path: Path;
}

export async function scanPackage(
  manifestOrLocation: string | ManifestManager,
  options: ScanOptions = {}
): Promise<ScannedPackageResult> {
  const { astAnalyserOptions } = options;

  const mama = await ManifestManager.fromPackageJSON(manifestOrLocation);
  const extractor = new NpmTarball(mama);
  const dependencySet = new DependencyCollectableSet(mama);

  const {
    composition,
    conformance: conformanceResult,
    code
  } = await extractor.scanFiles({
    ...astAnalyserOptions,
    collectables: [
      ...(astAnalyserOptions?.collectables ?? []),
      dependencySet
    ]
  });

  const warnings = [...code.warnings];
  if (composition.files.length === 1 && composition.files.includes("package.json")) {
    warnings.push(getEmptyPackageWarning());
  }

  return {
    files: {
      list: composition.files,
      extensions: [...composition.ext],
      minified: code.minified
    },
    directorySize: composition.size,
    uniqueLicenseIds: conformanceResult.uniqueLicenseIds,
    licenses: conformanceResult.licenses,
    ast: {
      dependencies: dependencySet.dependencies,
      warnings
    },
    path: code.path
  };
}

export interface PacoteProvider {
  extract(
    spec: string,
    destination: string,
    options: pacote.Options
  ): Promise<void>;
}

export interface TarballResolutionOptions {
  spec: string;
  registry?: string;
  pacoteProvider?: PacoteProvider;
}

export async function extractAndResolve(
  location: string,
  options: TarballResolutionOptions
): Promise<ManifestManager> {
  const { spec, registry, pacoteProvider = pacote } = options;

  const tarballLocation = path.join(location, spec.replaceAll("/", "_"));
  await pacoteProvider.extract(
    spec,
    tarballLocation,
    {
      ...NPM_TOKEN,
      registry,
      cache: `${os.homedir()}/.npm`,
      userAgent: `@nodesecure/tarball node/${process.version}`
    }
  );

  return ManifestManager.fromPackageJSON(tarballLocation);
}
