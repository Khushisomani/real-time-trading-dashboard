import { WebSocketServer, WebSocket } from "ws";
import { MarketData } from "../market/marketData.js";
import { TickerSymbol, TickerSnapshot } from "../market/types.js";

type Alert = {
  ticker: TickerSymbol;
  condition: "above" | "below";
  threshold: number;
};

const clientAlerts = new Map<WebSocket, Alert[]>();

export function attachWsHub(wss: WebSocketServer, market: MarketData, tickMs = 1000) {
  wss.on("connection", (ws) => {
    clientAlerts.set(ws, []);

    ws.on("message", (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      if (msg.type === "subscribe") {
        ws.send(JSON.stringify({ type: "connected" }));
        return;
      }

      if (msg.type === "set_alert") {
        const p = msg.payload ?? {};
        const valid =
          typeof p.ticker === "string" &&
          (p.condition === "above" || p.condition === "below") &&
          typeof p.threshold === "number";

        if (!valid) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid alert payload" }));
          return;
        }

        const alerts = clientAlerts.get(ws) ?? [];
        alerts.push({ ticker: p.ticker, condition: p.condition, threshold: p.threshold });
        clientAlerts.set(ws, alerts);

        ws.send(JSON.stringify({ type: "alert_set", message: "Alert registered" }));
      }
    });

    ws.on("close", () => {
      clientAlerts.delete(ws);
    });
  });

  setInterval(() => {
    const updates: TickerSnapshot[] = market.step();

    // broadcast prices
    const payload = JSON.stringify({ type: "price_update", data: updates });
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(payload);
    });

    // check alerts per client
    wss.clients.forEach((ws) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const alerts = clientAlerts.get(ws) ?? [];
      if (alerts.length === 0) return;

      const remaining: Alert[] = [];

      for (const a of alerts) {
        const u = updates.find((x) => x.symbol === a.ticker);
        if (!u) {
          remaining.push(a);
          continue;
        }

        const triggered = a.condition === "above" ? u.price >= a.threshold : u.price <= a.threshold;

        if (triggered) {
          ws.send(
            JSON.stringify({
              type: "alert_triggered",
              message: `${a.ticker} crossed ${a.condition} ${a.threshold}. Current: ${u.price}`,
              data: { ...a, currentPrice: u.price, ts: Date.now() }
            })
          );
        } else {
          remaining.push(a);
        }
      }

      clientAlerts.set(ws, remaining);
    });
  }, tickMs);
}
