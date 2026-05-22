FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate
WORKDIR /app

# ── Build environment (python3 + build-base for native modules like better-sqlite3) ──
FROM base AS build-env
RUN apk add --no-cache python3 build-base

# ── Dependencies ──
FROM build-env AS deps
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
COPY tsconfig.base.json ./
COPY packages/api-client/tsconfig.json packages/api-client/
COPY packages/api-client/src ./packages/api-client/src
COPY packages/auth/tsconfig.json packages/auth/
COPY packages/auth/src ./packages/auth/src
COPY packages/database/tsconfig.json packages/database/
COPY packages/database/src ./packages/database/src
COPY packages/mcp-tools/tsconfig.json packages/mcp-tools/
COPY packages/mcp-tools/src ./packages/mcp-tools/src
COPY apps/platform/tsconfig.json apps/platform/
COPY apps/platform/src ./apps/platform/src
COPY apps/mcp-server/tsconfig.json apps/mcp-server/
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
RUN pnpm deploy --legacy --filter @ncm/platform /tmp/deploy-platform && \
    pnpm deploy --legacy --filter @ncm/mcp-server /tmp/deploy-mcp-server

# ── Platform runtime ──
FROM base AS platform
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]
WORKDIR /app
COPY --from=builder /tmp/deploy-platform .
COPY --from=builder /app/apps/web/dist ./apps/web/dist
EXPOSE 3001
CMD ["node", "dist/index.js"]

# ── MCP Server runtime ──
FROM base AS mcp-server
RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]
WORKDIR /app
COPY --from=builder /tmp/deploy-mcp-server .
EXPOSE 3002
CMD ["node", "dist/index.js"]
