// Import Internal Dependencies
import { isSensitiveFile } from "../../src/utils/index.js";

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
