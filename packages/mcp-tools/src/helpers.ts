import type { NcmApiResponse } from "@ncm/api-client";

export function createTextResult(body: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(body, null, 2) }],
  };
}

export function handleNcmError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown NetEase API error";
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

export async function safeNcmCall(
  apiCall: () => Promise<NcmApiResponse>,
) {
  try {
    const res = await apiCall();
    if (res.body?.code === 301) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Cookie expired, please re-bind your NetEase account" }) }],
        isError: true,
      };
    }
    return createTextResult(res.body);
  } catch (e) {
    return handleNcmError(e);
  }
}
