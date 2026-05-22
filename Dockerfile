FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate
WORKDIR /app

# ── Dependencies ──
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/api-client/package.json packages/api-client/
COPY packages/auth/package.json packages/auth/
COPY packages/database/package.json packages/database/
COPY packages/mcp-tools/package.json packages/mcp-tools/
COPY apps/platform/package.json apps/platform/
COPY apps/mcp-server/package.json apps/mcp-server/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

# ── Build ──
FROM deps AS builder
COPY tsconfig.json ./
COPY packages/api-client/src ./packages/api-client/src
COPY packages/auth/src ./packages/auth/src
COPY packages/database/src ./packages/database/src
COPY packages/mcp-tools/src ./packages/mcp-tools/src
COPY apps/platform/src ./apps/platform/src
COPY apps/mcp-server/src ./apps/mcp-server/src
COPY apps/web/src ./apps/web/src
COPY apps/web/index.html ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
RUN pnpm --filter @ncm/api-client build && \
    pnpm --filter @ncm/auth build && \
    pnpm --filter @ncm/database build && \
    pnpm --filter @ncm/mcp-tools build && \
    pnpm --filter @ncm/platform build && \
    pnpm --filter @ncm/mcp-server build && \
    pnpm --filter @ncm/web build
RUN rm -rf node_modules packages/*/node_modules apps/*/node_modules
RUN pnpm install --prod --frozen-lockfile

# ── Platform runtime ──
FROM base AS platform
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]
WORKDIR /app
COPY --from=builder /app/apps/platform/dist ./apps/platform/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "apps/platform/dist/index.js"]

# ── MCP Server runtime ──
FROM base AS mcp-server
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]
WORKDIR /app
COPY --from=builder /app/apps/mcp-server/dist ./apps/mcp-server/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "apps/mcp-server/dist/index.js"]
