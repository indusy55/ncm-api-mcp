import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: <KeyIcon />,
    title: "创建 API 密钥",
    content: (navigate: (path: string) => void) => (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          在{" "}
          <Typography
            component="a"
            onClick={() => navigate("/account/keys")}
            sx={{ color: "primary.main", cursor: "pointer", fontWeight: 500 }}
          >
            API 密钥
          </Typography>{" "}
          页面创建一个新的密钥。
        </Typography>
      </Box>
    ),
  },
  {
    icon: <SettingsIcon />,
    title: "配置 MCP 客户端",
    content: () => (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          在 MCP 客户端的配置文件中添加以下配置：
        </Typography>

        <CodeBlock code={`{
  "mcpServers": {
    "netease-cloud-music": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer <你的 API 密钥>"
      }
    }
  }
}`} />

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          客户端配置示例
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Claude Desktop
        </Typography>
        <CodeBlock code={`# claude_desktop_config.json
# macOS: ~/Library/Application Support/Claude/
# Windows: %APPDATA%\\Claude\\
{
  "mcpServers": {
    "netease-cloud-music": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer ncm_你的密钥..."
      }
    }
  }
}`} />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Cursor
        </Typography>
        <CodeBlock code={`# .cursor/mcp.json
{
  "mcpServers": {
    "netease-cloud-music": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer ncm_你的密钥..."
      }
    }
  }
}`} />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Windsurf
        </Typography>
        <CodeBlock code={`# ~/.codeium/windsurf/mcp_config.json
{
  "mcpServers": {
    "netease-cloud-music": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer ncm_你的密钥..."
      }
    }
  }
}`} />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          OpenAI Codex CLI
        </Typography>
        <CodeBlock code={`# ~/.codex/config.toml
experimental_use_rmcp_client = true

[mcp_servers.netease-cloud-music]
url = "http://localhost:3002/mcp"
bearer_token = "ncm_你的密钥..."
startup_timeout_sec = 10
tool_timeout_sec = 60`} />
      </Box>
    ),
  },
  {
    icon: <CheckCircleIcon />,
    title: "验证连接",
    content: () => (
      <Typography variant="body2" color="text.secondary">
        配置完成后，重启 MCP 客户端。如果连接成功，你将看到可用的网易云音乐工具列表，
        包括搜索歌曲、获取歌词、查看歌单等功能。
      </Typography>
    ),
  },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <Box
      sx={{
        bgcolor: "grey.100",
        p: 1.5,
        borderRadius: 1,
        mb: 2,
        fontFamily: "monospace",
        fontSize: 13,
        whiteSpace: "pre-wrap",
      }}
    >
      {code}
    </Box>
  );
}

export default function McpSetup() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <MenuBookIcon /> MCP 配置教程
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            按照以下步骤配置你的 MCP 客户端（如 Claude Desktop、Cursor 等）连接到此服务器。
          </Typography>
        </CardContent>
      </Card>

      {steps.map((step, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, pb: index < steps.length - 1 ? 0 : 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
              }}
            >
              {step.icon}
            </Avatar>
            {index < steps.length - 1 && (
              <Box sx={{ width: 2, bgcolor: "divider", flexGrow: 1, my: 0.5 }} />
            )}
          </Box>
          <Box sx={{ flexGrow: 1, pb: index < steps.length - 1 ? 3 : 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {step.title}
            </Typography>
            {step.content(navigate)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
