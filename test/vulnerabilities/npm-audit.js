import { VULN_MODE_NPM_AUDIT } from "../../src/vulnerabilities/strategies.js";

// Require Internal Dependencies
import { NPMAuditStrategy } from "../../src/vulnerabilities/strategies/npm-audit.js";

test("Run NPM Audit and get vulnerabilities", async() => {
  const vulnStrategy = await NPMAuditStrategy();
  expect(vulnStrategy.type).toStrictEqual(VULN_MODE_NPM_AUDIT);
  await vulnStrategy.hydrateNodeSecurePayload({});
});
