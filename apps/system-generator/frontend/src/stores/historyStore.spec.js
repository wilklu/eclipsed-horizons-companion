import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../api/historyApi.js", () => ({
  getHistories: vi.fn(),
  upsertHistory: vi.fn(),
  deleteHistory: vi.fn(),
}));

import * as historyApi from "../api/historyApi.js";
import { useHistoryStore } from "./historyStore.js";

describe("historyStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("hydrates, saves, and removes histories through the API-backed store", async () => {
    historyApi.getHistories.mockResolvedValue([
      {
        id: "history-1",
        civilizationName: "Talari Concord",
        worldName: "Talara",
        systemId: "sys-1",
        worldKey: "sys-1:Talara",
        updatedAt: "2026-04-18T00:00:00.000Z",
      },
    ]);
    historyApi.upsertHistory.mockImplementation(async (payload) => ({
      ...payload,
      id: payload.id || "history-2",
      savedAt: "2026-04-18T01:00:00.000Z",
      updatedAt: "2026-04-18T01:00:00.000Z",
    }));
    historyApi.deleteHistory.mockResolvedValue([]);

    const store = useHistoryStore();
    const loaded = await store.hydrateHistories({ worldName: "Talara" });
    const saved = await store.saveHistory({
      civilizationName: "Vey Imperium",
      worldName: "Talara",
      systemId: "sys-1",
      worldKey: "sys-1:Talara",
    });
    await store.removeHistory(saved.id);

    expect(loaded).toHaveLength(1);
    expect(historyApi.upsertHistory).toHaveBeenCalledTimes(1);
    expect(historyApi.deleteHistory).toHaveBeenCalledWith(saved.id, {});
    expect(store.historiesByWorld({ worldName: "Talara" })).toHaveLength(1);
  });
});
