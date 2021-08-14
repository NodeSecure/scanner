// Require Node.js Dependencies
import { rmSync } from "fs";
import os from "os";
import { join } from "path";

// Require Internal Dependencies
import {
  cleanRange, isSensitiveFile
} from "../src/utils/index.js";

test("should return cleaned SemVer range", () => {
  const r1 = cleanRange("0.1.0");
  const r2 = cleanRange("^1.0.0");
  const r3 = cleanRange(">=2.0.0");

  expect(r1).toStrictEqual("0.1.0");
  expect(r2).toStrictEqual("1.0.0");
  expect(r3).toStrictEqual("2.0.0");
});

test("isSensitiveFile", () => {
  expect(isSensitiveFile(".npmrc")).toBe(true);
  expect(isSensitiveFile("lol.key")).toBe(true);
});
