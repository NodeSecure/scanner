// Import Node.js Dependencies
import path from "path";
import os from "os";
import timers from "timers/promises";

// Import Third-party Dependencies
import { runASTAnalysisOnFile } from "@nodesecure/js-x-ray";
import pacote from "pacote";
import ntlp from "@nodesecure/ntlp";

// Import Internal Dependencies
import {
  getTarballComposition, isSensitiveFile, filterDependencyKind, analyzeDependencies, booleanToFlags,
  NPM_TOKEN
} from "./utils/index.js";
import * as manifest from "./manifest.js";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// CONSTANTS
const kNativeCodeExtensions = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);
const kJsExtname = new Set([".js", ".mjs", ".cjs"]);

export async function scanJavascriptFile(dest, file, packageName) {
  const result = await runASTAnalysisOnFile(path.join(dest, file), { packageName });

  const warnings = result.warnings.map((curr) => Object.assign({}, curr, { file }));
  if (!result.ok) {
    return {
      file,
      warnings,
      isMinified: false,
      tryDependencies: [],
      dependencies: [],
      filesDependencies: []
    };
  }
  const { packages, files } = filterDependencyKind(result.dependencies, path.dirname(file));

  return {
    file,
    warnings,
    isMinified: result.isMinified,
    tryDependencies: [...result.dependencies.getDependenciesInTryStatement()],
    dependencies: packages,
    filesDependencies: files
  };
}

export async function scanDirOrArchive(name, version, options) {
  const { ref, location = process.cwd(), tmpLocation, locker } = options;

  const isNpmTarball = !(tmpLocation === null);
  const dest = isNpmTarball ? path.join(tmpLocation, `${name}@${version}`) : location;
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
    const {
      packageDeps, packageDevDeps, author, description, hasScript, hasNativeElements, nodejs
    } = await manifest.readAnalyze(dest);
    ref.author = author;
    ref.description = description;

    // Get the composition of the (extracted) directory
    const { ext, files, size } = await getTarballComposition(dest);
    ref.size = size;
    ref.composition.extensions.push(...ext);
    ref.composition.files.push(...files);
    const hasBannedFile = files.some((path) => isSensitiveFile(path));
    const hasNativeCode = hasNativeElements || files.some((file) => kNativeCodeExtensions.has(path.extname(file)));

    // Search for minified and runtime dependencies
    // Run a JS-X-Ray analysis on each JavaScript files of the project!
    const fileAnalysisRaw = await Promise.allSettled(
      files
        .filter((name) => kJsExtname.has(path.extname(name)))
        .map((file) => scanJavascriptFile(dest, file, name))
    );

    const fileAnalysisResults = fileAnalysisRaw
      .filter((promiseSettledResult) => promiseSettledResult.status === "fulfilled")
      .map((promiseSettledResult) => promiseSettledResult.value);

    ref.warnings.push(...fileAnalysisResults.flatMap((row) => row.warnings));

    const dependencies = [...new Set(fileAnalysisResults.flatMap((row) => row.dependencies))];
    const filesDependencies = [...new Set(fileAnalysisResults.flatMap((row) => row.filesDependencies))];
    const tryDependencies = new Set(fileAnalysisResults.flatMap((row) => row.tryDependencies));
    const minifiedFiles = fileAnalysisResults.filter((row) => row.isMinified).flatMap((row) => row.file);

    const {
      nodeDependencies, thirdPartyDependencies, subpathImportsDependencies, missingDependencies, unusedDependencies, flags
    } = analyzeDependencies(dependencies, { packageDeps, packageDevDeps, tryDependencies, nodeImports: nodejs.imports });

    ref.composition.required_thirdparty = thirdPartyDependencies;
    ref.composition.required_subpath = Object.fromEntries(subpathImportsDependencies);
    ref.composition.unused.push(...unusedDependencies);
    ref.composition.missing.push(...missingDependencies);
    ref.composition.required_files = filesDependencies;
    ref.composition.required_nodejs = nodeDependencies;
    ref.composition.minified = minifiedFiles;

    // License
    await timers.setImmediate();
    const licenses = await ntlp(dest);
    const uniqueLicenseIds = Array.isArray(licenses.uniqueLicenseIds) ? licenses.uniqueLicenseIds : [];
    ref.license = licenses;
    ref.license.uniqueLicenseIds = uniqueLicenseIds;

    ref.flags.push(...booleanToFlags({
      ...flags,
      hasNoLicense: uniqueLicenseIds.length === 0,
      hasMultipleLicenses: licenses.hasMultipleLicenses,
      hasMinifiedCode: minifiedFiles.length > 0,
      hasWarnings: ref.warnings.length > 0 && !ref.flags.includes("hasWarnings"),
      hasBannedFile,
      hasNativeCode,
      hasScript
    }));
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
