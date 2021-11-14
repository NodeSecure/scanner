// Import Node.js Dependencies
import path from "path";
import os from "os";
import timers from "timers/promises";

// Import Third-party Dependencies
import { runASTAnalysisOnFile } from "@nodesecure/js-x-ray";
import difference from "lodash.difference";
import pacote from "pacote";
import ntlp from "@nodesecure/ntlp";
import builtins from "builtins";

// Import Internal Dependencies
import {
  getTarballComposition, isSensitiveFile, getPackageName, filterDependencyKind,
  NPM_TOKEN
} from "./utils/index.js";
import * as manifest from "./manifest.js";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// CONSTANTS
const kNativeCodeExtensions = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);
const kJsExtname = new Set([".js", ".mjs", ".cjs"]);
const kNodeModules = new Set(builtins({ experimental: true }));

export async function scanFile(dest, file, packageName) {
  const result = await runASTAnalysisOnFile(path.join(dest, file), { packageName });

  const warnings = result.warnings.map((curr) => Object.assign({}, curr, { file }));
  if (!result.ok) {
    return { warnings, tryDependencies: [], dependencies: [], filesDependencies: [] };
  }
  const { packages, files } = filterDependencyKind(result.dependencies, path.dirname(file));

  return {
    warnings,
    isMinified: result.isMinified,
    tryDependencies: [...result.dependencies.getDependenciesInTryStatement()],
    dependencies: packages,
    filesDependencies: files
  };
}

export async function scanDirOrArchive(name, version, options) {
  const { ref, tmpLocation, locker } = options;

  const isNpmTarball = !(tmpLocation === null);
  const dest = isNpmTarball ? path.join(tmpLocation, `${name}@${version}`) : process.cwd();
  const free = await locker.acquireOne();

  try {
    // If this is an NPM tarball then we extract it on the disk with pacote.
    if (isNpmTarball) {
      await pacote.extract(ref.flags.includes("isGit") ? ref.gitUrl : `${name}@${version}`, dest, {
        ...NPM_TOKEN,
        registry: getLocalRegistryURL(),
        cache: `${os.homedir()}/.npm`
      });
      await timers.setImmediate();
    }

    // Read the package.json at the root of the directory or archive.
    const { packageDeps, packageDevDeps, author, description, hasScript, hasNativeElements } = await manifest.readAnalyze(dest);
    ref.author = author;
    ref.description = description;
    ref.flags.hasScript = hasScript;

    // Get the composition of the (extracted) directory
    const { ext, files, size } = await getTarballComposition(dest);
    ref.size = size;
    ref.composition.extensions.push(...ext);
    ref.composition.files.push(...files);
    if (files.some((path) => isSensitiveFile(path))) {
      ref.flags.push("hasBannedFile");
    }

    // Search for minified and runtime dependencies
    // Run a JS-X-Ray analysis on each JavaScript files of the project!
    const fileAnalysisRaw = await Promise.allSettled(
      files
        .filter((name) => kJsExtname.has(path.extname(name)))
        .map((file) => scanFile(dest, file, name))
    );

    const fileAnalysisResults = fileAnalysisRaw
      .filter((promiseSettledResult) => promiseSettledResult.status === "fulfilled")
      .map((promiseSettledResult) => promiseSettledResult.value);

    ref.warnings.push(...fileAnalysisResults.flatMap((row) => row.warnings));
    const dependencies = new Set(fileAnalysisResults.flatMap((row) => row.dependencies));
    const filesDependencies = new Set(fileAnalysisResults.flatMap((row) => row.filesDependencies));
    const inTryDeps = new Set(fileAnalysisResults.flatMap((row) => row.tryDependencies));

    // Search for native code
    const hasNativeFile = files.some((file) => kNativeCodeExtensions.has(path.extname(file)));
    if (hasNativeFile || hasNativeElements) {
      ref.flags.push("hasNativeCode");
    }

    if (ref.warnings.length > 0 && !ref.flags.includes("hasWarnings")) {
      ref.flags.push("hasWarnings");
    }
    const required = [...dependencies];

    // TODO: need to improve this
    if (packageDeps !== null) {
      const thirdPartyDependencies = required
        .map((name) => (packageDeps.includes(name) ? name : getPackageName(name)))
        .filter((name) => !name.startsWith("."))
        .filter((name) => !kNodeModules.has(name))
        .filter((name) => !packageDevDeps.includes(name))
        .filter((name) => !inTryDeps.has(name));
      ref.composition.required_thirdparty = thirdPartyDependencies;

      const unusedDeps = difference(
        packageDeps.filter((name) => !name.startsWith("@types")), thirdPartyDependencies);
      const missingDeps = new Set(difference(thirdPartyDependencies, packageDeps));

      if (unusedDeps.length > 0 || missingDeps.length > 0) {
        ref.flags.push("hasMissingOrUnusedDependency");
      }
      ref.composition.unused.push(...unusedDeps);
      ref.composition.missing.push(...missingDeps);
    }

    ref.composition.required_files = [...filesDependencies]
      .filter((depName) => depName.trim() !== "")
      .map((depName) => (path.extname(depName) === "" ? `${depName}.js` : depName));
    ref.composition.required_nodejs = required.filter((name) => kNodeModules.has(name));

    if (ref.composition.minified.length > 0) {
      ref.flags.push("hasMinifiedCode");
    }

    const hasExternalCapacity = ref.composition.required_nodejs
      .some((depName) => kExternalModules.has(depName));
    if (hasExternalCapacity) {
      ref.flags.push("hasExternalCapacity");
    }

    // License
    await timers.setImmediate();
    const licenses = await ntlp(dest);

    const uniqueLicenseIds = Array.isArray(licenses.uniqueLicenseIds) ? licenses.uniqueLicenseIds : [];
    if (uniqueLicenseIds.length === 0) {
      ref.flags.push("hasNoLicense");
    }
    if (licenses.hasMultipleLicenses) {
      ref.flags.push("hasMultipleLicenses");
    }

    ref.license = licenses;
    ref.license.uniqueLicenseIds = uniqueLicenseIds;
  }
  catch {
    // Ignore
  }
  finally {
    free();
  }
}

export async function scanPackage(dest, packageName) {
  const { type = "script", name } = await manifest.read(dest);

  await timers.setImmediate();
  const { ext, files, size } = await getTarballComposition(dest);
  ext.delete("");

  // Search for runtime dependencies
  const dependencies = Object.create(null);
  const [minified, warnings] = [[], []];

  const JSFiles = files.filter((name) => kJsExtname.has(path.extname(name)));
  for (const file of JSFiles) {
    const result = await runASTAnalysisOnFile(path.join(dest, file), {
      packageName: packageName ?? name,
      module: type === "module"
    });

    warnings.push(...result.warnings.map((curr) => Object.assign({}, curr, { file })));
    if (!result.ok) {
      continue;
    }

    dependencies[file] = result.dependencies.dependencies;
    result.isMinified && minified.push(file);
  }

  await timers.setImmediate();
  const { uniqueLicenseIds, licenses } = await ntlp(dest);

  return {
    files: { list: files, extensions: [...ext], minified },
    directorySize: size,
    uniqueLicenseIds,
    licenses,
    ast: { dependencies, warnings }
  };
}
