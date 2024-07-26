// Import Node.js Dependencies
import fs from "node:fs";

// Import Third-party Dependencies
import httpie from "@myunisoft/httpie";
import * as astring from "astring";
import { ESTree, Helpers, VarDeclaration } from "node-estree";

// CONSTANTS
const kSrcDirectory = new URL("../src/data/", import.meta.url);

const { data } = await httpie.get(
  "https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json"
);
const response = JSON.parse(data);

const spdxProperties = [];

for (const license of response.licenses) {
  const {
    name,
    isDeprecatedLicenseId: deprecated,
    licenseId: id,
    isOsiApproved: osi,
    isFsfLibre: fsf = false
  } = license;

  spdxProperties.push(
    ESTree.Property(
      id.charAt(0) !== "0" && /^[a-zA-Z0-9]+$/.test(id) ? ESTree.Identifier(id) : ESTree.Literal(id),
      Helpers.PlainObject({ name, id, deprecated, osi, fsf }),
      {
        kind: "init",
        computed: false,
        method: false,
        shorthand: false
      }
    )
  );
}

const prog = ESTree.Program("module", [
  ESTree.ExportNamedDeclaration(
    VarDeclaration.const("spdx", ESTree.ObjectExpression(spdxProperties))
  )
]);

fs.writeFileSync(
  new URL("spdx.ts", kSrcDirectory),
  `/* eslint-disable max-lines */\n\n` + astring.generate(prog)
);
