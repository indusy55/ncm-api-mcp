import { useState } from "react";
import {
  Box, Drawer, AppBar, Toolbar, Typography, Button, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  CircularProgress, Alert, Snackbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import BuildIcon from "@mui/icons-material/Build";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";
import { useNeteaseAccount } from "../hooks/useNeteaseAccount.js";
import { useMediaQuery, useTheme } from "@mui/material";

const DRAWER_WIDTH = 200;

function Sidebar({
  mode,
  onNavigate,
}: {
  mode: "user" | "admin";
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/", label: "控制台", icon: <DashboardIcon /> },
    { key: "/account/profile", label: "个人资料", icon: <ManageAccountsIcon /> },
    { key: "/account/bind", label: "网易云账号", icon: <PersonIcon /> },
    { key: "/account/keys", label: "API 密钥", icon: <KeyIcon /> },
    { key: "/mcp-setup", label: "MCP 配置", icon: <MenuBookIcon /> },
    { key: "/tools", label: "工具管理", icon: <BuildIcon /> },
  ];

  const adminItems = [
    { key: "/admin/users", label: "用户管理", icon: <SupervisedUserCircleIcon /> },
    { key: "/admin/tools", label: "工具策略", icon: <TuneIcon /> },
  ];

  const visibleItems = mode === "admin" ? adminItems : menuItems;

  return (
    <Box>
      <Box sx={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>
        NCM MCP
      </Box>
      <List>
        {visibleItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={location.pathname === item.key}
              onClick={() => {
                navigate(item.key);
                onNavigate?.();
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default function AppLayout({ mode }: { mode: "user" | "admin" }) {
  const { user, loading, logout } = useAuth();
  const { status } = useNeteaseAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState(false);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAdmin = user.role === "admin";
  const isAdminRoute = location.pathname.startsWith("/admin/");

  if (mode === "admin" && !isAdmin) {
    navigate("/");
    return null;
  }

  const toggleAdminView = () => {
    navigate(mode === "admin" ? "/" : "/admin/tools");
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          disableEnforceFocus
          disableAutoFocus
          sx={{
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          <Sidebar mode={mode} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          <Sidebar mode={mode} />
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="sticky" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.appBar }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {isAdmin && (
              <Button
                variant="text"
                startIcon={mode === "admin" ? <VisibilityOffIcon /> : <VisibilityIcon />}
                onClick={toggleAdminView}
                sx={{ ml: isMobile ? 0 : 1 }}
              >
                {mode === "admin" ? "退出管理员视图" : "进入管理员视图"}
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography sx={{ mr: 2 }}>{user.username}</Typography>
            <Button
              variant="text"
              startIcon={<LogoutIcon />}
              onClick={() => {
                logout();
                setLogoutMsg(true);
                setTimeout(() => navigate("/login"), 500);
              }}
            >
              退出登录
            </Button>
          </Toolbar>
        </AppBar>

        {/* Account expired banner */}
        {status === "expired" && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            网易云账号 Cookie 已过期，部分 MCP 工具可能无法使用。请
            <Button
              size="small"
              sx={{ mx: 0.5, fontWeight: 600, verticalAlign: "inherit" }}
              onClick={() => navigate("/account/bind")}
            >
              重新绑定
            </Button>
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
      <Snackbar open={logoutMsg} autoHideDuration={2000} onClose={() => setLogoutMsg(false)}>
        <Alert severity="success" variant="filled">已退出登录</Alert>
      </Snackbar>
    </Box>
  );
}
