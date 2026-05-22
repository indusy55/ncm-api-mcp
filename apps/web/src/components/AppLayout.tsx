import { Box, Drawer, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CircularProgress } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";

const DRAWER_WIDTH = 200;

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const menuItems = [
    { key: "/", label: "控制台", icon: <DashboardIcon /> },
    { key: "/account/bind", label: "网易云账号", icon: <PersonIcon /> },
    { key: "/account/keys", label: "API 密钥", icon: <KeyIcon /> },
    { key: "/mcp-setup", label: "MCP 配置", icon: <MenuBookIcon /> },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        <Box sx={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>
          NCM MCP
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                selected={location.pathname === item.key}
                onClick={() => navigate(item.key)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <Typography sx={{ mr: 2 }}>{user.displayName}</Typography>
            <Button
              variant="text"
              startIcon={<LogoutIcon />}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              退出登录
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
