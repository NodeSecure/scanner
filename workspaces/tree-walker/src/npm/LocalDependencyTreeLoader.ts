// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";

// Import Third-party Dependencies
import Arborist from "@npmcli/arborist";

// Import Internal Dependencies
import {
  TreeDependencies,
  type TreeDependenciesOptions
} from "./TreeDependencies.ts";
import * as utils from "../utils/index.ts";

export interface LocalDependencyTreeLoaderProvider {
  load(
    location: string,
    options?: LocalDependencyTreeLoaderOptions
  ): Promise<TreeDependencies>;
}

export interface LocalDependencyTreeLoaderOptions extends TreeDependenciesOptions {
  registry?: string;
}

export class LocalDependencyTreeLoader implements LocalDependencyTreeLoaderProvider {
  async load(
    location: string,
    options: LocalDependencyTreeLoaderOptions = {}
  ): Promise<TreeDependencies> {
    const { registry, ...treeDepOptions } = options;
    const resolvedLocation = await fs.realpath(location);

    const arb = new Arborist({
      ...utils.NPM_TOKEN,
      path: resolvedLocation,
      registry
    });

    try {
      await fs.access(
        path.join(resolvedLocation, "node_modules")
      );

      await arb.loadActual();

      if (!arb.actualTree) {
        throw new Error("arborist loadActual fn did not produce a tree");
      }

      return TreeDependencies.fromArboristNode(arb.actualTree, treeDepOptions);
    }
    catch {
      const treeNode = await arb.loadVirtual();

      return TreeDependencies.fromArboristNode(treeNode, treeDepOptions);
    }
  }
}
