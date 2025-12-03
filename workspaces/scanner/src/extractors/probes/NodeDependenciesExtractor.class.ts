
// Import Internal Dependencies
import type {
  ManifestProbeExtractor
} from "../payload.ts";
import type { DependencyVersion } from "../../types.ts";

export type NodeDependenciesResult = {
  nodeDeps: string[];
};

export class NodeDependencies implements ManifestProbeExtractor<NodeDependenciesResult> {
  level = "manifest" as const;

  #nodeDeps = new Set<string>();

  next(
    _: string,
    version: DependencyVersion
  ) {
    const { composition } = version;

    composition.required_nodejs.forEach((dep) => {
      this.#nodeDeps.add(dep);
    });
  }

  done() {
    return {
      nodeDeps: [...this.#nodeDeps]
    };
  }
}
