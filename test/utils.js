// Require Node.js Dependencies
import { rmSync } from "fs";
import os from "os";
import { join } from "path";

// Require Internal Dependencies
import {
  cleanRange, writeNsecureCache, loadNsecureCache, getRegistryURL, isSensitiveFile
} from "../src/utils/index.js";

test("should return cleaned SemVer range", () => {
  const r1 = cleanRange("0.1.0");
  const r2 = cleanRange("^1.0.0");
  const r3 = cleanRange(">=2.0.0");

  expect(r1).toStrictEqual("0.1.0");
  expect(r2).toStrictEqual("1.0.0");
  expect(r3).toStrictEqual("2.0.0");
});

test("node-secure cache", () => {
  const filePath = join(os.tmpdir(), "nsecure-cache.json");
  rmSync(filePath, { force: true });

  const result = loadNsecureCache();
  expect(Reflect.has(result, "lastUpdated")).toBe(true);

  writeNsecureCache();

  const result2 = loadNsecureCache();
  expect(Reflect.has(result2, "lastUpdated")).toBe(true);
});

test("getRegistryURL should return the npm registry URL", async() => {
  const result = getRegistryURL();
  expect(result).toStrictEqual("https://registry.npmjs.org/");
  expect(getRegistryURL()).toStrictEqual("https://registry.npmjs.org/");
});

test("isSensitiveFile", () => {
  expect(isSensitiveFile(".npmrc")).toBe(true);
  expect(isSensitiveFile("lol.key")).toBe(true);
});
