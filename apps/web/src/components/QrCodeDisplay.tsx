interface QrCodeDisplayProps {
  image: string;
}

export default function QrCodeDisplay({ image }: QrCodeDisplayProps) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: 16,
        background: "#fff",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
      }}
    >
      <img
        src={image}
        alt="QR Code"
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
