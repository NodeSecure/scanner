// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { scanOrganization } from "../../src/github/index.js";

const githubToken = process.env.GITHUB_TOKEN;

test("scanOrganization should retrieve repositories and their dependencies", async(t) => {
  if (!githubToken) {
    t.comment("Skipping test because GITHUB_TOKEN is not set");
    t.end();

    return;
  }

  try {
    const results = await scanOrganization({
      orgName: "NodeSecure",
      githubToken,
      onProgress: (repo) => {
        t.comment(`- scanning repository: ${repo.name}`);
      }
    });

    t.ok(Array.isArray(results), "should return an array");
    t.ok(results.length > 0, "should return at least one repository");

    const cliRepo = results.find((repo) => repo.name === "cli");
    t.ok(cliRepo, "should find the 'cli' repository");
    t.ok(cliRepo?.dependencies, "cli repo should have dependencies");
  }
  catch (error) {
    t.error(error, "should not throw an error");
  }

  t.end();
});
