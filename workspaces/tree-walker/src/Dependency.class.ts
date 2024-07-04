// Import Third-party Dependencies
import * as JSXRay from "@nodesecure/js-x-ray";

export type NpmSpec = `${string}@${string}`;

export interface DependencyJSON {
  id: number;
  name: string;
  version: string;
  usedBy: Record<string, string>;
  isDevDependency: boolean;
  existOnRemoteRegistry: boolean;
  flags: string[];
  warnings: JSXRay.Warning<JSXRay.WarningDefault>[];
  alias: Record<string, string>;
  dependencyCount: number;
  gitUrl: string | null;
}

export type DependencyOptions = {
  parent?: Dependency;
} & Partial<Omit<DependencyJSON, "id" | "name" | "version">>;

export class Dependency {
  static currentId = 1;

  public name: string;
  public version: string;
  public dev = false;
  public existOnRemoteRegistry = true;
  public dependencyCount = 0;
  public gitUrl: null | string = null;
  public warnings: JSXRay.Warning<JSXRay.WarningDefault>[] = [];
  public alias: Record<string, string> = {};

  #flags = new Set<string>();
  #parent: null | Dependency = null;

  constructor(
    name: string,
    version: string,
    options: DependencyOptions = {}
  ) {
    this.name = name;
    this.version = version;
    const { parent = null, ...props } = options;

    if (parent !== null) {
      parent.addChildren();
    }
    this.#parent = parent;

    Object.assign(this, props);
  }

  addChildren() {
    this.dependencyCount += 1;
  }

  get spec(): NpmSpec {
    return `${this.name}@${this.version}`;
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

  exportAsPlainObject(customId?: number): DependencyJSON {
    if (this.warnings.length > 0) {
      this.addFlag("hasWarnings");
    }

    return {
      id: typeof customId === "number" ? customId : Dependency.currentId++,
      name: this.name,
      version: this.version,
      usedBy: this.parent,
      isDevDependency: this.dev,
      existOnRemoteRegistry: this.existOnRemoteRegistry,
      flags: this.flags,
      warnings: this.warnings,
      dependencyCount: this.dependencyCount,
      gitUrl: this.gitUrl,
      alias: this.alias
    };
  }
}
