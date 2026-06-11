import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSector } from "./sectorApi.js";

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

function quotaExceededError() {
  return Object.assign(new Error("Setting the value exceeded the quota."), {
    name: "QuotaExceededError",
  });
}

describe("sectorApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("drops oversized hex detail from cached sectors instead of failing", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sectorId: "sec-1",
        galaxyId: "gal-1",
        coordinates: { x: 1, y: 1 },
        metadata: {
          gridX: 1,
          gridY: 1,
          occupiedHexes: Array.from({ length: 160 }, (_, index) => String(index + 1).padStart(4, "0")),
          hexStarTypes: Object.fromEntries(
            Array.from({ length: 160 }, (_, index) => [String(index + 1).padStart(4, "0"), { starType: "G2 V" }]),
          ),
        },
      }),
    });

    const sector = await getSector("sec-1");
    const cached = JSON.parse(globalThis.localStorage.setItem.mock.calls.at(-1)[1]);

    expect(sector.metadata.occupiedHexes).toHaveLength(160);
    expect(cached[0].metadata.occupiedHexes).toBeUndefined();
    expect(cached[0].metadata.occupiedHexesCount).toBe(160);
    expect(cached[0].metadata.hexStarTypes).toBeUndefined();
    expect(cached[0].metadata.hexStarTypeCount).toBe(160);
  });

  it("returns fetched sectors even when cache writes exceed quota", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        sectorId: "sec-1",
        galaxyId: "gal-1",
        coordinates: { x: 1, y: 1 },
        metadata: { gridX: 1, gridY: 1 },
      }),
    });
    globalThis.localStorage.setItem.mockImplementation(() => {
      throw quotaExceededError();
    });

    const sector = await getSector("sec-1");

    expect(sector.sectorId).toBe("sec-1");
    expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith("eclipsed-horizons-sectors-cache");
  });
});
