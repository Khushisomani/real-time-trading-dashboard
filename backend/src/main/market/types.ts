export type TickerSymbol = "BTC-USD" | "ETH-USD" | "SOL-USD" | "AAPL" | "TSLA";

export type PricePoint = {
    ts: number;      
    price: number;
  };
  
  export type TickerSnapshot = {
    symbol: TickerSymbol;
    price: number;
    change24hPct: number;
    ts: number;
  };

export  type Alert = {
    ticker: TickerSymbol;
    condition: "above" | "below";
    threshold: number;
  };
  