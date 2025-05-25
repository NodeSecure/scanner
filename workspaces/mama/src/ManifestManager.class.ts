// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";

// Import Third-party Dependencies
import { parseAuthor } from "@nodesecure/utils";
import type {
  PackumentVersion,
  PackageJSON,
  WorkspacesPackageJSON,
  Contact
} from "@nodesecure/npm-types";

// Import Internal Dependencies
import { packageJSONIntegrityHash } from "./utils/index.js";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type NonOptionalPackageJSONProperties =
  "dependencies" |
  "devDependencies" |
  "scripts" |
  "gypfile";

// CONSTANTS
const kNativeNpmPackages = new Set([
  "node-gyp",
  "node-pre-gyp",
  "node-gyp-build",
  "node-addon-api"
]);

/**
 * @see https://www.nerdycode.com/prevent-npm-executing-scripts-security/
 */
export const kUnsafeNPMScripts = new Set([
  "install",
  "preinstall",
  "postinstall",
  "preuninstall",
  "postuninstall"
]);

export type ManifestManagerDefaultProperties = Required<
  Pick<PackumentVersion, NonOptionalPackageJSONProperties>
>;

export type ManifestManagerDocument =
  PackageJSON |
  WorkspacesPackageJSON |
  PackumentVersion;

export interface ManifestManagerOptions {
  location?: string;
  // D'autres options pourront être ajoutées ici plus tard
}

export class ManifestManager<
  MetadataDef extends Record<string, any> = Record<string, any>
> {
  static Default: Readonly<ManifestManagerDefaultProperties> = Object.freeze({
    dependencies: {},
    devDependencies: {},
    scripts: {},
    gypfile: false
  });

  public metadata: MetadataDef = Object.create(null);
  public document: WithRequired<
    ManifestManagerDocument,
    NonOptionalPackageJSONProperties
  >;
  public location?: string;

  public flags = Object.seal({
    hasUnsafeScripts: false,
    isNative: false
  });

  constructor(
    document: ManifestManagerDocument,
    options: ManifestManagerOptions = {}
  ) {
    this.document = Object.assign(
      { ...ManifestManager.Default },
      structuredClone(document)
    );
    this.location = options.location;

    this.flags.isNative = [
      ...this.dependencies,
      ...this.devDependencies
    ].some((pkg) => kNativeNpmPackages.has(pkg)) || this.document.gypfile;
    this.flags.hasUnsafeScripts = Object
      .keys(this.document.scripts)
      .some((script) => kUnsafeNPMScripts.has(script.toLowerCase()));
  }

  get hasZeroSemver() {
    if (typeof this.document.version === "string") {
      return /^0(\.\d+)*$/
        .test(this.document.version);
    }

    return false;
  }

  get nodejsImports() {
    return this.document.imports ?? {};
  }

  get dependencies() {
    return Object.keys(this.document.dependencies);
  }

  get devDependencies() {
    return Object.keys(this.document.devDependencies);
  }

  get spec(): `${string}@${string}` {
    const hasBothProperties = ["name", "version"]
      .every((key) => key in this.document);
    if (this.isWorkspace && !hasBothProperties) {
      throw new Error("spec is not available for the given workspace");
    }

    return `${this.document.name}@${this.document.version}`;
  }

  get author(): Contact | null {
    return parseAuthor(this.document.author);
  }

  get isWorkspace(): boolean {
    return "workspaces" in this.document;
  }

  get integrity(): string {
    if (this.isWorkspace) {
      throw new Error("integrity is not available for workspaces");
    }

    return packageJSONIntegrityHash(this.document);
  }

  get license(): string | null {
    if (this.document.license) {
      if (typeof this.document.license === "string") {
        return this.document.license;
      }

      if (typeof this.document.license === "object") {
        return this.document.license.type ?? null;
      }
    }

    if (this.document.licenses) {
      if (Array.isArray(this.document.licenses)) {
        return this.document.licenses[0]?.type ?? null;
      }

      if (typeof this.document.licenses === "object") {
        return this.document.licenses.type ?? null;
      }
    }

    return null;
  }

  * getEntryFiles(): IterableIterator<string> {
    if (this.document.main) {
      yield this.document.main;
    }

    if (!this.document.exports) {
      return;
    }

    if (typeof this.document.exports === "string") {
      yield this.document.exports;
    }
    else {
      yield* this.extractNodejsExport(this.document.exports);
    }
  }

  private* extractNodejsExport(
    exports: Record<string, string | null | Record<string, string | null>>
  ): IterableIterator<string> {
    for (const node of Object.values(exports)) {
      if (node === null) {
        continue;
      }

      if (typeof node === "string") {
        yield node;
      }
      else {
        yield* this.extractNodejsExport(node);
      }
    }
  }

  static async fromPackageJSON(
    location: string
  ): Promise<ManifestManager> {
    if (typeof location !== "string") {
      throw new TypeError("location must be a string primitive");
    }

    const packageLocation = location.endsWith("package.json") ?
      path.join(path.dirname(location), "package.json") :
      path.join(location, "package.json");
    const packageStr = await fs.readFile(packageLocation, "utf-8");

    try {
      const packageJSON = JSON.parse(
        packageStr
      ) as PackageJSON | WorkspacesPackageJSON;

      return new ManifestManager(
        packageJSON,
        { location }
      );
    }
    catch (cause) {
      throw new Error(
        `Failed to parse package.json located at: ${packageLocation}`,
        { cause }
      );
    }
  }
}
