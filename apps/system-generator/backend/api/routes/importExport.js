import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { galaxyToJson, universeToJson } from "../../data/converters/sqliteToJson.js";
import { jsonUniverseToSqlite } from "../../data/converters/jsonToSqlite.js";
import { validateUniverse } from "../../data/validators/jsonValidator.js";

const router = Router();

router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const universe = await universeToJson(db);
    res.json(universe);
  }),
);

router.get(
  "/export/:galaxyId",
  asyncHandler(async (req, res) => {
    const galaxy = await galaxyToJson(db, req.params.galaxyId);
    res.json(galaxy);
  }),
);

router.post(
  "/import",
  asyncHandler(async (req, res) => {
    const universe = req.body.universe || req.body;

    if (!universe || !Array.isArray(universe.galaxies)) {
      throw new ApiError(400, "Import payload must contain a universe with a galaxies array");
    }

    const validation = validateUniverse(universe);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Import validation failed",
        errorCount: validation.errorCount,
        details: {
          galaxies: validation.galaxies.filter((r) => !r.valid),
          sectors: validation.sectors.filter((r) => !r.valid),
          systems: validation.systems.filter((r) => !r.valid),
          worlds: validation.worlds.filter((r) => !r.valid),
          sophonts: validation.sophonts.filter((r) => !r.valid),
        },
      });
    }

    const idMap = await jsonUniverseToSqlite(db, universe);
    res.status(201).json({
      message: "Import completed",
      idMap,
      importedGalaxies: universe.galaxies.length,
    });
  }),
);

export default router;
