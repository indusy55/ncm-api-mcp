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

  const callWithoutCookie = async (
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<NcmApiResponse> => {
    const fn = ncm[method];
    if (!fn) {
      throw new Error(`Unknown NetEase API method: ${method}`);
    }
    return fn(params);
  };

  const loginQrKey = () => callWithoutCookie("login_qr_key");
  const loginQrCreate = (key: string, qrimg = true) =>
    callWithoutCookie("login_qr_create", { key, qrimg });
  const loginQrCheck = (key: string) => callWithoutCookie("login_qr_check", { key });

  return {
    call,
    callWithoutCookie,
    loginQrKey,
    loginQrCreate,
    loginQrCheck,
    userAccount: (cookieOverride?: string) =>
      cookieOverride
        ? ncm.user_account({ cookie: cookieOverride })
        : call("user_account"),
  };
}
