/**
 * Survey Promotion System
 *
 * Handles dynamic space tier promotion when sectors are surveyed.
 * When a sector transitions to Surveyed tier, its neighbors automatically
 * promote from Void to Frontier tier.
 */

import { fromSectorCoordKey, isSurveyedSector } from "./spaceClassification.js";

/**
 * Event emitter for survey lifecycle events
 * Allows decoupled components to react to survey completion
 */
class SurveyEventEmitter {
  constructor() {
    this.listeners = {
      surveyed: [],
    };
  }

  /**
   * Subscribe to survey completion events
   * @param {string} eventType - Event type: 'surveyed'
   * @param {Function} callback - Handler (sector) => void
   * @returns {Function} Unsubscribe function
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[eventType] = this.listeners[eventType].filter((cb) => cb !== callback);
    };
  }

  /**
   * Emit a survey event
   * @param {string} eventType - Event type: 'surveyed'
   * @param {Object} data - Event payload
   */
  emit(eventType, data) {
    if (this.listeners[eventType]) {
      for (const callback of this.listeners[eventType]) {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in survey event listener (${eventType}):`, err);
        }
      }
    }
  }
}

/**
 * Global survey event bus
 */
export const surveyEventBus = new SurveyEventEmitter();

/**
 * Detects if a sector transitioned from non-surveyed to surveyed
 * @param {Object} oldSector - Previous sector state
 * @param {Object} newSector - New sector state
 * @returns {boolean} True if newly surveyed in this update
 */
export function detectSurveyCompletion(oldSector, newSector) {
  if (!newSector) return false;
  if (!oldSector) {
    // New sector created with presence data
    return isSurveyedSector(newSector);
  }

  const wasNotSurveyed = !isSurveyedSector(oldSector);
  const isNowSurveyed = isSurveyedSector(newSector);
  return wasNotSurveyed && isNowSurveyed;
}

/**
 * Gets the coordinate grid neighbors of a sector
 * Returns all 8 adjacent sectors in Chebyshev distance
 * @param {number} sx - Sector X coordinate
 * @param {number} sy - Sector Y coordinate
 * @returns {Array<[number, number]>} Array of [x, y] neighbor coordinates
 */
export function getNeighboringCoordinates(sx, sy) {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue; // Skip center
      neighbors.push([sx + dx, sy + dy]);
    }
  }
  return neighbors;
}

/**
 * Finds sectors in the provided list that are neighbors of the given coordinate
 * @param {number} sx - Reference sector X coordinate
 * @param {number} sy - Reference sector Y coordinate
 * @param {Array<Object>} sectors - Full sector list to search
 * @returns {Array<Object>} Sectors that are neighbors
 */
export function findNeighboringSectors(sx, sy, sectors = []) {
  if (!sectors || !Array.isArray(sectors)) return [];

  const neighbors = getNeighboringCoordinates(sx, sy);
  const neighborSet = new Set(neighbors.map(([x, y]) => `${x}:${y}`));

  return sectors.filter((sector) => {
    if (!sector?.coordinates) return false;
    const coordKey = `${sector.coordinates.x}:${sector.coordinates.y}`;
    return neighborSet.has(coordKey);
  });
}

/**
 * Builds promotion metadata for a sector transitioning to frontier
 * Marks when the sector entered frontier tier
 * @param {Object} sectorMetadata - Existing metadata object (or {})
 * @returns {Object} Updated metadata with frontierPromotedAt timestamp
 */
export function buildFrontierPromotionMetadata(sectorMetadata = {}) {
  return {
    ...sectorMetadata,
    // Record when this sector was promoted to frontier
    frontierPromotedAt: new Date().toISOString(),
  };
}

/**
 * Applies promotion to a sector (Void → Frontier)
 * This is metadata-only; actual frontier appearance is computed by isSurveyedSector
 * @param {Object} sector - Sector to promote
 * @returns {Object} Updated sector with promotion metadata
 */
export function promoteToFrontier(sector) {
  if (!sector) return null;
  return {
    ...sector,
    metadata: buildFrontierPromotionMetadata(sector?.metadata || {}),
  };
}

/**
 * Emits survey completion event and returns neighbor sectors for promotion
 * Call this after a sector is successfully surveyed
 *
 * @param {Object} newSector - Sector that was just surveyed
 * @param {Array<Object>} allSectors - Full sector list
 * @param {Object} oldSector - Previous sector state (optional, for transition detection)
 * @returns {Object} { neighbors: Array<Object>, event: Object }
 */
export function onSectorSurveyCompleted(newSector, allSectors = [], oldSector = null) {
  if (!newSector?.coordinates) {
    console.warn("onSectorSurveyCompleted: Invalid sector", newSector);
    return { neighbors: [], event: null };
  }

  // Detect if this is genuinely a new survey (not just a metadata update)
  const isNewSurvey = detectSurveyCompletion(oldSector, newSector);

  const neighbors = findNeighboringSectors(newSector.coordinates.x, newSector.coordinates.y, allSectors);

  const event = {
    timestamp: new Date().toISOString(),
    sectorId: newSector.sectorId,
    coordinates: newSector.coordinates,
    isNewSurvey,
    neighborCount: neighbors.length,
  };

  // Emit event for subscribers (Atlas, etc.)
  surveyEventBus.emit("surveyed", event);

  return { neighbors, event };
}

/**
 * Subscribes to survey completion events
 * Useful for reactive components that need to update on survey completion
 *
 * @param {Function} handler - (event: { sectorId, coordinates, isNewSurvey, neighborCount }) => void
 * @returns {Function} Unsubscribe function
 */
export function onSurveyed(handler) {
  return surveyEventBus.on("surveyed", handler);
}
