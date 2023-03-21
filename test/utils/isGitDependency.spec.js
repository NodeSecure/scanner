// Require Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { isGitDependency } from "../../src/utils/index.js";

describe("isGitDependency", () => {
  it("isGitDependency should return true for git related package versions", () => {
    assert.ok(isGitDependency("git+ssh://git@github.com:npm/cli.git#v1.0.27"));
    assert.ok(isGitDependency("git+ssh://git@github.com:npm/cli#semver:^5.0"));
    assert.ok(isGitDependency("git+https://isaacs@github.com/npm/cli.git"));
    assert.ok(isGitDependency("git://github.com/npm/cli.git#v1.0.27"));
    assert.ok(isGitDependency("github:NodeSecure/scanner"));
  });

  it("isGitDependency should return false for non git related package versions", () => {
    assert.ok(!isGitDependency(">=1.0.2 <2.1.2"));
    assert.ok(!isGitDependency("1.0.0 - 2.9999.9999"));
    assert.ok(!isGitDependency(">1.0.2 <=2.3.4"));
    assert.ok(!isGitDependency("2.0.1"));
    assert.ok(!isGitDependency("<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0"));
    assert.ok(!isGitDependency("http://asdf.com/asdf.tar.gz"));
    assert.ok(!isGitDependency("~1.2"));
    assert.ok(!isGitDependency("~1.2.3"));
    assert.ok(!isGitDependency("2.x"));
    assert.ok(!isGitDependency("3.3.x"));
    assert.ok(!isGitDependency("latest"));
    assert.ok(!isGitDependency("file:../dyl"));
  });
});
