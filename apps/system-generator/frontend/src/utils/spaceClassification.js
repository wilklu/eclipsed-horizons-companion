/**
 * Space Classification Utility
 *
 * Implements a three-tier space classification system for exploration gameplay:
 * - Surveyed: Sectors with generated systems (hexPresenceGenerated = true)
 * - Frontier: Sectors adjacent to Surveyed sectors within one Chebyshev ring
 * - Void: All other sectors (unexplored space)
 *
 * The system supports dynamic promotion where newly surveyed sectors
 * automatically promote their neighbors from Void to Frontier.
 */

/**
 * Converts sector grid coordinates to a unique string key
 * @param {number} x - Sector X coordinate
 * @param {number} y - Sector Y coordinate
 * @returns {string} Coordinate key in format "x:y"
 */
export function toSectorCoordKey(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return `${x}:${y}`;
}

/**
 * Parses a coordinate key back into [x, y]
 * @param {string} coordKey - Coordinate key in format "x:y"
 * @returns {[number, number] | null} Array [x, y] or null if invalid
 */
export function fromSectorCoordKey(coordKey) {
  const parts = String(coordKey).split(":");
  if (parts.length !== 2) return null;
  const x = Number(parts[0]);
  const y = Number(parts[1]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [x, y];
}

/**
 * Checks if a sector is in Surveyed tier (has generated systems)
 * @param {Object} sector - Sector data object
 * @returns {boolean} True if sector is surveyed
 */
export function isSurveyedSector(sector) {
  if (!sector) return false;
  const hasPresence = sector.hexPresenceGenerated === true;
  const hasSystems = Number(sector.systemCount) > 0;
  return hasPresence || hasSystems;
}

/**
 * Checks if a sector coordinate is adjacent to a surveyed sector (within one Chebyshev ring)
 * @param {number} sx - Sector X coordinate
 * @param {number} sy - Sector Y coordinate
 * @param {Set<string>} surveyedCoordKeySet - Set of surveyed sector coordinate keys
 * @returns {boolean} True if adjacent to any surveyed sector
 */
export function isAdjacentToSurveyed(sx, sy, surveyedCoordKeySet) {
  if (!surveyedCoordKeySet || !surveyedCoordKeySet.size) return false;

  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue; // Skip center
      const adjKey = toSectorCoordKey(sx + dx, sy + dy);
      if (surveyedCoordKeySet.has(adjKey)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculates space tier for a given coordinate based on surveyed sectors
 * @param {number} sx - Sector X coordinate
 * @param {number} sy - Sector Y coordinate
 * @param {Set<string>} surveyedCoordKeySet - Set of surveyed sector coordinate keys
 * @returns {string} One of: "surveyed" | "frontier" | "void"
 */
export function calculateSpaceTier(sx, sy, surveyedCoordKeySet) {
  const coordKey = toSectorCoordKey(sx, sy);

  // Check if this sector is surveyed
  if (surveyedCoordKeySet.has(coordKey)) {
    return "surveyed";
  }

  // Check if adjacent to surveyed
  if (isAdjacentToSurveyed(sx, sy, surveyedCoordKeySet)) {
    return "frontier";
  }

  // Everything else is void
  return "void";
}

/**
 * Resolves generation mode based on phase-3 space tier policy.
 * Policy:
 * - surveyed -> full systems
 * - frontier -> user-selected mode
 * - void -> user-selected mode
 * @param {string} requestedMode - One of: name | presence | name-presence | name-systems
 * @param {string} spaceTier - One of: surveyed | frontier | void
 * @returns {string} Effective generation mode after policy enforcement
 */
export function resolveGenerationModeForSpaceTier(requestedMode, spaceTier) {
  const mode = String(requestedMode || "name-presence")
    .trim()
    .toLowerCase();
  const tier = String(spaceTier || "void")
    .trim()
    .toLowerCase();

  if (tier === "surveyed") {
    return "name-systems";
  }

  if (tier === "frontier") {
    return mode;
  }

  if (tier === "void") {
    return mode;
  }

  return mode;
}

/**
 * Builds the complete set of surveyed sector coordinate keys from sector list
 * @param {Array<Object>} sectors - Array of sector objects
 * @returns {Set<string>} Set of coordinate keys for surveyed sectors
 */
export function buildSurveyedCoordKeySet(sectors = []) {
  const keys = new Set();
  if (!sectors || !Array.isArray(sectors)) return keys;
  for (const sector of sectors) {
    if (!isSurveyedSector(sector)) continue;
    const key = toSectorCoordKey(sector?.coordinates?.x, sector?.coordinates?.y);
    if (key) keys.add(key);
  }
  return keys;
}

/**
 * Builds the complete set of frontier sector coordinate keys
 * Frontier sectors are those adjacent to surveyed sectors within one Chebyshev ring
 * @param {Set<string>} surveyedCoordKeySet - Set of surveyed sector coordinate keys
 * @returns {Set<string>} Set of coordinate keys for frontier sectors
 */
export function buildFrontierCoordKeySet(surveyedCoordKeySet) {
  const keys = new Set();

  for (const coordKey of surveyedCoordKeySet) {
    const [sx, sy] = fromSectorCoordKey(coordKey) || [null, null];
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;

    // Add all adjacent cells (one Chebyshev ring)
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue; // Skip center (that's surveyed)
        keys.add(toSectorCoordKey(sx + dx, sy + dy));
      }
    }
  }

  return keys;
}

/**
 * Builds combined Known Space set (surveyed + frontier)
 * @param {Set<string>} surveyedCoordKeySet - Set of surveyed sector coordinate keys
 * @returns {Set<string>} Set of all known space (surveyed + frontier) coordinate keys
 */
export function buildKnownSpaceCoordKeySet(surveyedCoordKeySet) {
  const knownSpace = new Set(surveyedCoordKeySet);
  const frontier = buildFrontierCoordKeySet(surveyedCoordKeySet);
  for (const key of frontier) {
    knownSpace.add(key);
  }
  return knownSpace;
}

/**
 * Counts the number of sectors in each tier
 * @param {Set<string>} surveyedCoordKeySet - Set of surveyed sector coordinate keys
 * @returns {Object} Counts object { surveyed: number, frontier: number }
 */
export function countSpaceTiers(surveyedCoordKeySet) {
  const surveyed = surveyedCoordKeySet.size;
  const frontier = buildFrontierCoordKeySet(surveyedCoordKeySet).size;

  return {
    surveyed,
    frontier,
    // Void is conceptually infinite, returns null to indicate unbounded
    void: null,
  };
}

/**
 * Calculates 10x10 planning region capacity info
 * Returns information about how many sectors fit in the current 10x10 planning window
 * @param {Object} options - Configuration options
 * @param {number} options.centerX - Center X coordinate
 * @param {number} options.centerY - Center Y coordinate
 * @param {number} options.planningRadius - Radius of planning window (default 5 for 10x10)
 * @returns {Object} Planning info { totalCapacity, surveyed, remaining, percentUtilization }
 */
export function calculatePlanningRegionCapacity(options = {}) {
  const { centerX = 0, centerY = 0, planningRadius = 5 } = options;

  const totalCapacity = (planningRadius * 2 + 1) ** 2; // e.g., 11x11 = 121 sectors

  return {
    totalCapacity,
    centerX,
    centerY,
    planningRadius,
    description: `${totalCapacity} sectors in planning window`,
  };
}

/**
 * Checks if coordinates fall within a planning region
 * @param {number} sx - Sector X coordinate
 * @param {number} sy - Sector Y coordinate
 * @param {number} centerX - Center X coordinate of planning window
 * @param {number} centerY - Center Y coordinate of planning window
 * @param {number} planningRadius - Radius of planning window
 * @returns {boolean} True if coordinates are within planning window
 */
export function isInPlanningWindow(sx, sy, centerX, centerY, planningRadius = 5) {
  const dx = Math.abs(sx - centerX);
  const dy = Math.abs(sy - centerY);
  return dx <= planningRadius && dy <= planningRadius;
}
