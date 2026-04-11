function toNonNegativeInteger(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.trunc(numeric);
}

function resolvePresenceGenerated(tile) {
  if (tile?.presenceGenerated === true) {
    return true;
  }
  return Boolean(tile?.persistedSector?.metadata?.hexPresenceGenerated);
}

function isSystemsComplete(tile) {
  if (!tile?.persisted || !resolvePresenceGenerated(tile)) {
    return false;
  }

  const occupiedHexCount = toNonNegativeInteger(tile?.occupiedHexCount);
  const typedHexCount = toNonNegativeInteger(tile?.typedHexCount);
  return typedHexCount >= occupiedHexCount;
}

export function summarizeGalaxyGenerationRings(tiles = []) {
  const ringMap = new Map();

  for (const tile of Array.isArray(tiles) ? tiles : []) {
    const ring = Number(tile?.ring);
    if (!Number.isFinite(ring) || ring < 0) {
      continue;
    }

    const summary = ringMap.get(ring) || {
      ring,
      label: `Ring ${ring}`,
      layoutCount: 0,
      persistedCount: 0,
      presenceCompleteCount: 0,
      systemsCompleteCount: 0,
    };

    summary.layoutCount += 1;

    if (tile?.persisted) {
      summary.persistedCount += 1;
    }
    if (tile?.persisted && resolvePresenceGenerated(tile)) {
      summary.presenceCompleteCount += 1;
    }
    if (isSystemsComplete(tile)) {
      summary.systemsCompleteCount += 1;
    }

    ringMap.set(ring, summary);
  }

  return Array.from(ringMap.values())
    .sort((left, right) => left.ring - right.ring)
    .map((summary) => ({
      ...summary,
      missingSectorCount: Math.max(0, summary.layoutCount - summary.persistedCount),
      presencePendingCount: Math.max(0, summary.layoutCount - summary.presenceCompleteCount),
      systemsPendingCount: Math.max(0, summary.layoutCount - summary.systemsCompleteCount),
      isComplete:
        summary.layoutCount > 0 &&
        summary.presenceCompleteCount >= summary.layoutCount &&
        summary.systemsCompleteCount >= summary.layoutCount,
    }));
}

export function findNextGalaxyGenerationRing(ringSummaries = [], mode = "presence") {
  const pendingKey = mode === "systems" ? "systemsPendingCount" : "presencePendingCount";
  return (
    (Array.isArray(ringSummaries) ? ringSummaries : []).find((summary) => Number(summary?.[pendingKey]) > 0) || null
  );
}

export function buildGalaxyGenerationGuidance({ tiles = [] } = {}) {
  const ringSummaries = summarizeGalaxyGenerationRings(tiles);
  const nextPresenceRing = findNextGalaxyGenerationRing(ringSummaries, "presence");
  const nextSystemsRing = findNextGalaxyGenerationRing(ringSummaries, "systems");
  const completedRingCount = ringSummaries.filter((summary) => summary.isComplete).length;

  const recommendation = {
    title: "No layout available",
    body: "Generate or load a galaxy layout to start guided ring progression.",
    mode: null,
    ring: null,
  };

  if (ringSummaries.length) {
    recommendation.title = "Survey footprint complete";
    recommendation.body = "All mapped rings currently have persisted presence and typed system coverage.";
  }

  if (nextSystemsRing && (!nextPresenceRing || nextSystemsRing.ring < nextPresenceRing.ring)) {
    recommendation.title = `Resume ring ${nextSystemsRing.ring} systems`;
    recommendation.body =
      `Ring ${nextSystemsRing.ring} already has persisted survey coverage, but ` +
      `${nextSystemsRing.systemsPendingCount.toLocaleString()} sector${nextSystemsRing.systemsPendingCount === 1 ? " is" : "s are"} still missing typed system output.`;
    recommendation.mode = "systems";
    recommendation.ring = nextSystemsRing.ring;
  } else if (nextPresenceRing) {
    recommendation.title = `Survey ring ${nextPresenceRing.ring} next`;
    recommendation.body = `Ring ${nextPresenceRing.ring} still has ${nextPresenceRing.presencePendingCount.toLocaleString()} sector${nextPresenceRing.presencePendingCount === 1 ? "" : "s"} without persisted survey presence.`;
    recommendation.mode = "presence";
    recommendation.ring = nextPresenceRing.ring;
  } else if (nextSystemsRing) {
    recommendation.title = `Finish ring ${nextSystemsRing.ring} systems`;
    recommendation.body = `Ring ${nextSystemsRing.ring} has survey coverage, but ${nextSystemsRing.systemsPendingCount.toLocaleString()} sector${nextSystemsRing.systemsPendingCount === 1 ? " is" : "s are"} still missing typed systems.`;
    recommendation.mode = "systems";
    recommendation.ring = nextSystemsRing.ring;
  }

  return {
    ringSummaries,
    nextPresenceRing,
    nextSystemsRing,
    completedRingCount,
    totalRingCount: ringSummaries.length,
    recommendation,
  };
}
