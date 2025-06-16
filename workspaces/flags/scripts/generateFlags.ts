// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import TurndownService from "turndown";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kRootPath = path.join(__dirname, "..");

const turndownService = new TurndownService();

turndownService.addRule("h1", {
  filter: "h1",
  replacement: (content) => `<summary>${content}</summary>`
});
turndownService.addRule("div", {
  filter: "div",
  replacement: (content) => `<details>${content}</details>`
});

const { flags, headerTemplate } = await loadHTMLs();
await fs.writeFile(
  path.join(kRootPath, "FLAGS.md"),
  headerTemplate.concat(
    turndownService.turndown(flags)
  )
);

async function loadHTMLs() {
  const HTMLFlagsLocation = path.join(kRootPath, "src", "flags");
  const HTMLFlagsEntries = await fs.readdir(HTMLFlagsLocation);

  const [headerTemplate, ...HTMLFlagsFiles] = await Promise.all([
    fs.readFile(
      path.join(__dirname, "template", "flagDocHeader.md"),
      "utf-8"
    ),
    ...HTMLFlagsEntries.map(
      (file) => fs.readFile(path.join(HTMLFlagsLocation, file), "utf-8")
    )
  ]);

  return {
    flags: HTMLFlagsFiles.join(""),
    headerTemplate
  };
}
