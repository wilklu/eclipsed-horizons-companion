/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = reactive({
  name: "SystemSurvey",
  query: {
    systemId: "sector-1:0101",
    systemRecordId: "sector-1:0101",
    systemName: "Aster System",
    hex: "0101",
  },
  params: {
    galaxyId: "gal-1",
    sectorId: "sector-1",
    systemId: "sector-1:0101",
  },
});

const systemStoreState = reactive({
  currentSystemId: "sector-1:0101",
  getCurrentSystem: {
    systemId: "sector-1:0101",
    stars: [{ designation: "Aster Primus Major" }],
    worlds: [],
    metadata: {},
  },
  systems: [
    {
      systemId: "sector-1:0101",
      stars: [{ designation: "Aster Primus Major" }],
      worlds: [],
      metadata: {},
    },
  ],
});

vi.mock("vue-router", () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: () => {},
}));

vi.mock("../../stores/systemStore", () => ({
  useSystemStore: () => systemStoreState,
}));

import SystemSurvey from "./SystemSurvey.vue";

describe("SystemSurvey", () => {
  beforeEach(() => {
    routeState.name = "SystemSurvey";
    routeState.query = {
      systemId: "sector-1:0101",
      systemRecordId: "sector-1:0101",
      systemName: "Aster System",
      hex: "0101",
    };
    routeState.params = {
      galaxyId: "gal-1",
      sectorId: "sector-1",
      systemId: "sector-1:0101",
    };

    systemStoreState.currentSystemId = "sector-1:0101";
    systemStoreState.getCurrentSystem = {
      systemId: "sector-1:0101",
      stars: [{ designation: "Aster Primus Major" }],
      worlds: [],
      metadata: {},
    };
    systemStoreState.systems = [systemStoreState.getCurrentSystem];
  });

  it("autofills the form with routed system name and sector-hex context", async () => {
    const wrapper = mount(SystemSurvey, {
      global: {
        stubs: {
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const systemDesignationInput = wrapper.find('input[placeholder="e.g., Alpha Centauri A"]');
    const sectorHexInput = wrapper.find('input[placeholder="e.g., Orion 0101"]');

    expect(systemDesignationInput.element.value).toBe("Aster System");
    expect(sectorHexInput.element.value).toContain("0101");
    expect(sectorHexInput.element.value).toContain("sector-1");
  });

  it("uses routed star metadata when no matching system record exists in cache", async () => {
    routeState.query = {
      systemId: "sector-1:0917",
      systemRecordId: "sector-1:0917",
      systemName: "Nadir System",
      hex: "0917",
      star: "K7 V",
    };
    routeState.params = {
      galaxyId: "gal-1",
      sectorId: "sector-1",
      systemId: "sector-1:0917",
    };

    // Keep a stale current system in store to verify route-specific hydration wins.
    systemStoreState.currentSystemId = "sector-1:0101";
    systemStoreState.getCurrentSystem = {
      systemId: "sector-1:0101",
      stars: [{ designation: "G2 V", spectralClass: "G2 V" }],
      worlds: [],
      metadata: {},
    };
    systemStoreState.systems = [systemStoreState.getCurrentSystem];

    const wrapper = mount(SystemSurvey, {
      global: {
        stubs: {
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const starSubtypeInput = wrapper.find('input[placeholder="G2V"]');
    expect(starSubtypeInput.exists()).toBe(true);
    expect(starSubtypeInput.element.value).toBe("K7");
  });

  it("prefers routed star metadata over cached default stars for matched systems", async () => {
    routeState.query = {
      systemId: "sector-1:0101",
      systemRecordId: "sector-1:0101",
      systemName: "Aster System",
      hex: "0101",
      star: "M3 V",
    };
    routeState.params = {
      galaxyId: "gal-1",
      sectorId: "sector-1",
      systemId: "sector-1:0101",
    };

    systemStoreState.systems = [
      {
        systemId: "sector-1:0101",
        stars: [{ designation: "G2 V", spectralClass: "G2 V" }],
        primaryStar: { designation: "G2 V", spectralClass: "G2 V" },
        worlds: [],
        metadata: {},
      },
    ];
    systemStoreState.getCurrentSystem = systemStoreState.systems[0];

    const wrapper = mount(SystemSurvey, {
      global: {
        stubs: {
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const starSubtypeInput = wrapper.find('input[placeholder="G2V"]');
    expect(starSubtypeInput.exists()).toBe(true);
    expect(starSubtypeInput.element.value).toBe("M3");
  });
});
