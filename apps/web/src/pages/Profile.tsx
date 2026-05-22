import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api/client.js";
import { useAuth } from "../contexts/AuthContext.js";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (severity: "success" | "error", message: string) => {
    setSnackbar({ open: true, severity, message });
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) return;
    setSaving(true);
    try {
      await api.put("/users/me", { username });
      await refreshUser();
      showSnackbar("success", "个人资料已更新");
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "更新失败");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showSnackbar("error", "请填写所有密码字段");
      return;
    }
    if (newPassword.length < 8) {
      showSnackbar("error", "新密码至少 8 个字符");
      return;
    }
    if (newPassword !== confirmPassword) {
      showSnackbar("error", "两次密码输入不一致");
      return;
    }
    setChangingPwd(true);
    try {
      await api.put("/users/me/password", { currentPassword, newPassword });
      showSnackbar("success", "密码已修改");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "修改密码失败");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <PersonIcon /> 个人资料
      </Typography>

      {/* Profile Info */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardHeader title="基本信息" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            邮箱: {user?.email}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={saving || !username.trim()}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card variant="outlined">
        <CardHeader title="修改密码" />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="当前密码"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="新密码"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { minLength: 8 } }}
            />
            <TextField
              label="确认新密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="small"
              fullWidth
            />
            <Box>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={changingPwd}
              >
                {changingPwd ? "修改中..." : "修改密码"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
