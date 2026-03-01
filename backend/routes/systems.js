const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database connection
const dbPath = path.join(__dirname, "../database/eclipsed-horizon.db");
const db = new sqlite3.Database(dbPath);

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// GET all systems
router.get("/", (req, res) => {
  db.all("SELECT * FROM star_systems ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET single system
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM star_systems WHERE system_id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "System not found" });
      return;
    }
    res.json(row);
  });
});

// POST create system (placeholder - logic added in Sprint 4)
router.post("/", (req, res) => {
  res.status(501).json({ message: "Generator logic not implemented yet (Sprint 4)" });
});

// POST generate system (placeholder - logic added in Sprint 4)
router.post("/generate", (req, res) => {
  res.status(501).json({ message: "Generator logic not implemented yet (Sprint 4)" });
});

// DELETE system
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM star_systems WHERE system_id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "System deleted", id: id });
  });
});

module.exports = router;
