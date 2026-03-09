import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useGalaxyStore } from "./galaxyStore.js";
import { useSectorStore } from "./sectorStore.js";
import { useSystemStore } from "./systemStore.js";
import { useWorldStore } from "./worldStore.js";
import { useSophontStore } from "./sophontStore.js";

import * as galaxyApi from "../api/galaxyApi.js";
import * as sectorApi from "../api/sectorApi.js";
import * as systemApi from "../api/systemApi.js";
import * as worldApi from "../api/worldApi.js";
import * as sophontApi from "../api/sophontApi.js";

vi.mock("../api/galaxyApi.js", () => ({
  listGalaxies: vi.fn(),
  createGalaxy: vi.fn(),
  updateGalaxy: vi.fn(),
  deleteGalaxy: vi.fn(),
}));

vi.mock("../api/sectorApi.js", () => ({
  getSectors: vi.fn(),
  createSector: vi.fn(),
  updateSector: vi.fn(),
  deleteSector: vi.fn(),
}));

vi.mock("../api/systemApi.js", () => ({
  getSystems: vi.fn(),
  createSystem: vi.fn(),
  updateSystem: vi.fn(),
  deleteSystem: vi.fn(),
}));

vi.mock("../api/worldApi.js", () => ({
  getWorlds: vi.fn(),
  createWorld: vi.fn(),
  updateWorld: vi.fn(),
  deleteWorld: vi.fn(),
}));

vi.mock("../api/sophontApi.js", () => ({
  getSophonts: vi.fn(),
  createSophont: vi.fn(),
  updateSophont: vi.fn(),
  deleteSophont: vi.fn(),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("galaxyStore API mocking", () => {
  it("loads galaxies from API", async () => {
    galaxyApi.listGalaxies.mockResolvedValue([{ galaxyId: "g-1", name: "Alpha" }]);
    const store = useGalaxyStore();

    await store.loadGalaxies();

    expect(galaxyApi.listGalaxies).toHaveBeenCalledTimes(1);
    expect(store.galaxies).toEqual([{ galaxyId: "g-1", name: "Alpha" }]);
    expect(store.error).toBeNull();
    expect(store.isLoading).toBe(false);
  });

  it("rolls back optimistic create on API failure", async () => {
    galaxyApi.createGalaxy.mockRejectedValue(new Error("create failed"));
    const store = useGalaxyStore();

    await expect(store.createGalaxy({ name: "Temp" })).rejects.toThrow("create failed");

    expect(store.galaxies).toEqual([]);
    expect(store.error).toContain("create failed");
    expect(store.currentGalaxyId).toBeNull();
  });

  it("rolls back optimistic update on API failure", async () => {
    galaxyApi.updateGalaxy.mockRejectedValue(new Error("update failed"));
    const store = useGalaxyStore();
    store.galaxies = [{ galaxyId: "g-1", name: "Original" }];

    await expect(store.updateGalaxy("g-1", { name: "Changed" })).rejects.toThrow("update failed");

    expect(store.galaxies).toEqual([{ galaxyId: "g-1", name: "Original" }]);
    expect(store.error).toContain("update failed");
  });

  it("persists optimistic update on API success", async () => {
    const updatedGalaxy = { galaxyId: "g-1", name: "Updated" };
    galaxyApi.updateGalaxy.mockResolvedValue(updatedGalaxy);
    const store = useGalaxyStore();
    store.galaxies = [{ galaxyId: "g-1", name: "Original" }];

    await expect(store.updateGalaxy("g-1", { name: "Updated" })).resolves.toEqual(updatedGalaxy);

    expect(galaxyApi.updateGalaxy).toHaveBeenCalledWith("g-1", { name: "Updated" });
    expect(store.galaxies).toEqual([updatedGalaxy]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic delete on API failure", async () => {
    galaxyApi.deleteGalaxy.mockRejectedValue(new Error("delete failed"));
    const store = useGalaxyStore();
    store.galaxies = [
      { galaxyId: "g-1", name: "Alpha" },
      { galaxyId: "g-2", name: "Beta" },
    ];
    store.setCurrentGalaxy("g-1");

    await expect(store.deleteGalaxy("g-1")).rejects.toThrow("delete failed");

    expect(store.galaxies).toEqual([
      { galaxyId: "g-1", name: "Alpha" },
      { galaxyId: "g-2", name: "Beta" },
    ]);
    expect(store.currentGalaxyId).toBe("g-1");
    expect(store.error).toContain("delete failed");
  });

  it("keeps optimistic delete on API success", async () => {
    galaxyApi.deleteGalaxy.mockResolvedValue(undefined);
    const store = useGalaxyStore();
    store.galaxies = [
      { galaxyId: "g-1", name: "Alpha" },
      { galaxyId: "g-2", name: "Beta" },
    ];
    store.setCurrentGalaxy("g-1");

    await expect(store.deleteGalaxy("g-1")).resolves.toBeUndefined();

    expect(galaxyApi.deleteGalaxy).toHaveBeenCalledWith("g-1");
    expect(store.galaxies).toEqual([{ galaxyId: "g-2", name: "Beta" }]);
    expect(store.currentGalaxyId).toBe("g-2");
    expect(store.error).toBeNull();
  });
});

describe("sectorStore API mocking", () => {
  it("loads sectors from API", async () => {
    sectorApi.getSectors.mockResolvedValue([{ sectorId: "s-1", galaxyId: "g-1" }]);
    const store = useSectorStore();

    await store.loadSectors("g-1");

    expect(sectorApi.getSectors).toHaveBeenCalledWith("g-1");
    expect(store.sectors).toEqual([{ sectorId: "s-1", galaxyId: "g-1" }]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic create on API failure", async () => {
    sectorApi.createSector.mockRejectedValue(new Error("sector failed"));
    const store = useSectorStore();

    await expect(store.createSector({ galaxyId: "g-1" })).rejects.toThrow("sector failed");

    expect(store.sectors).toEqual([]);
    expect(store.error).toContain("sector failed");
  });

  it("rolls back optimistic update on API failure", async () => {
    sectorApi.updateSector.mockRejectedValue(new Error("sector update failed"));
    const store = useSectorStore();
    store.sectors = [{ sectorId: "s-1", galaxyId: "g-1", name: "Original" }];

    await expect(store.updateSector("s-1", { name: "Changed" })).rejects.toThrow("sector update failed");

    expect(store.sectors).toEqual([{ sectorId: "s-1", galaxyId: "g-1", name: "Original" }]);
    expect(store.error).toContain("sector update failed");
  });

  it("persists optimistic update on API success", async () => {
    const updatedSector = { sectorId: "s-1", galaxyId: "g-1", name: "Updated" };
    sectorApi.updateSector.mockResolvedValue(updatedSector);
    const store = useSectorStore();
    store.sectors = [{ sectorId: "s-1", galaxyId: "g-1", name: "Original" }];

    await expect(store.updateSector("s-1", { name: "Updated" })).resolves.toEqual(updatedSector);

    expect(sectorApi.updateSector).toHaveBeenCalledWith("s-1", { name: "Updated" });
    expect(store.sectors).toEqual([updatedSector]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic delete on API failure", async () => {
    sectorApi.deleteSector.mockRejectedValue(new Error("sector delete failed"));
    const store = useSectorStore();
    store.sectors = [
      { sectorId: "s-1", galaxyId: "g-1" },
      { sectorId: "s-2", galaxyId: "g-1" },
    ];
    store.setCurrentSector("s-1");

    await expect(store.deleteSector("s-1")).rejects.toThrow("sector delete failed");

    expect(store.sectors).toEqual([
      { sectorId: "s-1", galaxyId: "g-1" },
      { sectorId: "s-2", galaxyId: "g-1" },
    ]);
    expect(store.currentSectorId).toBe("s-1");
    expect(store.error).toContain("sector delete failed");
  });

  it("keeps optimistic delete on API success", async () => {
    sectorApi.deleteSector.mockResolvedValue(undefined);
    const store = useSectorStore();
    store.sectors = [
      { sectorId: "s-1", galaxyId: "g-1" },
      { sectorId: "s-2", galaxyId: "g-1" },
    ];
    store.setCurrentSector("s-1");

    await expect(store.deleteSector("s-1")).resolves.toBeUndefined();

    expect(sectorApi.deleteSector).toHaveBeenCalledWith("s-1");
    expect(store.sectors).toEqual([{ sectorId: "s-2", galaxyId: "g-1" }]);
    expect(store.currentSectorId).toBe("s-2");
    expect(store.error).toBeNull();
  });
});

describe("systemStore API mocking", () => {
  it("loads systems from API", async () => {
    systemApi.getSystems.mockResolvedValue([{ systemId: "sys-1", sectorId: "s-1" }]);
    const store = useSystemStore();

    await store.loadSystems("g-1", "s-1");

    expect(systemApi.getSystems).toHaveBeenCalledWith("g-1", "s-1");
    expect(store.systems).toEqual([{ systemId: "sys-1", sectorId: "s-1" }]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic create on API failure", async () => {
    systemApi.createSystem.mockRejectedValue(new Error("system failed"));
    const store = useSystemStore();

    await expect(store.createSystem({ sectorId: "s-1" })).rejects.toThrow("system failed");

    expect(store.systems).toEqual([]);
    expect(store.error).toContain("system failed");
  });

  it("rolls back optimistic update on API failure", async () => {
    systemApi.updateSystem.mockRejectedValue(new Error("system update failed"));
    const store = useSystemStore();
    store.systems = [{ systemId: "sys-1", sectorId: "s-1", name: "Original" }];

    await expect(store.updateSystem("sys-1", { name: "Changed" })).rejects.toThrow("system update failed");

    expect(store.systems).toEqual([{ systemId: "sys-1", sectorId: "s-1", name: "Original" }]);
    expect(store.error).toContain("system update failed");
  });

  it("persists optimistic update on API success", async () => {
    const updatedSystem = { systemId: "sys-1", sectorId: "s-1", name: "Updated" };
    systemApi.updateSystem.mockResolvedValue(updatedSystem);
    const store = useSystemStore();
    store.systems = [{ systemId: "sys-1", sectorId: "s-1", name: "Original" }];

    await expect(store.updateSystem("sys-1", { name: "Updated" })).resolves.toEqual(updatedSystem);

    expect(systemApi.updateSystem).toHaveBeenCalledWith("sys-1", { name: "Updated" });
    expect(store.systems).toEqual([updatedSystem]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic delete on API failure", async () => {
    systemApi.deleteSystem.mockRejectedValue(new Error("system delete failed"));
    const store = useSystemStore();
    store.systems = [
      { systemId: "sys-1", sectorId: "s-1" },
      { systemId: "sys-2", sectorId: "s-1" },
    ];
    store.setCurrentSystem("sys-1");

    await expect(store.deleteSystem("sys-1")).rejects.toThrow("system delete failed");

    expect(store.systems).toEqual([
      { systemId: "sys-1", sectorId: "s-1" },
      { systemId: "sys-2", sectorId: "s-1" },
    ]);
    expect(store.currentSystemId).toBe("sys-1");
    expect(store.error).toContain("system delete failed");
  });

  it("keeps optimistic delete on API success", async () => {
    systemApi.deleteSystem.mockResolvedValue(undefined);
    const store = useSystemStore();
    store.systems = [
      { systemId: "sys-1", sectorId: "s-1" },
      { systemId: "sys-2", sectorId: "s-1" },
    ];
    store.setCurrentSystem("sys-1");

    await expect(store.deleteSystem("sys-1")).resolves.toBeUndefined();

    expect(systemApi.deleteSystem).toHaveBeenCalledWith("sys-1");
    expect(store.systems).toEqual([{ systemId: "sys-2", sectorId: "s-1" }]);
    expect(store.currentSystemId).toBe("sys-2");
    expect(store.error).toBeNull();
  });
});

describe("worldStore API mocking", () => {
  it("loads worlds from API", async () => {
    worldApi.getWorlds.mockResolvedValue([{ worldId: "w-1", systemId: "sys-1" }]);
    const store = useWorldStore();

    await store.loadWorlds("sys-1");

    expect(worldApi.getWorlds).toHaveBeenCalledWith("sys-1");
    expect(store.worlds).toEqual([{ worldId: "w-1", systemId: "sys-1" }]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic create on API failure", async () => {
    worldApi.createWorld.mockRejectedValue(new Error("world failed"));
    const store = useWorldStore();

    await expect(store.createWorld({ systemId: "sys-1" })).rejects.toThrow("world failed");

    expect(store.worlds).toEqual([]);
    expect(store.error).toContain("world failed");
  });

  it("rolls back optimistic update on API failure", async () => {
    worldApi.updateWorld.mockRejectedValue(new Error("world update failed"));
    const store = useWorldStore();
    store.worlds = [{ worldId: "w-1", systemId: "sys-1", name: "Original" }];

    await expect(store.updateWorld("w-1", { name: "Changed" })).rejects.toThrow("world update failed");

    expect(store.worlds).toEqual([{ worldId: "w-1", systemId: "sys-1", name: "Original" }]);
    expect(store.error).toContain("world update failed");
  });

  it("persists optimistic update on API success", async () => {
    const updatedWorld = { worldId: "w-1", systemId: "sys-1", name: "Updated" };
    worldApi.updateWorld.mockResolvedValue(updatedWorld);
    const store = useWorldStore();
    store.worlds = [{ worldId: "w-1", systemId: "sys-1", name: "Original" }];

    await expect(store.updateWorld("w-1", { name: "Updated" })).resolves.toEqual(updatedWorld);

    expect(worldApi.updateWorld).toHaveBeenCalledWith("w-1", { name: "Updated" });
    expect(store.worlds).toEqual([updatedWorld]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic delete on API failure", async () => {
    worldApi.deleteWorld.mockRejectedValue(new Error("world delete failed"));
    const store = useWorldStore();
    store.worlds = [
      { worldId: "w-1", systemId: "sys-1" },
      { worldId: "w-2", systemId: "sys-1" },
    ];
    store.setCurrentWorld("w-1");

    await expect(store.deleteWorld("w-1")).rejects.toThrow("world delete failed");

    expect(store.worlds).toEqual([
      { worldId: "w-1", systemId: "sys-1" },
      { worldId: "w-2", systemId: "sys-1" },
    ]);
    expect(store.currentWorldId).toBe("w-1");
    expect(store.error).toContain("world delete failed");
  });

  it("keeps optimistic delete on API success", async () => {
    worldApi.deleteWorld.mockResolvedValue(undefined);
    const store = useWorldStore();
    store.worlds = [
      { worldId: "w-1", systemId: "sys-1" },
      { worldId: "w-2", systemId: "sys-1" },
    ];
    store.setCurrentWorld("w-1");

    await expect(store.deleteWorld("w-1")).resolves.toBeUndefined();

    expect(worldApi.deleteWorld).toHaveBeenCalledWith("w-1");
    expect(store.worlds).toEqual([{ worldId: "w-2", systemId: "sys-1" }]);
    expect(store.currentWorldId).toBe("w-2");
    expect(store.error).toBeNull();
  });
});

describe("sophontStore API mocking", () => {
  it("loads sophonts from API", async () => {
    sophontApi.getSophonts.mockResolvedValue([{ sophontId: "sp-1", worldId: "w-1" }]);
    const store = useSophontStore();

    await store.loadSophonts("w-1");

    expect(sophontApi.getSophonts).toHaveBeenCalledWith("w-1");
    expect(store.sophonts).toEqual([{ sophontId: "sp-1", worldId: "w-1" }]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic create on API failure", async () => {
    sophontApi.createSophont.mockRejectedValue(new Error("sophont failed"));
    const store = useSophontStore();

    await expect(store.createSophont({ worldId: "w-1" })).rejects.toThrow("sophont failed");

    expect(store.sophonts).toEqual([]);
    expect(store.error).toContain("sophont failed");
  });

  it("rolls back optimistic update on API failure", async () => {
    sophontApi.updateSophont.mockRejectedValue(new Error("sophont update failed"));
    const store = useSophontStore();
    store.sophonts = [{ sophontId: "sp-1", worldId: "w-1", name: "Original" }];

    await expect(store.updateSophont("sp-1", { name: "Changed" })).rejects.toThrow("sophont update failed");

    expect(store.sophonts).toEqual([{ sophontId: "sp-1", worldId: "w-1", name: "Original" }]);
    expect(store.error).toContain("sophont update failed");
  });

  it("persists optimistic update on API success", async () => {
    const updatedSophont = { sophontId: "sp-1", worldId: "w-1", name: "Updated" };
    sophontApi.updateSophont.mockResolvedValue(updatedSophont);
    const store = useSophontStore();
    store.sophonts = [{ sophontId: "sp-1", worldId: "w-1", name: "Original" }];

    await expect(store.updateSophont("sp-1", { name: "Updated" })).resolves.toEqual(updatedSophont);

    expect(sophontApi.updateSophont).toHaveBeenCalledWith("sp-1", { name: "Updated" });
    expect(store.sophonts).toEqual([updatedSophont]);
    expect(store.error).toBeNull();
  });

  it("rolls back optimistic delete on API failure", async () => {
    sophontApi.deleteSophont.mockRejectedValue(new Error("sophont delete failed"));
    const store = useSophontStore();
    store.sophonts = [
      { sophontId: "sp-1", worldId: "w-1" },
      { sophontId: "sp-2", worldId: "w-1" },
    ];
    store.setCurrentSophont("sp-1");

    await expect(store.deleteSophont("sp-1")).rejects.toThrow("sophont delete failed");

    expect(store.sophonts).toEqual([
      { sophontId: "sp-1", worldId: "w-1" },
      { sophontId: "sp-2", worldId: "w-1" },
    ]);
    expect(store.currentSophontId).toBe("sp-1");
    expect(store.error).toContain("sophont delete failed");
  });

  it("keeps optimistic delete on API success", async () => {
    sophontApi.deleteSophont.mockResolvedValue(undefined);
    const store = useSophontStore();
    store.sophonts = [
      { sophontId: "sp-1", worldId: "w-1" },
      { sophontId: "sp-2", worldId: "w-1" },
    ];
    store.setCurrentSophont("sp-1");

    await expect(store.deleteSophont("sp-1")).resolves.toBeUndefined();

    expect(sophontApi.deleteSophont).toHaveBeenCalledWith("sp-1");
    expect(store.sophonts).toEqual([{ sophontId: "sp-2", worldId: "w-1" }]);
    expect(store.currentSophontId).toBe("sp-2");
    expect(store.error).toBeNull();
  });
});
