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
if (ManifestManager.isLocated(locatedManifest)) {
  expectType<string>(locatedManifest.location);
}

// Test generic type preservation
interface CustomMetadata {
  customField: string;
}
const customManifest = new ManifestManager<CustomMetadata>(
  { name: "test", version: "1.0.0" },
  { location: "/tmp/path" }
);
customManifest.metadata.customField = "test";

if (ManifestManager.isLocated(customManifest)) {
  expectType<LocatedManifestManager<CustomMetadata>>(customManifest);
}

