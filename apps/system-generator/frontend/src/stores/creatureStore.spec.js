import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../api/creatureApi.js", () => ({
  getCreatures: vi.fn(),
  getFaunaBundles: vi.fn(),
  upsertCreature: vi.fn(),
  upsertFaunaBundle: vi.fn(),
  deleteCreature: vi.fn(),
  deleteFaunaBundle: vi.fn(),
}));

import * as creatureApi from "../api/creatureApi.js";
import { useCreatureStore } from "./creatureStore.js";

describe("creatureStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("hydrates and persists saved creature records by linked world", async () => {
    creatureApi.getCreatures.mockResolvedValue([
      {
        id: "creature-1",
        name: "Glass Jackal",
        worldKey: "sys-1:Caledon",
        systemId: "sys-1",
        worldName: "Caledon",
        sourceWorld: { name: "Caledon" },
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
    ]);
    creatureApi.upsertCreature.mockImplementation(async (payload) => ({
      ...payload,
      id: payload.id || "creature-2",
      savedAt: "2026-04-18T01:00:00.000Z",
      updatedAt: "2026-04-18T01:00:00.000Z",
    }));
    creatureApi.deleteCreature.mockResolvedValue([]);

    const store = useCreatureStore();
    await store.hydrateCreatures({ worldKey: "sys-1:Caledon" });
    const saved = await store.saveCreature({
      name: "Red Grazer",
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
      sourceWorld: { name: "Mora" },
    });

    expect(saved.id).toBeTruthy();
    expect(creatureApi.upsertCreature).toHaveBeenCalledTimes(1);
    expect(store.creaturesByWorld({ worldKey: "sys-1:Caledon" })).toHaveLength(1);
    expect(store.creaturesByWorld({ worldName: "Mora" })[0]?.name).toBe("Red Grazer");

    await store.removeCreature(saved.id);
    expect(creatureApi.deleteCreature).toHaveBeenCalledWith(saved.id, {});
  });

  it("hydrates fauna bundles linked to a world through the API-backed store", async () => {
    creatureApi.getFaunaBundles.mockResolvedValue([
      {
        id: "bundle-1",
        worldKey: "sys-1:Caledon",
        systemId: "sys-1",
        worldName: "Caledon",
        entries: [{ name: "Fen Stalker" }],
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
    ]);
    creatureApi.upsertFaunaBundle.mockImplementation(async (payload) => ({
      ...payload,
      id: payload.id || "bundle-2",
      savedAt: "2026-04-18T01:00:00.000Z",
      updatedAt: "2026-04-18T01:00:00.000Z",
    }));
    creatureApi.deleteFaunaBundle.mockResolvedValue([]);

    const store = useCreatureStore();
    await store.hydrateFaunaBundles({ worldName: "Caledon" });
    const bundle = await store.saveFaunaBundle({
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
      entries: [{ name: "Ash Leaper" }],
    });

    expect(bundle.id).toBeTruthy();
    expect(creatureApi.upsertFaunaBundle).toHaveBeenCalledTimes(1);
    expect(store.faunaBundlesByWorld({ worldName: "Caledon" })).toHaveLength(1);
    expect(store.faunaBundlesByWorld({ worldName: "Mora" })[0]?.entries?.[0]?.name).toBe("Ash Leaper");

    await store.removeFaunaBundle(bundle.id);
    expect(creatureApi.deleteFaunaBundle).toHaveBeenCalledWith(bundle.id, {});
  });
});
