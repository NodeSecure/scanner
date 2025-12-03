// Import Node.js Dependencies
import { afterEach, beforeEach, describe, it } from "node:test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Import Internal Dependencies
import {
  LocalDependencyTreeLoader
} from "../../src/npm/LocalDependencyTreeLoader.ts";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturesDir = path.join(__dirname, "..", "fixtures");

describe("LocalDependencyTreeLoader", () => {
  describe("arborist.loadVirtual()", () => {
    it("should load a simple dependency tree using package-lock.json", async() => {
      const treeLoader = new LocalDependencyTreeLoader();

      const { dependencies } = await treeLoader.load(
        path.join(kFixturesDir, "tree-loader-virtual")
      );

      const dependenciesName = Array.from(dependencies.keys());
      assert.deepEqual(
        dependenciesName,
        ["@types/node"]
      );
    });
  });

  describe("arborist.loadActual()", () => {
    let npmLocalProjectCloneLocation: string;

    beforeEach(() => {
      npmLocalProjectCloneLocation = fs.mkdtempSync(
        path.join(os.tmpdir(), "local-dep-tree-loader-")
      );
    });

    afterEach(() => {
      fs.rmSync(npmLocalProjectCloneLocation, { recursive: true, force: true });
    });

    it("should load a simple dependency tree using node_modules", async() => {
      copyAndInstall(
        path.join(kFixturesDir, "tree-loader-virtual"),
        npmLocalProjectCloneLocation
      );
      const treeLoader = new LocalDependencyTreeLoader();

      const { dependencies } = await treeLoader.load(npmLocalProjectCloneLocation);

      const dependenciesName = Array.from(dependencies.keys());
      assert.deepEqual(
        dependenciesName,
        ["@types/node"]
      );
    });
  });
});

interface CopyAndInstallOptions {
  /**
   * @default true
   */
  removePackageLock?: boolean;
}

function copyAndInstall(
  source: string,
  destination: string,
  options: CopyAndInstallOptions = {}
) {
  const { removePackageLock = true } = options;

  fs.copyFileSync(
    path.join(source, "package.json"),
    path.join(destination, "package.json")
  );

  spawnSync(
    [
      `npm${process.platform === "win32" ? ".cmd" : ""}`,
      "install",
      "--prefer-offline",
      "--no-audit"
    ].join(" "),
    {
      cwd: destination,
      shell: true
    }
  );

  if (removePackageLock) {
    fs.rmSync(
      path.join(destination, "package-lock.json"),
      { force: true }
    );
  }
}
