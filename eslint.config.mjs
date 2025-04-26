import { typescriptConfig, globals } from "@openally/config.eslint";

export default [
  ...typescriptConfig({
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }),
  {
    ignores: [
      "workspaces/**/coverage",
      "workspaces/**/test/fixtures",
      "workspaces/**/temp/**",
      "workspaces/i18n/src/languages"
    ],
  }
];
