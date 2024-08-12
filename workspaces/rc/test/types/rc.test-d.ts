// Import Third-party Dependencies
import { expectAssignable } from "tsd";

// Import Internal Dependencies
import {
  generateDefaultRC,
  generateCIConfiguration,
  type RC,
  type CiConfiguration
} from "../../src/rc.js";

expectAssignable<RC>(generateDefaultRC());
expectAssignable<{ ci: CiConfiguration }>(generateCIConfiguration());
