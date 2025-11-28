/* eslint-disable func-style */
// Import Third-party Dependencies
import Arborist from "@npmcli/arborist";
import * as iter from "itertools";

type EdgeOut = [string, Arborist.Edge];

export interface TreeDependenciesOptions {
  includeDevDeps?: boolean;
}

export class TreeDependencies {
  dependencies: Map<string, Arborist.Node>;

  static fromArboristNode(
    node: Arborist.Node,
    options: TreeDependenciesOptions = {}
  ): TreeDependencies {
    const { includeDevDeps = false } = options;

    const shouldIncludeEdge = ([packageName, edge]: EdgeOut) => {
      const { to } = edge;
      if (to === null) {
        return [];
      }

      const shouldInclude = includeDevDeps || to.dev === false || to.isWorkspace;
      if (!shouldInclude) {
        return [];
      }

      const targetNode = to.isWorkspace ? to.target : to;

      return [[packageName, targetNode] as const];
    };

    const dependencies = new Map(
      iter.flatmap(node.edgesOut.entries(), shouldIncludeEdge)
    );

    return new TreeDependencies(dependencies);
  }

  constructor(
    dependencies: Map<string, Arborist.Node>
  ) {
    this.dependencies = dependencies;
  }
}
