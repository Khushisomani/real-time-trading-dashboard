import { Router } from "express";
import { MarketData } from "../market/marketData.js";
import { TickerSymbol } from "../market/types.js";

type CacheEntry = {
  points: ReturnType<MarketData["getHistory"]>;
  createdAt: number;
};

const HISTORY_TTL_MS = 60_000; // 1 minute
const historyCache = new Map<string, CacheEntry>();

function cacheKey(symbol: string, limit: number) {
  return `${symbol}::${limit}`;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of historyCache.entries()) {
    if (now - entry.createdAt > HISTORY_TTL_MS) {
      historyCache.delete(key);
    }
  }
}, 30_000);

export function historyRouter(market: MarketData) {
  const router = Router();

  router.get("/:symbol", (req, res) => {
    const symbol = req.params.symbol as TickerSymbol;

    const rawLimit = Number(req.query.limit ?? 120);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 500) : 120;

    try {
      const key = cacheKey(symbol, limit);
      const cached = historyCache.get(key);

      if (cached && Date.now() - cached.createdAt < HISTORY_TTL_MS) {
        return res.json({
          symbol,
          source: "cache",
          points: cached.points
        });
      }

      const points = market.getHistory(symbol, limit);

      historyCache.set(key, { points, createdAt: Date.now() });

      return res.json({
        symbol,
        source: "generated",
        points
      });

    } catch (e) {
      return res.status(404).json({ error: (e as Error).message });
    }
  });

  return router;
}