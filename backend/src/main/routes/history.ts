import { Router } from "express";
import { MarketData } from "../market/marketData.js";
import { TickerSymbol } from "../market/types.js";

export function historyRouter(market: MarketData) {
  const router = Router();

  router.get("/:symbol", (req, res) => {
    const symbol = req.params.symbol as TickerSymbol;
    const limit = Number(req.query.limit ?? 120);

    try {
      const data = market.getHistory(symbol, Number.isFinite(limit) ? limit : 120);
      res.json({ symbol, points: data });
    } catch (e) {
      res.status(404).json({ error: (e as Error).message });
    }
  });

  return router;
}