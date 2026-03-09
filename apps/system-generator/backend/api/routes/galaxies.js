import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromGalaxy, toGalaxy } from "../utils/entityMapper.js";

const router = Router();

router.get(
  "/galaxies",
  asyncHandler(async (req, res) => {
    const rows = db.prepare("SELECT * FROM galaxies ORDER BY createdAt DESC").all();
    res.json(rows.map(toGalaxy));
  }),
);

router.get(
  "/galaxies/:id",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(req.params.id);

    if (!row) {
      throw new ApiError(404, `Galaxy not found: ${req.params.id}`);
    }

    res.json(toGalaxy(row));
  }),
);

router.post(
  "/galaxies",
  validateBody("galaxy"),
  asyncHandler(async (req, res) => {
    const galaxy = fromGalaxy(req.body);

    db.prepare(
      `
      INSERT INTO galaxies (galaxyId, name, type, morphology, metadata, importMetadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(galaxy.galaxyId, galaxy.name, galaxy.type, galaxy.morphology, galaxy.metadata, galaxy.importMetadata);

    const created = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(galaxy.galaxyId);
    res.status(201).json(toGalaxy(created));
  }),
);

router.put(
  "/galaxies/:id",
  validateBody("galaxy"),
  asyncHandler(async (req, res) => {
    if (req.body.galaxyId !== req.params.id) {
      throw new ApiError(400, "Body galaxyId must match route id");
    }

    const galaxy = fromGalaxy(req.body);

    const result = db
      .prepare(
        `
        UPDATE galaxies
        SET name = ?,
            type = ?,
            morphology = ?,
            metadata = ?,
            importMetadata = ?,
            lastModified = CURRENT_TIMESTAMP
        WHERE galaxyId = ?
      `,
      )
      .run(galaxy.name, galaxy.type, galaxy.morphology, galaxy.metadata, galaxy.importMetadata, req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `Galaxy not found: ${req.params.id}`);
    }

    const updated = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(req.params.id);
    res.json(toGalaxy(updated));
  }),
);

router.delete(
  "/galaxies/:id",
  asyncHandler(async (req, res) => {
    const result = db.prepare("DELETE FROM galaxies WHERE galaxyId = ?").run(req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `Galaxy not found: ${req.params.id}`);
    }

    res.status(204).send();
  }),
);

export default router;
