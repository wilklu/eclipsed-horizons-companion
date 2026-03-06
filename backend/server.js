const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const systemRoutes = require("./routes/systems");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// API routes
app.use("/api/systems", systemRoutes);

// Serve Vue app - use app.use() instead of app.get("*")
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoints:`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/systems`);
  console.log(`  GET  /api/systems/:id`);
  console.log(`  POST /api/systems`);
  console.log(`  POST /api/systems/generate`);
  console.log(`  DELETE /api/systems/:id`);
});
