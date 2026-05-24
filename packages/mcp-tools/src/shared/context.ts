import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { NcmApiResponse, NcmClient } from "@ncm/api-client";
import { safeNcmCall } from "../helpers.js";
import type { SummaryMapper } from "../helpers.js";

export const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

export const writeAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

export interface ToolDeps {
  ncm: NcmClient;
  call: <T extends NcmApiResponse>(
    name: string,
    fn: () => Promise<T>,
    mapper?: SummaryMapper,
  ) => ReturnType<typeof safeNcmCall>;
}

export type ToolRegistrar = (server: McpServer, deps: ToolDeps) => void;
