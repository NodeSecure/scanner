// Import Third-party Dependencies
import parseExpressions from "spdx-expression-parse";
import { Result, Ok, Err } from "@openally/result";

// Import Internal Dependencies
import {
  spdxLicenseIds,
  licenseNameToId,
  closestSpdxLicenseID,
  checkSpdx
} from "./licenses.js";
import * as utils from "./utils/index.js";

export interface SpdxLicenseConformance {
  licenses: Record<string, string>;
  spdx: {
    osi: boolean;
    fsf: boolean;
    fsfAndOsi: boolean;
    includesDeprecated: boolean;
  };
}

export function licenseIdConformance(
  licenseID: string
): Result<SpdxLicenseConformance, Error> {
  let closestLicenseID: string;
  if (/and|or/.exec(licenseID) === null) {
    closestLicenseID = spdxLicenseIds.has(licenseID) ?
      licenseID :
      closestSpdxLicenseID(licenseID);
  }
  else {
    closestLicenseID = licenseID;
  }

  try {
    const uniqueLicenseIds = [
      ...extractLicenseIds(parseExpressions(closestLicenseID))
    ];

    return Ok(
      buildSpdxLicenseConformance(uniqueLicenseIds)
    );
  }
  catch (cause) {
    return Err(
      new Error(`Passed license expression '${closestLicenseID}' was not a valid license expression.`, {
        cause
      })
    );
  }
}

export function searchSpdxLicenseId(
  contentStr: string
): string | null {
  for (const [licenseName, license] of licenseNameToId) {
    if (contentStr.indexOf(licenseName) > -1) {
      return license.id;
    }
  }

  return null;
}

function buildSpdxLicenseConformance(
  uniqueLicenseIds: string[]
): SpdxLicenseConformance {
  const conformance: SpdxLicenseConformance = {
    licenses: Object.fromEntries(
      uniqueLicenseIds.map((id) => [id, utils.createSpdxLink(id)])
    ),
    spdx: {
      osi: false,
      fsf: false,
      fsfAndOsi: false,
      includesDeprecated: false
    }
  };
  const licenseSpdx = uniqueLicenseIds.map((id) => checkSpdx(id));

  conformance.spdx.osi = utils.checkEveryTruthy(
    ...licenseSpdx.map((spdx) => spdx.osi)
  );
  conformance.spdx.fsf = utils.checkEveryTruthy(
    ...licenseSpdx.map((spdx) => spdx.fsf)
  );
  conformance.spdx.fsfAndOsi = utils.checkEveryTruthy(
    ...licenseSpdx.map((spdx) => spdx.fsfAndOsi)
  );
  conformance.spdx.includesDeprecated = utils.checkSomeTruthy(
    ...licenseSpdx.map((spdx) => spdx.includesDeprecated)
  );

  return conformance;
}

function* extractLicenseIds(
  data: parseExpressions.Info
): IterableIterator<string> {
  if ("conjunction" in data) {
    yield* extractLicenseIds(data.left);
    yield* extractLicenseIds(data.right);
  }
  else {
    yield data.license;
  }
}
