import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import { MarketData } from "./main/market/marketData.js";
import { tickersRouter } from "./main/routes/tickers.js";
import { historyRouter } from "./main/routes/history.js";
import loginRouter from "./main/routes/login.js";
import { WsHub } from "./main/ws/hub.js";

const PORT = Number(process.env.PORT ?? 8080);
const TICK_MS = Number(process.env.TICK_MS ?? 1000);

const app = express();
app.use(cors());
app.use(express.json());

const market = new MarketData();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/tickers", tickersRouter(market));
app.use("/api/history", historyRouter(market));
app.use("/api/login", loginRouter);


const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });
const hub = new WsHub(wss);

// drive updates
setInterval(() => {
  const updates = market.step();
  hub.broadcastTickerUpdates(updates);
}, TICK_MS);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`WebSocket on ws://localhost:${PORT}/ws`);
});