// Import Node.js Dependencies
import path from "node:path";
import { once } from "node:events";

// Import Third-party Dependencies
import { AsynchronousConfig } from "@openally/config";
import { Ok, Err, Result } from "@openally/result";
import type { RequireAtLeastOne } from "type-fest";

// Import Internal Dependencies
import {
  JSONSchema,
  generateDefaultRC,
  type RCGenerationMode,
  type RC
} from "../rc.ts";
import * as CONSTANTS from "../constants.ts";
import { memoize } from "./memoize.ts";

interface CreateReadOptions {
  /**
   * If enabled the file will be created if it does not exist on the disk.
   *
   * @default false
   */
  createIfDoesNotExist?: boolean;
  /**
   * RC Generation mode. This option allows to generate a more or less complete configuration for some NodeSecure tools.
   *
   * @default `minimal`
   */
  createMode?: RCGenerationMode | RCGenerationMode[];

  /**
   * RC automatic caching option. This option allows to cache a configuration passed in parameter.
   *
   * @default false
   */
  memoize?: boolean;
}

export type readOptions = RequireAtLeastOne<CreateReadOptions, "createIfDoesNotExist" | "createMode">;

export async function read(
  location = process.cwd(),
  options: readOptions = Object.create(null)
): Promise<Result<RC, NodeJS.ErrnoException>> {
  try {
    const { createIfDoesNotExist = Boolean(options.createMode), createMode, memoize: memoizeRc = false } = options;

    const cfgPath = path.join(location, CONSTANTS.CONFIGURATION_NAME);
    const cfg = new AsynchronousConfig<RC>(cfgPath, {
      jsonSchema: JSONSchema,
      createOnNoEntry: createIfDoesNotExist
    });

    await cfg.read(createIfDoesNotExist ? generateDefaultRC(createMode) : void 0);
    if (createIfDoesNotExist) {
      await once(cfg, "configWritten");
    }
    const result = cfg.payload;

    if (memoizeRc) {
      memoize(result);
    }

    await cfg.close();

    return Ok(result);
  }
  catch (error) {
    return Err(error as NodeJS.ErrnoException);
  }
}
