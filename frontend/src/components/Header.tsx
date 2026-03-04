import React from "react";

export function Header({ wsStatus }: { wsStatus: "connecting" | "open" | "closed" }) {
  const dotClass =
    wsStatus === "open" ? "dot open" : wsStatus === "closed" ? "dot closed" : "dot";

  return (
    <div className="header">
      <div className="h-title">
        <h1>Real Time Dashboard</h1>
        <div className="sub">Live ticker updates • WebSocket streaming • Alerts</div>
      </div>

      <div className="pill">
        <span className={dotClass} />
        WS: <b style={{ color: "var(--text)" }}>{wsStatus}</b>
      </div>
    </div>
  );
}