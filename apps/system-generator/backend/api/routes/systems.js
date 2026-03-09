import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromSystem, toSystem } from "../utils/entityMapper.js";

const router = Router();

router.get(
  "/galaxies/:gid/sectors/:sid/systems",
  asyncHandler(async (req, res) => {
    const sector = db
      .prepare(
        `
        SELECT s.*
        FROM sectors s
        WHERE s.sectorId = ? AND s.galaxyId = ?
      `,
      )
      .get(req.params.sid, req.params.gid);

    if (!sector) {
      throw new ApiError(404, `Sector ${req.params.sid} not found in galaxy ${req.params.gid}`);
    }

    const rows = db.prepare("SELECT * FROM systems WHERE sectorId = ? ORDER BY createdAt DESC").all(req.params.sid);

    res.json(rows.map(toSystem));
  }),
);

router.get(
  "/systems/:id",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM systems WHERE systemId = ?").get(req.params.id);

    if (!row) {
      throw new ApiError(404, `System not found: ${req.params.id}`);
    }

    res.json(toSystem(row));
  }),
);

router.post(
  "/systems",
  validateBody("system"),
  asyncHandler(async (req, res) => {
    const system = fromSystem(req.body);

    db.prepare(
      `
      INSERT INTO systems (systemId, sectorId, hexCoordinates, starCount, primaryStar, companionStars, habitable_zone, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      system.systemId,
      system.sectorId,
      system.hexCoordinates,
      system.starCount,
      system.primaryStar,
      system.companionStars,
      system.habitableZone,
      system.metadata,
    );

    const created = db.prepare("SELECT * FROM systems WHERE systemId = ?").get(system.systemId);
    res.status(201).json(toSystem(created));
  }),
);

router.put(
  "/systems/:id",
  validateBody("system"),
  asyncHandler(async (req, res) => {
    if (req.body.systemId !== req.params.id) {
      throw new ApiError(400, "Body systemId must match route id");
    }

    const system = fromSystem(req.body);

    const result = db
      .prepare(
        `
        UPDATE systems
        SET sectorId = ?,
            hexCoordinates = ?,
            starCount = ?,
            primaryStar = ?,
            companionStars = ?,
            habitable_zone = ?,
            metadata = ?,
            lastModified = CURRENT_TIMESTAMP
        WHERE systemId = ?
      `,
      )
      .run(
        system.sectorId,
        system.hexCoordinates,
        system.starCount,
        system.primaryStar,
        system.companionStars,
        system.habitableZone,
        system.metadata,
        req.params.id,
      );

    if (result.changes === 0) {
      throw new ApiError(404, `System not found: ${req.params.id}`);
    }

    const updated = db.prepare("SELECT * FROM systems WHERE systemId = ?").get(req.params.id);
    res.json(toSystem(updated));
  }),
);

router.delete(
  "/systems/:id",
  asyncHandler(async (req, res) => {
    const result = db.prepare("DELETE FROM systems WHERE systemId = ?").run(req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `System not found: ${req.params.id}`);
    }

    res.status(204).send();
  }),
);

export default router;
