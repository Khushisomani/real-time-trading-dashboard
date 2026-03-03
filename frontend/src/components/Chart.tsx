import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PricePoint, TickerSymbol } from "../api/types";

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export function Chart({
  symbol,
  history,
  livePrice
}: {
  symbol: TickerSymbol | null;
  history: PricePoint[] | null;
  livePrice: number | null;
}) {
  return (
    <div className="card">
      <div className="cardTitle">Chart</div>

      {!symbol ? (
        <div className="empty">Select a ticker to view chart</div>
      ) : (
        <>
          <div className="chartHeader">
            <div className="chartSymbol">{symbol}</div>
            <div className="chartPrice">{livePrice != null ? livePrice.toFixed(2) : "--"}</div>
          </div>

          <div className="chartWrap">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={(history ?? []).map(p => ({ ...p, t: formatTime(p.ts) }))}>
                <XAxis dataKey="t" tick={{ fontSize: 12 }} minTickGap={20} />
                <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="price" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}