/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as sectorApi from "../../api/sectorApi.js";
import * as sectorLayoutGenerator from "../../utils/sectorLayoutGenerator.js";

const hoisted = vi.hoisted(() => ({
  routerPush: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  toastInfo: vi.fn(),
  baseGalaxy: {
    galaxyId: "gal-1",
    name: "Core Test Galaxy",
    morphology: {
      centralAnomaly: { type: "Black Hole", massSolarMasses: 4000000, activityIndex: 0.3 },
    },
    metadata: {
      universeCoordinates: { x: 0, y: 0 },
    },
  },
}));

function createAnomalySector(overrides = {}) {
  const baseSector = {
    sectorId: "gal-1:0,0",
    galaxyId: "gal-1",
    densityClass: 3,
    densityVariation: 0,
    coordinates: { x: 0, y: 0 },
    metadata: {
      gridX: 0,
      gridY: 0,
      displayName: "Core Sector",
      occupiedHexes: ["1619", "1720"],
      hexPresenceGenerated: true,
      centralAnomalyType: "Black Hole",
      centralAnomalyHex: "1619",
      hexStarTypes: {
        1619: {
          starType: "Black Hole",
          starClass: "anomaly-core",
          anomalyType: "Black Hole",
          generatedStars: [{ designation: "BH", spectralClass: "Black Hole" }],
        },
        1720: {
          starType: "B2V",
          starClass: "spectral-b",
          secondaryStars: [],
          generatedStars: [{ designation: "B2V", spectralClass: "B2V" }],
        },
      },
    },
  };

  return {
    ...baseSector,
    ...overrides,
    metadata: {
      ...baseSector.metadata,
      ...(overrides.metadata || {}),
      hexStarTypes: {
        ...baseSector.metadata.hexStarTypes,
        ...(overrides.metadata?.hexStarTypes || {}),
      },
    },
  };
}

const galaxyStoreState = reactive({
  currentGalaxyId: "gal-1",
  getAllGalaxies: [hoisted.baseGalaxy],
  loadGalaxies: vi.fn().mockResolvedValue([hoisted.baseGalaxy]),
  setCurrentGalaxy: vi.fn(),
});

const sectorStoreState = reactive({
  sectors: [createAnomalySector()],
  currentSectorId: "gal-1:0,0",
  setCurrentSector: vi.fn(),
});

const systemStoreState = reactive({
  systems: [],
});

const preferencesStoreState = reactive({
  atlasLayerHexGrid: true,
  atlasLayerNames: true,
  atlasLayerSectorNames: true,
  atlasLayerCoords: false,
  atlasLayerZones: true,
  atlasLayerRoutes: true,
  atlasLayerAnomalies: true,
  atlasLayerBadges: true,
  atlasLayerPolity: true,
  atlasGridBiasX: 0,
  atlasGridBiasY: 0,
  atlasPlanningBiasX: 0,
  atlasPlanningBiasY: 0,
  $state: {},
  set: vi.fn((key, value) => {
    preferencesStoreState[key] = value;
  }),
  replace: vi.fn((nextState) => {
    Object.assign(preferencesStoreState, nextState || {});
  }),
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: hoisted.routerPush }),
}));

vi.mock("../../stores/galaxyStore.js", () => ({
  useGalaxyStore: () => galaxyStoreState,
}));

vi.mock("../../stores/sectorStore.js", () => ({
  useSectorStore: () => sectorStoreState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => systemStoreState,
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  PREFERENCE_DEFAULTS: {
    atlasLayerHexGrid: true,
    atlasLayerNames: true,
    atlasLayerSectorNames: true,
    atlasLayerCoords: false,
    atlasLayerZones: true,
    atlasLayerRoutes: true,
    atlasLayerAnomalies: true,
    atlasLayerBadges: true,
    atlasLayerPolity: true,
    atlasGridBiasX: 0,
    atlasGridBiasY: 0,
    atlasPlanningBiasX: 0,
    atlasPlanningBiasY: 0,
  },
  usePreferencesStore: () => preferencesStoreState,
}));

vi.mock("../../api/sectorApi.js", () => ({
  getSectors: vi.fn().mockResolvedValue([createAnomalySector()]),
  getSectorsWindow: vi.fn().mockResolvedValue([createAnomalySector()]),
  getSector: vi.fn().mockResolvedValue(createAnomalySector()),
}));

vi.mock("../../utils/sectorLayoutGenerator.js", () => ({
  estimateGalaxySectorFootprint: vi.fn().mockReturnValue({ gridRadius: 1 }),
  generateGalaxySectorLayoutWindow: vi.fn().mockReturnValue([createAnomalySector()]),
}));

vi.mock("../../utils/toast.js", () => ({
  error: (...args) => hoisted.toastError(...args),
  success: (...args) => hoisted.toastSuccess(...args),
  info: (...args) => hoisted.toastInfo(...args),
  warning: vi.fn(),
}));

import TravellerMap from "./TravellerMap.vue";

describe("TravellerMap anomaly display", () => {
  beforeEach(() => {
    hoisted.routerPush.mockReset();
    hoisted.toastError.mockReset();
    hoisted.toastSuccess.mockReset();
    hoisted.toastInfo.mockReset();
    preferencesStoreState.atlasGridBiasX = 0;
    preferencesStoreState.atlasGridBiasY = 0;
    preferencesStoreState.atlasPlanningBiasX = 0;
    preferencesStoreState.atlasPlanningBiasY = 0;
    const baseSector = createAnomalySector();
    sectorStoreState.sectors = [baseSector];
    systemStoreState.systems = [];
    sectorApi.getSectors.mockResolvedValue([baseSector]);
    sectorApi.getSectorsWindow.mockResolvedValue([baseSector]);
    sectorApi.getSector.mockResolvedValue(baseSector);
    sectorLayoutGenerator.generateGalaxySectorLayoutWindow.mockReturnValue([baseSector]);
    localStorage.clear();
  });

  it("uses the primary star color for normal stars and purple for anomalies", async () => {
    const wrapper = mount(TravellerMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const markers = wrapper.vm.$.setupState.loadedRouteStarMarkers;
    const anomalyStar = markers.find((entry) => entry.coord === "1619");
    const blueStar = markers.find((entry) => entry.coord === "1720");

    expect(anomalyStar).toBeTruthy();
    expect(anomalyStar.anomalyType).toBe("Black Hole");
    expect(anomalyStar.starType).toBe("Black Hole");
    expect(anomalyStar.color).toBe("#c77dff");

    expect(blueStar).toBeTruthy();
    expect(blueStar.starType).toBe("B2V");
    expect(blueStar.color).toBe("#aabfff");
  });

  it("anchors the anomaly overlay to the anomaly hex when metadata provides it", async () => {
    const wrapper = mount(TravellerMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const markers = wrapper.vm.$.setupState.loadedRouteStarMarkers;
    const overlays = wrapper.vm.$.setupState.anomalyRegionOverlays;
    const anomalyStar = markers.find((entry) => entry.coord === "1619");
    const sectorOverlay = overlays.find((entry) => entry.key === "sector:gal-1:0,0:BH");

    expect(anomalyStar).toBeTruthy();
    expect(sectorOverlay).toBeTruthy();
    expect(sectorOverlay.cx).toBeCloseTo(anomalyStar.wx, 5);
    expect(sectorOverlay.cy).toBeCloseTo(anomalyStar.wy, 5);
  });

  it("anchors the anomaly overlay when the stored anomaly hex uses structured coordinates", async () => {
    const structuredSector = createAnomalySector({
      metadata: {
        centralAnomalyHex: { x: 16, y: 20 },
        hexStarTypes: {
          1521: {
            starType: "Black Hole",
            starClass: "anomaly-core",
            anomalyType: "Black Hole",
            generatedStars: [{ designation: "BH", spectralClass: "Black Hole" }],
          },
          1620: {
            starType: "Black Hole",
            starClass: "anomaly-core",
            anomalyType: "Black Hole",
            generatedStars: [{ designation: "BH", spectralClass: "Black Hole" }],
          },
        },
      },
    });
    sectorStoreState.sectors = [structuredSector];
    sectorApi.getSectors.mockResolvedValue([structuredSector]);
    sectorApi.getSectorsWindow.mockResolvedValue([structuredSector]);
    sectorApi.getSector.mockResolvedValue(structuredSector);
    sectorLayoutGenerator.generateGalaxySectorLayoutWindow.mockReturnValue([structuredSector]);

    const wrapper = mount(TravellerMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const markers = wrapper.vm.$.setupState.loadedRouteStarMarkers;
    const overlays = wrapper.vm.$.setupState.anomalyRegionOverlays;
    const centralAnomalyStar = markers.find((entry) => entry.coord === "1620");
    const sectorOverlay = overlays.find((entry) => entry.key === "sector:gal-1:0,0:BH");

    expect(centralAnomalyStar).toBeTruthy();
    expect(sectorOverlay).toBeTruthy();
    expect(sectorOverlay.cx).toBeCloseTo(centralAnomalyStar.wx, 5);
    expect(sectorOverlay.cy).toBeCloseTo(centralAnomalyStar.wy, 5);
  });

  it("keeps the planning overlay anchored to the current sector before manual bias is applied", async () => {
    const wrapper = mount(TravellerMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.vm.$.setupState.planningWindowBounds).toMatchObject({
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
    });

    const planningOverlay = wrapper.find(".planning-window-overlay");
    expect(planningOverlay.exists()).toBe(true);
    expect(Number(planningOverlay.attributes("x"))).toBe(0);
    expect(Number(planningOverlay.attributes("y"))).toBe(0);
  });

  it("applies dedicated planning bias on top of the atlas grid bias", async () => {
    preferencesStoreState.atlasGridBiasX = 18;
    preferencesStoreState.atlasGridBiasY = 12;
    preferencesStoreState.atlasPlanningBiasX = 4;
    preferencesStoreState.atlasPlanningBiasY = -6;

    const wrapper = mount(TravellerMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const planningOverlay = wrapper.find(".planning-window-overlay");
    expect(planningOverlay.exists()).toBe(true);
    expect(Number(planningOverlay.attributes("x"))).toBe(22);
    expect(Number(planningOverlay.attributes("y"))).toBe(6);
  });
});
