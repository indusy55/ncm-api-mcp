import type { NcmApiResponse } from "@ncm/api-client";

export type SummaryMapper = (body: Record<string, unknown>) => unknown;

export function createTextResult(body: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(body) }],
  };
}

export function handleNcmError(error: unknown) {
  const payload = normalizeNcmError(error);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
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

function normalizeNcmError(error: unknown) {
  if (error instanceof Error) {
    return {
      error: error.message,
      name: error.name,
      ...(isRecord((error as Error & { cause?: unknown }).cause)
        ? { cause: simplifyRecord((error as Error & { cause?: unknown }).cause as Record<string, unknown>) }
        : {}),
    };
  }

  if (isRecord(error)) {
    const message =
      firstString(error.message, error.msg, error.error, error.errMsg) ?? "NetEase API error";

    return {
      error: message,
      ...simplifyRecord(error),
    };
  }

  return { error: typeof error === "string" ? error : "NetEase API error" };
}

function simplifyRecord(record: Record<string, unknown>) {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      out[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value.slice(0, 10);
      continue;
    }

    if (isRecord(value)) {
      out[key] = simplifyNestedRecord(value);
    }
  }

  return out;
}

function simplifyNestedRecord(record: Record<string, unknown>) {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      out[key] = value;
    }
  }

  return out;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}
