// Require Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

// Require Internal Dependencies
import Dependency from "../src/dependency.class.js";

test("Dependency class should act as expected by assertions", (tape) => {
  tape.true(is.classObject(Dependency));

  const dep = new Dependency("semver", "1.0.0");
  tape.deepEqual(dep.parent, {});
  tape.strictEqual(dep.name, "semver");
  tape.strictEqual(dep.version, "1.0.0");
  tape.strictEqual(dep.fullName, "semver 1.0.0");
  tape.strictEqual(dep.dependencyCount, 0);
  tape.deepEqual(dep.warnings, []);
  tape.strictEqual(dep.gitUrl, null);
  tape.strictEqual(Reflect.ownKeys(dep).length, 5);

  const flagOne = dep.flags;
  const flagTwo = dep.flags;
  tape.deepEqual(flagOne, flagTwo);
  tape.false(flagOne === flagTwo);

  tape.end();
});

test("Dependency children should write his parent as usedBy when exported", (tape) => {
  const semverDep = new Dependency("semver", "1.0.0");
  const testDep = new Dependency("test", "1.0.0", semverDep);

  tape.strictEqual(semverDep.dependencyCount, 1);
  tape.deepEqual(testDep.parent, {
    [semverDep.name]: semverDep.version
  });

  const flatDep = testDep.exportAsPlainObject(void 0);
  tape.deepEqual(flatDep["1.0.0"].usedBy, {
    [semverDep.name]: semverDep.version
  });

  tape.end();
});

test("Create a dependency with one warning", (tape) => {
  const semverDep = new Dependency("semver", "1.0.0");
  const fakeWarning = { foo: "bar" };
  semverDep.warnings.push(fakeWarning);

  const flatDep = semverDep.exportAsPlainObject(void 0);
  const version = flatDep["1.0.0"];
  tape.deepEqual(version.flags, ["hasWarnings"]);
  tape.strictEqual(version.warnings[0], fakeWarning);

  tape.end();
});

test("Create a GIT Dependency (flags.isGit must be set to true)", (tape) => {
  const semverDep = new Dependency("semver", "1.0.0").isGit();
  tape.is(semverDep.gitUrl, null);

  const flatSemver = semverDep.exportAsPlainObject(void 0);
  tape.true(flatSemver["1.0.0"].flags.includes("isGit"));

  const mochaDep = new Dependency("mocha", "1.0.0").isGit("https://github.com/mochajs/mocha");
  tape.strictEqual(mochaDep.gitUrl, "https://github.com/mochajs/mocha");

  const flatMocha = mochaDep.exportAsPlainObject(void 0);
  tape.true(flatMocha["1.0.0"].flags.includes("isGit"));

  tape.end();
});

test("Dependency.addFlag should throw a TypeError if flagName is not string", (tape) => {
  tape.plan(2);

  const semverDep = new Dependency("semver", "1.0.0");
  try {
    semverDep.addFlag(10);
  }
  catch (error) {
    tape.strictEqual(error.name, "TypeError");
    tape.strictEqual(error.message, "flagName argument must be typeof string");
  }
});
