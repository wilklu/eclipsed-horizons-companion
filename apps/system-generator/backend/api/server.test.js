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

test("history routes persist saved historical archives", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "eh-api-test-"));
  const dbPath = join(tempDir, "universe.test.db");
  const port = 3113;
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

    const saved = await requestJson(baseUrl, "/histories/upsert", {
      method: "POST",
      body: JSON.stringify({
        id: "history-talara",
        civilizationName: "Talari Concord",
        worldName: "Talara",
        systemId: "012:0,0:0203",
        worldKey: "012:0,0:0203:Talara",
        overview: { "Historical Themes": "Political, Diplomatic" },
        events: [{ title: "Founding of Talara", yearsAgo: 2000 }],
        dynasties: [{ id: "dynasty-1", name: "House Vey" }],
        notablePeople: [{ name: "Corin Vey" }],
        familyTree: [{ id: "dynasty-1", links: [] }],
        context: { government: "Directorate", flashpoint: "succession blockade" },
        meta: { historyLength: "long", eraStart: 25000 },
      }),
    });

    assert.equal(saved.id, "history-talara");
    assert.equal(saved.civilizationName, "Talari Concord");

    const list = await requestJson(baseUrl, "/histories?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(Array.isArray(list), true);
    assert.equal(list.length, 1);
    assert.equal(list[0].worldName, "Talara");

    const fetched = await requestJson(baseUrl, "/histories/history-talara");
    assert.equal(fetched.meta.historyLength, "long");
    assert.equal(fetched.events[0].title, "Founding of Talara");

    await fetch(`${baseUrl}/histories/history-talara`, { method: "DELETE" });
    const listAfterDelete = await requestJson(baseUrl, "/histories?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(listAfterDelete.length, 0);
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

test("sophont routes persist generated species dossiers", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "eh-api-test-"));
  const dbPath = join(tempDir, "universe.test.db");
  const port = 3115;
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

    const saved = await requestJson(baseUrl, "/sophonts/upsert", {
      method: "POST",
      body: JSON.stringify({
        id: "sophont-talara",
        name: "Talari",
        systemId: "012:0,0:0203",
        worldName: "Talara",
        worldKey: "012:0,0:0203:Talara",
        bodyPlanSelection: "Humanoid",
        homeEnvironmentSelection: "Desert",
        civilization: { "Tech Level": 11 },
        biology: { "Body Plan": "Humanoid", "Home Environment": "Desert" },
      }),
    });

    assert.equal(saved.id, "sophont-talara");
    assert.equal(saved.worldName, "Talara");

    const list = await requestJson(baseUrl, "/sophonts?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(Array.isArray(list), true);
    assert.equal(list.length, 1);
    assert.equal(list[0].name, "Talari");

    const fetched = await requestJson(baseUrl, "/sophonts/sophont-talara");
    assert.equal(fetched.bodyPlanSelection, "Humanoid");

    await fetch(`${baseUrl}/sophonts/sophont-talara`, { method: "DELETE" });
    const listAfterDelete = await requestJson(baseUrl, "/sophonts?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(listAfterDelete.length, 0);
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

test("flora routes persist generated plant dossiers", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "eh-api-test-"));
  const dbPath = join(tempDir, "universe.test.db");
  const port = 3116;
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

    const saved = await requestJson(baseUrl, "/flora/upsert", {
      method: "POST",
      body: JSON.stringify({
        id: "flora-talara",
        name: "Mirror Reed",
        systemId: "012:0,0:0203",
        worldName: "Talara",
        worldKey: "012:0,0:0203:Talara",
        biology: { "Growth Form": "reed" },
        ecology: { Climate: "Desert oasis" },
        uses: { "Primary Use": "Medicine" },
      }),
    });

    assert.equal(saved.id, "flora-talara");
    assert.equal(saved.worldName, "Talara");

    const list = await requestJson(baseUrl, "/flora?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(Array.isArray(list), true);
    assert.equal(list.length, 1);
    assert.equal(list[0].name, "Mirror Reed");

    const fetched = await requestJson(baseUrl, "/flora/flora-talara");
    assert.equal(fetched.uses["Primary Use"], "Medicine");

    await fetch(`${baseUrl}/flora/flora-talara`, { method: "DELETE" });
    const listAfterDelete = await requestJson(baseUrl, "/flora?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(listAfterDelete.length, 0);
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

test("creature routes persist fauna dossiers and world bundles", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "eh-api-test-"));
  const dbPath = join(tempDir, "universe.test.db");
  const port = 3117;
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

    const savedCreature = await requestJson(baseUrl, "/creatures/upsert", {
      method: "POST",
      body: JSON.stringify({
        id: "creature-talara",
        name: "Glass Jackal",
        systemId: "012:0,0:0203",
        worldName: "Talara",
        worldKey: "012:0,0:0203:Talara",
        recordType: "creature",
        terrain: "Desert",
      }),
    });

    const savedBundle = await requestJson(baseUrl, "/creatures/upsert", {
      method: "POST",
      body: JSON.stringify({
        id: "bundle-talara",
        name: "Talara Bundle",
        systemId: "012:0,0:0203",
        worldName: "Talara",
        worldKey: "012:0,0:0203:Talara",
        recordType: "fauna-bundle",
        entries: [{ name: "Glass Jackal" }, { name: "Dune Grazer" }],
      }),
    });

    assert.equal(savedCreature.id, "creature-talara");
    assert.equal(savedBundle.recordType, "fauna-bundle");

    const creatures = await requestJson(
      baseUrl,
      "/creatures?systemId=012%3A0%2C0%3A0203&worldName=Talara&recordType=creature",
    );
    const bundles = await requestJson(
      baseUrl,
      "/creatures?systemId=012%3A0%2C0%3A0203&worldName=Talara&recordType=fauna-bundle",
    );
    assert.equal(creatures.length, 1);
    assert.equal(bundles.length, 1);
    assert.equal(bundles[0].entries.length, 2);

    await fetch(`${baseUrl}/creatures/creature-talara`, { method: "DELETE" });
    await fetch(`${baseUrl}/creatures/bundle-talara`, { method: "DELETE" });
    const listAfterDelete = await requestJson(baseUrl, "/creatures?systemId=012%3A0%2C0%3A0203&worldName=Talara");
    assert.equal(listAfterDelete.length, 0);
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
