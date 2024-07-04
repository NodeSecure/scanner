// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Require Third-party Dependencies
import is from "@slimio/is";

// Require Internal Dependencies
import { Dependency } from "../src/Dependency.class.js";

test("Dependency class should act as expected by assertions", () => {
  assert.ok(is.classObject(Dependency));

  const dep = new Dependency("semver", "1.0.0");
  assert.deepEqual(dep.parent, {});
  assert.strictEqual(dep.name, "semver");
  assert.strictEqual(dep.version, "1.0.0");
  assert.strictEqual(dep.spec, "semver@1.0.0");
  assert.strictEqual(dep.dev, false);
  assert.strictEqual(dep.dependencyCount, 0);
  assert.strictEqual(dep.existOnRemoteRegistry, true);
  assert.deepEqual(dep.warnings, []);
  assert.deepEqual(dep.alias, {});
  assert.strictEqual(dep.gitUrl, null);
  assert.strictEqual(Reflect.ownKeys(dep).length, 8);

  const flagOne = dep.flags;
  const flagTwo = dep.flags;
  assert.deepEqual(flagOne, flagTwo);
  assert.ok(flagOne !== flagTwo);
});

test("Dependency children should write his parent as usedBy when exported", () => {
  const semverDep = new Dependency("semver", "1.0.0");
  const testDep = new Dependency("test", "1.0.0", {
    parent: semverDep
  });

  assert.strictEqual(semverDep.dependencyCount, 1);
  assert.deepEqual(testDep.parent, {
    [semverDep.name]: semverDep.version
  });

  const flatDep = testDep.exportAsPlainObject(void 0);
  assert.strictEqual(flatDep.name, "test");
  assert.deepEqual(flatDep.usedBy, {
    [semverDep.name]: semverDep.version
  });
});

test("Create a dependency with one warning", () => {
  const semverDep = new Dependency("semver", "1.0.0");
  const fakeWarning = { foo: "bar" };
  semverDep.warnings.push(fakeWarning as any);

  const flatDep = semverDep.exportAsPlainObject(void 0);
  assert.deepEqual(flatDep.flags, ["hasWarnings"]);
  assert.strictEqual(flatDep.warnings[0], fakeWarning);
});

test("Create a GIT Dependency (flags.isGit must be set to true)", () => {
  const semverDep = new Dependency("semver", "1.0.0").isGit();
  assert.deepStrictEqual(semverDep.gitUrl, null);

  const flatSemver = semverDep.exportAsPlainObject(void 0);
  assert.ok(flatSemver.flags.includes("isGit"));

  const mochaDep = new Dependency("mocha", "1.0.0").isGit("https://github.com/mochajs/mocha");
  assert.strictEqual(mochaDep.gitUrl, "https://github.com/mochajs/mocha");

  const flatMocha = mochaDep.exportAsPlainObject(void 0);
  assert.ok(flatMocha.flags.includes("isGit"));
});

test("Dependency.addFlag should throw a TypeError if flagName is not string", () => {
  const semverDep = new Dependency("semver", "1.0.0");
  assert.throws(
    () => semverDep.addFlag(10 as any),
    {
      name: "TypeError",
      message: "flagName argument must be typeof string"
    }
  );
});

test("Dependency.addChildren must increment dependencyCount one by one", () => {
  const semverDep = new Dependency("semver", "1.0.0");
  assert.equal(semverDep.dependencyCount, 0);

  semverDep.addChildren();
  assert.equal(semverDep.dependencyCount, 1);
});
