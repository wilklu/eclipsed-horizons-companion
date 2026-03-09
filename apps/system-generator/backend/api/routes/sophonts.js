import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromSophont, toSophont } from "../utils/entityMapper.js";

const router = Router();

router.get(
  "/worlds/:wid/sophonts",
  asyncHandler(async (req, res) => {
    const rows = db.prepare("SELECT * FROM sophonts WHERE worldId = ? ORDER BY createdAt DESC").all(req.params.wid);
    res.json(rows.map(toSophont));
  }),
);

router.get(
  "/sophonts/:id",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM sophonts WHERE sophontId = ?").get(req.params.id);

    if (!row) {
      throw new ApiError(404, `Sophont not found: ${req.params.id}`);
    }

    res.json(toSophont(row));
  }),
);

router.post(
  "/sophonts",
  validateBody("sophont"),
  asyncHandler(async (req, res) => {
    const sophont = fromSophont(req.body);

    db.prepare(
      `
      INSERT INTO sophonts (sophontId, worldId, name, bodyPlan, culture, population, techLevel, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      sophont.sophontId,
      sophont.worldId,
      sophont.name,
      sophont.bodyPlan,
      sophont.culture,
      sophont.population,
      sophont.techLevel,
      sophont.metadata,
    );

    const created = db.prepare("SELECT * FROM sophonts WHERE sophontId = ?").get(sophont.sophontId);
    res.status(201).json(toSophont(created));
  }),
);

router.put(
  "/sophonts/:id",
  validateBody("sophont"),
  asyncHandler(async (req, res) => {
    if (req.body.sophontId !== req.params.id) {
      throw new ApiError(400, "Body sophontId must match route id");
    }

    const sophont = fromSophont(req.body);

    const result = db
      .prepare(
        `
        UPDATE sophonts
        SET worldId = ?,
            name = ?,
            bodyPlan = ?,
            culture = ?,
            population = ?,
            techLevel = ?,
            metadata = ?,
            lastModified = CURRENT_TIMESTAMP
        WHERE sophontId = ?
      `,
      )
      .run(
        sophont.worldId,
        sophont.name,
        sophont.bodyPlan,
        sophont.culture,
        sophont.population,
        sophont.techLevel,
        sophont.metadata,
        req.params.id,
      );

    if (result.changes === 0) {
      throw new ApiError(404, `Sophont not found: ${req.params.id}`);
    }

    const updated = db.prepare("SELECT * FROM sophonts WHERE sophontId = ?").get(req.params.id);
    res.json(toSophont(updated));
  }),
);

router.delete(
  "/sophonts/:id",
  asyncHandler(async (req, res) => {
    const result = db.prepare("DELETE FROM sophonts WHERE sophontId = ?").run(req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `Sophont not found: ${req.params.id}`);
    }

    res.status(204).send();
  }),
);

export default router;
