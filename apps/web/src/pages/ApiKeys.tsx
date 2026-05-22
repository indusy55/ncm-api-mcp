import { useState, useEffect, useCallback } from "react";
import {
  Box, Button, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Card, CardContent,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import api from "../api/client.js";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning";
}

interface UsageLog {
  id: string;
  toolName: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<{
    fullKey: string;
    name: string;
  } | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [logKeyId, setLogKeyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const showSnackbar = (
    severity: SnackbarState["severity"],
    message: string
  ) => {
    setSnackbar({ open: true, severity, message });
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ keys: ApiKey[] }>("/keys");
      setKeys(res.data.keys);
    } catch {
      showSnackbar("error", "获取 API 密钥失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      showSnackbar("warning", "请输入名称");
      return;
    }
    try {
      const res = await api.post("/keys", { name: newKeyName });
      setNewKeyResult(res.data);
      setCreateOpen(false);
      setNewKeyName("");
      fetchKeys();
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "创建密钥失败");
    }
  };

  const handleOpenLogs = async (keyId: string) => {
    setLogKeyId(keyId);
    setLogsLoading(true);
    try {
      const res = await api.get<{ logs: UsageLog[] }>(`/keys/${keyId}/logs`);
      setLogs(res.data.logs);
    } catch {
      showSnackbar("error", "获取使用日志失败");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/keys/${id}`);
      showSnackbar("success", "密钥已撤销");
      fetchKeys();
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "撤销密钥失败");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <KeyIcon /> API 密钥
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          创建密钥
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Mobile: card layout */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1 }}>
            {keys.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                暂无 API 密钥
              </Typography>
            ) : (
              keys.map((key) => (
                <Card key={key.id} variant="outlined">
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{key.name}</Typography>
                      <Chip
                        label={key.isActive ? "已启用" : "已撤销"}
                        color={key.isActive ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                    <Typography
                      component="code"
                      sx={{ fontFamily: "monospace", fontSize: 13, bgcolor: "grey.100", px: 0.5, py: 0.25, borderRadius: 0.5 }}
                    >
                      {key.keyPrefix}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      最后使用：{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "从未使用"}
                    </Typography>
                  </CardContent>
                  <Box sx={{ display: "flex", gap: 0.5, px: 1, pb: 1 }}>
                    <Button size="small" variant="text" startIcon={<HistoryIcon />} onClick={() => handleOpenLogs(key.id)}>
                      日志
                    </Button>
                    {key.isActive && (
                      <Button size="small" variant="outlined" color="error" onClick={() => handleRevoke(key.id)}>
                        撤销
                      </Button>
                    )}
                  </Box>
                </Card>
              ))
            )}
          </Box>

          {/* Desktop: table */}
          <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: "none", sm: "block" }, overflowX: "auto" }}>
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow>
                  <TableCell>名称</TableCell>
                  <TableCell>密钥</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>最后使用</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      暂无 API 密钥
                    </TableCell>
                  </TableRow>
                ) : (
                  keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{key.name}</TableCell>
                      <TableCell>
                        <Typography component="code" sx={{ fontFamily: "monospace", fontSize: 13, bgcolor: "grey.100", px: 0.5, py: 0.25, borderRadius: 0.5 }}>
                          {key.keyPrefix}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={key.isActive ? "已启用" : "已撤销"} color={key.isActive ? "success" : "error"} size="small" />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" color="text.secondary">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "从未使用"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button size="small" variant="text" startIcon={<HistoryIcon />} onClick={() => handleOpenLogs(key.id)}>日志</Button>
                          {key.isActive && (
                            <Button size="small" variant="outlined" color="error" onClick={() => handleRevoke(key.id)}>撤销</Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>创建 API 密钥</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="密钥名称（如：我的 Claude 配置）"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreate}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Key Result Dialog */}
      <Dialog
        open={!!newKeyResult}
        onClose={() => setNewKeyResult(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>API 密钥已创建</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            该密钥仅显示一次，请立即复制！
          </Alert>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Name:</strong> {newKeyResult?.name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Key:</strong>
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.100",
              p: 1.5,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 13,
              wordBreak: "break-all",
            }}
          >
            {newKeyResult?.fullKey}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (newKeyResult) {
                navigator.clipboard.writeText(newKeyResult.fullKey);
                showSnackbar("success", "已复制到剪贴板");
              }
            }}
          >
            复制密钥
          </Button>
          <Button onClick={() => setNewKeyResult(null)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* Usage Log Dialog */}
      <Dialog
        open={!!logKeyId}
        onClose={() => setLogKeyId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>API 密钥使用日志</DialogTitle>
        <DialogContent>
          {logsLoading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              暂无使用记录
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>时间</TableCell>
                    <TableCell>工具</TableCell>
                    <TableCell>IP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="code"
                          sx={{ fontFamily: "monospace", fontSize: 13, bgcolor: "grey.100", px: 0.5, py: 0.25, borderRadius: 0.5 }}
                        >
                          {log.toolName}
                        </Typography>
                      </TableCell>
                      <TableCell>{log.ipAddress || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogKeyId(null)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
