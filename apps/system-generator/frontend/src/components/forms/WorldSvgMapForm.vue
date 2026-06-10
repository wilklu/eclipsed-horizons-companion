<template>
  <div class="world-svg-map-form">
    <div class="map-meta">
      <span>SVG template map</span>
      <span>Size {{ activeSizeCode }} ({{ templateStatus }})</span>
    </div>

    <div class="terrain-controls">
      <div class="terrain-palette" v-if="!readOnly">
        <button
          v-for="terrain in TERRAIN_TYPES"
          :key="terrain.id"
          type="button"
          class="terrain-btn"
          :class="{ active: selectedTerrain === terrain.id }"
          :style="{ backgroundColor: terrain.color }"
          :title="terrain.name"
          @click="selectedTerrain = terrain.id"
        >
          {{ terrain.symbol }}
        </button>
        <button
          type="button"
          class="terrain-btn erase-btn"
          :class="{ active: selectedTerrain === null }"
          title="Erase"
          @click="selectedTerrain = null"
        >
          ✕
        </button>
      </div>
      <div v-else class="read-only-note">Preview only. Edit terrain on the Terrain Map Page.</div>

      <div class="control-actions" v-if="!readOnly">
        <button type="button" class="action-btn" @click="autoSeedTerrain" :disabled="!activeHexCells.length">
          Auto-seed
        </button>
        <button type="button" class="action-btn action-btn--secondary" @click="clearAllTerrain">Clear All</button>
      </div>
    </div>

    <svg
      class="world-map-svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xml:space="preserve"
      width="100%"
      height="100%"
      :viewBox="activeViewBox"
      @click="readOnly ? null : handleMapClick"
    >
      <g v-if="activeTemplateBaseContent" v-html="activeTemplateBaseContent"></g>
      <g v-else>
        <text x="40" y="80" style="font-size: 1em; font-family: Arial, sans-serif; fill: black">
          Missing SVG template for size {{ activeSizeCode }}
        </text>
        <text x="40" y="110" style="font-size: 0.9em; font-family: Arial, sans-serif; fill: #444">
          Expected file: {{ expectedTemplateFilename }}
        </text>
      </g>

      <g id="terrain-overlay" pointer-events="none">
        <polygon
          v-for="entry in activeTerrainEntries"
          :key="entry.key"
          :points="entry.points"
          :fill="terrainFillColor(entry.terrain)"
          stroke="black"
          stroke-width="1"
          opacity="0.8"
        />
      </g>

      <g
        v-if="activeTemplateMaskContent"
        id="terrain-mask-overlay"
        pointer-events="none"
        v-html="activeTemplateMaskContent"
      ></g>

      <g
        v-if="activeTemplateFrontContent"
        id="terrain-front-overlay"
        pointer-events="none"
        v-html="activeTemplateFrontContent"
      ></g>
    </svg>

    <div class="stats-row">
      <span>Painted: {{ paintedCount }} / {{ activeHexCells.length }} hexes</span>
      <span v-if="activeHexCells.length"
        >({{ ((paintedCount / activeHexCells.length) * 100).toFixed(1) }}% coverage)</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { canonicalizeHexId } from "../../utils/worldMapHexTopology.js";

const props = defineProps({
  terrainSeed: { type: Object, default: null },
  seedWorldName: { type: String, default: "" },
  seedUwp: { type: String, default: "" },
  seedWorldSize: { type: [String, Number], default: null },
  seedTerrainGenerated: { type: Boolean, default: false },
  seedTerrainOverlay: { type: Object, default: null },
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(["terrain-overlay-change"]);

const TERRAIN_TYPES = [
  { id: "water", name: "Water", color: "#4167b7", symbol: "💧" },
  { id: "plains", name: "Plains", color: "#7ec850", symbol: "🌾" },
  { id: "forest", name: "Forest", color: "#2e7d32", symbol: "🌲" },
  { id: "mountain", name: "Mountain", color: "#8d6e63", symbol: "⛰️" },
  { id: "desert", name: "Desert", color: "#f5c842", symbol: "🏜️" },
  { id: "tundra", name: "Tundra", color: "#b2ebf2", symbol: "❄️" },
  { id: "swamp", name: "Swamp", color: "#558b2f", symbol: "🌿" },
  { id: "urban", name: "Urban", color: "#9e9e9e", symbol: "🏙️" },
];

const TYPE_TO_TERRAIN = {
  Wetland: "swamp",
  "Wet Woods": "swamp",
  Shore: "water",
  Ocean: "water",
  Islands: "plains",
  River: "water",
  Lake: "water",
  Icecap: "tundra",
  Glacier: "tundra",
  "Ice Field": "tundra",
  "Frozen Lands": "tundra",
  Mountain: "mountain",
  Rough: "mountain",
  Volcano: "mountain",
  Desert: "desert",
  "Baked lands": "desert",
  Woods: "forest",
  "Rough Woods": "forest",
  Exotic: "desert",
  Clear: "plains",
};

const LEGACY_LAYER_TO_TERRAIN = {
  water: "water",
  shore: "water",
  flatland: "plains",
  flatlands: "plains",
  plains: "plains",
  island: "plains",
  islands: "plains",
  hills: "mountain",
  forest: "forest",
  mountain: "mountain",
  volcanic: "mountain",
  icecap: "tundra",
  glacier: "tundra",
  icefield: "tundra",
  frozenland: "tundra",
  desert: "desert",
  arctic: "tundra",
  tundra: "tundra",
  swamp: "swamp",
  city: "urban",
  urban: "urban",
  exotic: "desert",
};

const RAW_MAP_MODULES = import.meta.glob("../../assets/maps/*.svg", {
  query: "?raw",
  import: "default",
});

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
]);

function parseWorldSizeCode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) {
    return 5;
  }

  if (/^[A-Z]$/.test(normalized)) {
    return TRAVELLER_EXTENDED_HEX.get(normalized) ?? 5;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return 5;
}

function getPopulatedOverlaySizes(serialized) {
  if (!serialized || typeof serialized !== "object") {
    return [];
  }
  return Object.entries(serialized)
    .map(([sizeKey, entries]) => {
      const size = Number.parseInt(String(sizeKey), 10);
      // Ignore invalid or non-positive sizes (0 or negative)
      if (!Number.isFinite(size) || size <= 0) {
        return null;
      }

      if (Array.isArray(entries)) {
        return entries.length > 0 ? size : null;
      }

      if (entries && typeof entries === "object") {
        return Object.keys(entries).length > 0 ? size : null;
      }

      return null;
    })
    .filter((size) => Number.isFinite(size) && size > 0);
}

const activeSize = computed(() => {
  const preferredSize = parseWorldSizeCode(props.seedWorldSize);
  if (!props.seedTerrainGenerated) {
    return preferredSize;
  }
  const overlaySizes = getPopulatedOverlaySizes(props.seedTerrainOverlay);
  if (overlaySizes.includes(preferredSize)) {
    return preferredSize;
  }
  return overlaySizes[0] ?? preferredSize;
});
const activeSizeCode = computed(() => String(props.seedWorldSize ?? activeSize.value));

function buildTemplateFilename(size) {
  return `Blank World Map Size ${size}.svg`;
}

const expectedTemplateFilename = computed(() => buildTemplateFilename(activeSize.value));

const selectedTerrain = ref("water");
const readOnly = computed(() => Boolean(props.readOnly));

function parseSvgTemplate(rawSvg) {
  if (!rawSvg) {
    return { viewBox: "0 0 1066 998", baseContent: "", maskContent: "", frontContent: "" };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) {
    return { viewBox: "0 0 1066 998", baseContent: rawSvg, maskContent: "", frontContent: "" };
  }

  const maskIds = ["map-icosahedral-mask", "map-border-mask"];
  const maskChunks = [];
  for (const id of maskIds) {
    const maskEl = svgEl.querySelector(`#${id}`);
    if (!maskEl) {
      continue;
    }
    maskChunks.push(maskEl.outerHTML);
    maskEl.remove();
  }

  const frontIds = ["map-lines", "map-reference", "map-references", "map-reference-lines", "map-text"];
  const frontChunks = [];
  for (const id of frontIds) {
    const frontEl = svgEl.querySelector(`#${id}`);
    if (!frontEl) {
      continue;
    }
    frontChunks.push(frontEl.outerHTML);
    frontEl.remove();
  }

  return {
    viewBox: svgEl.getAttribute("viewBox") || "0 0 1066 998",
    baseContent: svgEl.innerHTML || "",
    maskContent: maskChunks.join(""),
    frontContent: frontChunks.join(""),
  };
}

const activeViewBox = ref("0 0 1066 998");
const activeTemplateBaseContent = ref("");
const activeTemplateMaskContent = ref("");
const activeTemplateFrontContent = ref("");
const templateStatus = ref("loading");
let requestId = 0;

const terrainBySize = ref(new Map());

function resolveHexKeyFromElement(el) {
  const candidates = [
    el?.getAttribute?.("data-logical-hex-id"),
    el?.getAttribute?.("data-seam-group"),
    el?.getAttribute?.("data-hex-id"),
    el?.getAttribute?.("hex-id"),
  ];

  for (const candidate of candidates) {
    const normalized = canonicalizeHexId(String(candidate || "").trim());
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function buildHexCellLookup(cells = []) {
  const lookup = new Map();
  for (const cell of cells) {
    const cellKey = canonicalizeHexId(String(cell?.key || "").trim());
    if (cellKey && !lookup.has(cellKey)) {
      lookup.set(cellKey, cell);
    }
  }
  return lookup;
}

function normalizeSerializedEntries(entries, cellsByKey) {
  if (Array.isArray(entries)) {
    return entries
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        key: canonicalizeHexId(String(entry.key || "").trim()),
        points: normalizePoints(entry.points),
        terrain: String(entry.terrain || "").trim(),
      }));
  }

  if (!entries || typeof entries !== "object") {
    return [];
  }

  const out = [];
  for (const [layerName, payload] of Object.entries(entries)) {
    const terrain =
      LEGACY_LAYER_TO_TERRAIN[
        String(layerName || "")
          .trim()
          .toLowerCase()
      ] || null;
    if (!terrain) {
      continue;
    }

    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (typeof item === "string") {
          const key = canonicalizeHexId(item);
          out.push({
            key,
            points: normalizePoints(cellsByKey.get(key)?.points || ""),
            terrain,
          });
          continue;
        }
        if (item && typeof item === "object") {
          const key = canonicalizeHexId(String(item.key || "").trim());
          out.push({
            key,
            points: normalizePoints(item.points || cellsByKey.get(key)?.points || ""),
            terrain,
          });
        }
      }
      continue;
    }

    if (payload && typeof payload === "object") {
      for (const [entryKey, entryValue] of Object.entries(payload)) {
        const key = canonicalizeHexId(entryKey);
        out.push({
          key,
          points: normalizePoints(entryValue?.points || cellsByKey.get(key)?.points || ""),
          terrain,
        });
      }
    }
  }

  return out;
}

function deserializeTerrainOverlay(serialized, cells = []) {
  const next = new Map();
  if (!serialized || typeof serialized !== "object") {
    return next;
  }

  const cellsByKey = buildHexCellLookup(cells);
  const seamAliasLookup = buildRowSeamAliasLookup(cells.map((c) => c.hexId));

  for (const [sizeKey, entries] of Object.entries(serialized)) {
    const size = Number.parseInt(String(sizeKey), 10);
    if (!Number.isFinite(size)) {
      continue;
    }

    const perSize = new Map();
    for (const entry of normalizeSerializedEntries(entries, cellsByKey)) {
      const rawKey = String(entry?.key || "").trim();
      let key = canonicalizeHexId(rawKey);

      // If canonicalization didn't resolve a usable key, attempt to resolve via
      // seam alias lookup (maps seam partner ids to a canonical row endpoint).
      if ((!key || !cellsByKey.has(key)) && seamAliasLookup && typeof seamAliasLookup.get === "function") {
        const alias = seamAliasLookup.get(rawKey) || seamAliasLookup.get(key || "");
        if (alias) {
          key = canonicalizeHexId(alias);
        }
      }

      const points = normalizePoints(entry?.points || cellsByKey.get(key)?.points || "");
      const terrain = String(entry?.terrain || "").trim();
      if (!key || !points || !terrain) {
        continue;
      }
      perSize.set(key, { points, terrain });
    }

    if (perSize.size) {
      next.set(size, perSize);
    }
  }

  return next;
}

function serializeTerrainOverlay(mapBySize) {
  const out = {};
  for (const [size, entries] of mapBySize.entries()) {
    if (!entries?.size) {
      continue;
    }
    out[String(size)] = Array.from(entries.entries()).map(([key, value]) => ({
      key,
      points: value.points,
      terrain: value.terrain,
    }));
  }
  return out;
}

function commitTerrainMap(nextMap) {
  if (readOnly.value) {
    return;
  }
  terrainBySize.value = nextMap;
  emit("terrain-overlay-change", serializeTerrainOverlay(nextMap));
}

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

function isHexPolygonElement(poly) {
  const points = normalizePoints(poly.getAttribute("points"));
  if (!points) {
    return false;
  }

  const coords = parsePoints(points);
  if (coords.length !== 6) {
    return false;
  }

  const style = String(poly.getAttribute("style") || "").toLowerCase();
  if (style.includes("fill: white") || style.includes("fill:white") || style.includes("stroke: none")) {
    return false;
  }

  return true;
}
function parseHexIdList(value) {
  return String(value || "")
    .split(",")
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function parseHexIdParts(hexId) {
  const normalized = String(hexId || "").trim();
  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  const col = Number.parseInt(normalized.slice(0, 3), 10);
  const row = Number.parseInt(normalized.slice(3, 6), 10);
  if (!Number.isFinite(col) || !Number.isFinite(row)) {
    return null;
  }

  return {
    id: normalized,
    col,
    row,
  };
}

function buildRowSeamAliasLookup(hexIds) {
  const byRow = new Map();

  for (const rawId of hexIds || []) {
    const parsed = parseHexIdParts(rawId);
    if (!parsed) continue;
    if (!byRow.has(parsed.row)) {
      byRow.set(parsed.row, []);
    }
    byRow.get(parsed.row).push(parsed);
  }

  const lookup = new Map();

  for (const [row, entries] of byRow.entries()) {
    if (!Array.isArray(entries) || entries.length < 2) {
      continue;
    }

    entries.sort((a, b) => a.col - b.col);
    const first = entries[0]?.id;
    const last = entries[entries.length - 1]?.id;

    if (row === 1 && first) {
      for (const entry of entries) {
        lookup.set(entry.id, first);
      }
      continue;
    }

    if (first && last) {
      lookup.set(first, first);
      lookup.set(last, first);
    }
  }

  return lookup;
}

function deriveCanonicalHexKey({ logicalHexId, seamGroupHexId, hexId, seamPartnerHexIds }) {
  const logicalKey = canonicalizeHexId(logicalHexId);
  if (logicalKey) {
    return logicalKey;
  }

  const seamGroupKey = canonicalizeHexId(seamGroupHexId);
  if (seamGroupKey) {
    return seamGroupKey;
  }

  const baseHexKey = canonicalizeHexId(hexId);
  const partnerKeys = parseHexIdList(seamPartnerHexIds)
    .map((id) => canonicalizeHexId(id))
    .filter(Boolean);

  if (partnerKeys.length) {
    const grouped = [baseHexKey, ...partnerKeys].filter(Boolean).sort();
    if (grouped.length) {
      return grouped[0];
    }
  }

  return baseHexKey || "";
}

function extractHexCells(templateContent) {
  if (!templateContent) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<svg>${templateContent}</svg>`, "image/svg+xml");
  const polys = Array.from(doc.querySelectorAll("polygon"));

  const parsedCells = polys
    .filter((poly) => isHexPolygonElement(poly))
    .map((poly) => {
      const points = normalizePoints(poly.getAttribute("points"));
      const logicalHexId = String(poly.getAttribute("data-logical-hex-id") || "").trim();
      const seamGroupHexId = String(poly.getAttribute("data-seam-group") || "").trim();
      const seamPartnerHexIds = String(poly.getAttribute("data-seam-partners") || "").trim();
      const hexId = String(poly.getAttribute("data-hex-id") || poly.getAttribute("hex-id") || "").trim();

      return {
        logicalHexId,
        seamGroupHexId,
        seamPartnerHexIds,
        hexId,
        points,
      };
    })
    .filter(Boolean);

  const seamAliasLookup = buildRowSeamAliasLookup(parsedCells.map((cell) => cell?.hexId));

  return parsedCells.map((cell) => {
    const seamAliasHexId = seamAliasLookup.get(cell.hexId) || "";
    const canonicalFromMetadata = deriveCanonicalHexKey({
      logicalHexId: cell.logicalHexId,
      seamGroupHexId: cell.seamGroupHexId,
      hexId: cell.hexId,
      seamPartnerHexIds: cell.seamPartnerHexIds,
    });
    const canonicalHexId = canonicalFromMetadata || canonicalizeHexId(seamAliasHexId);

    return {
      key: canonicalHexId || cell.points,
      points: cell.points,
      hexId: cell.hexId,
      canonicalHexId,
    };
  });
}

const activeHexCells = computed(() => extractHexCells(activeTemplateBaseContent.value));

const activeTerrainEntries = computed(() => {
  const current = terrainBySize.value.get(activeSize.value);
  if (!current) {
    return [];
  }
  return Array.from(current.entries()).map(([key, value]) => ({ key, ...value }));
});

const paintedCount = computed(() => activeTerrainEntries.value.length);

function terrainFillColor(id) {
  return TERRAIN_TYPES.find((t) => t.id === id)?.color || "#cccccc";
}

function clearAllTerrain() {
  const next = new Map(terrainBySize.value);
  next.delete(activeSize.value);
  commitTerrainMap(next);
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

function terrainForSurveyType(type) {
  return TYPE_TO_TERRAIN[String(type || "").trim()] || "plains";
}

function buildTerrainWeightsFromSeed(seed) {
  const counts = Array.isArray(seed?.hexCounts) ? seed.hexCounts : [];
  if (!counts.length) {
    return [];
  }

  const merged = new Map();
  for (const entry of counts) {
    const terrain = terrainForSurveyType(entry?.type);
    const hexes = Number(entry?.hexes || 0);
    const percent = Number.parseFloat(String(entry?.percent || "0").replace("%", ""));
    const weight = Number.isFinite(hexes) && hexes > 0 ? hexes : Number.isFinite(percent) && percent > 0 ? percent : 0;
    if (weight <= 0) {
      continue;
    }
    merged.set(terrain, (merged.get(terrain) || 0) + weight);
  }

  return Array.from(merged.entries()).map(([terrain, weight]) => ({ terrain, weight }));
}

function buildAutoSeededTerrainMap() {
  const cells = activeHexCells.value;
  if (!cells.length) {
    return null;
  }

  const weighted = buildTerrainWeightsFromSeed(props.terrainSeed);
  if (!weighted.length) {
    return null;
  }

  const seedValue = hashString(`${props.seedWorldName}|${props.seedUwp}|${activeSize.value}|terrain`);
  const rand = mulberry32(seedValue);
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  const nextForSize = new Map();

  for (const cell of cells) {
    let roll = rand() * totalWeight;
    let picked = weighted[0].terrain;
    for (const entry of weighted) {
      roll -= entry.weight;
      if (roll <= 0) {
        picked = entry.terrain;
        break;
      }
    }
    nextForSize.set(cell.key, { points: cell.points, terrain: picked });
  }

  return nextForSize;
}

function autoSeedTerrain() {
  const nextForSize = buildAutoSeededTerrainMap();
  if (!nextForSize?.size) {
    return;
  }

  const next = new Map(terrainBySize.value);
  next.set(activeSize.value, nextForSize);
  commitTerrainMap(next);
}

function handleMapClick(event) {
  const el = event.target;
  if (!el || String(el.tagName).toLowerCase() !== "polygon") {
    return;
  }

  if (el.closest("#terrain-overlay")) {
    return;
  }

  if (!isHexPolygonElement(el)) {
    return;
  }

  const points = normalizePoints(el.getAttribute("points"));
  if (!points) {
    return;
  }

  const hexId = resolveHexKeyFromElement(el);
  const key = hexId || points;

  const next = new Map(terrainBySize.value);
  const nextForSize = new Map(next.get(activeSize.value) ?? []);

  if (selectedTerrain.value === null) {
    nextForSize.delete(key);
  } else {
    nextForSize.set(key, { points, terrain: selectedTerrain.value });
  }

  if (nextForSize.size) {
    next.set(activeSize.value, nextForSize);
  } else {
    next.delete(activeSize.value);
  }

  commitTerrainMap(next);
}

async function loadTemplateForSize(size) {
  const currentRequest = ++requestId;
  templateStatus.value = "loading";

  const filename = buildTemplateFilename(size);
  const moduleKey = `../../assets/maps/${filename}`;
  const loadRawSvg = RAW_MAP_MODULES[moduleKey];

  if (!loadRawSvg) {
    if (currentRequest !== requestId) return;
    activeTemplateBaseContent.value = "";
    activeTemplateMaskContent.value = "";
    activeTemplateFrontContent.value = "";
    activeViewBox.value = "0 0 1066 998";
    templateStatus.value = "missing";
    return;
  }

  try {
    const rawSvg = await loadRawSvg();
    if (currentRequest !== requestId) return;

    const parsed = parseSvgTemplate(rawSvg);
    activeTemplateBaseContent.value = parsed.baseContent;
    activeTemplateMaskContent.value = parsed.maskContent;
    activeTemplateFrontContent.value = parsed.frontContent;
    activeViewBox.value = parsed.viewBox;
    templateStatus.value = parsed.baseContent ? "loaded" : "missing";
  } catch {
    if (currentRequest !== requestId) return;
    activeTemplateBaseContent.value = "";
    activeTemplateMaskContent.value = "";
    activeTemplateFrontContent.value = "";
    activeViewBox.value = "0 0 1066 998";
    templateStatus.value = "missing";
  }
}

watch(
  activeSize,
  (size) => {
    void loadTemplateForSize(size);
  },
  { immediate: true },
);

watch(
  [() => props.seedTerrainOverlay, activeHexCells],
  ([nextOverlay, cells]) => {
    terrainBySize.value = deserializeTerrainOverlay(nextOverlay, cells);

    // If this is a read-only preview and the world reports a generated/saved
    // terrain map, prefer showing any persisted overlay from another size
    // rather than falling back to an auto-seeded preview when the active
    // template size doesn't have entries after deserialization.
    if (readOnly.value && props.seedTerrainGenerated) {
      const activeEntries = terrainBySize.value.get(activeSize.value);
      if (!activeEntries?.size && terrainBySize.value.size) {
        const firstSize = terrainBySize.value.keys().next().value;
        if (firstSize !== undefined) {
          const firstEntries = terrainBySize.value.get(firstSize);
          if (firstEntries?.size) {
            const next = new Map(terrainBySize.value);
            // Copy the first available persisted set into the active size so
            // the preview displays the persisted overlay rather than an
            // auto-generated one.
            next.set(activeSize.value, firstEntries);
            terrainBySize.value = next;
            return;
          }
        }
      }
    }

    if (!readOnly.value || !props.seedTerrainGenerated) {
      return;
    }

    const activeEntries = terrainBySize.value.get(activeSize.value);
    if (activeEntries?.size) {
      return;
    }

    const previewSeed = buildAutoSeededTerrainMap();
    if (!previewSeed?.size) {
      return;
    }

    const next = new Map(terrainBySize.value);
    next.set(activeSize.value, previewSeed);
    terrainBySize.value = next;
  },
  { immediate: true, deep: true },
);
</script>

<style scoped>
.world-svg-map-form {
  width: 100%;
}

.map-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #444;
}

.terrain-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.55rem;
}

.terrain-palette {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.terrain-btn {
  border: 1px solid #222;
  border-radius: 3px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.terrain-btn.active {
  outline: 2px solid #111;
  outline-offset: 1px;
}

.erase-btn {
  background: #fff;
}

.control-actions {
  display: flex;
  gap: 0.45rem;
}

.action-btn {
  border: 1px solid #111;
  background: #111;
  color: #fff;
  padding: 0.25rem 0.6rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn--secondary {
  background: #fff;
  color: #111;
}

.world-map-svg {
  width: 100%;
  border: 2px solid #111;
  background: #fff;
}

.stats-row {
  margin-top: 0.45rem;
  display: flex;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: #333;
}

.read-only-note {
  font-size: 0.8rem;
  color: #444;
  font-style: italic;
}
</style>
