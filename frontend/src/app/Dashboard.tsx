import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSnapshots, fetchTickers } from "../api/client";
import { TickerSnapshot, TickerSymbol } from "../api/types";
import { useMarketWebSocket } from "../hooks/useWebSocket"
import { useTickerHistory } from "../hooks/useTickerCache"
import { Header } from "../components/Header";
import { TickerList } from "../components/TickerList";
import { Chart } from "../components/Chart";

export default function App() {
  const [tickers, setTickers] = useState<TickerSymbol[]>([]);
  const [selected, setSelected] = useState<TickerSymbol | null>(null);
  const [snapshots, setSnapshots] = useState<Record<string, TickerSnapshot>>({});


  useEffect(() => {
    let alive = true;
    async function run() {
      const [t, snaps] = await Promise.all([fetchTickers(), fetchSnapshots()]);
      if (!alive) return;

      setTickers(t);
      setSelected((prev) => prev ?? t[0] ?? null);

      const map: Record<string, TickerSnapshot> = {};
      for (const s of snaps) map[s.symbol] = s;
      setSnapshots(map);
    }
    void run();
    return () => { alive = false; };
  }, []);

  const onWsUpdate = useCallback((updates: TickerSnapshot[]) => {
    setSnapshots((prev) => {
      const next = { ...prev };
      for (const u of updates) next[u.symbol] = u;
      return next;
    });
  }, []);

  const { status: wsStatus } = useMarketWebSocket(onWsUpdate);

  const { data: history, loading: histLoading, error: histError } =
    useTickerHistory(selected ?? "BTC-USD", 160, 30_000);

  const livePrice = useMemo(() => {
    if (!selected) return null;
    return snapshots[selected]?.price ?? null;
  }, [selected, snapshots]);

  return (
    <div className="page">
      <Header wsStatus={wsStatus} />

      <div className="grid">
        <TickerList
          tickers={tickers}
          selected={selected}
          snapshots={snapshots}
          onSelect={setSelected}
        />

        <div>
          {histLoading && selected && <div className="banner">Loading history for {selected}…</div>}
          {histError && <div className="banner error">{histError}</div>}
          <Chart symbol={selected} history={history} livePrice={livePrice} />
        </div>
      </div>

    </div>
  );
}