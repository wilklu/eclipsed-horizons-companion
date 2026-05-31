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
              <dd>{{ worldInfo.name }}</dd>
            </div>
            <div class="info-row">
              <dt>UWP</dt>
              <dd>{{ worldInfo.uwp }}</dd>
            </div>
            <div class="info-row">
              <dt>Size</dt>
              <dd>{{ worldInfo.size }}</dd>
            </div>
            <div class="info-row">
              <dt>Atmosphere</dt>
              <dd>{{ worldInfo.atmosphere }}</dd>
            </div>
            <div class="info-row">
              <dt>Hydrographics</dt>
              <dd>{{ worldInfo.hydrographics }}</dd>
            </div>
            <div class="info-row">
              <dt>Population</dt>
              <dd>{{ worldInfo.population }}</dd>
            </div>
          </dl>
        </div>

        <div class="info-column">
          <h2>System Data</h2>
          <dl class="info-grid">
            <div class="info-row">
              <dt>System</dt>
              <dd>{{ systemInfo.systemName }}</dd>
            </div>
            <div class="info-row">
              <dt>Hex</dt>
              <dd>{{ systemInfo.hex }}</dd>
            </div>
            <div class="info-row">
              <dt>Primary Star</dt>
              <dd>{{ systemInfo.primaryStar }}</dd>
            </div>
            <div class="info-row">
              <dt>Orbit</dt>
              <dd>{{ systemInfo.orbit }}</dd>
            </div>
            <div class="info-row">
              <dt>Zone</dt>
              <dd>{{ systemInfo.zone }}</dd>
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

const worldInfo = computed(() => ({
  name: String(selectedWorld.value?.name || route.query.worldName || "Unknown World"),
  uwp: String(selectedWorld.value?.uwp || "—"),
  size: String(selectedWorld.value?.size ?? "—"),
  atmosphere: String(selectedWorld.value?.atmosphereDesc || selectedWorld.value?.atmosphere || "—"),
  hydrographics: String(selectedWorld.value?.hydrographics ?? selectedWorld.value?.hydro ?? "—"),
  population: String(selectedWorld.value?.population ?? "—"),
}));

const systemInfo = computed(() => {
  const x = boundSystem.value?.hexCoordinates?.x;
  const y = boundSystem.value?.hexCoordinates?.y;
  const hex =
    Number.isFinite(Number(x)) && Number.isFinite(Number(y))
      ? `${String(x).padStart(2, "0")}${String(y).padStart(2, "0")}`
      : String(route.query.hex || "—");

  const primaryStar =
    String(boundSystem.value?.primaryStar?.spectralClass || "").trim() ||
    String(boundSystem.value?.stars?.[0]?.spectralClass || "").trim() ||
    String(route.query.star || "—");

  return {
    systemName: String(
      boundSystem.value?.name || boundSystem.value?.systemName || route.query.systemName || "Unknown System",
    ),
    hex,
    primaryStar,
    orbit: String(selectedWorld.value?.orbitAU ?? route.query.orbitAU ?? "—"),
    zone: String(selectedWorld.value?.zone || route.query.zone || "—"),
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

  const hexId = String(el.getAttribute("data-hex-id") || "").trim();
  const key = hexId || points;
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
