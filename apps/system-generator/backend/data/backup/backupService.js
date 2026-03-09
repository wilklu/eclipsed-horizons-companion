/**
 * Backup Service
 *
 * Handles full and selective database backups to JSON format.
 * Backups include timestamp metadata and can be used for restoration.
 *
 * Usage:
 *   import { backupFullUniverse, backupGalaxy } from './backupService.js'
 *
 *   const json = await backupFullUniverse(db)
 *   fs.writeFileSync('universe-backup.json', JSON.stringify(json, null, 2))
 */

import { universeToJson, galaxyToJson } from "../converters/sqliteToJson.js";

/**
 * Backup entire universe
 */
export async function backupFullUniverse(db) {
  const backup = {
    backupType: "full",
    timestamp: new Date().toISOString(),
    version: "1.0",
    universe: await universeToJson(db),
  };

  return backup;
}

/**
 * Backup single galaxy with all children
 */
export async function backupGalaxy(db, galaxyId) {
  const galaxy = await galaxyToJson(db, galaxyId);

  const backup = {
    backupType: "galaxy",
    timestamp: new Date().toISOString(),
    version: "1.0",
    galaxyId,
    galaxyName: galaxy.name,
    galaxy,
  };

  return backup;
}

/**
 * Verify backup integrity
 */
export function verifyBackup(backup) {
  const errors = [];

  if (!backup.timestamp) {
    errors.push("Missing timestamp");
  }

  if (!backup.universe && !backup.galaxy) {
    errors.push("No universe or galaxy data");
  }

  if (backup.universe) {
    if (!Array.isArray(backup.universe.galaxies)) {
      errors.push("Invalid galaxies array");
    }
    if (backup.universe.statistics) {
      if (backup.universe.statistics.galaxyCount !== backup.universe.galaxies.length) {
        errors.push("Galaxy count mismatch");
      }
    }
  }

  if (backup.galaxy) {
    if (!backup.galaxyId) {
      errors.push("Missing galaxyId for galaxy backup");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get backup metadata
 */
export function getBackupMetadata(backup) {
  const stats = backup.universe?.statistics || {
    galaxyCount: backup.galaxy ? 1 : 0,
    sectorCount: backup.galaxy?.sectors?.length || 0,
    systemCount: 0,
    worldCount: 0,
    sophontCount: 0,
  };

  if (backup.galaxy) {
    stats.sectorCount = backup.galaxy.sectors?.length || 0;
    backup.galaxy.sectors?.forEach((sector) => {
      sector.systems?.forEach((system) => {
        stats.systemCount++;
        system.worlds?.forEach((world) => {
          stats.worldCount++;
          stats.sophontCount += world.sophonts?.length || 0;
        });
      });
    });
  }

  return {
    type: backup.backupType,
    timestamp: backup.timestamp,
    version: backup.version,
    statistics: stats,
  };
}

/**
 * Create backup filename with timestamp
 */
export function createBackupFilename(backup) {
  const timestamp = new Date(backup.timestamp).toISOString().replace(/[:.]/g, "-").substring(0, 19);

  if (backup.backupType === "galaxy") {
    const safeName = backup.galaxyName?.replace(/[^a-zA-Z0-9_-]/g, "_") || "galaxy";
    return `backup-${backup.backupType}-${safeName}-${timestamp}.json`;
  }

  return `backup-${backup.backupType}-${timestamp}.json`;
}
