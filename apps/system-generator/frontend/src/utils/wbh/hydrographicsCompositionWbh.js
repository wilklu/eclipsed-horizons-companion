export function generateHydrographicsCompositionDetailed({
  hydrographics = 0,
  hydrographicsPercent = null,
  avgTempC = null,
  atmosphereCode = null,
  surfaceDistribution = null,
  isGasGiant = false,
} = {}) {
  const code = Number(hydrographics) || 0;

  const provenance = {
    generatedBy: "wbh-hydrographics-composition",
    hydrographics: code,
    provided: { hydrographicsPercent: hydrographicsPercent ?? null, avgTempC: avgTempC ?? null, atmosphereCode },
    timestamp: Date.now(),
  };

  const HYDROGRAPHICS_RANGE = {
    0: { min: 0, max: 5 },
    1: { min: 6, max: 15 },
    2: { min: 16, max: 25 },
    3: { min: 26, max: 35 },
    4: { min: 36, max: 45 },
    5: { min: 46, max: 55 },
    6: { min: 56, max: 65 },
    7: { min: 66, max: 75 },
    8: { min: 76, max: 85 },
    9: { min: 86, max: 95 },
    10: { min: 96, max: 100 },
  };

  const SURFACE_DISTRIBUTION = [
    "Extremely Dispersed",
    "Very Dispersed",
    "Dispersed",
    "Scattered",
    "Slightly Scattered",
    "Mixed",
    "Slightly Skewed",
    "Skewed",
    "Concentrated",
    "Very Concentrated",
    "Extremely Concentrated",
  ];

  const result = {
    code,
    description: "",
    waterFraction: 0,
    oceanFraction: 0,
    landFraction: 1,
    iceFraction: 0,
    salinity: "saline",
    surfaceDistribution: SURFACE_DISTRIBUTION[code] || null,
    provenance,
  };

  if (code === 0 || isGasGiant) {
    result.description = isGasGiant ? "Gas giant (no surface liquids)" : "None";
    result.waterFraction = 0;
    result.oceanFraction = 0;
    result.landFraction = 1;
    return result;
  }

  const range = HYDROGRAPHICS_RANGE[code] || { min: 0, max: 100 };
  const mid = Math.round((range.min + range.max) / 2);
  // Prefer an explicit percent when provided, otherwise use the table midpoint
  const waterFrac = clamp(
    Number.isFinite(Number(hydrographicsPercent)) && hydrographicsPercent !== null
      ? Number(hydrographicsPercent) / 100
      : mid / 100,
    0,
    1,
  );

  // Ocean vs inland water heuristic: higher hydrographics -> larger ocean share
  // Tuned: more aggressive ocean share for wetter worlds
  const oceanShare = clamp(0.4 + code * 0.06, 0.4, 0.95);
  const oceanFraction = clamp(waterFrac * oceanShare, 0, 1);

  // Ice fraction: scale with coldness and ocean fraction. At mild sub-zero temps only a rim freezes;
  // at very low temps most of the ocean can be ice.
  let iceFraction = 0;
  if (avgTempC != null && Number.isFinite(Number(avgTempC)) && avgTempC <= 0) {
    const coldScale = clamp(Math.min(1, Math.abs(avgTempC) / 40), 0, 1); // -40C -> 1.0
    iceFraction = clamp(oceanFraction * coldScale, 0, oceanFraction);
  }

  result.waterFraction = Number(waterFrac.toFixed(3));
  result.oceanFraction = Number(oceanFraction.toFixed(3));
  result.landFraction = Number(Math.max(0, 1 - result.waterFraction).toFixed(3));
  result.iceFraction = Number(iceFraction.toFixed(3));

  // Salinity heuristic: lots of ice -> fresher surface; very low water -> brackish; otherwise saline
  if (result.waterFraction <= 0.05) {
    result.salinity = "brackish";
  } else if (result.iceFraction >= 0.5) {
    result.salinity = "fresh";
  } else if (result.oceanFraction >= 0.7) {
    result.salinity = "saline";
  } else {
    result.salinity = "brackish";
  }

  result.description = `${Math.round(result.waterFraction * 100)}% surface water (${result.surfaceDistribution})`;

  return result;
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

export function generateHydrographicsComposition(opts = {}) {
  const detailed = generateHydrographicsCompositionDetailed(opts);
  return detailed && detailed.description ? detailed.description : String(detailed?.code ?? "Unusual");
}

export default generateHydrographicsComposition;
