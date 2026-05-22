import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Input, Typography, message, Tag, Space, Alert } from "antd";
import { KeyOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";
import api from "../api/client.js";

const { Title, Text, Paragraph } = Typography;

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
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

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ keys: ApiKey[] }>("/keys");
      setKeys(res.data.keys);
    } catch {
      message.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      message.warning("Please enter a name");
      return;
    }
    try {
      const res = await api.post("/keys", { name: newKeyName });
      setNewKeyResult(res.data);
      setCreateOpen(false);
      setNewKeyName("");
      fetchKeys();
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to create key");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/keys/${id}`);
      message.success("Key revoked");
      fetchKeys();
    } catch (err: any) {
      message.error(err.response?.data?.error || "Failed to revoke key");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Key",
      dataIndex: "keyPrefix",
      key: "keyPrefix",
      render: (prefix: string) => <Text code>{prefix}...</Text>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Revoked</Tag>
        ),
    },
    {
      title: "Last Used",
      dataIndex: "lastUsedAt",
      key: "lastUsedAt",
      render: (val: string | null) => (val ? new Date(val).toLocaleString() : "Never"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ApiKey) => (
        <Space>
          {record.isActive && (
            <Button
              danger
              size="small"
              onClick={() => handleRevoke(record.id)}
            >
              Revoke
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={4}>
          <KeyOutlined /> API Keys
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Create API Key
        </Button>
      </div>

      <Table
        dataSource={keys}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="Create API Key"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => setCreateOpen(false)}
        okText="Create"
      >
        <Input
          placeholder="Key name (e.g., My Claude Config)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
        />
      </Modal>

      <Modal
        title="API Key Created"
        open={!!newKeyResult}
        onCancel={() => setNewKeyResult(null)}
        footer={
          <Button
            type="primary"
            onClick={() => {
              if (newKeyResult) {
                navigator.clipboard.writeText(newKeyResult.fullKey);
                message.success("Copied to clipboard");
              }
            }}
            icon={<CopyOutlined />}
          >
            Copy Key
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="This key will only be shown once. Copy it now!"
          style={{ marginBottom: 16 }}
        />
        <Paragraph>
          <Text strong>Name:</Text> {newKeyResult?.name}
        </Paragraph>
        <Paragraph>
          <Text strong>Key:</Text>
        </Paragraph>
        <div
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 6,
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {newKeyResult?.fullKey}
        </div>
      </Modal>
    </div>
  );
}
