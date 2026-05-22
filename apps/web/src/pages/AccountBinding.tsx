import { Box, Card, Button, Typography, Alert, CircularProgress, AlertTitle } from "@mui/material";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import { QRCodeCanvas } from "qrcode.react";
import { useQrPolling } from "../hooks/useNeteaseAccount.js";
import { useNavigate } from "react-router-dom";

export default function AccountBinding() {
  const navigate = useNavigate();

  const onConfirmed = () => {
    setTimeout(() => navigate("/"), 2000);
  };

  const { qrUrl, pollState, qrNickname, startQrFlow, reset } =
    useQrPolling(onConfirmed);

  const handleRefresh = () => {
    reset();
    setTimeout(startQrFlow, 100);
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", py: 6, px: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>绑定网易云账号</Typography>

      {!qrUrl && pollState !== "expired" && (
        <Card variant="outlined" sx={{ textAlign: "center", py: 4 }}>
          <QrCodeIcon sx={{ fontSize: 64, color: "action.disabled", mb: 2 }} />
          <br />
          <Button variant="contained" size="large" onClick={startQrFlow}>
            扫码登录
          </Button>
        </Card>
      )}

      {qrUrl && (
        <Card variant="outlined" sx={{ textAlign: "center", py: 3 }}>
          <Box sx={{ display: "inline-flex", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <QRCodeCanvas value={qrUrl} size={200} />
          </Box>

          <Box sx={{ mt: 2 }}>
            {pollState === "waiting" && (
              <Box>
                <CircularProgress size={24} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  请使用网易云音乐 App 扫码
                </Typography>
              </Box>
            )}

            {pollState === "scanned" && (
              <Alert severity="info" icon={<AccessTimeIcon />}>
                <AlertTitle>已扫描{qrNickname ? ` (${qrNickname})` : ""}</AlertTitle>
                请在手机上确认登录
              </Alert>
            )}

            {pollState === "confirmed" && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                <AlertTitle>绑定成功！</AlertTitle>
                已登录为 {qrNickname}
              </Alert>
            )}

            {pollState === "expired" && (
              <Alert severity="error" action={
                <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                  重新扫码
                </Button>
              }>
                <AlertTitle>二维码已过期</AlertTitle>
                请点击重新扫码
              </Alert>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}
