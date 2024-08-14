import { typescriptConfig } from "@openally/config.eslint";

export default typescriptConfig({
  ignores: [
    "workspaces/**/coverage",
    "workspaces/**/test/fixtures",
    "workspaces/i18n/src/languages"
  ]
});
