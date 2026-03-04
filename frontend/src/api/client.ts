import { PricePoint, TickerSnapshot, TickerSymbol } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export async function fetchTickers(): Promise<TickerSymbol[]> {
    const ticker = await fetch(`${API_BASE}/api/tickers`);
    try {
        const result = await ticker.json();
        return result?.tickers;

    } catch {
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
    try {
       const result = await history.json();
       return result.points;
    }
    catch {
        throw new Error("Failed to fetch history");
    }
  }

  export async function fetchLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    try {
        const result = await res.json();
        return result.token;
    }
    catch {
        throw new Error("Invalid credentials")
    }
}
  
  export function wsUrl(): string {
    const base = API_BASE.replace(/^http/, "ws");
    return `${base}/ws`;
  }
