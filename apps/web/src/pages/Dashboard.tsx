import { Box, Card, Button, Typography, Chip, CircularProgress, Grid, CardActions, CardContent, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useNavigate } from "react-router-dom";
import { useNeteaseAccount } from "../hooks/useNeteaseAccount.js";

export default function Dashboard() {
  const { status, account, refresh } = useNeteaseAccount();
  const navigate = useNavigate();

  if (status === "loading") {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>控制台</Typography>

      <Grid container spacing={2}>
        {/* NetEase Account Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">网易云账号</Typography>
              </Box>

              {status === "none" && (
                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                  尚未绑定网易云账号，点击绑定
                </Typography>
              )}

              {status === "bound" && account && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Avatar
                      src={account.avatarUrl || undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {account.nickname[0]}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{account.nickname}</Typography>
                        <Chip label="正常" color="success" size="small" icon={<CheckCircleIcon />} />
                      </Box>
                      <Typography color="text.secondary" sx={{ fontSize: 13 }}>UID: {account.neteaseUid}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {status === "expired" && account && (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Avatar
                      src={account.avatarUrl || undefined}
                      sx={{ width: 36, height: 36 }}
                    >
                      {account.nickname[0]}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{account.nickname}</Typography>
                        <Chip label="Cookie 已过期" color="error" size="small" icon={<ErrorIcon />} />
                      </Box>
                    </Box>
                  </Box>
                  <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                    请重新绑定账号以继续使用 MCP 工具
                  </Typography>
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              {status === "none" ? (
                <Button variant="contained" startIcon={<LinkIcon />} onClick={() => navigate("/account/bind")}>
                  绑定账号
                </Button>
              ) : (
                <Button variant="outlined" color="error" startIcon={<LinkOffIcon />} onClick={async () => {
                  const api = (await import("../api/client.js")).default;
                  await api.delete("/netease/unbind");
                  refresh();
                }}>
                  解绑
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        {/* API Key Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <KeyIcon color="primary" />
                <Typography variant="h6">API 密钥</Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                管理你的 API 密钥，用于 MCP 服务器认证
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button variant="contained" startIcon={<KeyIcon />} onClick={() => navigate("/account/keys")}>
                管理密钥
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
