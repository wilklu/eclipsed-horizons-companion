export function createEmptyStarRow() {
  return {
    designation: "",
    typeSubtype: "",
    lumClass: "",
    mass: null,
    luminosity: null,
    temperature: null,
    diameter: null,
    stellarProfile: "",
    notes: "",
  };
}

export function createEmptyWorldRow() {
  return {
    designation: "",
    type: "",
    orbitAu: "",
    sah: "",
    diameter: null,
    temperature: null,
    atmosphere: "",
    hydrosphere: "",
    lifeMxdc: "",
    habitability: "",
    resources: "",
    notes: "",
  };
}

export function createEmptySurveyData() {
  return {
    systemDesignation: "",
    sectorHex: "",
    surveyDate: new Date().toISOString().split("T")[0],
    surveyClass: "A",
    systemAge: null,
    travelZone: "Green",
    surveyingVessel: "",
    previousSurveyDate: "",
    stars: [createEmptyStarRow()],
    hzCentre: null,
    hzInner: null,
    hzOuter: null,
    gasGiants: 0,
    belts: 0,
    terrestrials: 0,
    worlds: Array.from({ length: 12 }, () => createEmptyWorldRow()),
    mainworldName: "",
    mainworldType: "",
    mainworldParent: "",
    mainworldUwp: "",
    nativeLifeform: "",
    habitability: "",
    resourceRating: "",
    tradeCodes: "",
    stellarProfile: "",
    mainworldRemarks: "",
    secondaryProfiles: "",
    profileNotes: "",
    comments: "",
  };
}

function stringifyTradeCodes(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return String(value || "").trim();
}

function stringifyRemarks(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return String(value || "").trim();
}

function buildWorldSocialOverlayNotes(world) {
  if (!world || typeof world !== "object") {
    return "";
  }

  const notes = [];
  if (world?.minimumSustainableTechLevel?.summary) {
    notes.push(String(world.minimumSustainableTechLevel.summary));
  }
  if (world?.governmentProfile?.profileCode) {
    const summary = String(world?.governmentProfile?.summary || "").trim();
    const structureSummary = String(world?.governmentProfile?.structureSummary || "").trim();
    notes.push(
      `Government profile ${world.governmentProfile.profileCode}${summary ? ` (${summary})` : ""}${structureSummary ? `: ${structureSummary}` : ""}`,
    );
  }
  if (world?.justiceProfile?.code) {
    notes.push(
      `Justice ${String(world.justiceProfile.code)} ${String(world.justiceProfile.label || "").trim()}`.trim(),
    );
  }
  if (world?.factionsProfile?.eligible && world?.factionsProfile?.summary) {
    notes.push(`Factions ${String(world.factionsProfile.summary)}`);
  }
  if (world?.secondaryWorldContext?.eligible && world?.secondaryWorldContext?.classificationCodes?.length) {
    notes.push(`Secondary classifications ${world.secondaryWorldContext.classificationCodes.join(", ")}`);
  }
  if (world?.civilConflict?.active) {
    notes.push(`Civil conflict active (${String(world.civilConflict.trigger || "instability")})`);
  } else if (world?.civilConflict?.eligible) {
    notes.push(`Civil conflict risk (${String(world.civilConflict.trigger || "instability")})`);
  }
  if (world?.techLevelPockets?.eligible && world?.techLevelPockets?.summary) {
    notes.push(`Tech pockets ${String(world.techLevelPockets.summary)}`);
  }

  return notes.join("; ");
}

export function buildMainworldSocialProfileNotes(mainworld) {
  return buildWorldSocialOverlayNotes(mainworld);
}

function buildLegacyStarMetadataNote(systemRecord) {
  const generatedSurvey =
    systemRecord?.metadata?.generatedSurvey && typeof systemRecord.metadata.generatedSurvey === "object"
      ? systemRecord.metadata.generatedSurvey
      : {};

  if (generatedSurvey?.legacyHierarchyUnknown) {
    return "Legacy star hierarchy reconstructed from flat labels.";
  }
  if (generatedSurvey?.legacyReconstructed) {
    return "Legacy star metadata reconstructed from flat labels.";
  }
  return "";
}

function combineProfileNotes(...values) {
  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value, index, entries) => entries.indexOf(value) === index)
    .join("; ");
}

function isSurveyStarRow(star) {
  return Boolean(star && typeof star === "object" && ("typeSubtype" in star || "lumClass" in star));
}

function normalizeSurveyStarRow(star = {}) {
  if (isSurveyStarRow(star)) {
    return {
      designation: String(star?.designation || ""),
      typeSubtype: String(star?.typeSubtype || ""),
      lumClass: String(star?.lumClass || ""),
      mass: Number(star?.mass ?? 0) || null,
      luminosity: Number(star?.luminosity ?? 0) || null,
      temperature: Number(star?.temperature ?? 0) || null,
      diameter: Number(star?.diameter ?? 0) || null,
      stellarProfile: String(star?.stellarProfile || ""),
      notes: String(star?.notes || ""),
    };
  }

  return {
    designation: String(star?.designation || star?.starKey || ""),
    typeSubtype: String(star?.spectralClass || star?.designation || star?.objectType || ""),
    lumClass: String(star?.luminosityClass || ""),
    mass: Number(star?.massInSolarMasses ?? star?.mass ?? 0) || null,
    luminosity: Number(star?.luminosity ?? 0) || null,
    temperature: Number(star?.temperatureK ?? star?.temperature ?? 0) || null,
    diameter: Number(star?.diameter ?? 0) || null,
    stellarProfile: String(star?.stellarProfile || star?.orbitType || ""),
    notes: stringifyRemarks(
      [
        star?.orbitType,
        star?.parentStarKey ? `Parent ${star.parentStarKey}` : "",
        star?.continuationOf ? `Continuation ${star.continuationOf}` : "",
      ].filter(Boolean),
    ),
  };
}

function isSurveyWorldRow(world) {
  return Boolean(
    world && typeof world === "object" && ("designation" in world || "sah" in world || "lifeMxdc" in world),
  );
}

function normalizeSurveyWorldRow(world = {}) {
  if (isSurveyWorldRow(world)) {
    return {
      designation: String(world?.designation || ""),
      type: String(world?.type || ""),
      orbitAu: String(world?.orbitAu || ""),
      sah: String(world?.sah || ""),
      diameter: Number(world?.diameter ?? 0) || null,
      temperature: Number(world?.temperature ?? 0) || null,
      atmosphere: world?.atmosphere ?? "",
      hydrosphere: world?.hydrosphere ?? "",
      lifeMxdc: String(world?.lifeMxdc || ""),
      habitability: String(world?.habitability || ""),
      resources: String(world?.resources || ""),
      notes: String(world?.notes || ""),
    };
  }

  return {
    designation: String(world?.name || ""),
    type: formatSurveyWorldType(world),
    orbitAu: formatSurveyWorldOrbit(world),
    sah: String(world?.uwp || world?.sah_uwp || ""),
    diameter: Number(world?.diameterKm ?? 0) || null,
    temperature: Number(world?.avgTempC ?? world?.temperature ?? 0) || null,
    atmosphere: world?.atmosphereCode ?? "",
    hydrosphere: world?.hydrographics ?? "",
    lifeMxdc: String(world?.nativeLifeform || ""),
    habitability: String(world?.habitability || ""),
    resources: String(world?.resourceRating || ""),
    notes: stringifyRemarks(
      [
        ...(Array.isArray(world?.remarks) ? world.remarks : [world?.remarks]),
        buildWorldSocialOverlayNotes(world),
      ].filter(Boolean),
    ),
  };
}

function formatSurveyWorldType(world) {
  if (world?.isMainworld) return "MW";
  if (
    world?.isMoon ||
    String(world?.type || "")
      .toLowerCase()
      .includes("moon")
  ) {
    return "MON";
  }
  if (String(world?.type || "") === "Gas Giant") return "GG";
  if (String(world?.type || "") === "Planetoid Belt") return "BLT";
  return world?.name ? "TER" : "";
}

function formatSurveyWorldOrbit(world) {
  const orbitNumber = world?.orbitNumber ?? world?.orbitalSlot ?? "";
  const orbitAu = world?.orbitAU ?? world?.orbitAu ?? "";
  if (orbitNumber === "" && orbitAu === "") return "";
  if (orbitNumber === "") return String(orbitAu);
  if (orbitAu === "") return String(orbitNumber);
  return `${orbitNumber}/${orbitAu}`;
}

export function buildSurveyDataFromSystem(systemRecord) {
  const base = createEmptySurveyData();
  if (!systemRecord || typeof systemRecord !== "object") {
    return base;
  }

  const mainworld =
    systemRecord?.mainworld && typeof systemRecord.mainworld === "object" ? systemRecord.mainworld : null;

  const stars =
    Array.isArray(systemRecord?.stars) && systemRecord.stars.length
      ? systemRecord.stars.map((star) => normalizeSurveyStarRow(star))
      : base.stars;

  const worlds =
    Array.isArray(systemRecord?.worlds) && systemRecord.worlds.length
      ? systemRecord.worlds.map((world) => normalizeSurveyWorldRow(world))
      : Array.isArray(systemRecord?.planets) && systemRecord.planets.length
        ? systemRecord.planets.map((world) => normalizeSurveyWorldRow(world))
        : mainworld
          ? [normalizeSurveyWorldRow(mainworld)]
          : base.worlds;

  const profiles = systemRecord?.profiles && typeof systemRecord.profiles === "object" ? systemRecord.profiles : {};
  const derivedProfileNotes = buildMainworldSocialProfileNotes(mainworld);
  const legacyStarNote = buildLegacyStarMetadataNote(systemRecord);

  return {
    ...base,
    systemDesignation: String(systemRecord?.systemDesignation || systemRecord?.name || systemRecord?.systemId || ""),
    sectorHex:
      String(systemRecord?.sectorHex || "") ||
      `${String(systemRecord?.sectorId || "")}${systemRecord?.hexCoordinates ? ` ${String(systemRecord.hexCoordinates.x).padStart(2, "0")}${String(systemRecord.hexCoordinates.y).padStart(2, "0")}` : ""}`.trim(),
    surveyDate: String(systemRecord?.surveyDate || base.surveyDate),
    surveyClass: String(systemRecord?.surveyClass || base.surveyClass),
    systemAge: Number(systemRecord?.systemAge ?? systemRecord?.stars?.[0]?.systemAge ?? 0) || null,
    travelZone: String(systemRecord?.travelZone || profiles?.travelZone || base.travelZone),
    surveyingVessel: String(systemRecord?.surveyingVessel || ""),
    previousSurveyDate: String(systemRecord?.previousSurveyDate || ""),
    stars,
    hzCentre: Number(systemRecord?.habitableZone?.centerAU ?? systemRecord?.habitabilityZone?.centre ?? 0) || null,
    hzInner: Number(systemRecord?.habitableZone?.innerAU ?? systemRecord?.habitabilityZone?.inner ?? 0) || null,
    hzOuter: Number(systemRecord?.habitableZone?.outerAU ?? systemRecord?.habitabilityZone?.outer ?? 0) || null,
    gasGiants: Number(systemRecord?.objectCounts?.gasGiants ?? systemRecord?.gasGiants ?? 0) || 0,
    belts: Number(systemRecord?.objectCounts?.belts ?? systemRecord?.objectCounts?.planetoidBelts ?? 0) || 0,
    terrestrials:
      Number(systemRecord?.objectCounts?.terrestrials ?? systemRecord?.objectCounts?.terrestrialPlanets ?? 0) || 0,
    worlds,
    mainworldName: String(systemRecord?.mainworldName || profiles?.mainworldName || mainworld?.name || ""),
    mainworldType: String(
      systemRecord?.mainworldType || profiles?.mainworldType || (mainworld?.isMoon ? "Moon" : mainworld?.type) || "",
    ),
    mainworldParent: String(
      systemRecord?.mainworldParentWorldName || profiles?.mainworldParent || mainworld?.parentWorldName || "",
    ),
    mainworldUwp: String(systemRecord?.mainworldUwp || profiles?.mainworldUwp || mainworld?.uwp || ""),
    nativeLifeform: String(systemRecord?.nativeLifeform || profiles?.nativeLifeform || mainworld?.nativeLifeform || ""),
    habitability: String(systemRecord?.habitability || profiles?.habitability || mainworld?.habitability || ""),
    resourceRating: String(systemRecord?.resourceRating || profiles?.resourceRating || mainworld?.resourceRating || ""),
    tradeCodes: stringifyTradeCodes(systemRecord?.tradeCodes || profiles?.tradeCodes || mainworld?.tradeCodes),
    stellarProfile: stringifyRemarks(stars.map((star) => star.typeSubtype).filter(Boolean)),
    mainworldRemarks: stringifyRemarks(
      systemRecord?.mainworldRemarks || profiles?.mainworldRemarks || mainworld?.remarks,
    ),
    secondaryProfiles: String(profiles?.secondaryProfiles || ""),
    profileNotes: combineProfileNotes(profiles?.profileNotes, derivedProfileNotes, legacyStarNote),
    comments: String(systemRecord?.comments || ""),
  };
}

function cloneSurveyWorlds(worlds = []) {
  return (Array.isArray(worlds) ? worlds : []).map((world) => ({ ...world }));
}

export function buildSystemSurveyPayload(surveyData) {
  return {
    systemDesignation: surveyData.systemDesignation,
    sectorHex: surveyData.sectorHex,
    surveyDate: surveyData.surveyDate,
    surveyClass: surveyData.surveyClass,
    systemAge: surveyData.systemAge,
    travelZone: surveyData.travelZone,
    surveyingVessel: surveyData.surveyingVessel,
    previousSurveyDate: surveyData.previousSurveyDate,
    stars: surveyData.stars,
    habitabilityZone: {
      centre: surveyData.hzCentre,
      inner: surveyData.hzInner,
      outer: surveyData.hzOuter,
    },
    objectCounts: {
      gasGiants: surveyData.gasGiants,
      belts: surveyData.belts,
      terrestrials: surveyData.terrestrials,
    },
    worlds: surveyData.worlds,
    profiles: {
      mainworldName: surveyData.mainworldName,
      mainworldType: surveyData.mainworldType,
      mainworldParent: surveyData.mainworldParent,
      mainworldUwp: surveyData.mainworldUwp,
      nativeLifeform: surveyData.nativeLifeform,
      habitability: surveyData.habitability,
      resourceRating: surveyData.resourceRating,
      tradeCodes: surveyData.tradeCodes,
      stellarProfile: surveyData.stellarProfile,
      mainworldRemarks: surveyData.mainworldRemarks,
      secondaryProfiles: surveyData.secondaryProfiles,
      profileNotes: surveyData.profileNotes,
    },
    comments: surveyData.comments,
  };
}

export function mergeSystemSurveyRecord(currentRecord, surveyData, nowIso = new Date().toISOString()) {
  const payload = buildSystemSurveyPayload(surveyData);
  const current = currentRecord && typeof currentRecord === "object" ? currentRecord : {};

  return {
    ...current,
    ...payload,
    worlds: cloneSurveyWorlds(payload.worlds),
    profiles: {
      ...(current?.profiles && typeof current.profiles === "object" ? current.profiles : {}),
      ...payload.profiles,
    },
    objectCounts: {
      ...(current?.objectCounts && typeof current.objectCounts === "object" ? current.objectCounts : {}),
      ...payload.objectCounts,
    },
    habitabilityZone: {
      ...(current?.habitabilityZone && typeof current.habitabilityZone === "object" ? current.habitabilityZone : {}),
      ...payload.habitabilityZone,
    },
    travelZone: payload.travelZone,
    metadata: {
      ...(current?.metadata && typeof current.metadata === "object" ? current.metadata : {}),
      lastModified: nowIso,
    },
  };
}
