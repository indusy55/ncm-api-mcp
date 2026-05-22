import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/client.js";

const stepIcons = [<KeyIcon />, <SettingsIcon />, <CheckCircleIcon />];

function CustomStepIcon(props: { active?: boolean; completed?: boolean; icon?: number }) {
  const icon = stepIcons[(props.icon ?? 1) - 1];
  return (
    <Box
      sx={{
        color: props.active
          ? "primary.main"
          : props.completed
            ? "success.main"
            : "text.disabled",
        display: "flex",
        alignItems: "center",
      }}
    >
      {icon}
    </Box>
  );
}

export default function McpSetup() {
  const navigate = useNavigate();
  const [keyPrefix, setKeyPrefix] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ keys: { keyPrefix: string }[] }>("/keys")
      .then((res) => {
        if (res.data.keys.length > 0) {
          setKeyPrefix(res.data.keys[0].keyPrefix);
        }
      })
      .catch(() => {});
  }, []);

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

      <Stepper orientation="vertical" activeStep={-1} nonLinear>
        <Step>
          <StepLabel slots={{ stepIcon: CustomStepIcon }}>
            创建 API 密钥
          </StepLabel>
          <StepContent>
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
            {keyPrefix && (
              <Chip label={`你已创建密钥: ${keyPrefix}...`} color="primary" size="small" />
            )}
          </StepContent>
        </Step>

        <Step>
          <StepLabel slots={{ stepIcon: CustomStepIcon }}>
            配置 MCP 客户端
          </StepLabel>
          <StepContent>
            <Typography variant="body2" sx={{ mb: 1 }}>
              在 MCP 客户端的配置文件中添加以下配置：
            </Typography>

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
{`{
  "mcpServers": {
    "netease-cloud-music": {
      "type": "streamable-http",
      "url": "http://localhost:3002/mcp",
      "headers": {
        "Authorization": "Bearer <你的 API 密钥>"
      }
    }
  }
}`}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              客户端配置示例
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Claude Desktop
            </Typography>
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
{`# claude_desktop_config.json
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
}`}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Cursor
            </Typography>
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
{`# .cursor/mcp.json
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
}`}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Windsurf
            </Typography>
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 1.5,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
>
{`# ~/.codeium/windsurf/mcp_config.json
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
}`}
            </Box>
          </StepContent>
        </Step>

        <Step>
          <StepLabel slots={{ stepIcon: CustomStepIcon }}>
            验证连接
          </StepLabel>
          <StepContent>
            <Typography variant="body2" color="text.secondary">
              配置完成后，重启 MCP 客户端。如果连接成功，你将看到可用的网易云音乐工具列表，
              包括搜索歌曲、获取歌词、查看歌单等功能。
            </Typography>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
}
