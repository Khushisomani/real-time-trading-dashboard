import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

import { MarketData } from "./main/market/marketData.js";
import { tickersRouter } from "./main/routes/tickers.js";
import { historyRouter } from "./main/routes/history.js";
import loginRouter from "./main/routes/login.js";
import { attachWsHub } from "./main/ws/hub.js";

const PORT = Number(process.env.PORT ?? 8080);

const app = express();
app.use(cors());
app.use(express.json());

const market = new MarketData();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/tickers", tickersRouter(market));
app.use("/api/history", historyRouter(market));
app.use("/api/login", loginRouter);

const server = http.createServer(app);

// WebSocket hosted on /ws
const wss = new WebSocketServer({ server, path: "/ws" });
attachWsHub(wss, market);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket on ws://localhost:${PORT}/ws`);
});
