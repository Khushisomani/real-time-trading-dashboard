export type WsStatus = "idle" | "connecting" | "open" | "closed" | "error";

export type WsOptions = {
  url: string;

  // reconnect
  minReconnectMs?: number; // default 500
  maxReconnectMs?: number; // default 8000
  jitterPct?: number; // default 0.2

  // heartbeat
  pingIntervalMs?: number; // default 25000
  pongTimeoutMs?: number; // default 10000

  // queue
  maxQueue?: number; // default 50

  debug?: boolean;
};

type Listener<T> = (payload: T) => void;

export class WsManager<TMsg = unknown> {
  private ws: WebSocket | null = null;
  private status: WsStatus = "idle";
  private readonly opts: Required<WsOptions>;

  private reconnectAttempt = 0;
  private reconnectTimer: number | null = null;

  private pingTimer: number | null = null;
  private pongTimer: number | null = null;

  private listeners = new Set<Listener<TMsg>>();
  private statusListeners = new Set<(s: WsStatus) => void>();

  private sendQueue: string[] = [];

  constructor(options: WsOptions) {
    this.opts = {
      url: options.url,
      minReconnectMs: options.minReconnectMs ?? 500,
      maxReconnectMs: options.maxReconnectMs ?? 8000,
      jitterPct: options.jitterPct ?? 0.2,
      pingIntervalMs: options.pingIntervalMs ?? 25000,
      pongTimeoutMs: options.pongTimeoutMs ?? 10000,
      maxQueue: options.maxQueue ?? 50,
      debug: options.debug ?? false
    };

    // Reconnect when tab becomes visible again (helps after laptop sleep)
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("online", this.onOnline);
  }

  destroy() {
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("online", this.onOnline);
    this.disconnect();
    this.listeners.clear();
    this.statusListeners.clear();
  }

  getStatus() {
    return this.status;
  }

  onMessage(fn: Listener<TMsg>) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onStatus(fn: (s: WsStatus) => void) {
    this.statusListeners.add(fn);
    fn(this.status);
    return () => this.statusListeners.delete(fn);
  }

  connect() {
    // already open/connecting
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.clearReconnect();
    this.setStatus("connecting");

    const ws = new WebSocket(this.opts.url);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus("open");
      this.flushQueue();
      this.startHeartbeat();
    };

    ws.onmessage = (ev) => {
      // any inbound message is treated as keepalive activity
      this.resetPongTimeout();

      // handle optional non-JSON pongs
      if (typeof ev.data === "string" && ev.data === "pong") return;

      try {
        const parsed = JSON.parse(ev.data) as TMsg;
        this.listeners.forEach((l) => l(parsed));
      } catch {
        this.log("Ignored non-JSON message");
      }
    };

    ws.onerror = () => {
      this.setStatus("error");
      // onclose will run, which schedules reconnect
    };

    ws.onclose = () => {
      this.stopHeartbeat();
      this.setStatus("closed");
      this.ws = null;
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.clearReconnect();
    this.stopHeartbeat();

    if (this.ws) {
      const ws = this.ws;
      this.ws = null;

      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      try {
        ws.close();
      } catch {
        // ignore
      }
    }

    this.sendQueue = [];
    this.setStatus("closed");
  }

  sendJson(payload: unknown) {
    const msg = JSON.stringify(payload);
    this.sendRaw(msg);
  }

  sendRaw(msg: string) {
    const ws = this.ws;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
      return;
    }

    // queue if not open
    if (this.sendQueue.length >= this.opts.maxQueue) {
      this.sendQueue.shift();
    }
    this.sendQueue.push(msg);
  }

  private flushQueue() {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    for (const msg of this.sendQueue) ws.send(msg);
    this.sendQueue = [];
  }

  private scheduleReconnect() {
    // avoid reconnect storm if offline
    if (!navigator.onLine) return;

    this.reconnectAttempt += 1;

    const base = Math.min(
      this.opts.maxReconnectMs,
      this.opts.minReconnectMs * Math.pow(2, this.reconnectAttempt - 1)
    );

    const jitter = base * this.opts.jitterPct * (Math.random() * 2 - 1);
    const delay = Math.max(0, Math.round(base + jitter));

    this.log(`Reconnect in ${delay}ms (attempt ${this.reconnectAttempt})`);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimer != null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();

    // ping periodically (server may ignore; harmless)
    this.pingTimer = window.setInterval(() => {
      // If server supports it, this helps; otherwise it's just a small message.
      this.sendRaw("ping");
      this.resetPongTimeout();
    }, this.opts.pingIntervalMs);

    this.resetPongTimeout();
  }

  private resetPongTimeout() {
    if (this.pongTimer != null) window.clearTimeout(this.pongTimer);

    this.pongTimer = window.setTimeout(() => {
      this.log("Pong timeout → closing socket");
      // force close; onclose schedules reconnect
      this.ws?.close();
    }, this.opts.pongTimeoutMs);
  }

  private stopHeartbeat() {
    if (this.pingTimer != null) window.clearInterval(this.pingTimer);
    if (this.pongTimer != null) window.clearTimeout(this.pongTimer);
    this.pingTimer = null;
    this.pongTimer = null;
  }

  private setStatus(s: WsStatus) {
    if (this.status === s) return;
    this.status = s;
    this.statusListeners.forEach((fn) => fn(s));
  }

  private log(msg: string) {
    if (this.opts.debug) {
      // eslint-disable-next-line no-console
      console.log(`[WsManager] ${msg}`);
    }
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) this.connect();
    }
  };

  private onOnline = () => {
    this.connect();
  };
}