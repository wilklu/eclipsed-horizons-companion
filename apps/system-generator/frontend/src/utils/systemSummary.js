const STARPORT_LABELS = Object.freeze({
  A: "Excellent",
  B: "Good",
  C: "Routine",
  D: "Poor",
  E: "Frontier",
  X: "No starport",
});

function firstNonEmptyString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function firstNonEmptyHexSummary(...values) {
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (normalized) {
      return normalized;
    }
  }
  return "";
}

function normalizeTradeCodes(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(/[\s,;/]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isTruthySurveyValue(value) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  return Boolean(text) && !["none", "no", "false", "0", "n", "na", "n/a"].includes(text);
}

function splitSurveyList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(/[;,/|]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractStarportCode(...sources) {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string") {
      const code = source.trim().charAt(0).toUpperCase();
      if (/^[A-EX]$/.test(code)) {
        return code;
      }
      continue;
    }
    if (typeof source === "object") {
      const code = String(source.class ?? source.code ?? "")
        .trim()
        .charAt(0)
        .toUpperCase();
      if (/^[A-EX]$/.test(code)) {
        return code;
      }
    }
  }
  return "";
}

function extractBaseSummary(...sources) {
  const bases = [];
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      bases.push(...source.map((entry) => String(entry ?? "").trim()).filter(Boolean));
      continue;
    }
    if (typeof source === "string") {
      bases.push(...splitSurveyList(source));
      continue;
    }
    if (typeof source === "object") {
      if (isTruthySurveyValue(source.navy)) bases.push("Navy");
      if (isTruthySurveyValue(source.scout)) bases.push("Scout");
      if (isTruthySurveyValue(source.military)) bases.push("Military");
      if (isTruthySurveyValue(source.corsair)) bases.push("Corsair");
      if (isTruthySurveyValue(source.pirate)) bases.push("Pirate");
      if (isTruthySurveyValue(source.research)) bases.push("Research");
      if (isTruthySurveyValue(source.highport)) bases.push("Highport");
      if (isTruthySurveyValue(source.other)) bases.push(...splitSurveyList(source.other));
      if (Array.isArray(source.bases)) bases.push(...source.bases.map((entry) => String(entry ?? "").trim()));
    }
  }
  return Array.from(new Set(bases.filter(Boolean)));
}

function inferStarportCode(uwp) {
  const code = String(uwp ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return /^[A-EX]$/.test(code) ? code : "";
}

function formatStarport(code) {
  const normalized = String(code ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  if (!normalized) return "—";
  return STARPORT_LABELS[normalized] ? `${normalized} — ${STARPORT_LABELS[normalized]}` : normalized;
}

function countGasGiantsFromBodies(bodies) {
  if (!Array.isArray(bodies)) return null;
  const matches = bodies.filter((body) => {
    const type = String(body?.type ?? body?.designation ?? "").toLowerCase();
    return type.includes("gas giant") || type === "gg";
  }).length;
  return matches > 0 ? matches : null;
}

function isGasGiantLifeCandidate(record = {}) {
  const type = String(record?.type ?? record?.worldType ?? "")
    .trim()
    .toLowerCase();
  return !Boolean(record?.isMoon) && (type === "gas giant" || (type.includes("gas giant") && !type.includes("moon")));
}

function isPlanetoidBeltLifeCandidate(record = {}) {
  const type = String(record?.type ?? record?.worldType ?? "")
    .trim()
    .toLowerCase();
  return !Boolean(record?.isMoon) && (type === "planetoid belt" || type === "asteroid belt" || type.includes("belt"));
}

function isUwpRestrictedWorld(record = {}) {
  return isGasGiantLifeCandidate(record) || isPlanetoidBeltLifeCandidate(record);
}

function hasNativeSophontIndicator(record = {}) {
  if (
    !record ||
    typeof record !== "object" ||
    isGasGiantLifeCandidate(record) ||
    isPlanetoidBeltLifeCandidate(record)
  ) {
    return false;
  }

  if (record.nativeSophontLife === true) {
    return true;
  }

  const nativeSophontStatus = firstNonEmptyString(record.nativeSophontStatus, record.sophontStatus)
    .trim()
    .toLowerCase();
  return ["exist", "exists", "extant", "present", "current"].includes(nativeSophontStatus);
}

function hasNativeLifeIndicator(record = {}) {
  if (
    !record ||
    typeof record !== "object" ||
    isGasGiantLifeCandidate(record) ||
    isPlanetoidBeltLifeCandidate(record)
  ) {
    return false;
  }

  if (hasNativeSophontIndicator(record)) {
    return true;
  }

  const nativeLifeform = firstNonEmptyString(record.nativeLifeform, record.nativeLife, record.lifeform)
    .trim()
    .toUpperCase();
  return Boolean(nativeLifeform) && !["0000", "NONE", "ABSENT", "N/A", "NULL", "UNINHABITED"].includes(nativeLifeform);
}

function extractNativeLifeSummary(system = {}, mainworld = null) {
  const rawCandidates = [
    mainworld,
    ...(Array.isArray(system?.planets) ? system.planets : []),
    ...(Array.isArray(system?.worlds) ? system.worlds : []),
  ].filter((entry) => entry && typeof entry === "object");
  const seenCandidates = new Set();
  const candidates = rawCandidates.filter((entry, index) => {
    const candidateKey = [
      firstNonEmptyString(entry?.name, entry?.designation, `candidate-${index}`),
      firstNonEmptyString(entry?.type, entry?.worldType),
      firstNonEmptyString(entry?.parentWorldName),
      String(entry?.orbitAU ?? entry?.orbitAu ?? ""),
      firstNonEmptyString(entry?.uwp),
    ]
      .map((part) =>
        String(part || "")
          .trim()
          .toUpperCase(),
      )
      .join("|");

    if (seenCandidates.has(candidateKey)) {
      return false;
    }
    seenCandidates.add(candidateKey);
    return true;
  });
  const nativeLifeWorlds = candidates.filter((entry) => hasNativeLifeIndicator(entry));
  const nativeSophontWorlds = candidates.filter((entry) => hasNativeSophontIndicator(entry));

  if (nativeLifeWorlds.length > 0) {
    return {
      nativeSophontLife: nativeSophontWorlds.length > 0,
      nativeLifeform: firstNonEmptyString(nativeLifeWorlds[0]?.nativeLifeform, nativeLifeWorlds[0]?.nativeLife),
      nativeLifeWorldCount: nativeLifeWorlds.length,
      nativeSophontWorldCount: nativeSophontWorlds.length,
    };
  }

  const explicitSystemSophonts = hasNativeSophontIndicator(system);
  return {
    nativeSophontLife: explicitSystemSophonts,
    nativeLifeform: explicitSystemSophonts ? firstNonEmptyString(system?.nativeLifeform, system?.nativeLife) : "",
    nativeLifeWorldCount: explicitSystemSophonts ? 1 : 0,
    nativeSophontWorldCount: explicitSystemSophonts ? 1 : 0,
  };
}

function summarizeSecondaryWorldProfiles(...sources) {
  for (const source of sources) {
    const text = String(source ?? "").trim();
    if (text) {
      return text;
    }
  }

  return "";
}

export function summarizeSystemRecord(system) {
  if (!system) {
    return {
      hasSavedSystem: false,
      systemName: "",
      uwp: "—",
      starport: "—",
      bases: [],
      gasGiants: "—",
      importance: "—",
      travelZone: "—",
      minimumSustainableTechLevel: "—",
      populationConcentration: "—",
      urbanization: "—",
      majorCities: "—",
      governmentProfile: "—",
      justiceProfile: "—",
      lawProfile: "—",
      appealProfile: "—",
      privateLawProfile: "—",
      personalRightsProfile: "—",
      secondaryProfiles: "—",
      factionsProfile: "—",
      tradeCodes: [],
      surveyStatus: "Stellar data only",
    };
  }

  const profiles = system?.profiles ?? {};
  const metadata = system?.metadata ?? {};
  const worlds = Array.isArray(system?.worlds) ? system.worlds : [];
  const planets = Array.isArray(system?.planets) ? system.planets : [];
  const mainworld =
    system?.mainworld ??
    system?.world ??
    metadata?.mainworld ??
    worlds.find((world) => firstNonEmptyString(world?.uwp, world?.starport, world?.name));

  const mainworldTypeRecord = {
    ...mainworld,
    type: firstNonEmptyString(mainworld?.type, system?.mainworldType),
  };
  const uwp = isUwpRestrictedWorld(mainworldTypeRecord)
    ? ""
    : firstNonEmptyString(system?.mainworldUwp, profiles?.mainworldUwp, mainworld?.uwp, mainworld?.sah_uwp);
  const starportCode = extractStarportCode(
    system?.starport,
    profiles?.starport,
    system?.starport?.class,
    profiles?.starport?.class,
    mainworld?.starport,
    mainworld?.starport?.class,
    inferStarportCode(uwp),
  );
  const bases = extractBaseSummary(
    system?.bases,
    system?.starport,
    profiles?.starport,
    system?.metadata?.bases,
    mainworld?.starport,
    mainworld?.bases,
  );
  const gasGiantCount =
    toFiniteNumber(system?.gasGiants) ??
    toFiniteNumber(system?.objectCounts?.gasGiants) ??
    toFiniteNumber(metadata?.gasGiants) ??
    countGasGiantsFromBodies(planets) ??
    countGasGiantsFromBodies(worlds);
  const importance = firstNonEmptyString(
    system?.importance,
    profiles?.importance,
    system?.economics?.importance,
    metadata?.importance,
    mainworld?.economics?.importance,
    mainworld?.importance,
  );
  const tradeCodes = normalizeTradeCodes(system?.tradeCodes || profiles?.tradeCodes || mainworld?.tradeCodes);
  const habitability = firstNonEmptyString(
    system?.habitability,
    profiles?.habitability,
    metadata?.habitability,
    mainworld?.economics?.habitability,
    mainworld?.habitability,
  );
  const resourceRating = firstNonEmptyString(
    system?.resourceRating,
    profiles?.resourceRating,
    metadata?.resourceRating,
    mainworld?.economics?.resourceRating,
    mainworld?.resourceRating,
  );
  const travelZone = firstNonEmptyString(
    system?.travelZone,
    profiles?.travelZone,
    mainworld?.travelZone,
    metadata?.travelZone,
  );
  const minimumSustainableTechLevel = firstNonEmptyString(
    system?.minimumSustainableTechLevel?.summary,
    profiles?.minimumSustainableTechLevel?.summary,
    metadata?.minimumSustainableTechLevel?.summary,
    mainworld?.minimumSustainableTechLevel?.summary,
  );
  const populationConcentration = firstNonEmptyString(
    system?.populationConcentration?.summary,
    profiles?.populationConcentration?.summary,
    metadata?.populationConcentration?.summary,
    mainworld?.populationConcentration?.summary,
  );
  const urbanization = firstNonEmptyString(
    system?.urbanization?.summary,
    profiles?.urbanization?.summary,
    metadata?.urbanization?.summary,
    mainworld?.urbanization?.summary,
  );
  const majorCities = firstNonEmptyString(
    system?.majorCities?.summary,
    profiles?.majorCities?.summary,
    metadata?.majorCities?.summary,
    mainworld?.majorCities?.summary,
  );
  const governmentProfile = firstNonEmptyString(
    system?.governmentProfile?.profileCode,
    profiles?.governmentProfile?.profileCode,
    metadata?.governmentProfile?.profileCode,
    mainworld?.governmentProfile?.profileCode,
    system?.governmentProfile?.summary,
    profiles?.governmentProfile?.summary,
    metadata?.governmentProfile?.summary,
    mainworld?.governmentProfile?.summary,
  );
  const justiceProfile = firstNonEmptyString(
    system?.justiceProfile?.summary,
    profiles?.justiceProfile?.summary,
    metadata?.justiceProfile?.summary,
    mainworld?.justiceProfile?.summary,
  );
  const lawProfile = firstNonEmptyString(
    system?.lawProfile?.summary,
    profiles?.lawProfile?.summary,
    metadata?.lawProfile?.summary,
    mainworld?.lawProfile?.summary,
  );
  const appealProfile = firstNonEmptyString(
    system?.appealProfile?.summary,
    profiles?.appealProfile?.summary,
    metadata?.appealProfile?.summary,
    mainworld?.appealProfile?.summary,
  );
  const privateLawProfile = firstNonEmptyString(
    system?.privateLawProfile?.summary,
    profiles?.privateLawProfile?.summary,
    metadata?.privateLawProfile?.summary,
    mainworld?.privateLawProfile?.summary,
  );
  const personalRightsProfile = firstNonEmptyString(
    system?.personalRightsProfile?.summary,
    profiles?.personalRightsProfile?.summary,
    metadata?.personalRightsProfile?.summary,
    mainworld?.personalRightsProfile?.summary,
  );
  const factionsProfile = firstNonEmptyString(
    system?.factionsProfile?.summary,
    profiles?.factionsProfile?.summary,
    metadata?.factionsProfile?.summary,
    mainworld?.factionsProfile?.summary,
  );
  const secondaryProfiles = summarizeSecondaryWorldProfiles(
    profiles?.secondaryProfiles,
    system?.secondaryProfiles,
    metadata?.secondaryProfiles,
  );
  const metadataSystemRecord =
    metadata?.systemRecord && typeof metadata.systemRecord === "object" ? metadata.systemRecord : {};
  const systemName = firstNonEmptyString(
    system?.name,
    system?.systemName,
    system?.systemDesignation,
    profiles?.systemDesignation,
    metadataSystemRecord?.name,
    metadata?.displayName,
    mainworld?.name,
  );

  let surveyStatus = "System record saved";
  if (uwp || tradeCodes.length || starportCode || travelZone || gasGiantCount !== null || bases.length || importance) {
    surveyStatus = "Survey summary available";
  } else if (Array.isArray(system?.stars) && system.stars.length) {
    surveyStatus = "Stellar layout saved";
  }

  return {
    hasSavedSystem: true,
    systemName,
    uwp: uwp || "—",
    starport: formatStarport(starportCode),
    bases,
    gasGiants: gasGiantCount === null ? "—" : String(gasGiantCount),
    importance: importance || "—",
    travelZone: travelZone || "—",
    minimumSustainableTechLevel: minimumSustainableTechLevel || "—",
    populationConcentration: populationConcentration || "—",
    urbanization: urbanization || "—",
    majorCities: majorCities || "—",
    governmentProfile: governmentProfile || "—",
    justiceProfile: justiceProfile || "—",
    lawProfile: lawProfile || "—",
    appealProfile: appealProfile || "—",
    privateLawProfile: privateLawProfile || "—",
    personalRightsProfile: personalRightsProfile || "—",
    secondaryProfiles: secondaryProfiles || "—",
    factionsProfile: factionsProfile || "—",
    mainworldName: firstNonEmptyString(mainworld?.name, metadata?.mainworld?.name) || "—",
    mainworldType: firstNonEmptyString(mainworld?.type, mainworld?.parentWorldName ? "Moon" : "") || "—",
    mainworldParent: firstNonEmptyString(mainworld?.parentWorldName, system?.mainworldParentWorldName) || "—",
    habitability: habitability || "—",
    resourceRating: resourceRating || "—",
    tradeCodes,
    surveyStatus,
  };
}

export function buildSystemSummaryLabel({ system = null, fallbackHex = "Unknown Hex", starLabel = "" } = {}) {
  const summary = summarizeSystemRecord(system);
  const systemName = firstNonEmptyString(summary?.systemName, system?.systemId, fallbackHex);
  const primaryLabel = firstNonEmptyString(
    starLabel,
    system?.primaryStar?.designation,
    system?.stars?.[0]?.designation,
    "Unknown primary",
  );

  return `${systemName} · ${primaryLabel}`;
}

export function buildSystemHexSummary(system = {}) {
  const mainworld = system?.mainworld && typeof system.mainworld === "object" ? system.mainworld : null;
  const nativeLifeSummary = extractNativeLifeSummary(system, mainworld);

  const mainworldTypeRecord = {
    ...mainworld,
    type: firstNonEmptyString(mainworld?.type, system?.mainworldType),
  };

  return {
    mainworldName: firstNonEmptyHexSummary(system?.mainworldName, mainworld?.name),
    mainworldUwp: isUwpRestrictedWorld(mainworldTypeRecord)
      ? ""
      : firstNonEmptyHexSummary(system?.mainworldUwp, mainworld?.uwp),
    habitability: firstNonEmptyHexSummary(
      system?.habitability,
      system?.metadata?.habitability,
      mainworld?.economics?.habitability,
      mainworld?.habitability,
    ),
    resourceRating: firstNonEmptyHexSummary(
      system?.resourceRating,
      system?.metadata?.resourceRating,
      mainworld?.economics?.resourceRating,
      mainworld?.resourceRating,
    ),
    minimumSustainableTechLevel: firstNonEmptyHexSummary(
      system?.minimumSustainableTechLevel?.summary,
      mainworld?.minimumSustainableTechLevel?.summary,
    ),
    populationConcentration: firstNonEmptyHexSummary(
      system?.populationConcentration?.summary,
      mainworld?.populationConcentration?.summary,
    ),
    urbanization: firstNonEmptyHexSummary(system?.urbanization?.summary, mainworld?.urbanization?.summary),
    majorCities: firstNonEmptyHexSummary(system?.majorCities?.summary, mainworld?.majorCities?.summary),
    governmentProfile: firstNonEmptyHexSummary(
      system?.governmentProfile?.profileCode,
      mainworld?.governmentProfile?.profileCode,
      system?.governmentProfile?.summary,
      mainworld?.governmentProfile?.summary,
    ),
    justiceProfile: firstNonEmptyHexSummary(system?.justiceProfile?.summary, mainworld?.justiceProfile?.summary),
    lawProfile: firstNonEmptyHexSummary(system?.lawProfile?.summary, mainworld?.lawProfile?.summary),
    appealProfile: firstNonEmptyHexSummary(system?.appealProfile?.summary, mainworld?.appealProfile?.summary),
    privateLawProfile: firstNonEmptyHexSummary(
      system?.privateLawProfile?.summary,
      mainworld?.privateLawProfile?.summary,
    ),
    personalRightsProfile: firstNonEmptyHexSummary(
      system?.personalRightsProfile?.summary,
      mainworld?.personalRightsProfile?.summary,
    ),
    secondaryProfiles: firstNonEmptyHexSummary(
      system?.profiles?.secondaryProfiles,
      system?.secondaryProfiles,
      system?.metadata?.secondaryProfiles,
    ),
    factionsProfile: firstNonEmptyHexSummary(system?.factionsProfile?.summary, mainworld?.factionsProfile?.summary),
    nativeSophontLife: nativeLifeSummary.nativeSophontLife,
    nativeLifeform: nativeLifeSummary.nativeLifeform,
    nativeLifeWorldCount: nativeLifeSummary.nativeLifeWorldCount,
    nativeSophontWorldCount: nativeLifeSummary.nativeSophontWorldCount,
  };
}
