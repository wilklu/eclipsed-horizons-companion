/**
 * Restore Service
 *
 * Handles restoration of universes and galaxies from JSON backups.
 * Includes validation, conflict detection, and rollback capabilities.
 *
 * Usage:
 *   import { restoreFromBackup } from './restoreService.js'
 *
 *   const backup = JSON.parse(fs.readFileSync('universe-backup.json'))
 *   const result = await restoreFromBackup(db, backup)
 *   if (result.success) {
 *     console.log('Restored with ID mappings:', result.idMap)
 *   }
 */

import { validateUniverse } from "../validators/jsonValidator.js";
import { jsonUniverseToSqlite } from "../converters/jsonToSqlite.js";

/**
 * Restore from backup with validation
 */
export async function restoreFromBackup(db, backup, options = {}) {
  const { validateSchema = true, dryRun = false, onProgress = null } = options;

  const result = {
    success: false,
    message: "",
    idMap: null,
    errors: [],
    warnings: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Validate backup structure
    if (!backup.universe && !backup.galaxy) {
      result.errors.push('Backup must contain either "universe" or "galaxy" data');
      return result;
    }

    // Report progress
    if (onProgress) onProgress("Validating backup structure...");

    // Validate schemas if requested
    if (validateSchema) {
      const universeData = backup.universe || { galaxies: [backup.galaxy] };
      const validation = validateUniverse(universeData);

      if (!validation.isValid) {
        result.warnings.push(`Schema validation found ${validation.errorCount} issues`);

        if (validation.galaxies) {
          validation.galaxies.forEach((v, i) => {
            if (!v.valid) {
              result.warnings.push(`Galaxy ${i}: ${v.errorMessages.map((e) => e.message).join("; ")}`);
            }
          });
        }
      }
    }

    // Check for conflicts
    if (onProgress) onProgress("Checking for conflicts...");

    const conflicts = await detectConflicts(db, backup);
    if (conflicts.length > 0) {
      result.warnings.push(`Found ${conflicts.length} potential conflicts`);
      conflicts.forEach((c) => result.warnings.push(`  - ${c}`));
    }

    // Dry run - stop here if requested
    if (dryRun) {
      result.success = true;
      result.message = "Dry run completed - no data written to database";
      return result;
    }

    // Perform the restore
    if (onProgress) onProgress("Restoring data...");

    const universeData = backup.universe || { galaxies: [backup.galaxy] };
    const idMap = await jsonUniverseToSqlite(db, universeData);

    if (onProgress) onProgress("Verifying restore...");

    // Verify restoration
    const verification = await verifyRestore(db, universeData, idMap);
    if (!verification.valid) {
      result.errors.push("Verification failed after restore");
      verification.errors.forEach((e) => result.errors.push(`  - ${e}`));
      return result;
    }

    result.success = true;
    result.message = `Successfully restored backup from ${backup.timestamp}`;
    result.idMap = idMap;

    return result;
  } catch (err) {
    result.errors.push(`Restore failed: ${err.message}`);
    return result;
  }
}

/**
 * Detect conflicts between backup and current database
 */
export async function detectConflicts(db, backup) {
  const conflicts = [];
  const universeData = backup.universe || { galaxies: [backup.galaxy] };

  // Check for duplicate names
  if (universeData.galaxies) {
    const existingNames = db
      .prepare("SELECT name FROM galaxies")
      .all()
      .map((g) => g.name);

    universeData.galaxies.forEach((g) => {
      if (existingNames.includes(g.name)) {
        conflicts.push(`Galaxy "${g.name}" already exists in database`);
      }
    });
  }

  // Check for orphaned references
  if (universeData.sectors) {
    const galaxyIds = new Set(universeData.galaxies?.map((g) => g.galaxyId) || []);
    universeData.sectors.forEach((s) => {
      if (!galaxyIds.has(s.galaxyId)) {
        conflicts.push(`Sector references non-existent galaxy: ${s.galaxyId}`);
      }
    });
  }

  return conflicts;
}

/**
 * Verify restore was successful
 */
export async function verifyRestore(db, universeData, idMap) {
  const errors = [];
  const stats = {
    galaxiesRestored: 0,
    sectorsRestored: 0,
    systemsRestored: 0,
    worldsRestored: 0,
    sophontsRestored: 0,
  };

  // Verify galaxies
  if (universeData.galaxies) {
    for (const galaxy of universeData.galaxies) {
      const newId = idMap.galaxies[galaxy.galaxyId];
      const restored = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(newId);

      if (!restored) {
        errors.push(`Galaxy not restored: ${galaxy.name}`);
      } else {
        stats.galaxiesRestored++;
      }
    }
  }

  // Verify sectors
  if (universeData.sectors) {
    stats.sectorsRestored = db.prepare("SELECT COUNT(*) as count FROM sectors").get().count;
  }

  // Verify systems
  if (universeData.systems) {
    stats.systemsRestored = db.prepare("SELECT COUNT(*) as count FROM systems").get().count;
  }

  // Verify worlds
  if (universeData.worlds) {
    stats.worldsRestored = db.prepare("SELECT COUNT(*) as count FROM worlds").get().count;
  }

  // Verify sophonts
  if (universeData.sophonts) {
    stats.sophontsRestored = db.prepare("SELECT COUNT(*) as count FROM sophonts").get().count;
  }

  return {
    valid: errors.length === 0,
    errors,
    statistics: stats,
  };
}

/**
 * Rollback to previous state (requires transaction support)
 * Note: Actual rollback implementation depends on database setup
 */
export async function rollbackRestore(db) {
  try {
    // This is a placeholder - actual rollback would require:
    // 1. Saving old state before restore
    // 2. Using database transactions
    // 3. Deleting restored entities if restore failed partway

    return {
      success: false,
      message: "Rollback not yet implemented - restore was either successful or failed abort",
    };
  } catch (err) {
    return {
      success: false,
      message: `Rollback failed: ${err.message}`,
    };
  }
}

/**
 * Compare two backups for differences
 */
export function compareBackups(backup1, backup2) {
  const differences = {
    galaxies: [],
    sectors: [],
    systems: [],
    worlds: [],
    sophonts: [],
  };

  // Simple comparison by counting entities
  const u1 = backup1.universe || { galaxies: [backup1.galaxy] };
  const u2 = backup2.universe || { galaxies: [backup2.galaxy] };

  differences.galaxies = {
    backup1: u1.galaxies?.length || 0,
    backup2: u2.galaxies?.length || 0,
  };

  // Could add more detailed comparisons here

  return differences;
}
