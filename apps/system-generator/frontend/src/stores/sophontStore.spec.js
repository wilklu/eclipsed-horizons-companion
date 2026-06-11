import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../api/sophontApi.js", () => ({
  getSophonts: vi.fn(),
  upsertSophont: vi.fn(),
  deleteSophont: vi.fn(),
}));

import * as sophontApi from "../api/sophontApi.js";
import { useSophontStore } from "./sophontStore.js";

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

describe("sophontStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.clearAllMocks();
  });

  it("hydrates and persists saved sophont records by linked world", async () => {
    sophontApi.getSophonts.mockResolvedValue([
      {
        id: "soph-1",
        name: "Caledans",
        worldKey: "sys-1:Caledon",
        systemId: "sys-1",
        worldName: "Caledon",
        sourceWorld: { name: "Caledon" },
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
    ]);
    sophontApi.upsertSophont.mockImplementation(async (payload) => ({
      ...payload,
      id: payload.id || "soph-2",
      savedAt: "2026-04-18T01:00:00.000Z",
      updatedAt: "2026-04-18T01:00:00.000Z",
    }));
    sophontApi.deleteSophont.mockResolvedValue([]);

    const store = useSophontStore();
    await store.hydrateSophonts({ worldKey: "sys-1:Caledon" });
    const saved = await store.saveSophont({
      name: "Mora Guilders",
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
      sourceWorld: { name: "Mora" },
    });

    expect(saved.id).toBeTruthy();
    expect(sophontApi.upsertSophont).toHaveBeenCalledTimes(1);
    expect(store.sophontsByWorld({ worldKey: "sys-1:Caledon" })).toHaveLength(1);
    expect(store.sophontsByWorld({ worldName: "Mora" })[0]?.name).toBe("Mora Guilders");

    await store.removeSophont(saved.id);
    expect(sophontApi.deleteSophont).toHaveBeenCalledWith(saved.id, {});
  });
});
