// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import { AsynchronousConfig } from "@openally/config";
import { Ok, Err, Result } from "@openally/result";

// Import Internal Dependencies
import { JSONSchema, type RC } from "../rc.js";
import * as CONSTANTS from "../constants.js";
/**
 * Overwrite the complete payload. partialUpdate property is mandatory.
 */
export interface writeCompletePayload {
  payload: RC;
  partialUpdate?: false;
}

/**
 * Partially update the payload. This implies not to rewrite the content of the file when enabled.
 **/
export interface writePartialPayload {
  payload: Partial<RC>;
  partialUpdate: true;
}

export type writeOptions = writeCompletePayload | writePartialPayload;

export async function write(
  location: string,
  options: writeOptions
): Promise<Result<void, NodeJS.ErrnoException>> {
  try {
    const { payload, partialUpdate = false } = options;

    const cfgPath = path.join(location, CONSTANTS.CONFIGURATION_NAME);
    const cfg = new AsynchronousConfig<RC>(cfgPath, {
      jsonSchema: JSONSchema
    });
    await cfg.read();

    const newPayloadValue = partialUpdate ? Object.assign(cfg.payload, payload) : payload as RC;
    cfg.payload = newPayloadValue;

    await cfg.close();

    return Ok(void 0);
  }
  catch (error) {
    return Err(error as NodeJS.ErrnoException);
  }
}
