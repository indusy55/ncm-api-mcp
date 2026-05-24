import type { NcmApiResponse } from "@ncm/api-client";

export type SummaryMapper = (body: Record<string, unknown>) => unknown;

export function createTextResult(body: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(body) }],
  };
}

export function handleNcmError(error: unknown) {
  const message = error instanceof Error ? error.message : "NetEase API error";
  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

export async function safeNcmCall(
  apiCall: () => Promise<NcmApiResponse>,
  mapper?: SummaryMapper,
) {
  try {
    const res = await apiCall();
    if (res.body?.code === 301) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Cookie expired. Re-bind account." }) }],
        isError: true,
      };
    }
    const body =
      mapper && isRecord(res.body)
        ? mapper(res.body)
        : res.body;
    return createTextResult(body);
  } catch (e) {
    return handleNcmError(e);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
