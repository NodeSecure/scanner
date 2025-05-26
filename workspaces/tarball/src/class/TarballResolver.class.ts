// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomBytes } from "node:crypto";

// Import Third-party Dependencies
import pacote from "pacote";
import { ManifestManager } from "@nodesecure/mama";

// CONSTANTS
const kNpmToken = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};

export interface TarballResolutionOptions {
  registry?: string;
  isRemote?: boolean;
}

export class TarballResolver {
  location: string | undefined;

  get id(): string {
    return this.location?.slice(-6) ?? randomBytes(6).toString("hex");
  }

  async resolve(
    spec: string,
    location = process.cwd(),
    options: TarballResolutionOptions = {}
  ): Promise<ManifestManager> {
    const { registry, isRemote = false } = options;

    if (isRemote && this.location) {
      const location = path.join(this.location, spec);

      await pacote.extract(spec, location, {
        ...kNpmToken,
        registry,
        cache: `${os.homedir()}/.npm`
      });

      return ManifestManager.fromPackageJSON(location);
    }

    return ManifestManager.fromPackageJSON(location);
  }

  async initialize() {
    this.location = await fs.mkdtemp(
      path.join(os.tmpdir(), "/")
    );

    return this;
  }

  async clear() {
    if (this.location) {
      await fs.rm(
        this.location,
        { recursive: true, force: true }
      );
      this.location = undefined;
    }

    return this;
  }
}

