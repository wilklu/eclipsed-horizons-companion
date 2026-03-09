/**
 * JSON Validator Utility
 *
 * Validates entities against their JSON schemas using the AJV schema validation library.
 * Provides a simple interface for validating all entity types.
 *
 * Usage:
 *   import { validateGalaxy, validateSector, etc. } from './jsonValidator.js'
 *
 *   const galaxy = { galaxyId: '001', name: 'Milky Way', type: 'Spiral', ... }
 *   const result = validateGalaxy(galaxy)
 *   if (!result.valid) {
 *     console.error(result.errors)
 *   }
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(__dirname, "..", "schemas");

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load schemas
function loadSchema(filename) {
  const path = join(SCHEMA_DIR, filename);
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
}

const galaxySchema = loadSchema("galaxy-schema.json");
const sectorSchema = loadSchema("sector-schema.json");
const systemSchema = loadSchema("system-schema.json");
const worldSchema = loadSchema("world-schema.json");
const sophontSchema = loadSchema("sophont-schema.json");

// Compile validators
const validateGalaxy = ajv.compile(galaxySchema);
const validateSector = ajv.compile(sectorSchema);
const validateSystem = ajv.compile(systemSchema);
const validateWorld = ajv.compile(worldSchema);
const validateSophont = ajv.compile(sophontSchema);

/**
 * Validation result wrapper
 */
function createResult(validator, data) {
  const valid = validator(data);
  return {
    valid,
    data,
    errors: valid ? null : validator.errors,
    errorMessages: valid
      ? []
      : validator.errors.map((err) => ({
          path: err.instancePath || "(root)",
          message: err.message,
          keyword: err.keyword,
        })),
  };
}

/**
 * Validate any entity by type
 */
export function validateEntity(data, entityType) {
  const validators = {
    galaxy: validateGalaxy,
    sector: validateSector,
    system: validateSystem,
    world: validateWorld,
    sophont: validateSophont,
  };

  const validator = validators[entityType.toLowerCase()];
  if (!validator) {
    return {
      valid: false,
      data,
      errors: [`Unknown entity type: ${entityType}`],
      errorMessages: [{ path: "(root)", message: `Unknown entity type: ${entityType}` }],
    };
  }

  return createResult(validator, data);
}

/**
 * Bulk validate array of entities
 */
export function validateEntities(dataArray, entityType) {
  return dataArray.map((item) => validateEntity(item, entityType));
}

/**
 * Validate all entities in a universe object
 */
export function validateUniverse(universe) {
  const results = {
    galaxies: [],
    sectors: [],
    systems: [],
    worlds: [],
    sophonts: [],
    isValid: true,
    errorCount: 0,
  };

  // Supports both nested hierarchy (galaxy -> sectors -> systems -> worlds -> sophonts)
  // and flat arrays at universe root.
  const galaxies = universe.galaxies || [];
  results.galaxies = validateEntities(galaxies, "galaxy");

  const sectors = [...(universe.sectors || [])];
  const systems = [...(universe.systems || [])];
  const worlds = [...(universe.worlds || [])];
  const sophonts = [...(universe.sophonts || [])];

  for (const galaxy of galaxies) {
    for (const sector of galaxy.sectors || []) {
      sectors.push(sector);
      for (const system of sector.systems || []) {
        systems.push(system);
        for (const world of system.worlds || []) {
          worlds.push(world);
          for (const sophont of world.sophonts || []) {
            sophonts.push(sophont);
          }
        }
      }
    }
  }

  results.sectors = validateEntities(sectors, "sector");
  results.systems = validateEntities(systems, "system");
  results.worlds = validateEntities(worlds, "world");
  results.sophonts = validateEntities(sophonts, "sophont");

  const allResults = [results.galaxies, results.sectors, results.systems, results.worlds, results.sophonts].flat();
  results.isValid = allResults.every((r) => r.valid);
  results.errorCount = allResults.filter((r) => !r.valid).length;

  return results;
}

// Export validators
export { validateGalaxy, validateSector, validateSystem, validateWorld, validateSophont };
