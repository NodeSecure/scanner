// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";

// Import Third-party Dependencies
import { parseAuthor } from "@nodesecure/utils";
import type {
  PackumentVersion, PackageJSON, WorkspacesPackageJSON, Contact
} from "@nodesecure/npm-types";

// Import Internal Dependencies
import { packageJSONIntegrityHash } from "./utils/index.js";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

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

  public flags = Object.seal({
    hasUnsafeScripts: false,
    isNative: false
  });

  constructor(
    document: ManifestManagerDocument
  ) {
    this.document = Object.assign(
      { ...ManifestManager.Default },
      structuredClone(document)
    );

    this.flags.isNative = [
      ...this.dependencies,
      ...this.devDependencies
    ].some((pkg) => kNativeNpmPackages.has(pkg)) || this.document.gypfile;
    this.flags.hasUnsafeScripts = Object
      .keys(this.document.scripts)
      .some((script) => kUnsafeNPMScripts.has(script.toLowerCase()));
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

  static async fromPackageJSON(
    location: string
  ): Promise<ManifestManager> {
    if (typeof location !== "string") {
      throw new TypeError("location must be a string primitive");
    }

    const packageLocation = location.endsWith("package.json") ?
      location :
      path.join(location, "package.json");
    const packageStr = await fs.readFile(packageLocation, "utf-8");

    try {
      const packageJSON = JSON.parse(
        packageStr
      ) as PackageJSON | WorkspacesPackageJSON;

      return new ManifestManager(
        packageJSON
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
