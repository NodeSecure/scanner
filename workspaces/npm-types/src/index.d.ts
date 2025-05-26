/**
 * @see https://github.com/npm/types/blob/main/types/index.d.ts
 */

export type Spec = `${string}@${string}`;

export interface Contact {
  email?: string;
  url?: string;
  name: string;
}

export interface Signature {
  keyid: string;
  sig: string;
}

export interface Repository {
  directory?: string;
  type?: string;
  url: string;
}

export interface Dist {
  /**
   * the url to the tarball for the package version
   */
  tarball: string;
  /**
   * the sha1 sum of the tarball
   */
  shasum: string;
  /**
   * subresource integrity string! `npm view ssri`
   * https://w3c.github.io/webappsec-subresource-integrity/
   */
  integrity?: string;
  /**
   * the number of files in the tarball. this is on most packages published >= 2018
   */
  fileCount?: number;
  /**
   * the unpacked size of the files in the tarball. >= 2018
   */
  unpackedSize?: number;
  /**
   * pgp signed package signature
   * https://blog.npmjs.org/post/172999548390/new-pgp-machinery
   */
  "npm-signature"?: string;
  /**
   * NPM Provenance
   *
   * @see https://docs.npmjs.com/generating-provenance-statements
   */
  attestations?: {
    url: string;
    provenance: {
      predicateType: string;
    }
  };
  signatures?: Signature[];
}

export type ConditionalNodeExport<V = never> = Partial<Record<
  "node-addons" | "node" | "import" | "require" | "default",
  V | string
>>;

export type NodeExport<V = never> =
  ConditionalNodeExport<V> &
  Record<string, ConditionalNodeExport | string | null>;

export type NodeImport =
  { node: string } |
  { default: string } |
  { node: string, default: string };

export interface PackageJSONLicense {
  type?: string | undefined | null;
}

interface BasePackageJSON {
  author?: Contact | string;
  bin?: Record<string, string>;
  browser?: Record<string, string> | string;
  bugs?: Omit<Contact, "name"> | string;
  bundledDependencies?: string[] | boolean;
  bundleDependencies?: string[] | boolean;
  config?: Record<string, unknown>;
  contributors?: Contact[] | string[];
  cpu?: string[];
  dependencies?: Record<string, string>;
  description?: string;
  devDependencies?: Record<string, string>;
  directories?: Record<string, string>;
  engines?: Record<string, string>;
  files?: string[];
  homepage?: string;
  keywords?: string[];
  license?: string | PackageJSONLicense;
  licenses?: PackageJSONLicense[] | PackageJSONLicense;
  man?: string | string[];
  optionalDependencies?: Record<string, string>;
  os?: string[];
  peerDependencies?: Record<string, string>;
  private?: boolean;
  publishConfig?: Record<string, unknown>;
  repository?: Repository | string;
  scripts?: Record<string, string>;
  types?: string;

  /**
   * @see https://nodejs.org/api/packages.html#nodejs-packagejson-field-definitions
   * Node.js package.json field definitions
   */
  main?: string;
  type?: "commonjs" | "module";
  packageManager?: string;
  imports?: Record<`#${string}`, string | NodeImport>;
  exports?: string | NodeExport<NodeExport>;

  // Others
  gypfile?: boolean;

  [field: string]: unknown;
}

// this is in the tarball or the project. it really could have anything in it.
export interface PackageJSON extends BasePackageJSON {
  name: string;
  version: string;
}

export interface WorkspacesPackageJSON extends BasePackageJSON {
  name?: string;
  version?: string;
  workspaces: string[];
}

export interface PackumentVersion extends PackageJSON {
  // bugs, author, contributors, and repository can be simple strings in
  // package.json, but not in registry metadata.
  bugs?: Omit<Contact, "name">;
  author?: Contact;
  // ref: Record type found in uuid@1.4.1 et al
  browser?: Record<string, string>;
  contributors?: Contact[];
  repository?: Repository;
  gitHead?: string;
  _id: string;
  _npmVersion: string;
  _nodeVersion: string;
  _npmUser: Contact;
  maintainers?: Contact[];
  dist: Dist;
  readme?: string;
  readmeFileName?: string;
  _hasShrinkwrap?: boolean;
  deprecated?: string;
  _engineSupported?: boolean;
  _defaultsLoaded?: boolean;
  _npmOperationalInternal?: {
    host: string;
    tmp: string;
  }
}

export type Packument = {
  _cached?: boolean;
  _id: string;
  _rev: string;
  "dist-tags": {
    latest?: string
  } & Record<string, string>;
  time: {
    modified: string;
    created: string;
  } & Record<string, string>;
  users?: Record<string, true>;
  versions: Record<string, PackumentVersion>;
} & Pick<
  PackumentVersion,
  | "author"
  | "bugs"
  | "contributors"
  | "description"
  | "homepage"
  | "keywords"
  | "license"
  | "maintainers"
  | "name"
  | "readme"
  | "readmeFilename"
  | "repository"
>

export interface ManifestResult {
  /**
   * A normalized form of the spec passed in as an argument.
   */
  _from: string;
  /**
   * The tarball url or file path where the package artifact can be found.
   */
  _resolved: string;
  /**
   * The integrity value for the package artifact.
   */
  _integrity: string;
  /**
   * The canonical spec of this package version: name@version.
   */
  _id: string;
}

export type ManifestVersion = Pick<
  PackumentVersion,
  | "_hasShrinkwrap"
  | "bin"
  | "bundleDependencies"
  | "bundledDependencies"
  | "dependencies"
  | "deprecated"
  | "devDependencies"
  | "directories"
  | "dist"
  | "engines"
  | "name"
  | "optionalDependencies"
  | "peerDependencies"
  | "version"
>

/**
 * abbreviated metadata format (aka corgi)
 *
 * https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-metadata-format
 * returned from registry requests with accept header values conianing
 * `application/vnd.npm.install-v1+json`
 */
export type Manifest = {
  modified: string
  versions: Record<string, ManifestVersion>
} & Pick<Packument, "_cached" | "name" | "dist-tags">

/**
 * @see https://docs.npmjs.com/cli/v7/commands/npm-pack
 */
export type PackTarball = {
  id: string;
  name: string;
  version: string;
  size: number;
  unpackedSize: number;
  shasum: string;
  integrity: string;
  entryCount: number;
  filename: string;
  files: {
    path: string;
    size: number;
    mode: number;
  }[];
  bundled: string[];
}
