// Import Node.js Dependencies
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { scanOrganization } from "../../src/github/index.js";

const githubToken = process.env.GITHUB_TOKEN;

const kSkipTest = !githubToken;
const kTestOptions = {
  skip: kSkipTest ? "Skipping test because GITHUB_TOKEN is not set" : false
};

describe("scanOrganization", () => {
  test("should retrieve repositories and their dependencies", kTestOptions, async() => {
    const results = await scanOrganization({
      orgName: "NodeSecure",
      githubToken,
      onProgress: (repo) => {
        console.log(`- scanning repository: ${repo.name}`);
      }
    });

    assert.ok(Array.isArray(results), "should return an array");
    assert.ok(results.length > 0, "should return at least one repository");

    const repo = results[0];
    assert.ok(repo.name, "should have name");
    assert.ok(repo.url, "should have url");
    assert.ok(typeof repo.dependencies === "object", "should have dependencies object");
    assert.ok(typeof repo.devDependencies === "object", "should have devDependencies object");
    assert.ok(typeof repo.optionalDependencies === "object", "should have optionalDependencies object");
    assert.ok(typeof repo.peerDependencies === "object", "should have peerDependencies object");
  });

  test("should handle invalid organization gracefully", kTestOptions, async() => {
    await assert.rejects(
      async() => await scanOrganization({
        orgName: "ThisOrganizationShouldNotExist" + Date.now(),
        githubToken
      }),
      "should throw for invalid organization"
    );
  });
});
