import { VULN_MODE_NPM_AUDIT } from "../../src/vulnerabilities/strategies";
// Require Internal Dependencies
import { NPMAuditStrategy } from "../../src/vulnerabilities/strategies/npm-audit";

test("Run NPM Audit and get vulnerabilities", async() => {
  const vulnStrategy = await NPMAuditStrategy();
  expect(vulnStrategy.type).toStrictEqual(VULN_MODE_NPM_AUDIT);
  await vulnStrategy.hydrateNodeSecurePayload({});
});
