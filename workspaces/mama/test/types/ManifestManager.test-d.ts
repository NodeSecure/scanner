// Import Node.js Dependencies
import assert from "node:assert";

// Import Third-party Dependencies
import { expectType } from "tsd";

// Import Internal Dependencies
import {
  ManifestManager,
  type LocatedManifestManager
} from "../../dist/index.js";

// Test basic type guard
const locatedManifest = new ManifestManager(
  { name: "test", version: "1.0.0" },
  { location: "/tmp/path" }
);
assert.ok(ManifestManager.isLocated(locatedManifest));
expectType<string>(locatedManifest.location);

// Test generic type preservation
interface CustomMetadata {
  customField: string;
}
const customManifest = new ManifestManager<CustomMetadata>(
  { name: "test", version: "1.0.0" },
  { location: "/tmp/path" }
);
customManifest.metadata.customField = "test";

assert.ok(ManifestManager.isLocated(customManifest));
expectType<LocatedManifestManager<CustomMetadata>>(customManifest);

