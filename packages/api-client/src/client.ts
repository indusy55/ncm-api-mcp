import { createRequire } from "node:module";
import type { NcmApiResponse } from "./types.js";

const require = createRequire(import.meta.url);
// @neteasecloudmusicapienhanced/api is a CJS module, import via createRequire
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ncm: Record<string, (params: Record<string, unknown>) => Promise<NcmApiResponse>> = require("@neteasecloudmusicapienhanced/api");

export type NcmClient = ReturnType<typeof createNcmClient>;

export function createNcmClient(cookies: string) {
  const call = async (
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<NcmApiResponse> => {
    const fn = ncm[method];
    if (!fn) {
      throw new Error(`Unknown NetEase API method: ${method}`);
    }
    return fn({ ...params, cookie: cookies });
  };

  return { call };
}
