import { Layout, Menu, Button, Typography, Spin } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  KeyOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.js";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/account/bind",
      icon: <UserOutlined />,
      label: "NetEase Account",
    },
    {
      key: "/account/keys",
      icon: <KeyOutlined />,
      label: "API Keys",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          style={{
            color: "white",
            padding: 16,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          NCM MCP
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Text style={{ marginRight: 16 }}>{user.displayName}</Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
