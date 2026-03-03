import { useEffect, useRef, useState } from "react";
import { wsUrl } from "../api/client";
import { TickerSnapshot } from "../api/types";

type WsMessage =
  | { type: "TICKER_UPDATE"; data: TickerSnapshot[] };

export function useMarketWebSocket(onUpdate: (updates: TickerSnapshot[]) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");

  useEffect(() => {
    let alive = true;
    let retry = 0;
    let retryTimer: number | null = null;

    function connect() {
      if (!alive) return;
      setStatus("connecting");

      const ws = new WebSocket(wsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        retry = 0;
        setStatus("open");
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as WsMessage;
          if (msg.type === "TICKER_UPDATE") onUpdate(msg.data);
        } catch {
          // ignore malformed
        }
      };

      ws.onclose = () => {
        setStatus("closed");
        if (!alive) return;
        // exponential backoff: 0.5s, 1s, 2s, 4s ... max 8s
        retry += 1;
        const delay = Math.min(8000, 500 * Math.pow(2, retry - 1));
        retryTimer = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // let close handler do reconnection
      };
    }

    connect();

    return () => {
      alive = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [onUpdate]);

  return { status };
}