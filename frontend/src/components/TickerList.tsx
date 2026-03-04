import React from "react";
import { TickerSnapshot, TickerSymbol } from "../api/types";

export function TickerList({
  tickers,
  selected,
  snapshots,
  onSelect
}: {
  tickers: TickerSymbol[];
  selected: TickerSymbol | null;
  snapshots: Record<string, TickerSnapshot>;
  onSelect: (s: TickerSymbol) => void;
}) {
  return (
    <div className="card">
      <div className="section-title">Tickers</div>

      <div className="tickers">
        {tickers.map((t) => {
          const snap = snapshots[t];
          const chg = snap?.change24hPct ?? 0;
          const chgCls = chg >= 0 ? "chg pos" : "chg neg";

          return (
            <div
              key={t}
              className={`ticker ${selected === t ? "selected" : ""}`}
              onClick={() => onSelect(t)}
              role="button"
              tabIndex={0}
            >
              <div className="sym">{t}</div>
              <div className="chgLine">
                <span className={chgCls}>24h: {snap ? `${chg.toFixed(2)}%` : "--"}</span>
              </div>
              <div className="px">{snap ? snap.price.toFixed(2) : "--"}</div>
              <div className="muted">{snap ? new Date(snap.ts).toLocaleTimeString() : "--"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
