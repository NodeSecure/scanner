// Import Node.js Dependencies
import { join, extname, dirname } from "path";
import fs from "fs/promises";
import os from "os";
import timers from "timers/promises";

// Import Third-party Dependencies
import { runASTAnalysis } from "@nodesecure/js-x-ray";
import difference from "lodash.difference";
import isMinified from "is-minified-code";
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

export async function scanFile(dest, file, options) {
  try {
    const { packageName, ref } = options;

    const str = await fs.readFile(join(dest, file), "utf-8");
    const isMin = file.includes(".min") || isMinified(str);

    const ASTAnalysis = runASTAnalysis(str, { isMinified: isMin });
    ASTAnalysis.dependencies.removeByName(packageName);

    const { packages, files } = filterDependencyKind(ASTAnalysis.dependencies, dirname(file));
    const inTryDeps = [...ASTAnalysis.dependencies.getDependenciesInTryStatement()];

    if (!ASTAnalysis.isOneLineRequire && isMin) {
      ref.composition.minified.push(file);
    }
    ref.warnings.push(...ASTAnalysis.warnings.map((curr) => Object.assign({}, curr, { file })));

    return { inTryDeps, dependencies: packages, filesDependencies: files };
  }
  catch (error) {
    console.log(error);
    if (!("code" in error)) {
      ref.warnings.push({ file, kind: "parsing-error", value: error.message, location: [[0, 0], [0, 0]] });
    }

    return null;
  }
}

export async function scanDirOrArchive(name, version, options) {
  const { ref, tmpLocation, locker } = options;

  const isNpmTarball = !(tmpLocation === null);
  const dest = isNpmTarball ? join(tmpLocation, `${name}@${version}`) : process.cwd();
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
    const [dependencies, filesDependencies, inTryDeps] = [new Set(), new Set(), new Set()];
    const fileAnalysisResults = await Promise.all(
      files
        .filter((name) => kJsExtname.has(extname(name)))
        .map((file) => scanFile(dest, file, { packageName: name, ref }))
    );

    for (const result of fileAnalysisResults.filter((row) => row !== null)) {
      result.inTryDeps.forEach((dep) => inTryDeps.add(dep));
      result.dependencies.forEach((dep) => dependencies.add(dep));
      result.filesDependencies.forEach((dep) => filesDependencies.add(dep));
    }

    // Search for native code
    const hasNativeFile = files.some((file) => kNativeCodeExtensions.has(extname(file)));
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
      .map((depName) => (extname(depName) === "" ? `${depName}.js` : depName));
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
  catch (err) {
    // Ignore
  }
  finally {
    free();
  }
}

async function readJSFile(dest, file) {
  const str = await fs.readFile(join(dest, file), "utf-8");

  return [file, str];
}

export async function scanPackage(dest, packageName) {
  const { type = "script", name } = await manifest.read(dest);

  await timers.setImmediate();
  const { ext, files, size } = await getTarballComposition(dest);

  // Search for runtime dependencies
  const dependencies = Object.create(null);
  const minified = [];
  const warnings = [];

  const JSFiles = files.filter((name) => kJsExtname.has(extname(name)));
  const allFilesContent = (await Promise.allSettled(JSFiles.map((file) => readJSFile(dest, file))))
    .filter((_p) => _p.status === "fulfilled").map((_p) => _p.value);

  // TODO: 2) handle dependency by file to not loose data.
  for (const [file, str] of allFilesContent) {
    try {
      const ASTAnalysis = runASTAnalysis(str, {
        module: extname(file) === ".mjs" ? true : type === "module"
      });
      ASTAnalysis.dependencies.removeByName(packageName ?? name);
      dependencies[file] = ASTAnalysis.dependencies.dependencies;
      warnings.push(...ASTAnalysis.warnings.map((warn) => {
        warn.file = file;

        return warn;
      }));

      if (!ASTAnalysis.isOneLineRequire && !file.includes(".min") && isMinified(str)) {
        minified.push(file);
      }
    }
    catch (err) {
      if (!Reflect.has(err, "code")) {
        warnings.push({ file, kind: "parsing-error", value: err.message, location: [[0, 0], [0, 0]] });
      }
    }
  }

  await timers.setImmediate();
  const { uniqueLicenseIds, licenses } = await ntlp(dest);
  ext.delete("");

  return {
    files: { list: files, extensions: [...ext], minified },
    directorySize: size,
    uniqueLicenseIds,
    licenses,
    ast: { dependencies, warnings }
  };
}
