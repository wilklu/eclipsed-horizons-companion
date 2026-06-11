import { computed, nextTick, ref } from "vue";

function isAbortError(error) {
  if (!error) return false;
  const name = String(error?.name || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return name === "aborterror" || code === "abort_err" || message.includes("aborted") || message.includes("abort");
}

export class GalaxySurveyGenerationCancelledError extends Error {
  constructor(message = "Galaxy Survey generation cancelled.") {
    super(message);
    this.name = "GalaxySurveyGenerationCancelledError";
  }
}

export function isGalaxySurveyGenerationCancelledError(error) {
  return error instanceof GalaxySurveyGenerationCancelledError || isAbortError(error);
}

function formatDuration(seconds) {
  const clamped = Math.max(0, Math.round(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function useGalaxySurveyGenerationController({
  getGenerationGuidance,
  getSelectedGalaxyMapTile,
  getGalaxyMapPreview,
  focusGalaxyMapTile,
  toastService,
}) {
  const generationProgress = ref({
    active: false,
    label: "",
    current: 0,
    total: 0,
    startedAtMs: 0,
  });
  const generationCancelRequested = ref(false);
  const generationCancelMessage = ref("Generation will stop after the current sector finishes.");
  const generationAbortController = ref(null);

  const generationProgressPercent = computed(() => {
    if (!generationProgress.value.active || generationProgress.value.total <= 0) return 0;
    const pct = Math.round((generationProgress.value.current / generationProgress.value.total) * 100);
    return Math.max(0, Math.min(100, pct));
  });

  const generationProgressEtaLabel = computed(() => {
    const progress = generationProgress.value;
    if (!progress.active || progress.total <= 0) return "ETA --";
    if (progress.current <= 0 || progress.current >= progress.total) return "ETA --";
    if (progress.startedAtMs <= 0) return "ETA --";

    const elapsedSeconds = Math.max(1, (Date.now() - progress.startedAtMs) / 1000);
    const sectorsPerSecond = progress.current / elapsedSeconds;
    if (!Number.isFinite(sectorsPerSecond) || sectorsPerSecond <= 0) return "ETA --";

    const remaining = progress.total - progress.current;
    const etaSeconds = remaining / sectorsPerSecond;
    return `ETA ${formatDuration(etaSeconds)}`;
  });

  function startGenerationProgress(label, total) {
    generationCancelRequested.value = false;
    generationCancelMessage.value = "Generation will stop after the current sector finishes.";

    const now = Date.now();
    generationProgress.value = {
      active: true,
      label,
      current: 0,
      total: Math.max(0, Number(total) || 0),
      startedAtMs: now,
    };
  }

  async function flushGenerationProgressUi() {
    await nextTick();
    await new Promise((resolve) => {
      if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
        setTimeout(resolve, 0);
        return;
      }
      window.requestAnimationFrame(() => resolve());
    });
  }

  function updateGenerationProgress(
    current,
    total = generationProgress.value.total,
    label = generationProgress.value.label,
  ) {
    const previousStart = generationProgress.value.startedAtMs;
    const now = Date.now();
    generationProgress.value = {
      active: true,
      label,
      current: Math.max(0, Number(current) || 0),
      total: Math.max(0, Number(total) || 0),
      startedAtMs: previousStart > 0 ? previousStart : now,
    };
  }

  function resetGenerationProgress() {
    generationProgress.value = {
      active: false,
      label: "",
      current: 0,
      total: 0,
      startedAtMs: 0,
    };
    generationCancelRequested.value = false;
    generationCancelMessage.value = "Generation will stop after the current sector finishes.";
  }

  function beginGenerationRequestScope() {
    generationAbortController.value?.abort?.("Generation scope replaced.");
    generationAbortController.value = typeof AbortController === "function" ? new AbortController() : null;
    return generationAbortController.value?.signal ?? null;
  }

  function getGenerationRequestOptions() {
    const signal = generationAbortController.value?.signal ?? null;
    return signal ? { signal } : {};
  }

  function clearGenerationRequestScope() {
    generationAbortController.value = null;
  }

  function requestGenerationCancel(message = "Generation will stop after the current sector finishes.") {
    if (!generationProgress.value.active || generationCancelRequested.value) {
      return false;
    }
    generationCancelRequested.value = true;
    generationCancelMessage.value = message;
    generationAbortController.value?.abort?.(message);
    toastService?.info?.(message);
    return true;
  }

  function assertGenerationNotCancelled() {
    if (generationCancelRequested.value || generationAbortController.value?.signal?.aborted) {
      throw new GalaxySurveyGenerationCancelledError(generationCancelMessage.value);
    }
  }

  function focusGalaxyMapRing(ring, { zoom = true } = {}) {
    const preview = getGalaxyMapPreview?.();
    const selectableTiles = [...(preview?.tiles ?? []), ...(preview?.focusAnchors ?? [])];
    if (!selectableTiles.length) {
      return false;
    }

    const targetRing = Number(ring);
    if (!Number.isFinite(targetRing)) {
      return false;
    }

    const tile =
      selectableTiles.find((entry) => Number(entry?.ring) === targetRing && entry.persisted) ||
      selectableTiles.find((entry) => Number(entry?.ring) === targetRing && entry.kind === "ring-anchor") ||
      selectableTiles.find((entry) => Number(entry?.ring) === targetRing);

    if (!tile?.id) {
      return false;
    }

    focusGalaxyMapTile?.(tile.id, { zoom });
    return true;
  }

  function getRecommendedGenerationRing({ preferMode = null } = {}) {
    const guidance = getGenerationGuidance?.();
    if (!guidance) {
      return null;
    }

    if (preferMode === "presence" && guidance.nextPresenceRing) {
      return guidance.nextPresenceRing;
    }
    if (preferMode === "systems" && guidance.nextSystemsRing) {
      return guidance.nextSystemsRing;
    }
    if (guidance.recommendation?.ring !== null && guidance.recommendation?.ring !== undefined) {
      return { ring: guidance.recommendation.ring };
    }
    return guidance.nextSystemsRing || guidance.nextPresenceRing || null;
  }

  async function syncGenerationFrontierSelection({ preferMode = null, zoom = true, announce = false } = {}) {
    const previousRing = Number(getSelectedGalaxyMapTile?.()?.ring);
    await nextTick();
    const target = getRecommendedGenerationRing({ preferMode });
    if (!target) {
      return false;
    }
    const focused = focusGalaxyMapRing(target.ring, { zoom });
    if (focused && announce && previousRing !== Number(target.ring)) {
      toastService?.info?.(`Frontier advanced to ring ${target.ring}.`);
    }
    return focused;
  }

  async function runGuidedGenerationStep({ mode = "systems", generateRing } = {}) {
    const guidance = getGenerationGuidance?.();
    const ringSummaries = guidance?.ringSummaries ?? [];
    const pendingKey = mode === "systems" ? "systemsPendingCount" : "presencePendingCount";
    const ringSummary = ringSummaries.find((summary) => Number(summary?.[pendingKey]) > 0) || null;

    // Debug: surface guidance/ringSummary to test logs when running under test harness.
    if (typeof console !== "undefined" && typeof console.debug === "function") {
      try {
        console.debug("runGuidedGenerationStep: guidance rings", ringSummaries.length, "pendingKey", pendingKey);
        console.debug("runGuidedGenerationStep: selected ringSummary", ringSummary && ringSummary.ring);
      } catch (e) {
        // no-op
      }
    }

    if (!ringSummary) {
      toastService?.info?.(`No ${mode} frontier is pending right now.`);
      return false;
    }

    if (typeof generateRing !== "function") {
      // Debug: note missing generator function
      if (typeof console !== "undefined" && typeof console.warn === "function") {
        try {
          console.warn("runGuidedGenerationStep: generateRing is not a function");
        } catch (e) {}
      }
      return false;
    }

    const result = await generateRing({ ring: ringSummary.ring, mode, reason: "frontier" });
    return result !== false;
  }

  return {
    generationProgress,
    generationProgressPercent,
    generationProgressEtaLabel,
    generationCancelRequested,
    generationCancelMessage,
    startGenerationProgress,
    flushGenerationProgressUi,
    updateGenerationProgress,
    resetGenerationProgress,
    beginGenerationRequestScope,
    getGenerationRequestOptions,
    clearGenerationRequestScope,
    requestGenerationCancel,
    assertGenerationNotCancelled,
    focusGalaxyMapRing,
    getRecommendedGenerationRing,
    syncGenerationFrontierSelection,
    runGuidedGenerationStep,
  };
}
