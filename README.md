# Real-Time Trading Dashboard

A full-stack real-time trading dashboard that streams live price updates, visualizes historical data, and allows users to configure price alerts.

The system simulates a market data feed using a backend price engine and delivers real-time updates to the frontend using WebSockets.

---

# 1. Project Overview

This project demonstrates:

• Real-time data streaming using WebSockets  
• Interactive chart visualization of financial market data  
• Alerting system based on price thresholds  
• Backend caching for efficient historical data retrieval  
• Clean separation between frontend and backend services  
• The project has been pushed to github with 15+ commits

The application simulates a trading dashboard similar to those used in financial platforms.


---

# Architecture

Frontend (React + Vite)
|
| REST API
|
Backend (Node.js + Express)
|
| WebSocket
|
Market Data Engine


### Data Flow

1. Backend simulates market price updates every second
2. Updates are broadcast via WebSocket
3. Frontend receives updates and updates UI
4. Historical data is fetched via REST API
5. Alerts are registered via WebSocket messages

---

# Features

## Real-Time Market Data
Live streaming price updates for multiple assets using WebSockets.

## Historical Price Chart
Displays recent historical data for the selected ticker.

## Price Alerts
Users can configure alerts for:

• Price above threshold  
• Price below threshold  

When triggered, alerts are pushed instantly via WebSocket.

## Caching Layer
Historical price queries are cached on the backend to reduce repeated computation.

## Mock Authentication
Simple login endpoint simulates user authentication.

---

# Supported Tickers

Example simulated assets:

BTC-USD
ETH-USD
SOL-USD
AAPL
TSLA


---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- WebSocket API

Backend

- Node.js
- Express
- TypeScript
- ws (WebSocket library)


---

# 2. Assumptions & Trade-Offs

### Simulated Market Data
Prices are generated randomly rather than fetched from a real exchange API.

### No Persistent Storage
Market history is stored in memory and reset on server restart.

### Single Backend Instance
WebSocket alerts are stored in memory, so scaling would require shared storage.

### Lightweight Authentication
Authentication is mocked and not intended for production.

---

# 3. Instructions for Running Project

## 1. Start Backend
cd backend
npm install
npm run dev

Backend runs at: http://localhost:8080

WebSocket endpoint: ws://localhost:8080/ws

## 2. Start Frontend

cd frontend
npm install
npm run dev

Frontend runs at: http://localhost:5173

Note: Mocked login credentials, Kindly directly click on login to view the dashboard

# Running Tests

Backend tests use **Vitest**.

cd backend
npm run test

---

# 4. Bonus Features Implemented

✔ Real-time WebSocket streaming  
✔ Live updating charts  
✔ Price alert system  
✔ Backend caching for history  
✔ WebSocket reconnection handling  
✔ Mock authentication endpoint - (Mocked login credentials, Kindly directly click on login to view the dashboard)

---

# Author

Submission project demonstrating real-time systems, WebSocket architecture, and frontend streaming visualization.
