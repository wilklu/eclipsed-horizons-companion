import cors from "cors";
import express from "express";
import morgan from "morgan";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { db, getDbPath } from "./db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import galaxiesRouter from "./routes/galaxies.js";
import sectorsRouter from "./routes/sectors.js";
import systemsRouter from "./routes/systems.js";
import worldsRouter from "./routes/worlds.js";
import sophontsRouter from "./routes/sophonts.js";
import importExportRouter from "./routes/importExport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const docsDir = join(__dirname, "docs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "system-generator-api",
    dbPath: getDbPath(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/docs", (req, res) => {
  res.sendFile(join(docsDir, "swagger-ui.html"));
});

app.get("/api/openapi.yaml", (req, res) => {
  res.type("application/yaml");
  res.sendFile(join(docsDir, "openapi.yaml"));
});

app.use("/api", galaxiesRouter);
app.use("/api", sectorsRouter);
app.use("/api", systemsRouter);
app.use("/api", worldsRouter);
app.use("/api", sophontsRouter);
app.use("/api", importExportRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 3100);
app.listen(port, () => {
  db.pragma("foreign_keys = ON");
  console.log(`System Generator API listening on http://localhost:${port}`);
});

export default app;
