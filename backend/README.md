# Backend Service

The backend service simulates a real-time market data provider and exposes both REST APIs and WebSocket streams.

---

# Responsibilities

• Generate simulated market price updates  
• Broadcast real-time updates via WebSocket  
• Provide historical price data  
• Manage user price alerts  
• Cache historical queries  
• Provide authentication endpoint

---

# Architecture

src
├── main
│ ├── market
│ │ ├── marketData.ts
│ │ └── types.ts
│ ├── routes
│ │ ├── history.ts
│ │ ├── tickers.ts
│ │ └── login.ts
│ └── ws
│    └── hub.ts
└── index.ts


---

# REST API Endpoints

## Health Check

GET /health - { "ok": true }

---

## Get Tickers - ["BTC-USD","ETH-USD","SOL-USD","AAPL","TSLA"]

---

## Get Historical Data

GET /api/history/:symbol -  Ex. GET /api/history/BTC-USD 
Res. 

{
"symbol": "BTC-USD",
"points": [...]
}

Cached for improved performance.

---

## Login (Mock)

POST /api/login

Response - {
"token": "mock-jwt-token"
}

---

# WebSocket API

Endpoint

ws://localhost:8080/ws

---

## Subscribe

Client sends - {
"type": "subscribe"
}

Server responds - {
"type": "connected"
}


---

## Price Updates

Server pushes - {
"type": "price_update",
"data": [...]
}

---

## Set Alert

Client sends

{
"type": "set_alert",
"payload": {
"ticker": "BTC-USD",
"condition": "above",
"threshold": 65000
}
}

---

## Alert Triggered

Server sends

{
"type": "alert_triggered",
"message": "BTC-USD crossed above 65000"
}

# Key Backend Features

✔ Real-time price simulation  
✔ WebSocket broadcast hub  
✔ Alert tracking per client  
✔ Historical data caching  
✔ Modular route architecture
