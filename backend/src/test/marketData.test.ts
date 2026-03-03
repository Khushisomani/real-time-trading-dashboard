import { describe, it, expect } from "vitest";
import { MarketData } from "../main/market/marketData.js";

describe("MarketData", () => {
  it("lists tickers", () => {
    const m = new MarketData();
    expect(m.listTickers().length).toBeGreaterThan(0);
  });

  it("generates history on step()", () => {
    const m = new MarketData();
    const sym = m.listTickers()[0];
    m.step();
    m.step();
    const hist = m.getHistory(sym, 10);
    expect(hist.length).toBeGreaterThan(0);
  });

  it("snapshot has required fields", () => {
    const m = new MarketData();
    const sym = m.listTickers()[0];
    const s = m.getSnapshot(sym);
    expect(s.symbol).toBe(sym);
    expect(typeof s.price).toBe("number");
    expect(typeof s.ts).toBe("number");
  });
});