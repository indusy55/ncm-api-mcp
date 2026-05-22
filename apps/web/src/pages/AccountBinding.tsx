import { Button, Typography, Alert, Spin, Card } from "antd";
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQrPolling } from "../hooks/useNeteaseAccount.js";
import { useNavigate } from "react-router-dom";
import QrCodeDisplay from "../components/QrCodeDisplay.js";

const { Title, Text } = Typography;

export default function AccountBinding() {
  const navigate = useNavigate();

  const onConfirmed = () => {
    // Navigate to dashboard after a short delay
    setTimeout(() => navigate("/"), 2000);
  };

  const { qrImage, pollState, qrNickname, startQrFlow, reset } =
    useQrPolling(onConfirmed);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px" }}>
      <Title level={4}>Bind NetEase Account</Title>

      {!qrImage && pollState !== "expired" && (
        <Card>
          <div style={{ textAlign: "center" }}>
            <QrcodeOutlined style={{ fontSize: 64, color: "#999", marginBottom: 16 }} />
            <br />
            <Button type="primary" size="large" onClick={startQrFlow}>
              Start QR Login
            </Button>
          </div>
        </Card>
      )}

      {qrImage && (
        <Card>
          <div style={{ textAlign: "center" }}>
            <QrCodeDisplay image={qrImage} />

            <div style={{ marginTop: 16 }}>
              {pollState === "waiting" && (
                <div>
                  <Spin />
                  <br />
                  <Text type="secondary">
                    Please scan the QR code with the NetEase Cloud Music app
                  </Text>
                </div>
              )}

              {pollState === "scanned" && (
                <Alert
                  type="info"
                  showIcon
                  icon={<ClockCircleOutlined />}
                  message={`Scan detected${qrNickname ? ` (${qrNickname})` : ""}`}
                  description="Please confirm the login on your phone"
                />
              )}

              {pollState === "confirmed" && (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  message="Binding successful!"
                  description={`Logged in as ${qrNickname}`}
                />
              )}

              {pollState === "expired" && (
                <Alert
                  type="error"
                  message="QR code expired"
                  description={
                    <div>
                      <Text>The QR code has expired. Please try again.</Text>
                      <br />
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={reset}
                        style={{ marginTop: 8 }}
                      >
                        Try Again
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
