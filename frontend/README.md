# Frontend Application

The frontend is a real-time trading dashboard built with React and TypeScript.

It consumes backend APIs and WebSocket streams to display live market data.

---

# Features

• Real-time price updates  
• Interactive ticker selection  
• Historical price chart  
• Live WebSocket connection status  
• Price threshold alerts  
• notifications for triggered alerts

---

# UI Components

src
├── api
├── hooks
│ ├── useWebSocket.ts
│ └── useTickerCache.ts
├── components
│ ├── Chart.tsx
│ ├── Header.tsx
│ └── TickerList.tsx
└── app
    └── Dashboard.tsx
    |__ App
    |__ Login

---

# Real-Time Updates

The frontend connects to the backend WebSocket server. ws://localhost:8080/ws


Price updates are streamed continuously and reflected in:

• ticker list  
• chart  
• live price indicator

---

# Price Alerts

Users can configure alerts:


---

# Key Frontend Concepts

### WebSocket Hook

Manages:

• connection lifecycle  
• event parsing  
• message sending  
• reconnection handling

---

### Historical Data Caching

The hook `useTickerCache` caches historical data to avoid unnecessary API calls.

---

# Future Improvements

• Advanced charting
• Portfolio tracking  
• User authentication
• Dark mode UI  
• mobile responsive layout