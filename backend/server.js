const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const systemRoutes = require("./routes/systems");

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// API routes
app.use("/api/systems", systemRoutes);

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
