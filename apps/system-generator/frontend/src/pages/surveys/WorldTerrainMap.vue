<template>
  <div class="terrain-page">
    <div class="terrain-shell">
      <header class="terrain-header">
        <h1>World Terrain Map</h1>
        <router-link v-if="backRoute" :to="backRoute" class="back-link">← Back</router-link>
      </header>

      <section class="info-panel">
        <div class="info-column">
          <h2>World Information</h2>
          <dl class="info-grid">
            <div class="info-row">
              <dt>Name</dt>
              <dd>{{ worldInfo?.name || "Unknown World" }}</dd>
            </div>
            <div class="info-row">
              <dt>UWP</dt>
              <dd>{{ worldInfo?.uwp || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Size</dt>
              <dd>{{ worldInfo?.size || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Atmosphere</dt>
              <dd>{{ worldInfo?.atmosphere || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Hydrographics</dt>
              <dd>{{ worldInfo?.hydrographics || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Population</dt>
              <dd>{{ worldInfo?.population || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Resources</dt>
              <dd>{{ worldInfo?.resourceRating || "—" }}</dd>
            </div>
          </dl>
        </div>

        <div class="info-column">
          <h2>System Data</h2>
          <dl class="info-grid">
            <div class="info-row">
              <dt>System</dt>
              <dd>{{ systemInfo?.systemName || "Unknown System" }}</dd>
            </div>
            <div class="info-row">
              <dt>Hex</dt>
              <dd>{{ systemInfo?.hex || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Primary Star</dt>
              <dd>{{ systemInfo?.primaryStar || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Orbit</dt>
              <dd>{{ systemInfo?.orbit || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Zone</dt>
              <dd>{{ systemInfo?.zone || "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>GG / Belts</dt>
              <dd>{{ systemInfo?.gasGiants ?? "—" }} / {{ systemInfo?.belts ?? "—" }}</dd>
            </div>
            <div class="info-row">
              <dt>Resource Hexes</dt>
              <dd>{{ resourceHexCount }}</dd>
            </div>
            <div class="info-row">
              <dt>Map Profile</dt>
              <dd>{{ mapProfileLabel }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="map-panel">
        <div class="map-meta">
          <span>External SVG template rendering</span>
          <span>Template size {{ activeTerrainTemplateSize }} ({{ templateStatusLabel }})</span>
        </div>

        <div class="map-controls">
          <button
            type="button"
            class="map-button"
            @click="generateTerrain"
            :disabled="!(activeHexCells?.length ?? 0) || isAnimating"
          >
            Generate Terrain
          </button>
          <button
            type="button"
            class="map-button map-button-accent"
            @click="animateGeneration"
            :disabled="!(activeHexCells?.length ?? 0) || isAnimating"
          >
            {{ isAnimating ? animationStepLabel : "Walk Through Generation" }}
          </button>
          <button
            type="button"
            class="map-button map-button-secondary"
            @click="rollStarterTriangle"
            :disabled="isAnimating"
          >
            Roll d46 Start Triangle
          </button>
          <button type="button" class="map-button map-button-secondary" @click="rollStarterHexInTriangle">
            Roll Random Hex in Triangle
          </button>
          <button type="button" class="map-button map-button-secondary" @click="clearWaterHexes">Clear Water</button>
          <span class="map-controls-note">Target water: {{ Math.round(hydroTargetRatio * 100) }}%</span>
          <span class="map-controls-note" v-if="starterTriangleResultLabel">{{ starterTriangleResultLabel }}</span>
          <span class="map-controls-note" v-if="starterHexResultLabel">{{ starterHexResultLabel }}</span>
          <span class="map-controls-note">Mountains: {{ activeMountainHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Chasms: {{ activeChasmHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Precipices: {{ activePrecipiceHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="isDieBackWorld">Ruins: {{ activeRuinHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="resourceHexCount > 0"
            >Resource Hexes: {{ resourceHexCount }} ({{ activeResourceHexEntries?.length ?? 0 }} placed)</span
          >
        </div>
        <svg
          id="blankMapSVG"
          class="terrain-map"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xml:space="preserve"
          height="100%"
          width="100%"
          :viewBox="activeViewBox"
          @click="handleMapClick"
          style="cursor: crosshair"
        >
          <g v-if="activeTemplateContent" id="terrain-template-loaded" v-html="activeTemplateContent"></g>
          <g v-else id="terrain-template-missing">
            <text style="font-size: 1em; font-family: Arial, sans-serif; fill: black" x="40" y="90">
              No external map template found for size {{ activeTerrainTemplateSize }}.
            </text>
            <text style="font-size: 0.95em; font-family: Arial, sans-serif; fill: #444" x="40" y="120">
              Expected file: {{ expectedTemplateFilename }}
            </text>
          </g>

          <g id="starter-triangle-overlay" pointer-events="none" v-if="activeStarterTrianglePoints">
            <polygon
              :points="activeStarterTrianglePoints"
              fill="rgba(255, 208, 0, 0.18)"
              stroke="#d18900"
              stroke-width="2"
              stroke-dasharray="8 4"
            />
          </g>

          <g id="starter-hex-overlay" pointer-events="none" v-if="activeStarterHexPick">
            <circle
              :cx="activeStarterHexPick.cx"
              :cy="activeStarterHexPick.cy"
              r="6"
              fill="#ffd300"
              stroke="#8a5a00"
              stroke-width="2"
            />
          </g>

          <g id="water-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeWaterHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgb(65,103,183)"
              stroke="black"
              stroke-width="1"
            />
          </g>

          <g id="resource-hex-overlay" pointer-events="none">
            <g v-for="entry in activeResourceHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(34, 139, 34, 0.35)" stroke="#145214" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#145214"
                style="pointer-events: none; user-select: none"
              >
                R
              </text>
            </g>
          </g>

          <g id="mountain-hex-overlay" pointer-events="none">
            <g v-for="entry in activeMountainHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(122, 94, 63, 0.35)" stroke="#5c4125" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#4a321b"
                style="pointer-events: none; user-select: none"
              >
                M
              </text>
            </g>
          </g>

          <g id="chasm-hex-overlay" pointer-events="none">
            <g v-for="entry in activeChasmHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(121, 66, 159, 0.33)" stroke="#5d2f80" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#3f1f57"
                style="pointer-events: none; user-select: none"
              >
                C
              </text>
            </g>
          </g>

          <g id="precipice-hex-overlay" pointer-events="none">
            <g v-for="entry in activePrecipiceHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(201, 84, 50, 0.32)" stroke="#8b2f16" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#5a1d0d"
                style="pointer-events: none; user-select: none"
              >
                P
              </text>
            </g>
          </g>

          <g id="ruin-hex-overlay" pointer-events="none">
            <g v-for="entry in activeRuinHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(90, 90, 90, 0.35)" stroke="#333333" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#1f1f1f"
                style="pointer-events: none; user-select: none"
              >
                Ru
              </text>
            </g>
          </g>
        </svg>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import { useSystemStore } from "../../stores/systemStore.js";
import {
  normalizeFaceTopologyId,
  pickRandomHexInTriangle,
  resolveStarterTriangle,
  rollD46,
} from "../../utils/worldTerrainStartTriangle.js";
import { canonicalizeHexId } from "../../utils/worldMapHexTopology.js";
const route = useRoute();
const systemStore = useSystemStore();

const RAW_MAP_MODULES = import.meta.glob("../../assets/maps/*.svg", {
  query: "?raw",
  import: "default",
});

const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }
  return { name: "WorldBuilder", params: { systemId: String(route.params.systemId || "") }, query: { ...route.query } };
});

function normalizeSystemHex(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
}

const selectedWorldIndex = computed(() => {
  const parsed = Number.parseInt(String(route.params.worldIndex || route.query.worldIndex || ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
});

const boundSystem = computed(() => {
  const explicitRecordId = String(route.query.systemRecordId || "").trim();
  if (explicitRecordId) {
    return systemStore.systems.find((entry) => String(entry?.systemId) === explicitRecordId) ?? null;
  }

  const routeSystemHex = normalizeSystemHex(route.params.systemId || route.query.systemId || "");
  const currentSystem = systemStore.getCurrentSystem;
  if (currentSystem) {
    const currentSystemHex = normalizeSystemHex(
      `${currentSystem.hexCoordinates?.x || ""}${currentSystem.hexCoordinates?.y || ""}`,
    );
    if (
      !routeSystemHex ||
      currentSystemHex === routeSystemHex ||
      String(currentSystem.systemId || "").endsWith(`:${routeSystemHex}`)
    ) {
      return currentSystem;
    }
  }

  if (!routeSystemHex) {
    return null;
  }

  return (
    systemStore.systems.find((entry) => {
      const entryHex = normalizeSystemHex(`${entry?.hexCoordinates?.x ?? ""}${entry?.hexCoordinates?.y ?? ""}`);
      return entryHex === routeSystemHex || String(entry?.systemId || "").endsWith(`:${routeSystemHex}`);
    }) ?? null
  );
});

const selectedWorld = computed(() => {
  if (selectedWorldIndex.value === null) {
    return null;
  }
  if (!boundSystem.value || !Array.isArray(boundSystem.value.planets)) {
    return null;
  }
  return boundSystem.value.planets[selectedWorldIndex.value] ?? null;
});

const DEFAULT_WORLD_INFO = Object.freeze({
  name: "Unknown World",
  uwp: "—",
  size: "—",
  atmosphere: "—",
  hydrographics: "—",
  population: "—",
  resourceRating: "—",
});

const worldInfo = computed(() => {
  const world = selectedWorld.value;
  if (!world && !route.query.worldName && !route.query.resourceRating) {
    return DEFAULT_WORLD_INFO;
  }

  return {
    name: String(world?.name || route.query.worldName || DEFAULT_WORLD_INFO.name),
    uwp: String(world?.uwp || DEFAULT_WORLD_INFO.uwp),
    size: String(world?.size ?? DEFAULT_WORLD_INFO.size),
    atmosphere: String(world?.atmosphereDesc || world?.atmosphere || DEFAULT_WORLD_INFO.atmosphere),
    hydrographics: String(world?.hydrographics ?? world?.hydro ?? DEFAULT_WORLD_INFO.hydrographics),
    population: String(world?.population ?? DEFAULT_WORLD_INFO.population),
    resourceRating: String(
      world?.economics?.resourceRating ||
        world?.resourceRating ||
        boundSystem.value?.resourceRating ||
        route.query.resourceRating ||
        DEFAULT_WORLD_INFO.resourceRating,
    ),
  };
});

const systemInfo = computed(() => {
  const system = boundSystem.value;
  const world = selectedWorld.value;

  const x = boundSystem.value?.hexCoordinates?.x;
  const y = boundSystem.value?.hexCoordinates?.y;
  const hex =
    Number.isFinite(Number(x)) && Number.isFinite(Number(y))
      ? `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`
      : String(route.query.hex || "—");

  const primaryStar =
    String(system?.primaryStar?.spectralClass || "").trim() ||
    String(system?.stars?.[0]?.spectralClass || "").trim() ||
    String(route.query.star || "—");

  const ggRaw = system?.gasGiants ?? system?.objectCounts?.gasGiants ?? null;
  const beltsRaw = system?.belts ?? system?.objectCounts?.belts ?? system?.objectCounts?.planetoidBelts ?? null;

  return {
    systemName: String(system?.name || system?.systemName || route.query.systemName || "Unknown System"),
    hex,
    primaryStar,
    orbit: String(world?.orbitAU ?? route.query.orbitAU ?? "—"),
    zone: String(world?.zone || route.query.zone || "—"),
    gasGiants: ggRaw !== null && ggRaw !== undefined ? Number(ggRaw) || 0 : "—",
    belts: beltsRaw !== null && beltsRaw !== undefined ? Number(beltsRaw) || 0 : "—",
  };
});

const mapProfileLabel = computed(() => "External SVG templates");

const TRAVELLER_EXTENDED_HEX = new Map([
  ["A", 10],
  ["B", 11],
  ["C", 12],
  ["D", 13],
  ["E", 14],
  ["F", 15],
  ["G", 16],
  ["H", 17],
  ["J", 18],
  ["K", 19],
  ["L", 20],
  ["M", 21],
  ["N", 22],
  ["P", 23],
  ["Q", 24],
  ["R", 25],
  ["S", 26],
  ["T", 27],
  ["U", 28],
  ["V", 29],
  ["W", 30],
  ["X", 31],
  ["Y", 32],
  ["Z", 33],
]);

function parseWorldSizeCode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/^[A-Z]$/.test(normalized)) {
    if (TRAVELLER_EXTENDED_HEX.has(normalized)) {
      return TRAVELLER_EXTENDED_HEX.get(normalized);
    }
    return null;
  }

  if (/^[0-9]$/.test(normalized)) {
    return Number.parseInt(normalized, 10);
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  return null;
}

const activeTerrainTemplateSize = computed(() => {
  const sizeFromWorld = parseWorldSizeCode(selectedWorld.value?.size);
  if (sizeFromWorld !== null) {
    return sizeFromWorld;
  }

  const sizeFromRoute = parseWorldSizeCode(route.query.size);
  if (sizeFromRoute !== null) {
    return sizeFromRoute;
  }

  return 5;
});

function buildTemplateFilename(size) {
  return `Blank World Map Size ${size}.svg`;
}

const expectedTemplateFilename = computed(() => buildTemplateFilename(activeTerrainTemplateSize.value));

function parseSvgTemplate(rawSvg) {
  if (!rawSvg) {
    return { viewBox: "0 0 1066 998", content: "" };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) {
    return { viewBox: "0 0 1066 998", content: rawSvg };
  }

  return {
    viewBox: svgEl.getAttribute("viewBox") || "0 0 1066 998",
    content: svgEl.innerHTML || "",
  };
}

const activeViewBox = ref("0 0 1066 998");
const activeTemplateContent = ref("");
const templateStatusLabel = ref("loading");
let templateLoadRequestId = 0;

async function loadTemplateForSize(size) {
  const requestId = ++templateLoadRequestId;
  templateStatusLabel.value = "loading";

  const filename = buildTemplateFilename(size);
  const moduleKey = `../../assets/maps/${filename}`;
  const loadRawSvg = RAW_MAP_MODULES[moduleKey];

  if (!loadRawSvg) {
    if (requestId !== templateLoadRequestId) {
      return;
    }
    activeTemplateContent.value = "";
    activeViewBox.value = "0 0 1066 998";
    templateStatusLabel.value = "missing";
    return;
  }

  try {
    const rawSvg = await loadRawSvg();
    if (requestId !== templateLoadRequestId) {
      return;
    }

    const parsed = parseSvgTemplate(rawSvg);
    activeTemplateContent.value = parsed.content;
    activeViewBox.value = parsed.viewBox;
    templateStatusLabel.value = parsed.content ? "loaded" : "missing";
  } catch {
    if (requestId !== templateLoadRequestId) {
      return;
    }
    activeTemplateContent.value = "";
    activeViewBox.value = "0 0 1066 998";
    templateStatusLabel.value = "missing";
  }
}

watch(
  activeTerrainTemplateSize,
  (size) => {
    void loadTemplateForSize(size);
  },
  { immediate: true },
);

const waterHexesBySize = ref(new Map());

const activeWaterHexEntries = computed(() => {
  const mapForSize = waterHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) {
    return [];
  }

  return Array.from(mapForSize.entries()).map(([key, points]) => ({ key, points }));
});

function normalizePoints(points) {
  return String(points || "")
    .trim()
    .replace(/\s+/g, " ");
}

function parsePoints(points) {
  return normalizePoints(points)
    .split(" ")
    .map((pair) => pair.split(",").map(Number))
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
}

function centroid(points) {
  const coords = parsePoints(points);
  if (!coords.length) {
    return { x: 0, y: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of coords) {
    sumX += x;
    sumY += y;
  }

  return { x: sumX / coords.length, y: sumY / coords.length };
}

function extractHexCells(templateContent) {
  if (!templateContent) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg>${templateContent}</svg>`, "image/svg+xml");
  const polys = Array.from(doc.querySelectorAll("polygon"));

  return polys
    .map((poly) => {
      const points = normalizePoints(poly.getAttribute("points"));
      if (!points) {
        return null;
      }

      const coords = parsePoints(points);
      if (coords.length !== 6) {
        return null;
      }

      const style = String(poly.getAttribute("style") || "").toLowerCase();
      if (style.includes("fill: white") || style.includes("fill:white") || style.includes("stroke: none")) {
        return null;
      }

      const logicalHexId = String(poly.getAttribute("data-logical-hex-id") || "").trim();
      const hexId = String(poly.getAttribute("data-hex-id") || poly.getAttribute("hex-id") || "").trim();
      const canonicalHexId = canonicalizeHexId(logicalHexId || hexId);
      const c = centroid(points);
      return {
        key: canonicalHexId || points,
        hexId,
        canonicalHexId,
        points,
        cx: c.x,
        cy: c.y,
      };
    })
    .filter(Boolean);
}

function extractFaceTriangles(templateContent) {
  if (!templateContent) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg>${templateContent}</svg>`, "image/svg+xml");
  const polys = Array.from(doc.querySelectorAll("polygon[face-id]"));

  return polys
    .map((poly) => {
      const faceId = String(poly.getAttribute("face-id") || "").trim();
      const points = normalizePoints(poly.getAttribute("points"));
      const coords = parsePoints(points);
      if (!faceId || coords.length !== 3) {
        return null;
      }

      return {
        faceId,
        points,
        vertices: coords,
      };
    })
    .filter(Boolean);
}

function isPointInTriangle(px, py, vertices) {
  const [[x1, y1], [x2, y2], [x3, y3]] = vertices;
  const denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  if (!Number.isFinite(denom) || Math.abs(denom) < 1e-8) {
    return false;
  }

  const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denom;
  const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denom;
  const c = 1 - a - b;

  return a >= -1e-6 && b >= -1e-6 && c >= -1e-6;
}

const activeFaceTriangles = computed(() => extractFaceTriangles(activeTemplateContent.value));
const activeFaceIds = computed(() => [...new Set(activeFaceTriangles.value.map((face) => face.faceId))]);

const activeHexCells = computed(() => {
  const baseHexes = extractHexCells(activeTemplateContent.value);
  const faces = activeFaceTriangles.value;
  if (!baseHexes.length || !faces.length) {
    return baseHexes;
  }

  return baseHexes.map((hex) => {
    const matchedFace = faces.find((face) => isPointInTriangle(hex.cx, hex.cy, face.vertices));
    return {
      ...hex,
      faceId: matchedFace?.faceId || null,
    };
  });
});

const starterTriangleRoll = ref(null);
const starterHexPick = ref(null);

const activeStarterTrianglePoints = computed(() => {
  const resolvedFaceId = String(starterTriangleRoll.value?.resolvedFaceId || "").trim();
  if (!resolvedFaceId) {
    return "";
  }

  return activeFaceTriangles.value.find((face) => face.faceId === resolvedFaceId)?.points || "";
});

const starterTriangleResultLabel = computed(() => {
  const roll = starterTriangleRoll.value;
  if (!roll?.resolvedFaceId) {
    return "";
  }

  return `Start Triangle: ${roll.resolvedFaceId} (d46 ${roll.roll})`;
});

const activeStarterHexPick = computed(() => {
  const targetKey = String(starterHexPick.value?.key || "").trim();
  if (!targetKey) {
    return null;
  }

  return activeHexCells.value.find((entry) => String(entry?.key || "") === targetKey) || null;
});

const starterHexResultLabel = computed(() => {
  const pick = activeStarterHexPick.value;
  if (!pick) {
    return "";
  }

  return `Start Hex: ${pick.hexId || pick.key}`;
});

function rollStarterTriangle() {
  const rolled = rollD46();
  const resolvedFaceId = resolveStarterTriangle(rolled.faceId, activeFaceIds.value);
  starterTriangleRoll.value = {
    ...rolled,
    resolvedFaceId,
  };
  starterHexPick.value = null;
  rollStarterHexInTriangle();
}

function rollStarterHexInTriangle() {
  const resolvedFaceId = String(starterTriangleRoll.value?.resolvedFaceId || "").trim();
  if (!resolvedFaceId) {
    starterHexPick.value = null;
    return;
  }

  starterHexPick.value = pickRandomHexInTriangle(activeHexCells.value, resolvedFaceId);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseHydrographicsToRatio(value) {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!raw || raw === "—") {
    return 0.5;
  }

  const exactInt = Number.parseInt(raw, 10);
  if (Number.isFinite(exactInt) && String(exactInt) === raw) {
    return clamp(exactInt / 10, 0, 1);
  }

  const token = raw.match(/[0-9A-F]/)?.[0];
  if (!token) {
    return 0.5;
  }

  const score = /^[0-9]$/.test(token) ? Number.parseInt(token, 10) : 10;
  return clamp(score / 10, 0, 1);
}

const hydroTargetRatio = computed(() => parseHydrographicsToRatio(worldInfo.value.hydrographics));

const TRAVELLER_PSEUDO_HEX = new Map([
  ["A", 10],
  ["B", 11],
  ["C", 12],
  ["D", 13],
  ["E", 14],
  ["F", 15],
]);

function parseResourceRatingToNumber(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw || raw === "—") return null;

  // Numeric first
  const asInt = Number.parseInt(raw, 10);
  if (Number.isFinite(asInt) && String(asInt) === raw) return Math.max(2, Math.min(12, asInt));

  // Pseudo-hex letter (A–F = 10–15, capped at 12)
  if (TRAVELLER_PSEUDO_HEX.has(raw)) return Math.min(12, TRAVELLER_PSEUDO_HEX.get(raw));

  // Descriptive strings — use representative mid-range numeric
  switch (raw) {
    case "NONE":
      return 2;
    case "SCARCE":
      return 3;
    case "SPARSE":
      return 4;
    case "MODERATE":
      return 7;
    case "GOOD":
      return 9;
    case "ABUNDANT":
      return 11;
    case "RICH":
      return 12;
    default:
      return null;
  }
}

const resourceHexCount = computed(() => {
  const rating = parseResourceRatingToNumber(worldInfo.value.resourceRating);
  if (rating === null) return 0;
  const gg = typeof systemInfo.value.gasGiants === "number" ? systemInfo.value.gasGiants : 0;
  const belts = typeof systemInfo.value.belts === "number" ? systemInfo.value.belts : 0;
  return Math.max(0, rating - gg - belts);
});

const resourceHexesBySize = ref(new Map());
const mountainHexesBySize = ref(new Map());
const chasmHexesBySize = ref(new Map());
const precipiceHexesBySize = ref(new Map());
const ruinHexesBySize = ref(new Map());

const worldTradeCodes = computed(() => {
  const fromWorld = Array.isArray(selectedWorld.value?.tradeCodes) ? selectedWorld.value.tradeCodes : [];
  const fromRouteRaw = String(route.query.tradeCodes || route.query.tradeCode || "");
  const fromRoute = fromRouteRaw
    .split(/[\s,|/]+/)
    .map((token) => String(token || "").trim())
    .filter(Boolean);

  return [
    ...new Set(
      [...fromWorld, ...fromRoute].map((token) =>
        String(token || "")
          .trim()
          .toUpperCase(),
      ),
    ),
  ];
});

const isDieBackWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "DI" || explicit === "DIE-BACK" || explicit === "DIEBACK") {
    return true;
  }
  return worldTradeCodes.value.includes("DI");
});

const activeMountainHexEntries = computed(() => {
  const mapForSize = mountainHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

const activeChasmHexEntries = computed(() => {
  const mapForSize = chasmHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

const activePrecipiceHexEntries = computed(() => {
  const mapForSize = precipiceHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

const activeRuinHexEntries = computed(() => {
  const mapForSize = ruinHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

watch(
  activeFaceIds,
  () => {
    rollStarterTriangle();
    placeMountainHexes();
    placeChasmHexes();
    placePrecipiceHexes();
    placeRuinHexes();
    placeResourceHexes();
  },
  { immediate: true },
);

watch(resourceHexCount, () => {
  placeResourceHexes();
});

watch(isDieBackWorld, () => {
  placeRuinHexes();
});

const activeResourceHexEntries = computed(() => {
  const mapForSize = resourceHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

function placeResourceHexes(rng = Math.random) {
  const count = resourceHexCount.value;
  const cells = activeHexCells.value;
  if (count === 0 || !cells.length) {
    const nextBySize = new Map(resourceHexesBySize.value);
    nextBySize.delete(activeTerrainTemplateSize.value);
    resourceHexesBySize.value = nextBySize;
    return;
  }

  // Group hex cells by triangle faceId
  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const faceIds = [...byFace.keys()];
  if (!faceIds.length) return;

  // Shuffle face order so distribution is unbiased
  for (let i = faceIds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [faceIds[i], faceIds[j]] = [faceIds[j], faceIds[i]];
  }

  const placed = new Map();
  for (let i = 0; i < count; i++) {
    const faceId = faceIds[i % faceIds.length];
    const eligible = (byFace.get(faceId) || []).filter((c) => !placed.has(c.key));
    if (!eligible.length) continue;
    const pick = eligible[Math.floor(rng() * eligible.length)];
    placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
  }

  const nextBySize = new Map(resourceHexesBySize.value);
  nextBySize.set(activeTerrainTemplateSize.value, placed);
  resourceHexesBySize.value = nextBySize;
}

function placeMountainHexes(rng = Math.random) {
  const cells = activeHexCells.value;
  if (!cells.length) {
    const nextBySize = new Map(mountainHexesBySize.value);
    nextBySize.delete(activeTerrainTemplateSize.value);
    mountainHexesBySize.value = nextBySize;
    return;
  }

  const size = activeTerrainTemplateSize.value;

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const placed = new Map();
  for (const faceCells of byFace.values()) {
    if (!faceCells.length) continue;

    const target = Math.min(faceCells.length, 1 + Math.floor(rng() * 6));
    const pool = [...faceCells];

    for (let i = 0; i < target && pool.length; i += 1) {
      const pickIndex = Math.floor(rng() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    }
  }

  const nextBySize = new Map(mountainHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  mountainHexesBySize.value = nextBySize;
}

function placeChasmHexes(rng = Math.random) {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const worldSize = Math.max(0, Number(size) || 0);

  if (!cells.length || worldSize <= 0) {
    const nextBySize = new Map(chasmHexesBySize.value);
    nextBySize.delete(size);
    chasmHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const placed = new Map();
  for (const faceCells of byFace.values()) {
    if (!faceCells.length) continue;

    let target = 0;
    for (let setIndex = 0; setIndex < worldSize; setIndex += 1) {
      target += 1 + Math.floor(rng() * 6);
    }

    target = Math.min(target, faceCells.length);
    const pool = [...faceCells];
    for (let i = 0; i < target && pool.length; i += 1) {
      const pickIndex = Math.floor(rng() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    }
  }

  const nextBySize = new Map(chasmHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  chasmHexesBySize.value = nextBySize;
}

function placePrecipiceHexes(rng = Math.random) {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const worldSize = Math.max(0, Number(size) || 0);

  if (!cells.length || worldSize <= 0) {
    const nextBySize = new Map(precipiceHexesBySize.value);
    nextBySize.delete(size);
    precipiceHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const placed = new Map();
  for (const faceCells of byFace.values()) {
    if (!faceCells.length) continue;

    const target = Math.min(worldSize, faceCells.length);
    const pool = [...faceCells];
    for (let i = 0; i < target && pool.length; i += 1) {
      const pickIndex = Math.floor(rng() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    }
  }

  const nextBySize = new Map(precipiceHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  precipiceHexesBySize.value = nextBySize;
}

function placeRuinHexes(rng = Math.random) {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!isDieBackWorld.value || !cells.length) {
    const nextBySize = new Map(ruinHexesBySize.value);
    nextBySize.delete(size);
    ruinHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const placed = new Map();
  for (const faceCells of byFace.values()) {
    if (!faceCells.length) continue;

    const target = Math.min(faceCells.length, 1 + Math.floor(rng() * 6));
    const pool = [...faceCells];
    for (let i = 0; i < target && pool.length; i += 1) {
      const pickIndex = Math.floor(rng() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    }
  }

  const nextBySize = new Map(ruinHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  ruinHexesBySize.value = nextBySize;
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clearWaterHexes() {
  const nextBySize = new Map(waterHexesBySize.value);
  nextBySize.delete(activeTerrainTemplateSize.value);
  waterHexesBySize.value = nextBySize;
  placeMountainHexes();
  placeChasmHexes();
  placePrecipiceHexes();
  placeRuinHexes();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const isAnimating = ref(false);
const animationStepLabel = ref("");

async function animateGeneration() {
  const cells = activeHexCells.value;
  if (!cells.length || isAnimating.value) return;

  isAnimating.value = true;

  // Step 1: clear everything so we start fresh
  animationStepLabel.value = "Clearing…";
  clearWaterHexes();
  starterTriangleRoll.value = null;
  starterHexPick.value = null;
  const nextResource = new Map(resourceHexesBySize.value);
  nextResource.delete(activeTerrainTemplateSize.value);
  resourceHexesBySize.value = nextResource;
  const nextMountains = new Map(mountainHexesBySize.value);
  nextMountains.delete(activeTerrainTemplateSize.value);
  mountainHexesBySize.value = nextMountains;
  const nextChasms = new Map(chasmHexesBySize.value);
  nextChasms.delete(activeTerrainTemplateSize.value);
  chasmHexesBySize.value = nextChasms;
  const nextPrecipices = new Map(precipiceHexesBySize.value);
  nextPrecipices.delete(activeTerrainTemplateSize.value);
  precipiceHexesBySize.value = nextPrecipices;
  const nextRuins = new Map(ruinHexesBySize.value);
  nextRuins.delete(activeTerrainTemplateSize.value);
  ruinHexesBySize.value = nextRuins;
  await sleep(400);

  // Step 2: roll and show the starter triangle
  animationStepLabel.value = "Rolling starter triangle…";
  rollStarterTriangle();
  await sleep(900);

  // Step 3: pick and show the starter hex
  animationStepLabel.value = "Picking starter hex…";
  rollStarterHexInTriangle();
  await sleep(900);

  // Step 4: score all hexes exactly as generateTerrain does
  animationStepLabel.value = "Scoring hexes…";
  const starterFaceId = String(starterTriangleRoll.value?.resolvedFaceId || "").trim();
  const starterHexKey = String(starterHexPick.value?.key || "").trim();
  const targetCount = clamp(Math.round(cells.length * hydroTargetRatio.value), 0, cells.length);

  if (targetCount === 0) {
    isAnimating.value = false;
    animationStepLabel.value = "";
    return;
  }

  const ys = cells.map((c) => c.cy);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = Math.max(1, maxY - minY);
  const yMid = (minY + maxY) / 2;
  const seed = hashString(
    `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}`,
  );
  const rand = mulberry32(seed);
  const ranked = cells
    .map((cell) => {
      const latNorm = Math.abs(cell.cy - yMid) / (yRange / 2);
      const equatorBias = 1 - clamp(latNorm, 0, 1);
      const starterBias =
        starterFaceId && normalizeFaceTopologyId(cell.faceId) === normalizeFaceTopologyId(starterFaceId) ? 0.32 : 0;
      const starterHexBias = starterHexKey && String(cell.key) === starterHexKey ? 0.25 : 0;
      const score = rand() * 0.78 + equatorBias * 0.22 + starterBias + starterHexBias;
      return { ...cell, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount);
  await sleep(400);

  // Step 5: reveal water hexes in animated batches
  const size = activeTerrainTemplateSize.value;
  const batchSize = Math.max(1, Math.ceil(ranked.length / 20)); // ~20 frames total
  const currentMap = new Map();

  for (let i = 0; i < ranked.length; i += batchSize) {
    const batch = ranked.slice(i, i + batchSize);
    for (const cell of batch) currentMap.set(cell.key, cell.points);
    const nextBySize = new Map(waterHexesBySize.value);
    nextBySize.set(size, new Map(currentMap));
    waterHexesBySize.value = nextBySize;
    animationStepLabel.value = `Placing water ${Math.min(i + batchSize, ranked.length)} / ${ranked.length}…`;
    await sleep(60);
  }

  // Step 6: place mountain hexes
  animationStepLabel.value = "Placing mountain hexes…";
  await sleep(500);
  placeMountainHexes(rand);
  await sleep(400);

  // Step 7: place chasm hexes
  animationStepLabel.value = "Placing chasm hexes…";
  await sleep(300);
  placeChasmHexes(rand);
  await sleep(400);

  // Step 8: place precipice hexes
  animationStepLabel.value = "Placing precipice hexes…";
  await sleep(300);
  placePrecipiceHexes(rand);
  await sleep(400);

  // Step 9: place ruin hexes (Di worlds only)
  animationStepLabel.value = "Placing ruins…";
  await sleep(300);
  placeRuinHexes(rand);
  await sleep(400);

  // Step 10: place resource hexes
  animationStepLabel.value = "Placing resource hexes…";
  await sleep(300);
  placeResourceHexes();
  await sleep(400);

  animationStepLabel.value = "";
  isAnimating.value = false;
}

function generateTerrain() {
  const cells = activeHexCells.value;
  if (!cells.length) {
    return;
  }

  if (!starterTriangleRoll.value?.resolvedFaceId) {
    rollStarterTriangle();
  }
  const starterFaceId = String(starterTriangleRoll.value?.resolvedFaceId || "").trim();
  if (!starterHexPick.value?.key) {
    rollStarterHexInTriangle();
  }
  const starterHexKey = String(starterHexPick.value?.key || "").trim();

  const targetCount = clamp(Math.round(cells.length * hydroTargetRatio.value), 0, cells.length);
  if (targetCount === 0) {
    clearWaterHexes();
    return;
  }

  const ys = cells.map((cell) => cell.cy);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const yRange = Math.max(1, maxY - minY);
  const yMid = (minY + maxY) / 2;

  const seed = hashString(
    `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}`,
  );
  const rand = mulberry32(seed);

  const ranked = cells
    .map((cell) => {
      const latNorm = Math.abs(cell.cy - yMid) / (yRange / 2);
      const equatorBias = 1 - clamp(latNorm, 0, 1);
      const starterBias =
        starterFaceId && normalizeFaceTopologyId(cell.faceId) === normalizeFaceTopologyId(starterFaceId) ? 0.32 : 0;
      const starterHexBias = starterHexKey && String(cell.key) === starterHexKey ? 0.25 : 0;
      const score = rand() * 0.78 + equatorBias * 0.22 + starterBias + starterHexBias;
      return { ...cell, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount);

  const nextBySize = new Map(waterHexesBySize.value);
  nextBySize.set(activeTerrainTemplateSize.value, new Map(ranked.map((cell) => [cell.key, cell.points])));
  waterHexesBySize.value = nextBySize;

  placeMountainHexes(rand);
  placeChasmHexes(rand);
  placePrecipiceHexes(rand);
  placeRuinHexes(rand);
  placeResourceHexes();
}

function handleMapClick(event) {
  const el = event.target;
  if (!el || String(el.tagName).toLowerCase() !== "polygon") {
    return;
  }

  if (el.closest("#water-hex-overlay")) {
    return;
  }

  const points = normalizePoints(el.getAttribute("points"));
  if (!points) {
    return;
  }

  const hexId = String(
    el.getAttribute("data-logical-hex-id") || el.getAttribute("data-hex-id") || el.getAttribute("hex-id") || "",
  ).trim();
  const key = canonicalizeHexId(hexId) || points;
  const size = activeTerrainTemplateSize.value;

  const nextBySize = new Map(waterHexesBySize.value);
  const nextForSize = new Map(nextBySize.get(size) ?? []);

  if (nextForSize.has(key)) {
    nextForSize.delete(key);
  } else {
    nextForSize.set(key, points);
  }

  if (nextForSize.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, nextForSize);
  }

  waterHexesBySize.value = nextBySize;
  placeMountainHexes();
  placeChasmHexes();
  placePrecipiceHexes();
  placeRuinHexes();
}
</script>

<style scoped>
.terrain-page {
  height: 100vh;
  background: #f6f6f6;
  color: #0f0f0f;
  padding: 1rem;
  overflow-y: scroll;
  overflow-x: hidden;
}

.terrain-shell {
  max-width: 1200px;
  margin: 0 auto;
  border: 4px solid #111;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.terrain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #111;
  padding: 0.9rem 1rem;
}

.terrain-header h1 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.04em;
}

.back-link {
  color: #0f0f0f;
  text-decoration: none;
  border: 2px solid #111;
  padding: 0.3rem 0.6rem;
  font-weight: 600;
}

.back-link:hover {
  background: #111;
  color: #fff;
}

.info-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  border-bottom: 3px solid #111;
}

.info-column {
  padding: 0.85rem 1rem 1rem;
}

.info-column:first-child {
  border-right: 2px solid #111;
}

.info-column h2 {
  margin: 0 0 0.65rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-grid {
  margin: 0;
  display: grid;
  gap: 0.45rem;
}

.info-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 0.5rem;
  align-items: baseline;
}

.info-row dt {
  font-size: 0.78rem;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-row dd {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.map-panel {
  padding: 1rem;
}

.map-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  color: #333;
}

.map-controls {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
}

.map-button {
  border: 2px solid #111;
  background: #111;
  color: #fff;
  padding: 0.3rem 0.65rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.map-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.map-button-secondary {
  background: #fff;
  color: #111;
}

.map-button-accent {
  background: #1a5c1a;
  color: #fff;
  border-color: #0e3b0e;
}

.map-button-accent:hover:not(:disabled) {
  background: #0e3b0e;
}

.map-button-accent:disabled {
  background: #5a8a5a;
  border-color: #3a6a3a;
}

.map-controls-note {
  margin-left: auto;
  font-size: 0.85rem;
  color: #333;
}

.terrain-map {
  width: 100%;
  border: 3px solid #111;
  background: #fff;
}

@media (max-width: 920px) {
  .info-panel {
    grid-template-columns: 1fr;
  }

  .info-column:first-child {
    border-right: 0;
    border-bottom: 2px solid #111;
  }

  .info-row {
    grid-template-columns: 110px 1fr;
  }
}
</style>
