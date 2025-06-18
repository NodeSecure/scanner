// Import Node.js Dependencies
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import {
  type Warning,
  type Dependency
} from "@nodesecure/js-x-ray";
import * as conformance from "@nodesecure/conformance";
import {
  ManifestManager,
  type PackageModuleType
} from "@nodesecure/mama";
import pacote from "pacote";

// Import Internal Dependencies
import {
  isSensitiveFile,
  booleanToFlags
} from "./utils/index.js";
import { NpmTarball } from "./class/NpmTarball.class.js";
import * as warnings from "./warnings.js";

export interface DependencyRef {
  id: number;
  type: PackageModuleType;
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
const kNpmToken = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};

export async function scanDirOrArchive(
  locationOrManifest: string | ManifestManager,
  ref: DependencyRef
): Promise<void> {
  const mama = await ManifestManager.fromPackageJSON(
    locationOrManifest
  );
  const tarex = new NpmTarball(mama);

  const {
    composition,
    conformance,
    code
  } = await tarex.scanFiles();

  {
    const { description, engines, repository, scripts } = mama.document;
    Object.assign(ref, {
      description, engines, repository, scripts,
      author: mama.author,
      integrity: mama.isWorkspace ? null : mama.integrity
    });
  }

  if (
    composition.files.length === 1 &&
    composition.files.includes("package.json")
  ) {
    ref.warnings.push(warnings.getEmptyPackageWarning());
  }

  if (mama.hasZeroSemver) {
    ref.warnings.push(warnings.getSemVerWarning(mama.document.version!));
  }
  ref.warnings.push(...code.warnings);

  const {
    files,
    dependencies,
    flags
  } = code.groupAndAnalyseDependencies(mama);

  ref.licenses = conformance.licenses;
  ref.uniqueLicenseIds = conformance.uniqueLicenseIds;
  ref.type = mama.moduleType;
  ref.size = composition.size;
  ref.composition.extensions.push(...composition.ext);
  ref.composition.files.push(...composition.files);
  ref.composition.required_thirdparty = dependencies.thirdparty;
  ref.composition.required_subpath = dependencies.subpathImports;
  ref.composition.unused.push(...dependencies.unused);
  ref.composition.missing.push(...dependencies.missing);
  ref.composition.required_files = [...files];
  ref.composition.required_nodejs = dependencies.nodejs;
  ref.composition.minified = code.minified;

  ref.flags.push(...booleanToFlags({
    ...flags,
    hasExternalCapacity: code.flags.hasExternalCapacity || flags.hasExternalCapacity,
    hasNoLicense: conformance.uniqueLicenseIds.length === 0,
    hasMultipleLicenses: conformance.uniqueLicenseIds.length > 1,
    hasMinifiedCode: code.minified.length > 0,
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
  manifestOrLocation: string | ManifestManager
): Promise<ScannedPackageResult> {
  const mama = await ManifestManager.fromPackageJSON(
    manifestOrLocation
  );
  const extractor = new NpmTarball(mama);

  const {
    composition,
    conformance,
    code
  } = await extractor.scanFiles();

  return {
    files: {
      list: composition.files,
      extensions: [...composition.ext],
      minified: code.minified
    },
    directorySize: composition.size,
    uniqueLicenseIds: conformance.uniqueLicenseIds,
    licenses: conformance.licenses,
    ast: {
      dependencies: code.dependencies,
      warnings: code.warnings
    }
  };
}

export interface TarballResolutionOptions {
  spec: string;
  registry?: string;
}

export async function extractAndResolve(
  location: string,
  options: TarballResolutionOptions
): Promise<ManifestManager> {
  const { spec, registry } = options;

  const tarballLocation = path.join(location, spec.replaceAll("/", "_"));
  await pacote.extract(
    spec,
    tarballLocation,
    {
      ...kNpmToken,
      registry,
      cache: `${os.homedir()}/.npm`
    }
  );

  return ManifestManager.fromPackageJSON(
    tarballLocation
  );
}
