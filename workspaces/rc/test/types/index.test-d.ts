// Import Third-party Dependencies
import type { Result } from "@openally/result";
import { expectAssignable } from "tsd";

// Import Internal Dependencies
import { read, write, type RC } from "../../src/index.js";

expectAssignable<Promise<Result<RC, NodeJS.ErrnoException>>>(read());
expectAssignable<Promise<Result<void, NodeJS.ErrnoException>>>(write("test", {
  payload: {},
  partialUpdate: true
}));
