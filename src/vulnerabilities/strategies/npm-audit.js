// Import Third-party Dependencies
import Arborist from "@npmcli/arborist";

// CONSTANTS
import { constants, DEFAULT_REGISTRY_ADDR } from "../../utils/index.js";
import { VULN_MODE_NPM_AUDIT } from "../strategies.js";

export function NPMAuditStrategy() {
  return {
    type: VULN_MODE_NPM_AUDIT,
    hydrateNodeSecurePayload
  };
}

async function hydrateNodeSecurePayload(dependencies) {
  const arborist = new Arborist({ ...constants.NPM_TOKEN, registry: DEFAULT_REGISTRY_ADDR });

  try {
    const { vulnerabilities } = (await arborist.audit()).toJSON();

    Object.keys(vulnerabilities).forEach((packageName) => {
      const packageVulnerabilities = extractPackageVulnsFromSource(vulnerabilities[packageName]);
      const dependenciesVulnerabilities = dependencies.get(packageName).vulnerabilities;

      dependenciesVulnerabilities.push(packageVulnerabilities);
    });
  }
  // eslint-disable-next-line no-empty
  catch {}
}

function extractPackageVulnsFromSource(packageVulnerabilities) {
  const vulnerabilitiesFromSource = [];
  const { via: vulnSources } = packageVulnerabilities;

  for (const vulnSource of vulnSources) {
    const {
      title, range, id,
      module_name: name,
      severity, version,
      vulnerableVersions
    } = vulnSource;

    const vulnerability = {
      title,
      module_name: name,
      severity, version,
      vulnerableVersions,
      range,
      id
    };
    vulnerabilitiesFromSource.push(vulnerability);
  }

  return vulnerabilitiesFromSource;
}
