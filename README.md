# NCMAPI MCP Server

将 NCM 服务以 MCP 协议开放给 AI 客户端，附带 Web 管理平台。

## 架构图

```
┌──────────────────┐
│   AI 客户端       │
└────────┬─────────┘
         │ MCP Streamable HTTP
         ▼
┌──────────────────┐
│   Nginx (80)     │
└──┬───────┬───────┘
   │       │
   ▼       ▼
┌────────┐ ┌──────────┐ ┌────────┐
│Platform│ │MCP Server│ │ Redis  │
│:3001   │ │:3002     │ │        │
│        │ │          │ └────────┘
│ JWT    │ │ API Key  │
│ 用户   │ │ MCP 工具  │
│ 绑定   │ │ NCM API   │
│ 前端   │ │          │
└──┬─────┴──┬───────-─┘
   │        │
   └──┬─────┘
      ▼
┌──────────┐
│  SQLite   │  共享数据库
└──────────┘
```

## 部署

```bash
git clone https://github.com/<user>/ncmapi-mcp-server.git
cd ncmapi-mcp-server

# 配置环境变量
cat > .env << 'EOF'
JWT_SECRET=<至少32位随机字符串>
COOKIE_ENCRYPTION_KEY=<64位hex字符串，用 openssl rand -hex 32 生成>
EOF

# 一键启动
docker compose up -d
```

访问 `http://localhost` 进入管理界面。

## 使用

1. 打开管理界面 → 注册/登录
2. 进入「账号绑定」→ 扫码登录
3. 进入「API 密钥」→ 创建密钥
4. 在 AI 客户端配置 MCP 服务（Streamable HTTP 协议）：

### VSCode

```json
{
  "mcpServers": {
    "ncm": {
      "url": "http://你的地址/mcp",
      "headers": { "Authorization": "Bearer ncm_你的密钥" }
    }
  }
}
```

### Claude Code

编辑 `~/.claude/settings.json`：

```json
{
  "mcpServers": {
    "ncm": {
      "url": "http://你的地址/mcp",
      "headers": { "Authorization": "Bearer ncm_你的密钥" }
    }
  }
}
```

### OpenAI Codex CLI

在 `~/.codex/config.toml` 中添加：

```toml
experimental_use_rmcp_client = true

[mcp_servers.ncm]
url = "http://你的地址/mcp"
bearer_token_env_var = "NCM_API_KEY"
```

然后设置环境变量：`export NCM_API_KEY=ncm_你的密钥`

## 默认管理员

首次启动自动创建，请尽快修改密码。

| 用户名 | 密码 |
|--------|------|
| admin | admin123 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `JWT_SECRET` | JWT 签名密钥，至少 32 字符 |
| `COOKIE_ENCRYPTION_KEY` | 加密密钥，`openssl rand -hex 32` 生成 |

## License

[MIT](LICENSE)
