import { Router } from "express";

import { db } from "../db.js";
import { ApiError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fromWorld, toWorld } from "../utils/entityMapper.js";

const router = Router();

router.get(
  "/systems/:sid/worlds",
  asyncHandler(async (req, res) => {
    const rows = db.prepare("SELECT * FROM worlds WHERE systemId = ? ORDER BY orbit ASC").all(req.params.sid);
    res.json(rows.map(toWorld));
  }),
);

router.get(
  "/worlds/:id",
  asyncHandler(async (req, res) => {
    const row = db.prepare("SELECT * FROM worlds WHERE worldId = ?").get(req.params.id);

    if (!row) {
      throw new ApiError(404, `World not found: ${req.params.id}`);
    }

    res.json(toWorld(row));
  }),
);

router.post(
  "/worlds",
  validateBody("world"),
  asyncHandler(async (req, res) => {
    const world = fromWorld(req.body);

    db.prepare(
      `
      INSERT INTO worlds (worldId, systemId, name, orbit, uwp, physical, census, tradeCodes, starport, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      world.worldId,
      world.systemId,
      world.name,
      world.orbit,
      world.uwp,
      world.physical,
      world.census,
      world.tradeCodes,
      world.starport,
      world.metadata,
    );

    const created = db.prepare("SELECT * FROM worlds WHERE worldId = ?").get(world.worldId);
    res.status(201).json(toWorld(created));
  }),
);

router.put(
  "/worlds/:id",
  validateBody("world"),
  asyncHandler(async (req, res) => {
    if (req.body.worldId !== req.params.id) {
      throw new ApiError(400, "Body worldId must match route id");
    }

    const world = fromWorld(req.body);

    const result = db
      .prepare(
        `
        UPDATE worlds
        SET systemId = ?,
            name = ?,
            orbit = ?,
            uwp = ?,
            physical = ?,
            census = ?,
            tradeCodes = ?,
            starport = ?,
            metadata = ?,
            lastModified = CURRENT_TIMESTAMP
        WHERE worldId = ?
      `,
      )
      .run(
        world.systemId,
        world.name,
        world.orbit,
        world.uwp,
        world.physical,
        world.census,
        world.tradeCodes,
        world.starport,
        world.metadata,
        req.params.id,
      );

    if (result.changes === 0) {
      throw new ApiError(404, `World not found: ${req.params.id}`);
    }

    const updated = db.prepare("SELECT * FROM worlds WHERE worldId = ?").get(req.params.id);
    res.json(toWorld(updated));
  }),
);

router.delete(
  "/worlds/:id",
  asyncHandler(async (req, res) => {
    const result = db.prepare("DELETE FROM worlds WHERE worldId = ?").run(req.params.id);

    if (result.changes === 0) {
      throw new ApiError(404, `World not found: ${req.params.id}`);
    }

    res.status(204).send();
  }),
);

export default router;
