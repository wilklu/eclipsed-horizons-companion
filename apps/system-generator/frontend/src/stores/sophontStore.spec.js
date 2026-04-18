import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
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

  it("persists and filters saved sophont records by linked world", () => {
    const store = useSophontStore();

    const saved = store.saveSophont({
      name: "Caledans",
      worldKey: "sys-1:Caledon",
      systemId: "sys-1",
      worldName: "Caledon",
      sourceWorld: { name: "Caledon" },
    });

    store.saveSophont({
      name: "Mora Guilders",
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
      sourceWorld: { name: "Mora" },
    });

    expect(saved.id).toBeTruthy();
    expect(store.sophontsByWorld({ worldKey: "sys-1:Caledon" })).toHaveLength(1);
    expect(store.sophontsByWorld({ worldName: "Mora" })[0]?.name).toBe("Mora Guilders");
  });
});
