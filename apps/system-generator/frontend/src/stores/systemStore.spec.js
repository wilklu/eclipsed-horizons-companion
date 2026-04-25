import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../api/systemApi.js", () => ({
  getSystemsBySector: vi.fn(),
  upsertSystem: vi.fn(),
  updateSystem: vi.fn(),
  replaceSystemsForSector: vi.fn(),
}));

import * as systemApi from "../api/systemApi.js";
import { useSystemStore } from "./systemStore.js";

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

describe("systemStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.clearAllMocks();
  });

  it("loads systems for a sector and supports hex lookup on reloaded data", async () => {
    systemApi.getSystemsBySector.mockResolvedValue([
      {
        systemId: "sec-1:0102",
        sectorId: "sec-1",
        galaxyId: "gal-1",
        hexCoordinates: { x: 1, y: 2 },
        metadata: { generatedSurvey: { legacyReconstructed: true } },
      },
      {
        systemId: "sec-2:0101",
        sectorId: "sec-2",
        galaxyId: "gal-1",
        hexCoordinates: { x: 1, y: 1 },
      },
    ]);

    const store = useSystemStore();
    const loaded = await store.loadSystems("gal-1", "sec-1");
    const found = store.findSystemByHex("gal-1", "sec-1", "0102");

    expect(loaded).toHaveLength(1);
    expect(found?.systemId).toBe("sec-1:0102");
    expect(found?.metadata?.generatedSurvey?.legacyReconstructed).toBe(true);
  });
});
