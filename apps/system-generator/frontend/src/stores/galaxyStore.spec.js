import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("../../../backend/generators/utils/galaxyImporter.js", () => ({
  importGalaxy: vi.fn(),
}));

import * as galaxyImporter from "../../../backend/generators/utils/galaxyImporter.js";
import { useGalaxyStore } from "./galaxyStore.js";

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

describe("galaxyStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.clearAllMocks();
  });

  it("imports archived galaxies with placement options and commits the result", async () => {
    galaxyImporter.importGalaxy.mockResolvedValue({
      success: true,
      galaxy: {
        galaxyId: "099",
        name: "Imported Archive",
        metadata: {
          sectorStats: {
            totalSectors: 4,
          },
        },
      },
    });

    const store = useGalaxyStore();
    await store.importGalaxy(
      { galaxyId: "archive-1", name: "Archive" },
      {
        mode: "manual",
        coordinates: { x: 12, y: -4 },
        seed: "relay-seed",
      },
    );

    expect(galaxyImporter.importGalaxy).toHaveBeenCalledTimes(1);
    expect(galaxyImporter.importGalaxy.mock.calls[0][0]).toEqual({ galaxyId: "archive-1", name: "Archive" });
    expect(galaxyImporter.importGalaxy.mock.calls[0][1].userCoordinates).toEqual({
      mode: "manual",
      coordinates: { x: 12, y: -4 },
      seed: "relay-seed",
    });
    expect(store.galaxies).toHaveLength(1);
    expect(store.currentGalaxyId).toBe("099");

    vi.runAllTimers();
    expect(store.importInProgress).toBe(false);
    expect(store.importProgress).toBe(0);
  });
});
