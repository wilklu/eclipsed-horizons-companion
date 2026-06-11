/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHistorySeededRng, generateProceduralHistory } from "../../utils/history/proceduralHistory.js";

const hoisted = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
}));

const routeState = reactive({
  query: {
    civilizationName: "Talari Concord",
    systemId: "sector-1:0101",
    systemRecordId: "sector-1:0101",
    worldName: "Talara",
    government: "Imperial Directorate",
    diplomaticPosture: "guarded hostility",
    pressureLevel: "High",
    techBand: "stellar-capable",
    worldTraits: "frontier, scarcity",
    flashpoint: "succession blockade",
    conflictSummary: "great houses are maneuvering for the throne",
    eventHook: "The Succession War",
    seed: "history-seed",
    eraStart: "25000",
    historyLength: "long",
  },
  params: {},
});

const historyStoreState = reactive({
  historiesByWorld: vi.fn(() => []),
  hydrateHistories: vi.fn().mockResolvedValue([]),
  saveHistory: vi.fn(),
  removeHistory: vi.fn(),
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: hoisted.routerPush, replace: hoisted.routerReplace }),
  useRoute: () => routeState,
  onBeforeRouteLeave: () => {},
}));

vi.mock("../../stores/historyStore.js", () => ({
  useHistoryStore: () => historyStoreState,
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {},
    exportJson: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("../../utils/toast.js", () => ({
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

import HistoryGenerator from "./HistoryGenerator.vue";

describe("HistoryGenerator family focus", () => {
  beforeEach(() => {
    hoisted.routerPush.mockClear();
    hoisted.routerReplace.mockClear();
    historyStoreState.historiesByWorld.mockClear();
    historyStoreState.hydrateHistories.mockClear();
    historyStoreState.saveHistory.mockClear();
    historyStoreState.removeHistory.mockClear();
  });

  it("highlights the selected member and dims unrelated branches", async () => {
    const wrapper = mount(HistoryGenerator, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const familyTree = wrapper.find(".family-tree-panel");
    expect(familyTree.exists()).toBe(true);

    const members = wrapper.findAll(".generation-member");
    expect(members.length).toBeGreaterThan(0);

    await members[0].trigger("click");
    await flushPromises();

    const selected = wrapper.find(".family-member-selected");
    expect(selected.exists()).toBe(true);
    const selectedName = selected.find("strong").text();
    expect(selectedName).toBeTruthy();
    expect(hoisted.routerReplace).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          familyFocus: expect.stringContaining(selectedName),
        }),
      }),
    );
    expect(wrapper.find(".family-focus-banner").text()).toContain(selectedName);
    const focusedLinks = wrapper.findAll(".tree-link-row");
    expect(focusedLinks.length).toBeGreaterThan(0);
    for (const link of focusedLinks) {
      expect(link.text()).toContain(selectedName);
      expect(link.classes()).not.toContain("link-rivalry");
      expect(link.classes()).not.toContain("link-sibling");
    }
    expect(wrapper.findAll(".dynasty-card-muted").length).toBeGreaterThan(0);
    expect(wrapper.find(".family-clear-button").exists()).toBe(true);

    await wrapper.get(".family-clear-button").trigger("click");
    await flushPromises();

    expect(wrapper.find(".family-focus-banner").exists()).toBe(false);
    expect(hoisted.routerReplace).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          familyFocus: undefined,
        }),
      }),
    );
  });

  it("switches between list and track timeline views", async () => {
    const wrapper = mount(HistoryGenerator, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find('[data-test="timeline-list-view"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="timeline-track-view"]').exists()).toBe(false);

    await wrapper.findAll(".timeline-toggle-btn")[1].trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="timeline-track-view"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="timeline-list-view"]').exists()).toBe(false);
    expect(wrapper.findAll(".timeline-track-node").length).toBeGreaterThan(0);
    expect(hoisted.routerReplace).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          timelineView: "track",
        }),
      }),
    );
  });

  it("filters timeline events by selected era", async () => {
    const wrapper = mount(HistoryGenerator, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const initialEventCount = wrapper.findAll(".timeline-event").length;
    expect(initialEventCount).toBeGreaterThan(0);

    const eraChips = wrapper.findAll(".timeline-era-chip");
    expect(eraChips.length).toBeGreaterThan(2);

    const selectedEra = eraChips[2].text();
    await eraChips[2].trigger("click");
    await flushPromises();

    const filteredEvents = wrapper.findAll(".timeline-event");
    expect(filteredEvents.length).toBeGreaterThan(0);
    expect(filteredEvents.length).toBeLessThan(initialEventCount);

    const filteredCategories = wrapper.findAll(".timeline-event .event-category").map((node) => node.text());
    for (const category of filteredCategories) {
      expect(category).toContain(selectedEra);
    }

    expect(hoisted.routerReplace).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          timelineEra: selectedEra,
        }),
      }),
    );
  });

  it("groups track events into era lanes and narrows to one lane when filtered", async () => {
    const wrapper = mount(HistoryGenerator, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    await wrapper.findAll(".timeline-toggle-btn")[1].trigger("click");
    await flushPromises();

    const initialLanes = wrapper.findAll(".timeline-track-lane");
    expect(initialLanes.length).toBeGreaterThan(1);

    const eraChips = wrapper.findAll(".timeline-era-chip");
    const selectedEra = eraChips[1].text();
    await eraChips[1].trigger("click");
    await flushPromises();

    const filteredLanes = wrapper.findAll(".timeline-track-lane");
    expect(filteredLanes.length).toBe(1);
    expect(filteredLanes[0].find(".timeline-track-lane-label").text()).toContain(selectedEra);
  });

  it("restores focused family member from query on initial load", async () => {
    const seededHistory = generateProceduralHistory({
      civilizationName: routeState.query.civilizationName,
      historyLength: routeState.query.historyLength,
      eraStart: Number(routeState.query.eraStart),
      context: {
        worldName: routeState.query.worldName,
        government: routeState.query.government,
        diplomaticPosture: routeState.query.diplomaticPosture,
        pressureLevel: routeState.query.pressureLevel,
        techBand: routeState.query.techBand,
        worldTraits: routeState.query.worldTraits,
        flashpoint: routeState.query.flashpoint,
        conflictSummary: routeState.query.conflictSummary,
        eventHook: routeState.query.eventHook,
      },
      rng: createHistorySeededRng(
        `${routeState.query.seed}|${routeState.query.civilizationName}|${routeState.query.historyLength}|${Number(routeState.query.eraStart) || 0}|${routeState.query.worldName}`,
      ),
    });

    const dynasty = seededHistory.familyTree?.[0];
    const member = dynasty?.members?.[0];
    expect(dynasty?.id).toBeTruthy();
    expect(member?.name).toBeTruthy();

    routeState.query = {
      ...routeState.query,
      familyFocus: `${dynasty.id}::${member.name}`,
    };

    const wrapper = mount(HistoryGenerator, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".family-focus-banner").exists()).toBe(true);
    expect(wrapper.find(".family-focus-banner").text()).toContain(member.name);
    expect(wrapper.findAll(".family-member-selected").length).toBeGreaterThan(0);
  });
});
