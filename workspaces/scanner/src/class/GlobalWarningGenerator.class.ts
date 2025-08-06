// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";

// Import Internal Dependencies
import type { GlobalWarning } from "../types.js";

// CONSTANTS
const kI18nWarningsMap = {
  "typo-squatting": "scanner.typo_squatting",
  "integrity-mismatch": "scanner.integrity_mismatch",
  "empty-package": "scanner.empty_package",
  "dangerous-dependency": "scanner.dangerous_dependency"
} satisfies Record<GlobalWarning["type"], string>;

export class GlobalWarningGenerator {
  type: GlobalWarning["type"];
  metadata: GlobalWarning["metadata"];

  constructor(
    type: GlobalWarning["type"],
    metadata: GlobalWarning["metadata"]
  ) {
    this.type = type;
    this.metadata = metadata;
  }

  async resolve(): Promise<GlobalWarning> {
    const message = await i18n.getToken(
      kI18nWarningsMap[this.type],
      this.metadata
    );

    return {
      type: this.type,
      message,
      metadata: this.metadata
    };
  }
}
