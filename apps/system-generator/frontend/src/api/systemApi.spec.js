import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSystemsBySector, replaceSystemsForSector, upsertSystem } from "./systemApi.js";

function quotaExceededError() {
  return Object.assign(new Error("Setting the value exceeded the quota."), {
    name: "QuotaExceededError",
  });
}

function createLocalStorageMock() {
  const storage = new Map();
  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => storage.set(key, String(value))),
    removeItem: vi.fn((key) => storage.delete(key)),
    clear: vi.fn(() => storage.clear()),
  };
}

describe("systemApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("localStorage", createLocalStorageMock());
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes saved-system reload payloads from system record snapshots", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          systemId: "sec-1:0101",
          sectorId: "sec-1",
          galaxyId: "gal-1",
          metadata: {
            generatedSurvey: {
              legacyReconstructed: true,
              legacyHierarchyUnknown: true,
            },
            systemRecord: {
              hexCoordinates: { x: 1, y: 1 },
              primaryStar: { spectralClass: "G2 V" },
              companionStars: [{ spectralClass: "K7 V" }],
            },
          },
        },
      ],
    });

    const systems = await getSystemsBySector("sec-1");

    expect(systems).toHaveLength(1);
    expect(systems[0].hexCoordinates).toEqual({ x: 1, y: 1 });
    expect(systems[0].primaryStar).toEqual({ spectralClass: "G2 V" });
    expect(systems[0].companionStars).toEqual([{ spectralClass: "K7 V" }]);
    expect(systems[0].metadata.generatedSurvey.legacyReconstructed).toBe(true);
    expect(JSON.parse(globalThis.localStorage.setItem.mock.calls.at(-1)[1])[0].systemId).toBe("sec-1:0101");
  });

  it("enriches legacy persisted planets with descriptive orbit-band taxonomy on reload", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          systemId: "sec-1:0303",
          sectorId: "sec-1",
          galaxyId: "gal-1",
          planets: [
            {
              name: "Verdant",
              type: "Terrestrial Planet",
              orbitNumber: 4,
              orbitAU: 1.2,
              hydrographics: 6,
              avgTempC: 18,
            },
          ],
          metadata: {},
        },
      ],
    });

    const systems = await getSystemsBySector("sec-1");

    expect(systems[0].planets[0].orbitBand).toBe("Inner Zone");
    expect(systems[0].planets[0].worldFamily).toBe("Terrestrial World");
    expect(systems[0].planets[0].worldSubtype).toBe("Tectonic");
    expect(systems[0].planets[0].worldDescriptor).toBe("Inner Zone Tectonic");
  });

  it("falls back to cached systems when sector reload requests fail", async () => {
    globalThis.localStorage.setItem(
      "eclipsed-horizons-systems",
      JSON.stringify([
        {
          systemId: "sec-1:0202",
          sectorId: "sec-1",
          galaxyId: "gal-1",
          hexCoordinates: { x: 2, y: 2 },
          metadata: { generatedSurvey: { legacyReconstructed: true } },
        },
      ]),
    );
    globalThis.fetch.mockRejectedValue(new Error("offline"));

    const systems = await getSystemsBySector("sec-1");

    expect(systems).toHaveLength(1);
    expect(systems[0].systemId).toBe("sec-1:0202");
    expect(systems[0].metadata.generatedSurvey.legacyReconstructed).toBe(true);
  });

  it("keeps the saved system display name when legacy payloads only expose a hex placeholder at the top level", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          systemId: "sec-1:0101",
          sectorId: "sec-1",
          galaxyId: "gal-1",
          name: "0101",
          systemName: "0101",
          metadata: {
            displayName: "Aster System",
            systemRecord: {
              name: "Aster System",
              systemDesignation: "Aster System",
            },
          },
          stars: [{ designation: "Aster Primus Major", spectralClass: "G2 V" }],
        },
      ],
    });

    const systems = await getSystemsBySector("sec-1");

    expect(systems).toHaveLength(1);
    expect(systems[0].name).toBe("Aster System");
    expect(systems[0].systemName).toBe("Aster System");
    expect(systems[0].metadata.displayName).toBe("Aster System");
    expect(systems[0].stars[0].designation).toBe("Aster Primus Major");
  });

  it("replaces cached systems by sector without dropping other sectors", async () => {
    globalThis.localStorage.setItem(
      "eclipsed-horizons-systems",
      JSON.stringify([
        { systemId: "sec-1:0101", sectorId: "sec-1", galaxyId: "gal-1", hexCoordinates: { x: 1, y: 1 } },
        { systemId: "sec-2:0101", sectorId: "sec-2", galaxyId: "gal-1", hexCoordinates: { x: 1, y: 1 } },
      ]),
    );
    globalThis.fetch.mockRejectedValue(new Error("offline"));

    const replaced = await replaceSystemsForSector("sec-1", [
      { systemId: "sec-1:0303", sectorId: "sec-1", galaxyId: "gal-1", hexCoordinates: { x: 3, y: 3 } },
    ]);

    const cached = JSON.parse(globalThis.localStorage.getItem("eclipsed-horizons-systems"));
    expect(replaced).toHaveLength(1);
    expect(cached.map((entry) => entry.systemId).sort()).toEqual(["sec-1:0303", "sec-2:0101"]);
  });

  it("returns fetched systems even when cache writes exceed quota", async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          systemId: "sec-1:0101",
          sectorId: "sec-1",
          galaxyId: "gal-1",
          hexCoordinates: { x: 1, y: 1 },
        },
      ],
    });
    globalThis.localStorage.setItem.mockImplementation(() => {
      throw quotaExceededError();
    });

    const systems = await getSystemsBySector("sec-1");

    expect(systems).toHaveLength(1);
    expect(systems[0].systemId).toBe("sec-1:0101");
    expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith("eclipsed-horizons-systems");
  });

  it("preserves generated planets from metadata snapshot when upsert responses omit top-level planets", async () => {
    globalThis.fetch.mockImplementation(async (_url, options = {}) => {
      const payload = JSON.parse(options.body || "{}");
      return {
        ok: true,
        status: 200,
        json: async () => ({
          systemId: payload.systemId,
          sectorId: payload.sectorId,
          galaxyId: payload.galaxyId,
          hexCoordinates: payload.hexCoordinates,
          primaryStar: payload.primaryStar,
          metadata: {
            ...(payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {}),
          },
        }),
      };
    });

    const persisted = await upsertSystem({
      systemId: "sec-1:0404",
      sectorId: "sec-1",
      galaxyId: "gal-1",
      hexCoordinates: { x: 4, y: 4 },
      primaryStar: { spectralClass: "G2 V" },
      planets: [
        {
          name: "Aster I",
          type: "Terrestrial Planet",
          orbitNumber: 2,
          orbitAU: 0.8,
        },
      ],
      mainworld: {
        name: "Aster I",
        type: "Terrestrial Planet",
      },
      metadata: {},
    });

    expect(persisted.planets).toHaveLength(1);
    expect(persisted.planets[0].name).toBe("Aster I");
    expect(persisted.mainworld?.name).toBe("Aster I");
    expect(persisted.metadata?.systemRecord?.planets).toHaveLength(1);
    expect(persisted.metadata?.systemRecord?.mainworld?.name).toBe("Aster I");
  });
});
