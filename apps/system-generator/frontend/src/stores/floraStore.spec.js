import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../api/floraApi.js", () => ({
  getFlora: vi.fn(),
  upsertFlora: vi.fn(),
  deleteFlora: vi.fn(),
}));

import * as floraApi from "../api/floraApi.js";
import { useFloraStore } from "./floraStore.js";

describe("floraStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("hydrates and persists flora dossiers by linked world", async () => {
    floraApi.getFlora.mockResolvedValue([
      {
        id: "flora-1",
        name: "Mirror Reed",
        worldKey: "sys-1:Talara",
        systemId: "sys-1",
        worldName: "Talara",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
    ]);
    floraApi.upsertFlora.mockImplementation(async (payload) => ({
      ...payload,
      id: payload.id || "flora-2",
      savedAt: "2026-04-18T01:00:00.000Z",
      updatedAt: "2026-04-18T01:00:00.000Z",
    }));
    floraApi.deleteFlora.mockResolvedValue([]);

    const store = useFloraStore();
    await store.hydrateFlora({ worldKey: "sys-1:Talara" });
    const saved = await store.saveFlora({
      name: "Dust Lotus",
      worldKey: "sys-2:Mora",
      systemId: "sys-2",
      worldName: "Mora",
    });

    expect(saved.id).toBeTruthy();
    expect(floraApi.upsertFlora).toHaveBeenCalledTimes(1);
    expect(store.floraByWorld({ worldKey: "sys-1:Talara" })).toHaveLength(1);
    expect(store.floraByWorld({ worldName: "Mora" })[0]?.name).toBe("Dust Lotus");

    await store.removeFlora(saved.id);
    expect(floraApi.deleteFlora).toHaveBeenCalledWith(saved.id, {});
  });
});
