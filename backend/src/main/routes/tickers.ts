import { Router } from "express";
import { MarketData } from "../market/marketData.js";

export function tickersRouter(market: MarketData) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ tickers: market.listTickers() });
  });

  router.get("/snapshots", (_req, res) => {
    res.json({ snapshots: market.getAllSnapshots() });
  });

  return router;
}