// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isGitDependency } from "../../src/utils/index.js";

test("isGitDependency should return true for git related package versions", (tape) => {
  tape.true(isGitDependency("git+ssh://git@github.com:npm/cli.git#v1.0.27"));
  tape.true(isGitDependency("git+ssh://git@github.com:npm/cli#semver:^5.0"));
  tape.true(isGitDependency("git+https://isaacs@github.com/npm/cli.git"));
  tape.true(isGitDependency("git://github.com/npm/cli.git#v1.0.27"));
  tape.true(isGitDependency("github:NodeSecure/scanner"));

  tape.end();
});

test("isGitDependency should return false for non git related package versions", (tape) => {
  tape.false(isGitDependency(">=1.0.2 <2.1.2"));
  tape.false(isGitDependency("1.0.0 - 2.9999.9999"));
  tape.false(isGitDependency(">1.0.2 <=2.3.4"));
  tape.false(isGitDependency("2.0.1"));
  tape.false(isGitDependency("<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0"));
  tape.false(isGitDependency("http://asdf.com/asdf.tar.gz"));
  tape.false(isGitDependency("~1.2"));
  tape.false(isGitDependency("~1.2.3"));
  tape.false(isGitDependency("2.x"));
  tape.false(isGitDependency("3.3.x"));
  tape.false(isGitDependency("latest"));
  tape.false(isGitDependency("file:../dyl"));

  tape.end();
});
