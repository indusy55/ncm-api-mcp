import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import api from "../api/client.js";

interface ToolItem {
  name: string;
  module: string;
  moduleLabel: string;
  action: string;
  actionLabel: string;
  description: string;
  audience: "guest" | "user" | "both";
  destructive: boolean;
  admin: {
    guestEnabled: boolean;
    userEnabled: boolean;
    canManageGuest: boolean;
    canManageUser: boolean;
  };
  user: {
    visible: boolean;
    enabled: boolean;
    hasPreference: boolean;
    canManage: boolean;
  };
}

interface ToolGroup {
  module: string;
  moduleLabel: string;
  items: ToolItem[];
}

export default function AdminTools() {
  const [groups, setGroups] = useState<ToolGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showSnackbar = (severity: "success" | "error", message: string) => {
    setSnackbar({ open: true, severity, message });
  };

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ groups: ToolGroup[] }>("/admin/tools");
      setGroups(res.data.groups);
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "获取工具策略失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleToggle = async (toolName: string, subject: "guest" | "user", enabled: boolean) => {
    setSaving(`${toolName}:${subject}`);
    try {
      await api.put("/admin/tools", { toolName, subject, enabled });
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.name === toolName
              ? {
                  ...item,
                  admin: {
                    ...item.admin,
                    ...(subject === "guest" ? { guestEnabled: enabled } : { userEnabled: enabled }),
                  },
                }
              : item,
          ),
        })),
      );
      showSnackbar("success", enabled ? "工具策略已开启" : "工具策略已关闭");
    } catch (err: any) {
      showSnackbar("error", err.response?.data?.error || "更新策略失败");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <TuneIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>工具策略</Typography>
      </Box>

      <Stack spacing={2.5}>
        {groups.map((group) => (
          <Card key={group.module} variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {group.moduleLabel}
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={0}>
                {group.items.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      py: 1.5,
                      display: "flex",
                      gap: 2,
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", lg: "center" },
                      flexDirection: { xs: "column", lg: "row" },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                        <Typography sx={{ fontWeight: 600 }}>{item.actionLabel}</Typography>
                        <Chip
                          label={item.destructive ? "写操作" : "只读"}
                          size="small"
                          color={item.destructive ? "warning" : "default"}
                        />
                      </Box>
                      <Typography color="text.secondary" sx={{ fontSize: 14, mb: 0.5 }}>
                        {item.description}
                      </Typography>
                      <Typography
                        component="code"
                        sx={{
                          fontSize: 12,
                          color: "text.secondary",
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <FormControlLabel
                        sx={{ mr: 0 }}
                        control={
                          <Switch
                            checked={item.admin.guestEnabled}
                            disabled={!item.admin.canManageGuest || saving === `${item.name}:guest`}
                            onChange={(e) => handleToggle(item.name, "guest", e.target.checked)}
                          />
                        }
                        label="游客"
                      />
                      <FormControlLabel
                        sx={{ mr: 0 }}
                        control={
                          <Switch
                            checked={item.admin.userEnabled}
                            disabled={!item.admin.canManageUser || saving === `${item.name}:user`}
                            onChange={(e) => handleToggle(item.name, "user", e.target.checked)}
                          />
                        }
                        label="登录用户"
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

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
