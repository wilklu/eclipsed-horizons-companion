/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StarSystemBuilder from "./StarSystemBuilder.vue";

const hoisted = vi.hoisted(() => ({
  routeState: {
    query: {
      hex: "0101",
      systemRecordId: "gal-1:1,2:0101",
    },
    params: {
      galaxyId: "gal-1",
      sectorId: "grid:1:2",
    },
    name: "StarSystemBuilder",
  },
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  sectorStoreState: {
    sectors: [
      {
        sectorId: "gal-1:1,2",
        galaxyId: "gal-1",
        coordinates: { x: 1, y: 2 },
        metadata: {
          gridX: 1,
          gridY: 2,
          occupiedHexes: ["0101"],
          hexStarTypes: {},
        },
      },
    ],
    setCurrentSector: vi.fn(),
  },
  systemStoreState: {
    systems: [],
    currentSystemId: null,
    loadSystems: vi.fn(),
    createSystem: vi.fn(async (payload) => payload),
    setCurrentSystem: vi.fn(),
    findSystemByHex: vi.fn(),
  },
}));

const routeState = reactive(hoisted.routeState);
const sectorStoreState = reactive(hoisted.sectorStoreState);
const systemStoreState = reactive(hoisted.systemStoreState);

vi.mock("vue-router", () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: hoisted.routerPush, replace: hoisted.routerReplace }),
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  usePreferencesStore: () => ({
    worldNameMode: "list",
    asteroidBeltNameMode: "phonotactic",
    galaxyMythicTheme: "all",
  }),
}));

vi.mock("../../stores/sectorStore.js", () => ({
  useSectorStore: () => sectorStoreState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => systemStoreState,
}));

vi.mock("../../api/sectorApi.js", () => ({
  getSector: vi.fn(async () => sectorStoreState.sectors[0]),
  upsertSector: vi.fn(async (payload) => payload),
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {
      isVisible: false,
      context: "stellar",
      tone: "analysis",
      stateLabel: "",
      statusCode: "",
      title: "",
      message: "",
      barLabel: "",
      diagnostics: [],
      ledger: [],
    },
    exportJson: vi.fn(),
  }),
}));

describe("StarSystemBuilder page", () => {
  beforeEach(() => {
    hoisted.routerPush.mockReset();
    hoisted.routerReplace.mockReset();
    hoisted.systemStoreState.currentSystemId = null;

    const nullHabitableZoneSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "BH",
          spectralClass: "Black Hole",
          massInSolarMasses: 12,
          luminosity: 0,
          temperatureK: 0,
          orbitType: null,
          isAnomaly: true,
        },
      ],
      habitableZone: null,
      planets: [],
      metadata: {},
    };

    hoisted.systemStoreState.systems = [nullHabitableZoneSystem];
    hoisted.systemStoreState.loadSystems = vi.fn(async () => hoisted.systemStoreState.systems);
    hoisted.systemStoreState.createSystem = vi.fn(async (payload) => payload);
    hoisted.systemStoreState.findSystemByHex = vi.fn(() => nullHabitableZoneSystem);
    hoisted.systemStoreState.setCurrentSystem = vi.fn((systemId) => {
      hoisted.systemStoreState.currentSystemId = systemId;
    });
  });

  it("renders safely when a persisted system is missing habitable-zone data", async () => {
    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("System Layout Anchor");
    expect(wrapper.text()).toContain("Inner System");
    expect(wrapper.text()).toContain("Outer System");
  });

  it("rebuilds a persisted system even when reused star records have no positive mass", async () => {
    const masslessSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 0,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: null,
      planets: [],
      metadata: {
        generatedWorldProfilesIncomplete: true,
      },
    };

    systemStoreState.systems = [masslessSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => masslessSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();
    await wrapper.find("button.btn.btn-primary").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Planetary Catalog");
  });
});
