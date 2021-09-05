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
import { getTarballComposition, isSensitiveFile, getPackageName, constants } from "./utils/index.js";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// CONSTANTS
const DIRECT_PATH = new Set([".", "..", "./", "../"]);
const NATIVE_CODE_EXTENSIONS = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);
const NATIVE_NPM_PACKAGES = new Set(["node-gyp", "node-pre-gyp", "node-gyp-build", "node-addon-api"]);
const NODE_CORE_LIBS = new Set(builtins({ experimental: true }));

export async function readManifest(dest, ref) {
  const packageStr = await fs.readFile(join(dest, "package.json"), "utf-8");
  const packageJSON = JSON.parse(packageStr);
  const {
    description = "", author = {}, scripts = {}, dependencies = {}, devDependencies = {}, gypfile = false
  } = packageJSON;

  ref.description = description;
  ref.author = author;

  // TODO: handle this to @nodesecure/flags
  ref.flags.hasScript = [...Object.keys(scripts)]
    .some((value) => constants.NPM_SCRIPTS.has(value.toLowerCase()));

  return {
    packageDeps: [...Object.keys(dependencies)],
    packageDevDeps: Object.keys(devDependencies),
    packageGyp: gypfile
  };
}

export async function scanFile(dest, file, options) {
  const { name, ref } = options;

  try {
    const str = await fs.readFile(join(dest, file), "utf-8");
    const isMin = file.includes(".min") || isMinified(str);

    const ASTAnalysis = runASTAnalysis(str, { isMinified: isMin });
    ASTAnalysis.dependencies.removeByName(name);

    const dependencies = [];
    const filesDependencies = [];
    for (const depName of ASTAnalysis.dependencies) {
      if (depName.startsWith(".")) {
        const indexName = DIRECT_PATH.has(depName) ? join(depName, "index.js") : join(dirname(file), depName);
        filesDependencies.push(indexName);
      }
      else {
        dependencies.push(depName);
      }
    }
    const inTryDeps = [...ASTAnalysis.dependencies.getDependenciesInTryStatement()];

    if (!ASTAnalysis.isOneLineRequire && isMin) {
      ref.composition.minified.push(file);
    }
    ref.warnings.push(...ASTAnalysis.warnings.map((curr) => Object.assign({}, curr, { file })));

    return { inTryDeps, dependencies, filesDependencies };
  }
  catch (error) {
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
        ...constants.NPM_TOKEN,
        registry: getLocalRegistryURL(),
        cache: `${os.homedir()}/.npm`
      });
      await timers.setImmediate();
    }

    // Read the package.json at the root of the directory or archive.
    const { packageDeps, packageDevDeps, packageGyp } = await readManifest(dest, ref);

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
        .filter((name) => constants.EXT_JS.has(extname(name)))
        .map((file) => scanFile(dest, file, { name, ref }))
    );

    for (const result of fileAnalysisResults.filter((row) => row !== null)) {
      result.inTryDeps.forEach((dep) => inTryDeps.add(dep));
      result.dependencies.forEach((dep) => dependencies.add(dep));
      result.filesDependencies.forEach((dep) => filesDependencies.add(dep));
    }

    // Search for native code
    {
      const hasNativeFile = files.some((file) => NATIVE_CODE_EXTENSIONS.has(extname(file)));
      const hasNativePackage = hasNativeFile ? null : [
        ...new Set([...packageDevDeps, ...(packageDeps || [])])
      ].some((pkg) => NATIVE_NPM_PACKAGES.has(pkg));

      if (hasNativeFile || hasNativePackage || packageGyp) {
        ref.flags.push("hasNativeCode");
      }
    }

    if (ref.warnings.length > 0 && !ref.flags.includes("hasWarnings")) {
      ref.flags.push("hasWarnings");
    }
    const required = [...dependencies];

    if (packageDeps !== null) {
      const thirdPartyDependencies = required
        .map((name) => (packageDeps.includes(name) ? name : getPackageName(name)))
        .filter((name) => !name.startsWith("."))
        .filter((name) => !NODE_CORE_LIBS.has(name))
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
    // .map((depName) => {
    //     return files.includes(depName) ? depName : join(depName, "index.js");
    // })
      .map((depName) => (extname(depName) === "" ? `${depName}.js` : depName));
    ref.composition.required_nodejs = required.filter((name) => NODE_CORE_LIBS.has(name));

    if (ref.composition.minified.length > 0) {
      ref.flags.push("hasMinifiedCode");
    }

    const hasExternalCapacity = ref.composition.required_nodejs
      .some((depName) => constants.EXT_DEPS.has(depName));
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
  // Read the package.json file inside the extracted directory.
  let isProjectUsingESM = false;
  let localPackageName = packageName;
  {
    const packageStr = await fs.readFile(join(dest, "package.json"), "utf-8");
    const { type = "script", name } = JSON.parse(packageStr);
    isProjectUsingESM = type === "module";
    if (localPackageName === null) {
      localPackageName = name;
    }
  }

  // Get the tarball composition
  await timers.setImmediate();
  const { ext, files, size } = await getTarballComposition(dest);

  // Search for runtime dependencies
  const dependencies = Object.create(null);
  const minified = [];
  const warnings = [];

  const JSFiles = files.filter((name) => constants.EXT_JS.has(extname(name)));
  const allFilesContent = (await Promise.allSettled(JSFiles.map((file) => readJSFile(dest, file))))
    .filter((_p) => _p.status === "fulfilled").map((_p) => _p.value);

  // TODO: 2) handle dependency by file to not loose data.
  for (const [file, str] of allFilesContent) {
    try {
      const ASTAnalysis = runASTAnalysis(str, {
        module: extname(file) === ".mjs" ? true : isProjectUsingESM
      });
      ASTAnalysis.dependencies.removeByName(localPackageName);
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
