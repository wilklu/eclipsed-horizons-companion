/** @vitest-environment jsdom */

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import GalaxySurveyOperationsPanel from "./GalaxySurveyOperationsPanel.vue";

function createPlannerSummary() {
  return {
    modeLabel: "Generate Systems",
    actionLabel: "Generate persisted systems",
    layoutCountLabel: "64",
    sectorsTouchedLabel: "12",
    namedSectorsLabel: "12 / 64",
    presenceCoverageLabel: "18%",
    cachedSystemsLabel: "244",
    writeProfile: "Writes sector metadata and replaces sector system records",
    forecastRows: [
      { label: "Sector Writes", value: "12 upserts" },
      { label: "Likely Runtime", value: "Moderate", tone: "moderate" },
    ],
    forecastNote: "Forecasts use current cached coverage.",
    warningMessages: ["Large footprint detected."],
  };
}

function createGuidance(overrides = {}) {
  return {
    ringSummaries: [
      {
        ring: 0,
        label: "Ring 0",
        layoutCount: 1,
        persistedCount: 1,
        presenceCompleteCount: 1,
        systemsCompleteCount: 1,
      },
      {
        ring: 1,
        label: "Ring 1",
        layoutCount: 8,
        persistedCount: 8,
        presenceCompleteCount: 8,
        systemsCompleteCount: 5,
      },
    ],
    nextPresenceRing: { ring: 2 },
    nextSystemsRing: { ring: 1 },
    completedRingCount: 1,
    totalRingCount: 2,
    recommendation: {
      title: "Resume ring 1 systems",
      body: "Ring 1 already has persisted survey coverage, but 3 sectors are still missing typed system output.",
      mode: "systems",
      ring: 1,
    },
    ...overrides,
  };
}

describe("GalaxySurveyOperationsPanel", () => {
  it("renders frontier guidance and emits guided generation events", async () => {
    const wrapper = mount(GalaxySurveyOperationsPanel, {
      props: {
        generationPlannerSummary: createPlannerSummary(),
        generationGuidance: createGuidance(),
        currentGalaxyHistory: [],
      },
    });

    expect(wrapper.text()).toContain("Resume ring 1 systems");
    expect(wrapper.text()).toContain("Completed Rings");
    expect(wrapper.text()).toContain("Ring 2");
    expect(wrapper.text()).toContain("Sector Writes");
    expect(wrapper.text()).toContain("Moderate");

    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(wrapper.emitted("guided-generate")).toEqual([[{ mode: "presence" }], [{ mode: "systems" }]]);
  });

  it("emits reset requests for the selected sector and renders history metrics", async () => {
    const wrapper = mount(GalaxySurveyOperationsPanel, {
      props: {
        generationPlannerSummary: createPlannerSummary(),
        generationGuidance: createGuidance({ nextSystemsRing: null }),
        hasGalaxySectors: true,
        selectedSectorName: "Aegis Reach",
        selectedSectorId: "sec-42",
        currentGalaxyHistory: [
          {
            id: "hist-1",
            label: "Generated Ring 1 Systems",
            at: "2026-04-11T01:02:03.000Z",
            detail: "Processed ring 1.",
            metrics: [
              { label: "Mode", value: "systems" },
              { label: "Scope", value: "ring 1" },
            ],
          },
        ],
      },
    });

    expect(wrapper.text()).toContain("Mode: systems");
    expect(wrapper.text()).toContain("Scope: ring 1");

    const buttons = wrapper.findAll("button");
    await buttons[4].trigger("click");
    await buttons[5].trigger("click");

    expect(wrapper.emitted("request-reset")).toEqual([
      [{ level: "systems", scopeLabel: "Aegis Reach", sectorIds: ["sec-42"] }],
      [{ level: "presence", scopeLabel: "Aegis Reach", sectorIds: ["sec-42"] }],
    ]);
  });
});
