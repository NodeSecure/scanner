// Import Internal Dependencies
import { getPackageName } from "../../src/utils/index.js";

describe("getPackageName", () => {
  it("should return the package name (if there is not slash char at all)", () => {
    expect(getPackageName("is")).toStrictEqual("is");
  });

  it("should return the package name (first part before '/' character)", () => {
    expect(getPackageName("is/test")).toStrictEqual("is");
  });

  it("should return the package name with organization namespace", () => {
    expect(getPackageName("@slimio/is/test")).toStrictEqual("@slimio/is");
  });
});
