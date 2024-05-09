// Import Third-party Dependencies
import * as JSXRay from "@nodesecure/js-x-ray";

export class Dependency {
  static currentId = 1;

  public gitUrl: null | string = null;
  public dependencyCount = 0;
  public warnings: JSXRay.Warning<JSXRay.WarningDefault>[] = [];
  public name: string;
  public version: string;
  public dev = false;
  public existOnRemoteRegistry = true;
  public alias: Record<string, string> = {};

  #flags = new Set<string>();
  #parent: null | Dependency = null;

  constructor(
    name: string,
    version: string,
    parent: null | Dependency = null
  ) {
    this.name = name;
    this.version = version;

    if (parent !== null) {
      parent.addChildren();
    }
    this.#parent = parent;
  }

  addChildren() {
    this.dependencyCount += 1;
  }

  get fullName() {
    return `${this.name} ${this.version}`;
  }

  get flags() {
    return [...this.#flags];
  }

  get parent() {
    return this.#parent === null ? {} : { [this.#parent.name]: this.#parent.version };
  }

  addFlag(flagName: string, predicate = true) {
    if (typeof flagName !== "string") {
      throw new TypeError("flagName argument must be typeof string");
    }

    if (predicate) {
      if (flagName === "hasDependencies" && this.#parent !== null) {
        this.#parent.addFlag("hasIndirectDependencies");
      }

      this.#flags.add(flagName);
    }
  }

  isGit(url?: string) {
    this.#flags.add("isGit");
    if (typeof url === "string") {
      this.gitUrl = url;
    }

    return this;
  }

  exportAsPlainObject(customId?: number) {
    if (this.warnings.length > 0) {
      this.addFlag("hasWarnings");
    }

    return {
      versions: {
        [this.version]: {
          id: typeof customId === "number" ? customId : Dependency.currentId++,
          usedBy: this.parent,
          isDevDependency: this.dev,
          existOnRemoteRegistry: this.existOnRemoteRegistry,
          flags: this.flags,
          description: "",
          size: 0,
          author: null,
          engines: {},
          repository: {},
          scripts: {},
          warnings: this.warnings,
          composition: {
            extensions: [],
            files: [],
            minified: [],
            unused: [],
            missing: [],
            alias: this.alias,
            required_files: [],
            required_nodejs: [],
            required_thirdparty: [],
            required_subpath: []
          },
          license: "unkown license",
          gitUrl: this.gitUrl
        }
      },
      vulnerabilities: [],
      metadata: {
        dependencyCount: this.dependencyCount,
        publishedCount: 0,
        lastUpdateAt: new Date(),
        lastVersion: "N/A",
        hasChangedAuthor: false,
        hasManyPublishers: false,
        hasReceivedUpdateInOneYear: true,
        homepage: null,
        author: null,
        publishers: [],
        maintainers: [],
        integrity: {}
      }
    };
  }
}
