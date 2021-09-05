// Import Internal Dependencies
import {
  cleanRange, isSensitiveFile, getPackageName
} from "../src/utils/index.js";

describe("cleanRange", () => {
  it("should return cleaned SemVer range", () => {
    const r1 = cleanRange("0.1.0");
    const r2 = cleanRange("^1.0.0");
    const r3 = cleanRange(">=2.0.0");

    expect(r1).toStrictEqual("0.1.0");
    expect(r2).toStrictEqual("1.0.0");
    expect(r3).toStrictEqual("2.0.0");
  });
});

describe("isSensitiveFile", () => {
  it("should return true for sensitive files", () => {
    expect(isSensitiveFile(".npmrc")).toBe(true);
    expect(isSensitiveFile(".env")).toBe(true);
  });

  it("should return true for sensitive extensions", () => {
    expect(isSensitiveFile("lol.key")).toBe(true);
    expect(isSensitiveFile("bar.pem")).toBe(true);
  });

  it("should return false for classical extension or file name", () => {
    expect(isSensitiveFile("test.js")).toBe(false);
    expect(isSensitiveFile(".eslintrc")).toBe(false);
  });
});

describe("getPackageName", () => {
  it("should return the package name (first part before '/' character)", () => {
    expect(getPackageName("is/test")).toStrictEqual("is");
  });

  it("should return the package name with organization namespace", () => {
    expect(getPackageName("@slimio/is/test")).toStrictEqual("@slimio/is");
  });
});
