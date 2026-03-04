import { useCallback, useEffect, useRef, useState } from "react";
import { TickerSnapshot } from "../api/types";

type WsStatus = "connecting" | "open" | "closed";

type WsEvent = {
  type?: string;
  message?: string;
  data?: any;
  [key: string]: any;
};

function getWsUrl() {
  const host = window.location.hostname || "127.0.0.1";
  const port = 8080;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${host}:${port}/ws`;
}

export function useMarketWebSocket(
  onPriceUpdate: (updates: TickerSnapshot[]) => void,
  onEvent?: (evt: WsEvent) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<string[]>([]);
  const [status, setStatus] = useState<WsStatus>("connecting");

  // ✅ store latest callbacks in refs (prevents reconnect loop)
  const onPriceUpdateRef = useRef(onPriceUpdate);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const sendJson = useCallback((obj: unknown) => {
    const msg = JSON.stringify(obj);
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      queueRef.current.push(msg);
      return;
    }
    ws.send(msg);
  }, []);

  useEffect(() => {
    const url = getWsUrl();
    console.log("[WS] connecting to", url);

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      console.log("[WS] open");
      setStatus("open");

      ws.send(JSON.stringify({ type: "subscribe" }));

      // flush queued messages
      while (queueRef.current.length) {
        const m = queueRef.current.shift();
        if (m) ws.send(m);
      }
    };

    ws.onerror = (e) => {
      console.log("[WS] error", e);
      setStatus("closed");
    };

    ws.onclose = (e) => {
      console.log("[WS] close", e.code, e.reason);
      setStatus("closed");
    };

    ws.onmessage = (ev) => {
      let msg: WsEvent;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (msg.type === "price_update") {
        const updates = Array.isArray(msg.data) ? (msg.data as TickerSnapshot[]) : [];
        onPriceUpdateRef.current(updates);
        return;
      }

      onEventRef.current?.(msg);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  return { status, sendJson };
}
