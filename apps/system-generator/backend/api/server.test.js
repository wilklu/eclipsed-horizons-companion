import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const repoRoot = resolve(__dirname, "..", "..", "..", "..");
const serverEntry = join(repoRoot, "apps", "system-generator", "backend", "api", "server.js");

function wait(ms) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

async function waitForHealth(baseUrl, attempts = 40) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
      lastError = new Error(`Unexpected health status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(150);
  }
  throw lastError ?? new Error("Server health check timed out");
}

async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }
  return payload;
}

test("systems replace route persists Atlas-style system rows", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "eh-api-test-"));
  const dbPath = join(tempDir, "universe.test.db");
  const port = 3114;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const child = spawn(process.execPath, [serverEntry], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
      EH_DB_PATH: dbPath,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForHealth(baseUrl);

    const sector = await requestJson(baseUrl, "/sectors/upsert", {
      method: "POST",
      body: JSON.stringify({
        sectorId: "012:0,0",
        galaxyId: "012",
        coordinates: { x: 0, y: 0 },
        densityClass: 3,
        densityVariation: 30,
        metadata: {
          displayName: "Test Sector",
          gridX: 0,
          gridY: 0,
          occupiedHexes: ["0101", "0203"],
          hexStarTypes: {
            "0101": { starType: "G2V", starClass: "spectral-g", secondaryStars: [] },
            "0203": { starType: "K1V", starClass: "spectral-k", secondaryStars: ["M3V"] },
          },
          hexPresenceGenerated: true,
          systemCount: 2,
        },
      }),
    });

    assert.equal(sector.sectorId, "012:0,0");

    const replacedSystems = await requestJson(baseUrl, "/sectors/012%3A0%2C0/systems/replace", {
      method: "POST",
      body: JSON.stringify([
        {
          systemId: "012:0,0:0101",
          galaxyId: "012",
          sectorId: "012:0,0",
          hexCoordinates: { x: 1, y: 1 },
          starCount: 1,
          primaryStar: { spectralClass: "G2V" },
          companionStars: [],
          metadata: {
            generatedSurvey: {
              stars: [{ designation: "G2V", spectralType: "G2V", spectralClass: "G2V" }],
            },
            source: "atlas",
          },
        },
        {
          systemId: "012:0,0:0203",
          galaxyId: "012",
          sectorId: "012:0,0",
          hexCoordinates: { x: 2, y: 3 },
          starCount: 2,
          primaryStar: { spectralClass: "K1V" },
          companionStars: [{ spectralClass: "M3V" }],
          metadata: {
            generatedSurvey: {
              stars: [
                { designation: "K1V", spectralType: "K1V", spectralClass: "K1V" },
                { designation: "M3V", spectralType: "M3V", spectralClass: "M3V" },
              ],
            },
            source: "atlas",
          },
        },
      ]),
    });

    assert.equal(replacedSystems.length, 2);
    assert.deepEqual(
      replacedSystems.map((system) => system.systemId),
      ["012:0,0:0101", "012:0,0:0203"],
    );

    const sectorSystems = await requestJson(baseUrl, "/sectors/012%3A0%2C0/systems");
    assert.equal(sectorSystems.length, 2);
    assert.deepEqual(
      sectorSystems.map((system) => system.hexCoordinates),
      [
        { x: 1, y: 1 },
        { x: 2, y: 3 },
      ],
    );
    assert.equal(sectorSystems[0].metadata.source, "atlas");
    assert.equal(sectorSystems[1].companionStars[0].spectralClass, "M3V");

    const singleSystem = await requestJson(baseUrl, "/systems/012%3A0%2C0%3A0203");
    assert.equal(singleSystem.systemId, "012:0,0:0203");
    assert.equal(singleSystem.galaxyId, "012");
    assert.equal(singleSystem.primaryStar.spectralClass, "K1V");
  } finally {
    child.kill();
    await new Promise((resolvePromise) => {
      child.once("exit", () => resolvePromise());
      setTimeout(resolvePromise, 1000);
    });
    rmSync(tempDir, { recursive: true, force: true });
    if (stderr.trim()) {
      assert.equal(stderr.trim(), "", stderr.trim());
    }
  }
});
