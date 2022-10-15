export default class Dependency {
  #flags = new Set();
  #parent = null;

  constructor(name, version, parent = null) {
    this.gitUrl = null;
    this.dependencyCount = 0;
    this.warnings = [];
    this.name = name;
    this.version = version;
    this.dev = false;
    this.existOnRemoteRegistry = true;
    this.alias = {};

    if (parent !== null) {
      parent.dependencyCount++;
    }
    this.#parent = parent;
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

  addFlag(flagName, predicate = true) {
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

  isGit(url) {
    this.#flags.add("isGit");
    if (typeof url === "string") {
      this.gitUrl = url;
    }

    return this;
  }

  exportAsPlainObject(customId) {
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
          author: {},
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
        lastUpdateAt: null,
        lastVersion: null,
        hasManyPublishers: false,
        hasReceivedUpdateInOneYear: true,
        homepage: null,
        author: {},
        publishers: [],
        maintainers: []
      }
    };
  }
}

Dependency.currentId = 1;
