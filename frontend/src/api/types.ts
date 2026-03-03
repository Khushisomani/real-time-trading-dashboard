export type TickerSymbol = "BTC-USD" | "ETH-USD" | "SOL-USD" | "AAPL" | "TSLA";

export type TickerSnapshot = {
    symbol: TickerSymbol;
    price: number;
    change24hPct: number;
    ts: number;
}

export type PricePoint = {
    ts: number;
    price: number;
}
