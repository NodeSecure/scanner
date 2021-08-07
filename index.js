// Import Node.js Dependencies
import path from "path";
import fs from "fs/promises";
import timers from "timers/promises";
import os from "os";

// Import Third-party Dependencies
import pacote from "pacote";

// Import Internal Dependencies
import { depWalker } from "./src/depWalker.js";
import { analyseGivenLocation } from "./src/tarball.js";
import { DEFAULT_REGISTRY_ADDR } from "./src/utils/index.js";
import { setVulnerabilityStrategy } from "./src/vulnerabilities/vulnerabilitySource.js";
import { VULN_MODE_DB_SECURITY_WG, VULN_MODE_NPM_AUDIT } from "./src/vulnerabilities/strategies.js";

export async function cwd(cwd = process.cwd(), options) {
  const packagePath = path.join(cwd, "package.json");
  const str = await fs.readFile(packagePath, "utf-8");
  options.forceRootAnalysis = true;
  if (!("usePackageLock" in options)) {
    options.usePackageLock = true;
  }

  setVulnerabilityStrategy("vulnerabilityStrategy" in options ? options.vulnerabilityStrategy : VULN_MODE_NPM_AUDIT);

  return depWalker(JSON.parse(str), options);
}

export async function from(packageName, options) {
  const token = typeof process.env.NODE_SECURE_TOKEN === "string" ? { token: process.env.NODE_SECURE_TOKEN } : {};
  const manifest = await pacote.manifest(packageName, token);

  setVulnerabilityStrategy("vulnerabilityStrategy" in options ? options.vulnerabilityStrategy : VULN_MODE_DB_SECURITY_WG);

  return depWalker(manifest, options);
}

export async function verify(packageName = null) {
  if (typeof packageName === "undefined" || packageName === null) {
    const analysisPayload = await analyseGivenLocation(process.cwd());

    return analysisPayload;
  }

  const token = typeof process.env.NODE_SECURE_TOKEN === "string" ? { token: process.env.NODE_SECURE_TOKEN } : {};
  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));
  const dest = path.join(tmpLocation, packageName);

  try {
    await pacote.extract(packageName, dest, {
      ...token, registry: DEFAULT_REGISTRY_ADDR, cache: `${os.homedir()}/.npm`
    });
    const analysisPayload = await analyseGivenLocation(dest, packageName);

    return analysisPayload;
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}
