// Import Third-party Dependencies
import { expectAssignable } from "tsd";

// Import Internal Dependencies
import {
  generateDefaultRC,
  generateCIConfiguration,
  type RC,
  type CiConfiguration
} from "../../dist/rc.js";

expectAssignable<RC>(generateDefaultRC());
expectAssignable<{ ci: CiConfiguration; }>(generateCIConfiguration());
