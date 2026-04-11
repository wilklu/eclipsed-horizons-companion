import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import {
  isGalaxySurveyGenerationCancelledError,
  useGalaxySurveyGenerationController,
} from "./useGalaxySurveyGenerationController.js";

describe("useGalaxySurveyGenerationController", () => {
  it("focuses the next recommended frontier ring and announces changes", async () => {
    const selectedTile = ref({ ring: 0 });
    const preview = ref({
      tiles: [
        { id: "0_0", ring: 0, persisted: true },
        { id: "1_0", ring: 1, persisted: true },
        { id: "2_0", ring: 2, persisted: true },
      ],
    });
    const guidance = computed(() => ({
      ringSummaries: [
        { ring: 0, systemsPendingCount: 0, presencePendingCount: 0 },
        { ring: 1, systemsPendingCount: 0, presencePendingCount: 0 },
        { ring: 2, systemsPendingCount: 1, presencePendingCount: 0 },
      ],
      nextPresenceRing: null,
      nextSystemsRing: { ring: 2 },
      recommendation: { ring: 2, mode: "systems" },
    }));

    const focusGalaxyMapTile = vi.fn((tileId) => {
      const tile = preview.value.tiles.find((entry) => entry.id === tileId);
      selectedTile.value = tile;
    });
    const toast = { info: vi.fn() };

    const controller = useGalaxySurveyGenerationController({
      getGenerationGuidance: () => guidance.value,
      getSelectedGalaxyMapTile: () => selectedTile.value,
      getGalaxyMapPreview: () => preview.value,
      focusGalaxyMapTile,
      toastService: toast,
    });

    const focused = await controller.syncGenerationFrontierSelection({ preferMode: "systems", announce: true });

    expect(focused).toBe(true);
    expect(focusGalaxyMapTile).toHaveBeenCalledWith("2_0", { zoom: true });
    expect(toast.info).toHaveBeenCalledWith("Frontier advanced to ring 2.");
  });

  it("delegates guided generation to the provided ring runner", async () => {
    const generateRing = vi.fn().mockResolvedValue();
    const controller = useGalaxySurveyGenerationController({
      getGenerationGuidance: () => ({
        ringSummaries: [
          { ring: 0, systemsPendingCount: 0, presencePendingCount: 0 },
          { ring: 1, systemsPendingCount: 2, presencePendingCount: 0 },
        ],
      }),
      getSelectedGalaxyMapTile: () => ({ ring: 0 }),
      getGalaxyMapPreview: () => ({ tiles: [] }),
      focusGalaxyMapTile: vi.fn(),
      toastService: { info: vi.fn() },
    });

    const handled = await controller.runGuidedGenerationStep({ mode: "systems", generateRing });

    expect(handled).toBe(true);
    expect(generateRing).toHaveBeenCalledWith({ ring: 1, mode: "systems", reason: "frontier" });
  });

  it("raises a cancellation error after a cancel request", () => {
    const toast = { info: vi.fn() };
    const controller = useGalaxySurveyGenerationController({
      getGenerationGuidance: () => ({ ringSummaries: [] }),
      getSelectedGalaxyMapTile: () => null,
      getGalaxyMapPreview: () => ({ tiles: [] }),
      focusGalaxyMapTile: vi.fn(),
      toastService: toast,
    });

    controller.startGenerationProgress("Generating", 10);
    const requested = controller.requestGenerationCancel("Stopping after this sector.");

    expect(requested).toBe(true);
    expect(controller.generationCancelRequested.value).toBe(true);
    expect(toast.info).toHaveBeenCalledWith("Stopping after this sector.");
    expect(() => controller.assertGenerationNotCancelled()).toThrowError();
    expect(isGalaxySurveyGenerationCancelledError(new Error())).toBe(false);
  });

  it("aborts the active request scope when cancellation is requested", () => {
    const controller = useGalaxySurveyGenerationController({
      getGenerationGuidance: () => ({ ringSummaries: [] }),
      getSelectedGalaxyMapTile: () => null,
      getGalaxyMapPreview: () => ({ tiles: [] }),
      focusGalaxyMapTile: vi.fn(),
      toastService: { info: vi.fn() },
    });

    controller.startGenerationProgress("Generating", 1);
    const signal = controller.beginGenerationRequestScope();
    controller.requestGenerationCancel("Abort now.");

    expect(signal?.aborted).toBe(true);
    expect(isGalaxySurveyGenerationCancelledError(new DOMException("The operation was aborted.", "AbortError"))).toBe(
      true,
    );
  });
});
