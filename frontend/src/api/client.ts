import { PricePoint, TickerSnapshot, TickerSymbol } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function fetchTickers(): Promise<TickerSymbol[]> {
    const ticker = await fetch(`${API_BASE}/api/tickers`);
    try {
        const result = await ticker.json();
        console.log(result)
        return result?.tickers;

    } catch (err){
        console.log(err)
        throw new Error("Failed to fetch tickers");
    }
}

export async function fetchSnapshots(): Promise<TickerSnapshot[]> {
    const snapshot = await fetch(`${API_BASE}/api/tickers/snapshots`);
    try {
        const result = await snapshot.json();
        return result.shapshots;
    }
    catch {
        throw new Error("Failed to fetch snapshots");
    }
}

export async function fetchHistory(symbol: TickerSymbol, limit = 120): Promise<PricePoint[]> {
    const history = await fetch(`${API_BASE}/api/history/${encodeURIComponent(symbol)}?limit=${limit}`);
    console.log(symbol)
    try {
       const result = await history.json();
       return result.points;
    }
    catch {
        throw new Error("Failed to fetch history");
    }
  }



