import { Box, Card, TextField, Button, Typography, Alert, Snackbar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { useState } from "react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, username);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 400, p: 3 }}>
        <Typography variant="h5" sx={{ textAlign: "center", mb: 3, fontWeight: 600 }}>
          创建账号
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            size="small"
            helperText="3-30 个字符，仅支持字母、数字和下划线"
            slotProps={{ htmlInput: { minLength: 3, pattern: "^[a-zA-Z0-9_]+$" } }}
          />
          <TextField
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
            helperText="至少 8 个字符"
            slotProps={{ htmlInput: { minLength: 8 } }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </Button>
        </Box>
        <Typography sx={{ textAlign: "center", mt: 2, color: "text.secondary", fontSize: 14 }}>
          已有账号？<Link to="/login">登录</Link>
        </Typography>
      </Card>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={2000}>
        <Alert severity="success">注册成功</Alert>
      </Snackbar>
    </Box>
  );
}
