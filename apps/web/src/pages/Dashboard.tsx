import { Card, Button, Typography, Tag, Spin, Row, Col, Space } from "antd";
import {
  UserOutlined,
  KeyOutlined,
  LinkOutlined,
  DisconnectOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useNeteaseAccount } from "../hooks/useNeteaseAccount.js";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { status, account, refresh } = useNeteaseAccount();
  const navigate = useNavigate();

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        {/* NetEase Account Status */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                NetEase Account
              </Space>
            }
            actions={
              status === "none"
                ? [
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      onClick={() => navigate("/account/bind")}
                    >
                      Bind Account
                    </Button>,
                  ]
                : [
                    <Button
                      icon={<DisconnectOutlined />}
                      onClick={async () => {
                        // Import api directly for unbind
                        const api = (await import("../api/client.js")).default;
                        await api.delete("/netease/unbind");
                        refresh();
                      }}
                    >
                      Unbind
                    </Button>,
                  ]
            }
          >
            {status === "none" && (
              <Text type="secondary">
                No NetEase account bound yet. Click to bind.
              </Text>
            )}

            {status === "bound" && account && (
              <Space direction="vertical">
                <Space>
                  <Text strong>{account.nickname}</Text>
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Active
                  </Tag>
                </Space>
                <Text type="secondary">UID: {account.neteaseUid}</Text>
              </Space>
            )}

            {status === "expired" && account && (
              <Space direction="vertical">
                <Space>
                  <Text strong>{account.nickname}</Text>
                  <Tag color="red" icon={<ExclamationCircleOutlined />}>
                    Cookie Expired
                  </Tag>
                </Space>
                <Text type="secondary">
                  Please re-bind your account to continue using MCP tools.
                </Text>
              </Space>
            )}
          </Card>
        </Col>

        {/* API Key Summary */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <KeyOutlined />
                API Keys
              </Space>
            }
            actions={[
              <Button
                type="primary"
                icon={<KeyOutlined />}
                onClick={() => navigate("/account/keys")}
              >
                Manage Keys
              </Button>,
            ]}
          >
            <Text type="secondary">
              Manage your API keys for MCP server authentication.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
