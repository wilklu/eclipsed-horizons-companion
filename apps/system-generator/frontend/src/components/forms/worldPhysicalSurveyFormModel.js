function createEmptySubordinateRow() {
  return {
    name: "",
    sah_uwp: "",
    orbitPD: null,
    orbitKm: null,
    eccentricity: null,
    diameter: null,
    density: null,
    mass: null,
    periodHours: null,
    sizeAngle: null,
    notes: "",
  };
}

export function createEmptySurveyData() {
  const today = new Date().toISOString().split("T")[0];
  return {
    worldName: "",
    sah_uwp: "",
    sectorLocation: "",
    initialSurvey: today,
    lastUpdated: today,
    primaryObjects: "",
    systemAge: null,
    travelZone: "",
    orbit: { number: null, au: null, eccentricity: null, period: "", notes: "" },
    size: {
      diameter: null,
      composition: "",
      density: null,
      gravity: null,
      mass: null,
      escapeVelocity: null,
      notes: "",
    },
    atmosphere: { pressure: null, composition: "", o2Partial: null, taints: "", scaleHeight: null, notes: "" },
    hydrographics: {
      coverage: null,
      composition: "",
      distribution: "",
      majorBodies: "",
      minorBodies: "",
      other: "",
      notes: "",
    },
    rotation: {
      sidereal: null,
      solar: null,
      solarDaysPerYear: null,
      axialTilt: null,
      tidalLock: "no",
      tides: "",
      notes: "",
    },
    temperature: {
      high: null,
      mean: null,
      low: null,
      luminosity: null,
      albedo: null,
      greenhouse: "",
      seismicStress: "",
      residualStress: "",
      tidalStress: "",
      tidalHeating: "",
      majorTectonicPlates: null,
      notes: "",
    },
    life: { biomass: "", biocomplexity: "", sophonts: "none", biodiversity: "", compatibility: "", notes: "" },
    resources: { rating: "", notes: "" },
    habitability: { rating: "", notes: "" },
    subordinates: Array.from({ length: 5 }, () => createEmptySubordinateRow()),
    comments: "",
  };
}

function formatSectorLocation(systemRecord) {
  if (!systemRecord || typeof systemRecord !== "object") return "";
  if (String(systemRecord?.sectorHex || "").trim()) return String(systemRecord.sectorHex).trim();
  const x = String(systemRecord?.hexCoordinates?.x ?? "").padStart(2, "0");
  const y = String(systemRecord?.hexCoordinates?.y ?? "").padStart(2, "0");
  return [String(systemRecord?.sectorId || "").trim(), `${x}${y}`.trim()].filter(Boolean).join(" ");
}

function normalizeResourceRatingForSurvey(value) {
  switch (
    String(value || "")
      .trim()
      .toLowerCase()
  ) {
    case "abundant":
    case "good":
    case "moderate":
    case "sparse":
    case "none":
      return String(value).trim().toLowerCase();
    default:
      return "";
  }
}

function normalizeHabitabilityForSurvey(value) {
  switch (
    String(value || "")
      .trim()
      .toLowerCase()
  ) {
    case "excellent":
    case "good":
    case "marginal":
    case "poor":
    case "hostile":
      return String(value).trim().toLowerCase();
    default:
      return "";
  }
}

function titleCase(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "";
}

function formatSurfaceTides(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  if (numericValue <= 0) return "Minimal";
  return `${numericValue.toFixed(3).replace(/\.0+$|(?<=\.[0-9]*[1-9])0+$/g, "")} m`;
}

function formatTidalLockPressureNote(value) {
  if (!value || typeof value !== "object") return "";
  const risk = titleCase(value.risk);
  const dm = Number.isFinite(Number(value.dm)) ? Number(value.dm) : null;
  return [risk ? `Tidal lock pressure ${risk}` : "", dm !== null ? `DM ${dm}` : ""].filter(Boolean).join(" · ");
}

function formatGreenhouseLabel(runawayGreenhouse, greenhouseAtmosphereCode) {
  if (runawayGreenhouse === true) {
    return greenhouseAtmosphereCode !== null && greenhouseAtmosphereCode !== undefined
      ? `Runaway (Atm ${greenhouseAtmosphereCode})`
      : "Runaway";
  }
  if (runawayGreenhouse === false) return "No";
  return "";
}

function joinSurveyNotes(parts = []) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" · ");
}

function buildLifeSurvey(nativeLifeform, nativeSophontLife) {
  const digits = String(nativeLifeform || "").trim();
  return {
    biomass: digits.charAt(0) || "",
    biocomplexity: digits.charAt(1) || "",
    biodiversity: digits.charAt(2) || "",
    compatibility: digits.charAt(3) || "",
    sophonts: nativeSophontLife ? "native" : "none",
    notes: "",
  };
}

function buildSubordinates(worldRecord) {
  const moons = Array.isArray(worldRecord?.moonsData) ? worldRecord.moonsData : [];
  const significantMoons = moons.filter((moon) => moon?.type === "significant" && !moon?.ring);
  const rows = significantMoons.map((moon) => ({
    name: String(moon?.name || ""),
    sah_uwp: String(moon?.worldProfile?.uwp || ""),
    orbitPD: moon?.orbitalSlot ?? null,
    orbitKm: null,
    eccentricity: null,
    diameter: moon?.worldProfile?.diameterKm ?? null,
    density: moon?.worldProfile?.density ?? null,
    mass: moon?.worldProfile?.mass ?? null,
    periodHours: moon?.worldProfile?.dayLengthHours ?? null,
    sizeAngle: null,
    notes: String(moon?.description || ""),
  }));
  while (rows.length < 5) rows.push(createEmptySubordinateRow());
  return rows;
}

function parseNumericString(value) {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function extractDominantSurface(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "";
  const directMatch = normalized.match(/\b(ocean|land)\b/);
  return directMatch?.[1] || "";
}

function parseGreenhouseLabel(value, fallback = null) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) return fallback;
  if (normalized.includes("runaway")) return true;
  if (["no", "none", "weak"].includes(normalized)) return false;
  return fallback;
}

function parseGreenhouseAtmosphereCode(value, fallback = null) {
  const match = String(value || "").match(/atm\s*(\d+)/i);
  if (!match) return fallback;
  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toUwpHex(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "0";
  return Math.max(0, Math.trunc(numeric)).toString(36).toUpperCase();
}

function buildUninhabitedBaselineUwp(planet = {}) {
  return `X${toUwpHex(planet?.size)}${toUwpHex(planet?.atmosphereCode)}${toUwpHex(planet?.hydrographics)}000-0`;
}

function applyUninhabitedCensusBaseline(planet = {}) {
  return {
    ...planet,
    populationCode: 0,
    population: 0,
    governmentCode: 0,
    governmentDesc: "No Government",
    lawLevel: 0,
    lawDesc: "No Law",
    techLevel: 0,
    techDesc: "Primitive",
    starport: "X",
    starportDesc: "No starport",
    uwp: buildUninhabitedBaselineUwp(planet),
  };
}

function updateMoonData(existingMoons = [], subordinates = []) {
  let subordinateIndex = 0;
  return (Array.isArray(existingMoons) ? existingMoons : []).map((moon) => {
    if (moon?.type !== "significant" || moon?.ring) {
      return moon;
    }

    const subordinate = subordinates[subordinateIndex] ?? null;
    subordinateIndex += 1;
    if (!subordinate) {
      return moon;
    }

    return {
      ...moon,
      name: String(subordinate.name || moon.name || "").trim() || moon.name,
      worldProfile:
        moon?.worldProfile && typeof moon.worldProfile === "object"
          ? {
              ...moon.worldProfile,
              ...(subordinate.sah_uwp ? { uwp: subordinate.sah_uwp } : {}),
              ...(subordinate.diameter !== null ? { diameterKm: subordinate.diameter } : {}),
              ...(subordinate.density !== null ? { density: subordinate.density } : {}),
              ...(subordinate.mass !== null ? { mass: subordinate.mass } : {}),
            }
          : moon?.worldProfile,
    };
  });
}

export function buildSurveyDataFromWorld(systemRecord, worldRecord) {
  const base = createEmptySurveyData();
  if (!worldRecord || typeof worldRecord !== "object") return base;

  const physicalSurvey =
    worldRecord?.physicalSurvey && typeof worldRecord.physicalSurvey === "object" ? worldRecord.physicalSurvey : null;
  if (physicalSurvey) {
    return {
      ...base,
      ...physicalSurvey,
      orbit: { ...base.orbit, ...(physicalSurvey.orbit || {}) },
      size: { ...base.size, ...(physicalSurvey.size || {}) },
      atmosphere: { ...base.atmosphere, ...(physicalSurvey.atmosphere || {}) },
      hydrographics: { ...base.hydrographics, ...(physicalSurvey.hydrographics || {}) },
      rotation: { ...base.rotation, ...(physicalSurvey.rotation || {}) },
      temperature: { ...base.temperature, ...(physicalSurvey.temperature || {}) },
      life: { ...base.life, ...(physicalSurvey.life || {}) },
      resources: { ...base.resources, ...(physicalSurvey.resources || {}) },
      habitability: { ...base.habitability, ...(physicalSurvey.habitability || {}) },
      subordinates:
        Array.isArray(physicalSurvey.subordinates) && physicalSurvey.subordinates.length
          ? physicalSurvey.subordinates.map((row) => ({ ...createEmptySubordinateRow(), ...row }))
          : base.subordinates,
    };
  }

  const meanTemperatureK = Number.isFinite(Number(worldRecord?.avgTempC))
    ? Number(worldRecord.avgTempC) + 273.15
    : null;
  const orbitalPeriodDays = Number(worldRecord?.orbitalPeriodDays ?? 0) || null;
  const dayLengthHours = Number(worldRecord?.dayLengthHours ?? 0) || null;
  const solarDaysPerYear =
    orbitalPeriodDays && dayLengthHours ? Number((orbitalPeriodDays * 24) / dayLengthHours).toFixed(2) : null;
  const seismology =
    worldRecord?.seismology && typeof worldRecord.seismology === "object" ? worldRecord.seismology : {};
  const stars = Array.isArray(systemRecord?.stars) ? systemRecord.stars : [];
  const hydrographicsPercent =
    worldRecord?.hydrographicsPercent ??
    (Number.isFinite(Number(worldRecord?.hydrographics)) ? Number(worldRecord.hydrographics) * 10 : null);
  const surfaceDistributionSummary = String(worldRecord?.surfaceDistributionSummary || "");
  const dominantSurfaceLabel = titleCase(worldRecord?.dominantSurface);
  const tidalLockPressureNote = formatTidalLockPressureNote(worldRecord?.tidalLockPressure);

  return {
    ...base,
    worldName: String(worldRecord?.name || ""),
    sah_uwp: String(worldRecord?.uwp || worldRecord?.sah_uwp || ""),
    sectorLocation: formatSectorLocation(systemRecord),
    primaryObjects: stars
      .map((star) => String(star?.designation || star?.spectralClass || "").trim())
      .filter(Boolean)
      .join(", "),
    systemAge: Number(systemRecord?.stars?.[0]?.systemAge ?? systemRecord?.systemAge ?? 0) || null,
    travelZone: String(systemRecord?.travelZone || ""),
    orbit: {
      number: worldRecord?.orbitNumber ?? null,
      au: worldRecord?.orbitAU ?? worldRecord?.orbitAu ?? null,
      eccentricity: worldRecord?.eccentricity ?? null,
      period: orbitalPeriodDays ? `${orbitalPeriodDays} days` : "",
      notes: String(worldRecord?.orbitGroup || worldRecord?.zone || ""),
    },
    size: {
      diameter: worldRecord?.diameterKm ?? null,
      composition: String(worldRecord?.composition || ""),
      density: worldRecord?.density ?? null,
      gravity: worldRecord?.gravity ?? null,
      mass: worldRecord?.mass ?? null,
      escapeVelocity: Number(worldRecord?.escapeVelocityMps ?? 0) ? Number(worldRecord.escapeVelocityMps) / 1000 : null,
      notes: String(worldRecord?.sizeProfile || ""),
    },
    atmosphere: {
      pressure: worldRecord?.atmospherePressureBar ?? null,
      composition: String(worldRecord?.atmosphereComposition || worldRecord?.atmosphereDesc || ""),
      o2Partial: worldRecord?.oxygenPartialPressureBar ?? null,
      taints:
        String(worldRecord?.atmosphereTaintProfile || "") ||
        (String(worldRecord?.atmosphereDesc || "").includes("Tainted") ? "Tainted" : ""),
      scaleHeight: worldRecord?.atmosphereScaleHeightKm ?? null,
      notes: [
        `Code ${String(worldRecord?.atmosphereCode ?? "")}`.trim(),
        worldRecord?.atmosphereSurvivalGear ? `Gear ${worldRecord.atmosphereSurvivalGear}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    },
    hydrographics: {
      coverage: hydrographicsPercent,
      composition: String(
        worldRecord?.hydrosphereLiquid ||
          (Number(worldRecord?.hydrographics ?? 0) > 0 ? "Water-based surface volatiles" : "Dry world"),
      ),
      distribution: String(
        worldRecord?.surfaceDistribution ||
          (String(worldRecord?.hydrographics ?? 0) > "0"
            ? "Survey-derived global distribution"
            : "Minimal free-standing liquids"),
      ),
      majorBodies: surfaceDistributionSummary,
      minorBodies: "",
      other: dominantSurfaceLabel ? `Dominant surface: ${dominantSurfaceLabel}` : "",
      notes: String(worldRecord?.hydrosphereDescription || ""),
    },
    rotation: {
      sidereal: dayLengthHours,
      solar: dayLengthHours,
      solarDaysPerYear,
      axialTilt: worldRecord?.axialTilt ?? null,
      tidalLock: Number(dayLengthHours) >= Number(orbitalPeriodDays) * 24 && orbitalPeriodDays ? "yes" : "no",
      tides:
        formatSurfaceTides(worldRecord?.surfaceTidalEffectMeters) ||
        (Number(seismology?.tidalStressFactor ?? 0) > 0 ? "Present" : "Minimal"),
      notes: tidalLockPressureNote,
    },
    temperature: {
      high: null,
      mean: meanTemperatureK ? Number(meanTemperatureK.toFixed(1)) : null,
      low: null,
      luminosity: stars.reduce((sum, star) => sum + Number(star?.luminosity || 0), 0) || null,
      albedo: null,
      greenhouse: formatGreenhouseLabel(worldRecord?.runawayGreenhouse, worldRecord?.greenhouseAtmosphereCode),
      seismicStress: String(seismology?.totalSeismicStress ?? ""),
      residualStress: String(seismology?.residualSeismicStress ?? ""),
      tidalStress: String(seismology?.tidalStressFactor ?? ""),
      tidalHeating: String(seismology?.tidalHeatingFactor ?? ""),
      majorTectonicPlates: worldRecord?.majorTectonicPlates ?? seismology?.majorTectonicPlates ?? null,
      notes: joinSurveyNotes([
        worldRecord?.tempCategory ? `${worldRecord.tempCategory} climate regime` : "",
        tidalLockPressureNote,
      ]),
    },
    life: buildLifeSurvey(worldRecord?.nativeLifeform, worldRecord?.nativeSophontLife),
    resources: { rating: normalizeResourceRatingForSurvey(worldRecord?.resourceRating), notes: "" },
    habitability: { rating: normalizeHabitabilityForSurvey(worldRecord?.habitability), notes: "" },
    subordinates: buildSubordinates(worldRecord),
    comments: Array.isArray(worldRecord?.remarks) ? worldRecord.remarks.join(", ") : "",
  };
}

export function buildUpdatedPlanetFromSurvey(currentPlanet, surveyPayload) {
  const payload = surveyPayload && typeof surveyPayload === "object" ? surveyPayload : createEmptySurveyData();
  const planet = currentPlanet && typeof currentPlanet === "object" ? currentPlanet : {};
  const parsedSurfaceTides = parseNumericString(String(payload?.rotation?.tides || "").replace(/[^0-9.+-]/g, ""));
  const dominantSurface = extractDominantSurface(payload?.hydrographics?.other || planet?.dominantSurface);
  const sophontAssessment = String(payload?.life?.sophonts || "")
    .trim()
    .toLowerCase();
  const resolvedNativeSophontLife =
    sophontAssessment === "native" || sophontAssessment === "mixed"
      ? true
      : sophontAssessment === "none"
        ? false
        : planet.nativeSophontLife;

  const updatedPlanet = {
    ...planet,
    name: String(payload.worldName || planet.name || "").trim() || planet.name,
    uwp: String(payload.sah_uwp || planet.uwp || "").trim() || planet.uwp,
    diameterKm: payload?.size?.diameter ?? planet.diameterKm,
    composition: String(payload?.size?.composition || planet.composition || ""),
    density: payload?.size?.density ?? planet.density,
    gravity: payload?.size?.gravity ?? planet.gravity,
    mass: payload?.size?.mass ?? planet.mass,
    escapeVelocityMps:
      payload?.size?.escapeVelocity !== null && payload?.size?.escapeVelocity !== undefined
        ? Number(payload.size.escapeVelocity) * 1000
        : planet.escapeVelocityMps,
    orbitalPeriodDays: parseNumericString(payload?.orbit?.period) ?? planet.orbitalPeriodDays,
    dayLengthHours: payload?.rotation?.sidereal ?? planet.dayLengthHours,
    axialTilt: payload?.rotation?.axialTilt ?? planet.axialTilt,
    avgTempC:
      payload?.temperature?.mean !== null && payload?.temperature?.mean !== undefined
        ? Number(payload.temperature.mean) - 273.15
        : planet.avgTempC,
    hydrographicsPercent: payload?.hydrographics?.coverage ?? planet.hydrographicsPercent,
    hydrosphereLiquid: String(payload?.hydrographics?.composition || planet.hydrosphereLiquid || ""),
    hydrosphereDescription: String(payload?.hydrographics?.notes || planet.hydrosphereDescription || ""),
    surfaceDistribution: String(payload?.hydrographics?.distribution || planet.surfaceDistribution || ""),
    surfaceDistributionSummary: String(payload?.hydrographics?.majorBodies || planet.surfaceDistributionSummary || ""),
    dominantSurface: dominantSurface || planet.dominantSurface,
    runawayGreenhouse: parseGreenhouseLabel(payload?.temperature?.greenhouse, planet.runawayGreenhouse),
    greenhouseAtmosphereCode: parseGreenhouseAtmosphereCode(
      payload?.temperature?.greenhouse,
      planet.greenhouseAtmosphereCode,
    ),
    surfaceTidalEffectMeters: parsedSurfaceTides ?? planet.surfaceTidalEffectMeters,
    majorTectonicPlates: payload?.temperature?.majorTectonicPlates ?? planet.majorTectonicPlates,
    resourceRating: titleCase(payload?.resources?.rating) || planet.resourceRating,
    habitability: titleCase(payload?.habitability?.rating) || planet.habitability,
    nativeSophontLife: resolvedNativeSophontLife,
    nativeLifeform:
      `${payload?.life?.biomass || ""}${payload?.life?.biocomplexity || ""}${payload?.life?.biodiversity || ""}${payload?.life?.compatibility || ""}`.replace(
        /\s+/g,
        "",
      ) || planet.nativeLifeform,
    seismology: {
      ...(planet?.seismology && typeof planet.seismology === "object" ? planet.seismology : {}),
      residualSeismicStress:
        parseNumericString(payload?.temperature?.residualStress) ?? planet?.seismology?.residualSeismicStress,
      tidalStressFactor: parseNumericString(payload?.temperature?.tidalStress) ?? planet?.seismology?.tidalStressFactor,
      tidalHeatingFactor:
        parseNumericString(payload?.temperature?.tidalHeating) ?? planet?.seismology?.tidalHeatingFactor,
      totalSeismicStress:
        parseNumericString(payload?.temperature?.seismicStress) ?? planet?.seismology?.totalSeismicStress,
      majorTectonicPlates: payload?.temperature?.majorTectonicPlates ?? planet?.seismology?.majorTectonicPlates,
    },
    moonsData: updateMoonData(planet?.moonsData, payload?.subordinates),
    physicalSurvey: payload,
  };

  return resolvedNativeSophontLife === false ? applyUninhabitedCensusBaseline(updatedPlanet) : updatedPlanet;
}
