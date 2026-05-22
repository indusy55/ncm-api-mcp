import { useState, useEffect, useCallback } from "react";
import api from "../api/client.js";

interface NeteaseAccount {
  neteaseUid: number;
  nickname: string;
  avatarUrl: string | null;
  status: "active" | "expired";
}

type BindingStatus =
  | { bound: false }
  | { bound: true; account: NeteaseAccount };

export function useNeteaseAccount() {
  const [status, setStatus] = useState<"none" | "loading" | "bound" | "expired">("loading");
  const [account, setAccount] = useState<NeteaseAccount | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<BindingStatus>("/netease/status");
      if (res.data.bound) {
        setAccount(res.data.account);
        setStatus(res.data.account.status === "active" ? "bound" : "expired");
      } else {
        setAccount(null);
        setStatus("none");
      }
    } catch {
      setAccount(null);
      setStatus("none");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, account, refresh };
}

type QrPollState = "waiting" | "scanned" | "confirmed" | "expired";

export function useQrPolling(onConfirmed: () => void) {
  const [key, setKey] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [pollState, setPollState] = useState<QrPollState | null>(null);
  const [qrNickname, setQrNickname] = useState<string | null>(null);

  const startQrFlow = useCallback(async () => {
    // Step 1: Get QR key
    const keyRes = await api.post<{ key: string }>("/netease/qr-key");
    const qrKey = keyRes.data.key;
    setKey(qrKey);
    setPollState("waiting");

    // Step 2: Get QR image
    const imgRes = await api.post<{ qrimg: string }>("/netease/qr-image", {
      key: qrKey,
    });
    setQrImage(imgRes.data.qrimg);

    // Step 3: Start polling
    const poll = async () => {
      try {
        const statusRes = await api.get<{
          status: QrPollState;
          nickname?: string;
          uid?: number;
        }>(`/netease/qr-status?key=${qrKey}`);

        const { status } = statusRes.data;

        if (status === "confirmed") {
          setPollState("confirmed");
          setQrNickname(statusRes.data.nickname ?? null);
          onConfirmed();
          return;
        }

        if (status === "scanned") {
          setPollState("scanned");
          setQrNickname(statusRes.data.nickname ?? null);
        }

        if (status === "expired") {
          setPollState("expired");
          return;
        }

        // Continue polling
        setTimeout(poll, 3000);
      } catch {
        setPollState("expired");
      }
    };

    setTimeout(poll, 3000);
  }, [onConfirmed]);

  const reset = useCallback(() => {
    setKey(null);
    setQrImage(null);
    setPollState(null);
    setQrNickname(null);
  }, []);

  return { key, qrImage, pollState, qrNickname, startQrFlow, reset };
}
