const DESIGNATION_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const DEFAULT_SYSTEM_LABEL = "System";

function designationLetterForIndex(index) {
  if (!Number.isFinite(index) || index < 0) {
    return "A";
  }

  let value = Math.trunc(index);
  let label = "";
  do {
    const remainder = value % 26;
    label = `${DESIGNATION_ALPHABET.charAt(remainder)}${label}`;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

export function toRomanNumeral(value) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number) || number <= 0) {
    return "I";
  }

  const romanMap = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let remainder = number;
  let result = "";
  for (const [magnitude, glyph] of romanMap) {
    while (remainder >= magnitude) {
      result += glyph;
      remainder -= magnitude;
    }
  }

  return result || "I";
}

export function isPlanetoidBeltType(planetLike) {
  const normalizedSourceType = String(planetLike?.sourceType || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (normalizedSourceType === "planetoidbelt") {
    return true;
  }

  return /belt/i.test(String(planetLike?.type || ""));
}

export function normalizeSystemDesignationLabel(value, fallbackLabel = DEFAULT_SYSTEM_LABEL) {
  const normalized = String(value || "").trim();
  if (normalized) {
    return normalized;
  }

  const fallback = String(fallbackLabel || "").trim();
  return fallback || DEFAULT_SYSTEM_LABEL;
}

export function buildPlanetDesignationContext(stars = []) {
  const byKey = new Map();
  const starList = Array.isArray(stars) ? stars : [];

  const resolveCombinedDesignation = (star, fallback) => {
    const combined = String(star?.systemDesignationCombined || star?.systemDesignation || "").trim();
    return combined || fallback;
  };

  const resolveBaseDesignation = (star, combined, fallback) => {
    const explicitBase = String(star?.systemDesignationBase || "")
      .trim()
      .toUpperCase();
    if (/^[A-Z]+$/.test(explicitBase)) {
      return explicitBase;
    }

    const uppercaseSegments = combined.match(/[A-Z]+/g);
    if (uppercaseSegments?.length) {
      return uppercaseSegments.join("");
    }

    return fallback;
  };

  const primaryFallback = designationLetterForIndex(0);
  const primaryStar = starList[0];
  const primaryCombined = resolveCombinedDesignation(primaryStar, primaryFallback);
  const primaryBase = resolveBaseDesignation(primaryStar, primaryCombined, primaryFallback);

  byKey.set("primary", {
    combined: primaryCombined,
    base: primaryBase,
  });

  for (let index = 1; index < starList.length; index++) {
    const fallback = designationLetterForIndex(index);
    const star = starList[index];
    const combined = resolveCombinedDesignation(star, fallback);
    const base = resolveBaseDesignation(star, combined, fallback);

    byKey.set(`secondary-${index}`, {
      combined,
      base,
    });
  }

  return {
    byKey,
    isSingleStarSystem: starList.length <= 1,
  };
}

export function resolvePlanetParentDesignation(slot, secondaryOrbitContext, designationContext) {
  const starKey = typeof slot?.starKey === "string" ? slot.starKey : "primary";
  const slotOrbitNumber = Number(slot?.orbit);

  if (starKey !== "primary") {
    const parentInfo = designationContext.byKey.get(starKey);
    const parentLabel = parentInfo?.combined || parentInfo?.base || "A";
    return {
      parentKey: `single:${starKey}:${parentLabel}`,
      parentLabel,
    };
  }

  const primaryInfo = designationContext.byKey.get("primary") || { combined: "A", base: "A" };
  if (designationContext.isSingleStarSystem) {
    return {
      parentKey: "single:primary",
      parentLabel: "",
    };
  }

  const interiorSecondaries = secondaryOrbitContext
    .filter(
      (secondary) =>
        Number.isFinite(slotOrbitNumber) &&
        Number.isFinite(secondary.orbitNumber) &&
        secondary.orbitNumber < slotOrbitNumber,
    )
    .sort((a, b) => a.orbitNumber - b.orbitNumber);

  if (interiorSecondaries.length === 0) {
    return {
      parentKey: `single:primary:${primaryInfo.combined}`,
      parentLabel: primaryInfo.combined,
    };
  }

  const baseLetters = [];
  const addBaseLetter = (value) => {
    const normalized = String(value || "")
      .trim()
      .toUpperCase();
    if (!normalized) {
      return;
    }
    if (!baseLetters.includes(normalized)) {
      baseLetters.push(normalized);
    }
  };

  addBaseLetter(primaryInfo.base);
  for (const secondary of interiorSecondaries) {
    const secondaryDesignation = designationContext.byKey.get(secondary.key);
    addBaseLetter(secondaryDesignation?.base);
  }

  const collapsed = baseLetters.join("");
  return {
    parentKey: `multi:${collapsed}`,
    parentLabel: collapsed,
  };
}

function buildPlanetDesignationLabel(systemLabel, parentLabel, localDesignation) {
  const safeSystemLabel = normalizeSystemDesignationLabel(systemLabel);
  const safeParent = String(parentLabel || "").trim();
  const safeLocal = String(localDesignation || "I").trim() || "I";

  if (!safeParent) {
    return `${safeSystemLabel} ${safeLocal}`;
  }

  return `${safeSystemLabel} ${safeParent} ${safeLocal}`;
}

export function applyDefaultPlanetDesignations(planets, { systemLabel } = {}) {
  const entries = Array.isArray(planets) ? planets.slice() : [];
  const groups = new Map();

  entries.forEach((planet, index) => {
    const parentKey = String(planet?.parentDesignationKey || "single:primary");
    if (!groups.has(parentKey)) {
      groups.set(parentKey, []);
    }

    groups.get(parentKey).push({
      index,
      orbitNumber: Number(planet?.orbitNumber),
      isBelt: isPlanetoidBeltType(planet),
    });
  });

  const designationByIndex = new Map();
  for (const [parentKey, groupEntries] of groups.entries()) {
    groupEntries.sort((a, b) => {
      const aOrbit = Number.isFinite(a.orbitNumber) ? a.orbitNumber : Number.POSITIVE_INFINITY;
      const bOrbit = Number.isFinite(b.orbitNumber) ? b.orbitNumber : Number.POSITIVE_INFINITY;
      if (aOrbit !== bOrbit) {
        return aOrbit - bOrbit;
      }
      return a.index - b.index;
    });

    let planetCounter = 0;
    let beltCounter = 0;

    for (const entry of groupEntries) {
      if (entry.isBelt) {
        beltCounter += 1;
        designationByIndex.set(entry.index, {
          parentKey,
          localDesignation: `P${toRomanNumeral(beltCounter)}`,
        });
      } else {
        planetCounter += 1;
        designationByIndex.set(entry.index, {
          parentKey,
          localDesignation: toRomanNumeral(planetCounter),
        });
      }
    }
  }

  return entries.map((planet, index) => {
    const designation = designationByIndex.get(index);
    if (!designation) {
      return planet;
    }

    const parentLabel = String(planet?.parentDesignation || "").trim();
    const fullDesignation = buildPlanetDesignationLabel(systemLabel, parentLabel, designation.localDesignation);
    const shortDesignation = parentLabel
      ? `${parentLabel} ${designation.localDesignation}`
      : designation.localDesignation;

    return {
      ...planet,
      designation: fullDesignation,
      shortDesignation,
      localDesignation: designation.localDesignation,
      name: fullDesignation,
    };
  });
}
