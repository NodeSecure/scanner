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

    const arb = new Arborist({
      ...utils.NPM_TOKEN,
      path: location,
      registry
    });

    try {
      await fs.access(
        path.join(location, "node_modules")
      );

      await arb.loadActual();

      const treeNode = await arb.buildIdealTree();

      return TreeDependencies.fromArboristNode(treeNode, treeDepOptions);
    }
    catch {
      const treeNode = await arb.loadVirtual();

      return TreeDependencies.fromArboristNode(treeNode, treeDepOptions);
    }
  }
}
