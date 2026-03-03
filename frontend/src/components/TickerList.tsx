import { TickerSnapshot, TickerSymbol } from "../api/types";

export function TickerList({
  tickers,
  selected,
  snapshots,
  onSelect
}: {
  tickers: TickerSymbol[];
  selected: TickerSymbol | null;
  snapshots: Record<string, TickerSnapshot | undefined>;
  onSelect: (s: TickerSymbol) => void;
}) {
  return (
    <div className="card">
      <div className="cardTitle">Tickers</div>
      <div className="tickerList">
        {tickers.map((t) => {
          const snap = snapshots[t];
          const isSel = selected === t;
          return (
            <button
              key={t}
              className={`tickerRow ${isSel ? "active" : ""}`}
              onClick={() => onSelect(t)}
            >
              <div className="tickerLeft">
                <div className="tickerSymbol">{t}</div>
                <div className="tickerMeta">
                  24h:{" "}
                  <span className={snap && snap.change24hPct >= 0 ? "pos" : "neg"}>
                    {snap ? `${snap.change24hPct.toFixed(2)}%` : "--"}
                  </span>
                </div>
              </div>
              <div className="tickerRight">
                <div className="tickerPrice">{snap ? snap.price.toFixed(2) : "--"}</div>
                <div className="tickerTs">{snap ? new Date(snap.ts).toLocaleTimeString() : ""}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}