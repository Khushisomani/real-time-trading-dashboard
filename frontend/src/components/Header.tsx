export const Header = ({wsStatus}: {wsStatus: string}) => {
    return (
      <div className="header">
        <div className="title">Real Time Dashboard</div>
        <div className="subtitle">Live tickers + chart (REST history + WebSocket updates)</div>
      </div>
    )
}