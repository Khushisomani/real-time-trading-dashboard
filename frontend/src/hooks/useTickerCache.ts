import { useEffect, useRef, useState } from "react";
import { fetchHistory } from "../api/client";
import { PricePoint, TickerSymbol } from "../api/types";

type CacheEntry = { ts: number; data: PricePoint[] };

export function useTickerHistory(symbol: TickerSymbol, limit = 120, ttlMs = 30_000) {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const [data, setData] = useState<PricePoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const key = `${symbol}:${limit}`;
    const now = Date.now();
    const cached = cache.current.get(key);

    async function run() {
      setError(null);

      if (cached && now - cached.ts < ttlMs) {
        setData(cached.data);
        return;
      }

      setLoading(true);
      try {
        const points = await fetchHistory(symbol, limit);
        if (!alive) return;
        cache.current.set(key, { ts: Date.now(), data: points });
        setData(points);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void run();
    return () => { alive = false; };
  }, [symbol, limit, ttlMs]);

  return { data, loading, error };
}