import { PricePoint, TickerSnapshot, TickerSymbol } from "./types.js";

const DEFAULT_TICKERS: TickerSymbol[] = ["BTC-USD", "ETH-USD", "SOL-USD", "AAPL", "TSLA"];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randomWalk(prev: number, volPct: number) {
  // small random walk in percentage terms
  const r = (Math.random() * 2 - 1) * volPct;
  return prev * (1 + r / 100);
}

export class MarketData {
  private tickers: TickerSymbol[];
  private prices: Map<TickerSymbol, number>;
  private history: Map<TickerSymbol, PricePoint[]>;
  private maxHistoryPoints: number;

  constructor(opts?: { tickers?: TickerSymbol[]; maxHistoryPoints?: number }) {
    this.tickers = opts?.tickers ?? DEFAULT_TICKERS;
    this.maxHistoryPoints = opts?.maxHistoryPoints ?? 500;

    this.prices = new Map();
    this.history = new Map();

    // seed initial prices
    for (const s of this.tickers) {
      const seed =
        s === "BTC-USD" ? 60000 :
        s === "ETH-USD" ? 3000 :
        s === "SOL-USD" ? 120 :
        s === "AAPL" ? 190 :
        180; // TSLA

      this.prices.set(s, seed);
      this.history.set(s, []);
    }
  }

  listTickers(): TickerSymbol[] {
    return [...this.tickers];
  }

  getSnapshot(symbol: TickerSymbol): TickerSnapshot {
    const price = this.prices.get(symbol);
    if (price == null) throw new Error(`Unknown symbol ${symbol}`);
    const ts = Date.now();

    // mocked 24h change derived from a bounded random
    const change24hPct = clamp((Math.random() * 6 - 3), -12, 12);

    return { symbol, price: round2(price), change24hPct, ts };
  }

  getAllSnapshots(): TickerSnapshot[] {
    return this.tickers.map((s) => this.getSnapshot(s));
  }

  getHistory(symbol: TickerSymbol, limit = 120): PricePoint[] {
    const arr = this.history.get(symbol);
    if (!arr) throw new Error(`Unknown symbol ${symbol}`);
    const start = Math.max(0, arr.length - limit);
    return arr.slice(start);
  }

  step(): TickerSnapshot[] {
    const ts = Date.now();
    const updates: TickerSnapshot[] = [];

    for (const s of this.tickers) {
      const prev = this.prices.get(s)!;

      // volatility tuning
      const vol =
        s.endsWith("USD") ? 0.25 :
        s === "TSLA" ? 0.35 :
        0.18;

      const next = randomWalk(prev, vol);
      this.prices.set(s, next);

      const hist = this.history.get(s)!;
      hist.push({ ts, price: round2(next) });
      if (hist.length > this.maxHistoryPoints) hist.splice(0, hist.length - this.maxHistoryPoints);

      updates.push({
        symbol: s,
        price: round2(next),
        change24hPct: clamp((Math.random() * 6 - 3), -12, 12),
        ts
      });
    }

    return updates;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}