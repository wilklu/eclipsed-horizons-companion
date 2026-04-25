export function generateAtmosphereCompositionDetailed({
  atmosphereCode = 0,
  oxygenFraction = null,
  oxygenPartialPressureBar = null,
  avgTempC = null,
  hydrographics = 0,
  atmosphereTaints = [],
  isGasGiant = false,
  gasGiantProfile = null,
} = {}) {
  const code = Number(atmosphereCode);
  const taintLabels = Array.isArray(atmosphereTaints)
    ? atmosphereTaints.map((t) => (t && t.label ? t.label : String(t || "")).trim()).filter(Boolean)
    : [];

  const addTaintsToDesc = (desc) =>
    taintLabels.length ? `${desc} with ${taintLabels.join(", ").toLowerCase()}` : desc;

  const provenance = {
    generatedBy: "wbh-atmosphere-composition",
    atmosphereCode: code,
    provided: {
      oxygenFraction: oxygenFraction ?? null,
      oxygenPartialPressureBar: oxygenPartialPressureBar ?? null,
      avgTempC: avgTempC ?? null,
      hydrographics: hydrographics ?? 0,
      isGasGiant: Boolean(isGasGiant),
    },
    timestamp: Date.now(),
  };

  // Default structured object
  const result = {
    code,
    description: "",
    dominantGas: null,
    gases: [],
    taints: taintLabels,
    provenance,
  };

  if (code === 0) {
    result.description = "None";
    return result;
  }

  // Standard nitrogen/oxygen mixes
  if ([6, 7, 8, 9].includes(code)) {
    const o = Number.isFinite(Number(oxygenFraction)) ? Number(oxygenFraction) : 0.21;
    const n = Math.max(0, 1 - o - 0.009);
    result.gases = [
      { gas: "N₂", fraction: Number(n.toFixed(3)) },
      { gas: "O₂", fraction: Number(o.toFixed(3)) },
      { gas: "Ar", fraction: 0.009 },
    ];
    result.dominantGas = "N₂";
    result.description = addTaintsToDesc(`${Math.round(o * 100)}% O₂ in a nitrogen-dominated atmosphere (N₂/O₂ mix)`);
    return result;
  }

  if (code === 1) {
    result.description = "Trace atmosphere with negligible gases";
    result.gases = [];
    return result;
  }

  if (code === 2 || code === 3 || code === 4 || code === 5) {
    result.description = addTaintsToDesc("Thin or very thin low-pressure atmosphere (trace volatiles)");
    result.gases = [
      { gas: "N₂", fraction: 0.8 },
      { gas: "CO₂", fraction: 0.15 },
    ];
    result.dominantGas = "N₂";
    return result;
  }

  // Exotic and corrosive types
  if (code === 10) {
    result.gases = [
      { gas: "HCl", fraction: 0.6 },
      { gas: "Cl₂", fraction: 0.2 },
      { gas: "N₂", fraction: 0.2 },
    ];
    result.dominantGas = "HCl";
    result.description = addTaintsToDesc("Hydrogen chloride and chlorine-rich atmosphere");
    return result;
  }

  if (code === 11) {
    result.gases = [
      { gas: "CO₂", fraction: 0.85 },
      { gas: "SO₂", fraction: 0.08 },
      { gas: "N₂", fraction: 0.07 },
    ];
    result.dominantGas = "CO₂";
    result.description = addTaintsToDesc("Dense carbon dioxide atmosphere with sulfur clouds");
    return result;
  }

  if (code === 12) {
    result.gases = [
      { gas: "Reactive Halogens", fraction: 0.6 },
      { gas: "N₂", fraction: 0.4 },
    ];
    result.dominantGas = "Reactive Halogens";
    result.description = addTaintsToDesc("Insidious mix of reactive halogens and volatile oxides");
    return result;
  }

  if (code === 13) {
    result.gases = [
      { gas: "CO₂", fraction: 0.6 },
      { gas: "N₂", fraction: 0.3 },
      { gas: "Other", fraction: 0.1 },
    ];
    result.dominantGas = "CO₂";
    result.description = addTaintsToDesc("Very dense, high-pressure carbon-dioxide/nitrogen envelope");
    return result;
  }

  if (code === 14) {
    result.description = addTaintsToDesc("Low-pressure atmosphere, cold and thin");
    result.gases = [
      { gas: "N₂", fraction: 0.95 },
      { gas: "CO₂", fraction: 0.05 },
    ];
    result.dominantGas = "N₂";
    return result;
  }

  if (code === 15) {
    result.description = addTaintsToDesc("Unusual composition (metal vapour or noble-gas dominated)");
    result.gases = [{ gas: "Unknown", fraction: 1 }];
    result.dominantGas = "Unknown";
    return result;
  }

  if (code === 16 || code === 17) {
    // Gas giant envelopes
    const h = code === 17 ? "H₂" : "He";
    result.description = addTaintsToDesc(`${h}-dominated gas envelope (gas-giant)`);
    result.gases = [
      { gas: h, fraction: 0.9 },
      { gas: "He", fraction: 0.09 },
      { gas: "Other", fraction: 0.01 },
    ];
    result.dominantGas = h;
    return result;
  }

  // Fallback
  result.description = addTaintsToDesc("Unusual or mixed atmosphere composition");
  result.gases = [{ gas: "Mixed", fraction: 1 }];
  result.dominantGas = "Mixed";
  return result;
}

export function generateAtmosphereComposition(opts = {}) {
  const detailed = generateAtmosphereCompositionDetailed(opts);
  return detailed && detailed.description ? detailed.description : String(detailed?.code ?? "Unusual");
}

export default generateAtmosphereComposition;
