import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromSector, toSector } from "../utils/entityMapper.js";

const router = Router();

router.get(
  "/galaxies/:gid/sectors",
  asyncHandler(async (req, res) => {
    const rows = db.prepare("SELECT * FROM sectors WHERE galaxyId = ? ORDER BY createdAt DESC").all(req.params.gid);

    res.json(rows.map(toSector));
  }),
);

router.get(
  "/sectors/:id",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(req.params.id);

    if (!row) {
      throw new ApiError(404, `Sector not found: ${req.params.id}`);
    }

    res.json(toSector(row));
  }),
);

router.post(
  "/sectors",
  validateBody("sector"),
  asyncHandler(async (req, res) => {
    const sector = fromSector(req.body);

    db.prepare(
      `
      INSERT INTO sectors (sectorId, galaxyId, coordinates, densityClass, densityVariation, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      sector.sectorId,
      sector.galaxyId,
      sector.coordinates,
      sector.densityClass,
      sector.densityVariation,
      sector.metadata,
    );

    const created = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(sector.sectorId);
    res.status(201).json(toSector(created));
  }),
);

router.put(
  "/sectors/:id",
  validateBody("sector"),
  asyncHandler(async (req, res) => {
    if (req.body.sectorId !== req.params.id) {
      throw new ApiError(400, "Body sectorId must match route id");
    }

    const sector = fromSector(req.body);

    const result = db
      .prepare(
        `
        UPDATE sectors
        SET galaxyId = ?,
            coordinates = ?,
            densityClass = ?,
            densityVariation = ?,
            metadata = ?,
            lastModified = CURRENT_TIMESTAMP
        WHERE sectorId = ?
      `,
      )
      .run(
        sector.galaxyId,
        sector.coordinates,
        sector.densityClass,
        sector.densityVariation,
        sector.metadata,
        req.params.id,
      );

    if (result.changes === 0) {
      throw new ApiError(404, `Sector not found: ${req.params.id}`);
    }

    const updated = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(req.params.id);
    res.json(toSector(updated));
  }),
);

router.delete(
  "/sectors/:id",
  asyncHandler(async (req, res) => {
    const result = db.prepare("DELETE FROM sectors WHERE sectorId = ?").run(req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `Sector not found: ${req.params.id}`);
    }

    res.status(204).send();
  }),
);

export default router;
