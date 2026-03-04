import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSnapshots, fetchTickers } from "../api/client";
import { TickerSnapshot, TickerSymbol, PricePoint } from "../api/types";
import { useMarketWebSocket } from "../hooks/useWebSocket";
import { useTickerHistory } from "../hooks/useTickerCache";
import { Header } from "../components/Header";
import { TickerList } from "../components/TickerList";
import { Chart } from "../components/Chart";

type AlertCondition = "above" | "below";

const MAX_CHART_POINTS = 200;

export default function Dashboard() {
  const [tickers, setTickers] = useState<TickerSymbol[]>([]);
  const [selected, setSelected] = useState<TickerSymbol | null>(null);
  const [snapshots, setSnapshots] = useState<Record<string, TickerSnapshot>>({});

  // ✅ chart points that will grow with live ticks
  const [chartPoints, setChartPoints] = useState<PricePoint[]>([]);

  // Alerts
  const [alertCondition, setAlertCondition] = useState<AlertCondition>("above");
  const [alertThreshold, setAlertThreshold] = useState("");
  const [toast, setToast] = useState("");

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
    return () => {
      alive = false;
    };
  }, []);

  // ✅ Stable event handler (prevents WS reconnect loop)
  const onWsEvent = useCallback((evt: { type?: string; message?: string }) => {
    if (evt?.type === "alert_triggered") {
      setToast(evt.message ?? "Alert triggered");
    }
    if (evt?.type === "error") {
      setToast(evt.message ?? "WS error");
    }
  }, []);

  // ✅ WS update handler:
  // 1) update ticker snapshots
  // 2) if selected ticker update arrives → append to chartPoints so chart moves
  const onWsUpdate = useCallback(
    (updates: TickerSnapshot[]) => {
      setSnapshots((prev) => {
        const next = { ...prev };
        for (const u of updates) next[u.symbol] = u;
        return next;
      });

      setChartPoints((prev) => {
        if (!selected) return prev;

        const u = updates.find((x) => x.symbol === selected);
        if (!u) return prev;

        const nextPoint: PricePoint = { ts: u.ts ?? Date.now(), price: u.price };

        // avoid duplicating same timestamp in case of re-renders
        const last = prev[prev.length - 1];
        const merged =
          last && last.ts === nextPoint.ts ? [...prev.slice(0, -1), nextPoint] : [...prev, nextPoint];

        // keep last N points
        if (merged.length > MAX_CHART_POINTS) {
          return merged.slice(merged.length - MAX_CHART_POINTS);
        }
        return merged;
      });
    },
    [selected]
  );

  const { status: wsStatus, sendJson } = useMarketWebSocket(onWsUpdate, onWsEvent);

  const { data: history, loading: histLoading, error: histError } = useTickerHistory(
    selected ?? "BTC-USD",
    160,
    30_000
  );

  // ✅ When ticker changes OR fresh history arrives, reset chartPoints to history
  useEffect(() => {
    setChartPoints(history ?? []);
  }, [selected, history]);

  const livePrice = useMemo(() => {
    if (!selected) return null;
    return snapshots[selected]?.price ?? null;
  }, [selected, snapshots]);

  const onSetAlert = useCallback(() => {
    if (!selected) return;

    const th = Number(alertThreshold);
    if (!Number.isFinite(th)) {
      setToast("Enter a valid threshold number");
      return;
    }

    sendJson({
      type: "set_alert",
      payload: {
        ticker: selected,
        condition: alertCondition,
        threshold: th
      }
    });

    setToast(`Alert set: ${selected} ${alertCondition} ${th}`);
    setAlertThreshold("");
  }, [selected, alertThreshold, alertCondition, sendJson]);

  return (
    <div className="page">
      <Header wsStatus={wsStatus} />

      {toast && (
        <div className="banner">
          {toast}
          <button style={{ marginLeft: 12 }} onClick={() => setToast("")}>
            ×
          </button>
        </div>
      )}

      <div className="grid">
        <TickerList tickers={tickers} selected={selected} snapshots={snapshots} onSelect={setSelected} />

        <div>
          {histLoading && selected && <div className="banner">Loading history for {selected}…</div>}
          {histError && <div className="banner error">{histError}</div>}

          {/* Price Alerts UI */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Price Alerts <span className="muted" style={{ marginLeft: 8 }}>WS: {wsStatus}</span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div className="muted">Condition</div>
                <select value={alertCondition} onChange={(e) => setAlertCondition(e.target.value as AlertCondition)}>
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div>
                <div className="muted">Threshold</div>
                <input
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="e.g. 65000"
                />
              </div>

              <div style={{ paddingTop: 18 }}>
                <button onClick={onSetAlert} disabled={!selected || wsStatus !== "open"}>
                  Set Alert
                </button>
              </div>

              <div style={{ paddingTop: 18 }} className="muted">
                Live: <b>{livePrice != null ? livePrice.toFixed(2) : "-"}</b>
              </div>
            </div>
          </div>

          <Chart symbol={selected} history={chartPoints} livePrice={livePrice} />
        </div>
      </div>
    </div>
  );
}
