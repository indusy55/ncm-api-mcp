import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Card, CardContent, Switch, FormControlLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/client.js";
import { useAuth } from "../contexts/AuthContext.js";

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: "admin" | "user";
  createdAt: string;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<{ id: string; email: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  // Settings
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const showSnackbar = (severity: "success" | "error", message: string) => {
    setSnackbar({ open: true, severity, message });
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ users: User[] }>("/admin/users");
      setUsers(res.data.users);
    } catch {
      showSnackbar("error", "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get<{ settings: Record<string, string> }>("/admin/settings");
      setAllowRegistration(res.data.settings.allow_registration !== "false");
      setSettingsLoaded(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, [fetchUsers, fetchSettings]);

  const handleRestartApi = async () => {
    try {
      await api.post("/admin/restart-api");
      showSnackbar("success", "NCM API 已重启");
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "重启失败");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      showSnackbar("success", `用户 ${deleteTarget.username} 已删除`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "删除失败");
    }
  };

  const handleSaveEmail = async () => {
    if (!editingEmail) return;
    try {
      await api.put(`/admin/users/${editingEmail.id}/email`, { email: editingEmail.email });
      showSnackbar("success", "邮箱已更新");
      setEditingEmail(null);
      fetchUsers();
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "更新邮箱失败");
    }
  };

  const handleToggleRegistration = async (checked: boolean) => {
    setAllowRegistration(checked);
    try {
      await api.put("/admin/settings", { key: "allow_registration", value: String(checked) });
      showSnackbar("success", checked ? "已允许注册" : "已关闭注册");
    } catch {
      setAllowRegistration(!checked);
      showSnackbar("error", "更新设置失败");
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AdminPanelSettingsIcon /> 管理
      </Typography>

      {/* NCM API Management */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontWeight: 600 }}>NCM API 管理</Typography>
            <Typography variant="body2" color="text.secondary">
              重启网易云 API 模块以应用配置变更
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRestartApi}>
            重启
          </Button>
        </CardContent>
      </Card>

      {/* Settings */}
      {settingsLoaded && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>站点设置</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={allowRegistration}
                  onChange={(e) => handleToggleRegistration(e.target.checked)}
                />
              }
              label="允许新用户注册"
            />
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card variant="outlined">
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>用户管理</Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>用户名</TableCell>
                    <TableCell>邮箱</TableCell>
                    <TableCell>角色</TableCell>
                    <TableCell>注册时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        暂无用户
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{u.username}</TableCell>
                        <TableCell>
                          {editingEmail?.id === u.id ? (
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <TextField
                                size="small"
                                value={editingEmail.email}
                                onChange={(e) => setEditingEmail({ ...editingEmail, email: e.target.value })}
                                sx={{ width: 200 }}
                              />
                              <Button size="small" variant="contained" onClick={handleSaveEmail}>保存</Button>
                              <Button size="small" onClick={() => setEditingEmail(null)}>取消</Button>
                            </Box>
                          ) : (
                            <Typography
                              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                              onClick={() => setEditingEmail({ id: u.id, email: u.email })}
                            >
                              {u.email}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={u.role === "admin" ? "管理员" : "用户"}
                            color={u.role === "admin" ? "primary" : "default"}
                            size="small"
                            icon={u.role === "admin" ? <AdminPanelSettingsIcon /> : undefined}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {u.role !== "admin" && (
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => {
                                setDeleteTarget(u);
                                setDeleteOpen(true);
                              }}
                            >
                              删除
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除用户</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除用户 <strong>{deleteTarget?.username}</strong> 吗？此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>取消</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>删除</Button>
        </DialogActions>
      </Dialog>

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
