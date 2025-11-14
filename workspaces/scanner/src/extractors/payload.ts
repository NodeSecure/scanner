// Import Third-party Dependencies
import type { Simplify } from "type-fest";
// @ts-ignore
import deepmerge from "@fastify/deepmerge";

// Import Internal Dependencies
import * as Scanner from "../types.js";
import { isNodesecurePayload } from "../utils/index.js";

// CONSTANTS
const kFastMerge = deepmerge({ all: true });

type MergeDeep<T extends unknown[]> =
    T extends [a: infer A, ...rest: infer R] ? A & MergeDeep<R> : {};

export type ExtractProbeResult<
  T extends ProbeExtractor<any>[]
> = {
  [K in keyof T]: T[K] extends ProbeExtractor<any> ? ReturnType<T[K]["done"]> : never;
};
export type MergedExtractProbeResult<
  T extends ProbeExtractor<any>[]
> = Simplify<MergeDeep<ExtractProbeResult<T>>>;

export type ProbeExtractorLevel = "packument" | "manifest";
export type ProbeExtractorManifestParent = {
  name: string;
  dependency: Scanner.Dependency;
};

export type PackumentProbeNextCallback = (name: string, dependency: Scanner.Dependency) => void;
export type ManifestProbeNextCallback = (
  spec: string,
  dependencyVersion: Scanner.DependencyVersion,
  parent: ProbeExtractorManifestParent) => void;

export interface ProbeExtractor<Defs> {
  level: ProbeExtractorLevel;
  next(...args: any[]): void;
  done(): Defs;
}

export interface PackumentProbeExtractor<Defs> extends ProbeExtractor<Defs> {
  level: "packument";
  next: PackumentProbeNextCallback;
}

export interface ManifestProbeExtractor<Defs> extends ProbeExtractor<Defs> {
  level: "manifest";
  next: ManifestProbeNextCallback;
}

export class Payload<T extends ProbeExtractor<any>[]> extends EventTarget {
  private dependencies: Scanner.Payload["dependencies"];
  private probes: Record<ProbeExtractorLevel, T>;
  private cachedResult: ExtractProbeResult<T>;

  constructor(
    data: Scanner.Payload | Scanner.Payload["dependencies"],
    probes: [...T]
  ) {
    super();
    this.dependencies = isNodesecurePayload(data) ?
      data.dependencies :
      data;

    this.probes = probes.reduce((data, probe) => {
      data[probe.level].push(probe);

      return data;
    }, { packument: [] as unknown as T, manifest: [] as unknown as T });
  }

  extract() {
    if (this.cachedResult) {
      return this.cachedResult;
    }

    for (const [name, dependency] of Object.entries(this.dependencies)) {
      this.probes.packument.forEach((probe) => probe.next(name, dependency));
      this.emit("packument", name, dependency);

      if (this.probes.manifest.length > 0) {
        for (const [spec, depVersion] of Object.entries(dependency.versions)) {
          this.probes.manifest.forEach((probe) => probe.next(spec, depVersion, { name, dependency }));
          this.emit("manifest", spec, depVersion, { name, dependency });
        }
      }
    }

    this.cachedResult = [
      ...this.probes.packument.map((probe) => probe.done()),
      ...this.probes.manifest.map((probe) => probe.done())
    ] as ExtractProbeResult<T>;

    return this.cachedResult;
  }

  extractAndMerge() {
    return kFastMerge(
      ...this.extract()
    ) as unknown as MergedExtractProbeResult<T>;
  }

  emit<T extends ProbeExtractorLevel>(
    event: T,
    ...extractionDetails: unknown[]
  ) {
    const customEvent = new CustomEvent(event, {
      detail: extractionDetails
    });
    this.dispatchEvent(customEvent);
  }

  on<T extends ProbeExtractorLevel>(
    e: T,
    listener: ExtractorListener<T>
  ): this {
    function wrappedListener(event: Event) {
      const customEvent = event as CustomEvent<ExtractorCallbackParams<T>>;
      listener(...customEvent.detail);
    }
    this.addEventListener(e, wrappedListener);

    return this;
  }
}

export const Callbacks = {
  packument(
    callback: PackumentProbeNextCallback
  ): PackumentProbeExtractor<void> {
    return {
      level: "packument" as const,
      next: callback,
      done: noop
    };
  },
  manifest(
    callback: ManifestProbeNextCallback
  ): ManifestProbeExtractor<void> {
    return {
      level: "manifest" as const,
      next: callback,
      done: noop
    };
  }
} as const;

type ExtractorCallback<T extends ProbeExtractorLevel> = Parameters<
  (typeof Callbacks)[T]
>[0];

export type ExtractorCallbackParams<T extends ProbeExtractorLevel> = Parameters<
  ExtractorCallback<T>
>;

export type ExtractorListener<T extends ProbeExtractorLevel> = (
  ...events: CustomEvent<ExtractorCallbackParams<T>>["detail"]
) => void;

function noop() {
  return void 0;
}
