import { WebSocketServer, WebSocket } from "ws";
import { TickerSnapshot } from "../main/market/types.js";

type Client = WebSocket & { isAlive?: boolean };

export class WsHub {
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    this.wss = wss;

    // heartbeat
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const c = ws as Client;
        if (c.isAlive === false) return c.terminate();
        c.isAlive = false;
        c.ping();
      });
    }, 30000);

    this.wss.on("close", () => clearInterval(interval));

    this.wss.on("connection", (ws) => {
      const c = ws as Client;
      c.isAlive = true;
      ws.on("pong", () => { c.isAlive = true; });

      ws.on("message", (data) => {
        // Optional: could accept subscribe messages later
        // Keep it simple: broadcast-only feed.
        void data;
      });
    });
  }

  broadcastTickerUpdates(updates: TickerSnapshot[]) {
    const payload = JSON.stringify({ type: "TICKER_UPDATE", data: updates });

    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(payload);
    });
  }
}