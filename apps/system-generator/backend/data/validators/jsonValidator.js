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
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(__dirname, "..", "apps", "system-generator", "backend", "data", "schemas");

const ajv = new Ajv({ allErrors: true });

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

  if (universe.galaxies) {
    results.galaxies = validateEntities(universe.galaxies, "galaxy");
    results.isValid &= results.galaxies.every((r) => r.valid);
    results.errorCount += results.galaxies.filter((r) => !r.valid).length;
  }

  if (universe.sectors) {
    results.sectors = validateEntities(universe.sectors, "sector");
    results.isValid &= results.sectors.every((r) => r.valid);
    results.errorCount += results.sectors.filter((r) => !r.valid).length;
  }

  if (universe.systems) {
    results.systems = validateEntities(universe.systems, "system");
    results.isValid &= results.systems.every((r) => r.valid);
    results.errorCount += results.systems.filter((r) => !r.valid).length;
  }

  if (universe.worlds) {
    results.worlds = validateEntities(universe.worlds, "world");
    results.isValid &= results.worlds.every((r) => r.valid);
    results.errorCount += results.worlds.filter((r) => !r.valid).length;
  }

  if (universe.sophonts) {
    results.sophonts = validateEntities(universe.sophonts, "sophont");
    results.isValid &= results.sophonts.every((r) => r.valid);
    results.errorCount += results.sophonts.filter((r) => !r.valid).length;
  }

  return results;
}

// Export validators
export { validateGalaxy, validateSector, validateSystem, validateWorld, validateSophont };
