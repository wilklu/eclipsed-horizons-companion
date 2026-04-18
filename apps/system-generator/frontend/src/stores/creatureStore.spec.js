import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useCreatureStore } from "./creatureStore.js";

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

describe("creatureStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.clearAllMocks();
  });

  it("persists and filters saved creature records by linked world", () => {
    const store = useCreatureStore();

    const saved = store.saveCreature({
      name: "Glass Jackal",
      worldKey: "sys-1:Caledon",
      systemId: "sys-1",
      worldName: "Caledon",
      sourceWorld: { name: "Caledon" },
    });

    store.saveCreature({
      name: "Red Grazer",
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
      sourceWorld: { name: "Mora" },
    });

    expect(saved.id).toBeTruthy();
    expect(store.creaturesByWorld({ worldKey: "sys-1:Caledon" })).toHaveLength(1);
    expect(store.creaturesByWorld({ worldName: "Mora" })[0]?.name).toBe("Red Grazer");
  });
});
