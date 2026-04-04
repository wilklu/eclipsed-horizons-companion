<template>
  <div ref="atlasRootRef" class="atlas-root">
    <LoadingSpinner :isVisible="isLoading" message="Loading atlas data..." />

    <!-- ── Floating toolbar ──────────────────────────────────────────────── -->
    <header class="atlas-toolbar">
      <span class="toolbar-brand">🌌 Traveller Atlas</span>

      <div class="toolbar-center">
        <select v-model="selectedGalaxyId" @change="handleGalaxyChange" class="atlas-select">
          <option value="">— Select Galaxy —</option>
          <option :value="ALL_GALAXIES_VALUE">— All Galaxies —</option>
          <option v-for="g in galaxyOptions" :key="g.galaxyId" :value="g.galaxyId">
            {{ g.label }}
          </option>
        </select>

        <div class="zoom-cluster">
          <button class="tb-btn" @click="zoomOut" title="Zoom out one hierarchy level">−</button>
          <button class="zoom-badge" @click="resetView" title="Reset to fit galaxy">{{ parsecBadge }}</button>
          <button class="tb-btn" @click="zoomIn" title="Zoom in one hierarchy level">+</button>
        </div>

        <div class="level-cluster">
          <button class="tb-btn" @click="zoomToPreviousHierarchyLevel" title="Previous hierarchy level">◀</button>
          <span class="lod-pill" :class="`lod-${currentLod}`" :title="currentHierarchyLevel.description">
            {{ currentHierarchyLevel.label }}
          </span>
          <button class="tb-btn" @click="zoomToNextHierarchyLevel" title="Next hierarchy level">▶</button>
        </div>
      </div>

      <div class="toolbar-layers">
        <button
          class="tb-toggle"
          :class="{ active: layerHexGrid }"
          @click="layerHexGrid = !layerHexGrid"
          title="Hex grid"
        >
          Grid
        </button>
        <button
          class="tb-toggle"
          :class="{ active: layerNames }"
          @click="layerNames = !layerNames"
          title="System names"
        >
          Names
        </button>
        <button
          class="tb-toggle"
          :class="{ active: layerCoords }"
          @click="layerCoords = !layerCoords"
          title="Hex coordinates"
        >
          Coords
        </button>
        <button
          class="tb-toggle"
          :class="{ active: layerZones }"
          @click="layerZones = !layerZones"
          title="Travel zones"
        >
          Zones
        </button>
      </div>
    </header>

    <!-- ── Map canvas ────────────────────────────────────────────────────── -->
    <svg
      ref="svgRef"
      class="atlas-svg"
      :class="{ dragging }"
      @wheel.prevent="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <defs>
        <pattern id="dustfield" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
          <circle cx="23" cy="61" r="0.85" fill="rgba(255,255,255,0.12)" />
          <circle cx="110" cy="18" r="0.65" fill="rgba(200,220,255,0.14)" />
          <circle cx="263" cy="122" r="1.05" fill="rgba(255,248,220,0.10)" />
          <circle cx="174" cy="240" r="0.75" fill="rgba(255,255,255,0.09)" />
          <circle cx="341" cy="304" r="0.90" fill="rgba(200,220,255,0.11)" />
          <circle cx="67" cy="350" r="0.70" fill="rgba(255,255,255,0.13)" />
          <circle cx="194" cy="376" r="0.80" fill="rgba(255,248,220,0.10)" />
          <circle cx="318" cy="57" r="0.60" fill="rgba(180,200,255,0.12)" />
          <circle cx="45" cy="195" r="1.10" fill="rgba(255,255,255,0.08)" />
        </pattern>
        <filter id="softglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="orbitglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="galaxy-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6090ff" stop-opacity="0.8" />
          <stop offset="50%" stop-color="#3060cc" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#1030a0" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Infinite space background -->
      <rect x="-200000" y="-200000" width="400000" height="400000" fill="#070b1c" @click="clearSelection" />
      <rect x="-200000" y="-200000" width="400000" height="400000" fill="url(#dustfield)" @click="clearSelection" />

      <!-- ── World-space group (all LOD layers) ─────────────────────────── -->
      <g :transform="cameraTransform">
        <!-- 0 ── Universe: galaxy blobs (visible at >1000 pc) -->
        <g v-if="showUniverseLayer" class="layer-universe">
          <g
            v-for="dot in galaxyDots"
            :key="`gdot-${dot.galaxyId}`"
            class="galaxy-dot"
            :class="{ 'galaxy-dot--selected': dot.isSelected }"
            @click.stop="onGalaxyDotClick(dot)"
            style="cursor: pointer"
          >
            <!-- Diffuse halo -->
            <circle :cx="dot.wx" :cy="dot.wy" :r="GALAXY_DOT_R * 3" fill="url(#galaxy-glow-grad)" />
            <!-- Core body -->
            <circle
              :cx="dot.wx"
              :cy="dot.wy"
              :r="GALAXY_DOT_R"
              :fill="dot.color"
              filter="url(#softglow)"
              opacity="0.85"
            />
            <!-- Selection ring -->
            <circle
              v-if="dot.isSelected"
              :cx="dot.wx"
              :cy="dot.wy"
              :r="GALAXY_DOT_R * 1.8"
              fill="none"
              stroke="#4dc2ff"
              :stroke-width="parsecsPerHex * 10"
              opacity="0.75"
            />
            <!-- Name label -->
            <text
              :x="dot.wx"
              :y="dot.wy + GALAXY_DOT_R * 1.4 + parsecsPerHex * 14"
              class="galaxy-dot-name"
              text-anchor="middle"
              :font-size="parsecsPerHex * 14"
            >
              {{ dot.name }}
            </text>
          </g>
        </g>

        <!-- 0 ── Grid click-capture layer (all positions, behind density tiles) -->
        <g class="layer-grid-clicks">
          <rect
            v-for="tile in gridClickTiles"
            :key="`gclick-${tile.key}`"
            :x="tile.wx"
            :y="tile.wy"
            :width="SECTOR_PX_W"
            :height="SECTOR_PX_H"
            fill="transparent"
            pointer-events="all"
            @click.stop="onGridCellClick(tile)"
          />
        </g>

        <!-- 1 ── Sector density tiles -->
        <g class="layer-sector-tiles">
          <g
            v-for="tile in visibleSectorTiles"
            :key="`tile-${tile.sectorId}`"
            @click.stop="onSectorTileClick(tile)"
            @mouseenter="hoveredSectorId = tile.sectorId"
            @mouseleave="hoveredSectorId = null"
          >
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="SECTOR_PX_W - 1"
              :height="SECTOR_PX_H - 1"
              :fill="densityFill(tile.densityClass)"
              :opacity="sectorTileOpacity"
              class="sector-tile"
              :class="{ hovered: hoveredSectorId === tile.sectorId }"
            />
            <text
              v-if="sectorLabelVisible && tile.showLabel"
              :x="tile.wx + SECTOR_PX_W * 0.5"
              :y="tile.wy + SECTOR_PX_H * 0.5 + 4"
              class="sector-label"
              :transform="`rotate(-27 ${tile.wx + SECTOR_PX_W * 0.5} ${tile.wy + SECTOR_PX_H * 0.5})`"
              :style="{ fontSize: `${sectorLabelSize}px` }"
            >
              {{ tile.name }}
            </text>
          </g>
        </g>

        <!-- 2 ── Sector borders -->
        <g v-if="showSectorBorders" class="layer-sector-borders">
          <rect
            v-for="tile in continuousSectorTiles"
            :key="`border-${tile.key}`"
            :x="tile.wx"
            :y="tile.wy"
            :width="SECTOR_PX_W"
            :height="SECTOR_PX_H"
            fill="none"
            stroke="#1e2d4a"
            :stroke-width="sectorBorderWidth"
            class="sector-border"
          />
        </g>

        <!-- 2b ── Subsector borders -->
        <g v-if="showSubsectorBorders" class="layer-subsector-borders">
          <g v-for="tile in continuousSectorTiles" :key="`sub-${tile.key}`">
            <line
              v-for="i in 3"
              :key="`sub-v-${tile.key}-${i}`"
              :x1="tile.wx + (SECTOR_PX_W / 4) * i"
              :y1="tile.wy"
              :x2="tile.wx + (SECTOR_PX_W / 4) * i"
              :y2="tile.wy + SECTOR_PX_H"
              class="subsector-border"
            />
            <line
              v-for="i in 3"
              :key="`sub-h-${tile.key}-${i}`"
              :x1="tile.wx"
              :y1="tile.wy + (SECTOR_PX_H / 4) * i"
              :x2="tile.wx + SECTOR_PX_W"
              :y2="tile.wy + (SECTOR_PX_H / 4) * i"
              class="subsector-border"
            />
          </g>
        </g>

        <!-- 2c ── Hierarchy overlays (Phase 2) -->
        <g v-if="showQuadrantOverlay" class="layer-hierarchy layer-quadrant">
          <g v-for="tile in visibleQuadrantTiles" :key="`quad-${tile.key}`" @click.stop="focusHierarchyTile(tile)">
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="tile.ww"
              :height="tile.wh"
              class="hierarchy-tile hierarchy-tile-quadrant"
            />
            <text
              v-if="showHierarchyLabels"
              :x="tile.wx + tile.ww * 0.5"
              :y="tile.wy + 16"
              class="hierarchy-label"
              text-anchor="middle"
            >
              {{ tile.label }}
            </text>
          </g>
        </g>

        <g v-if="showQuadrantSubOverlay" class="layer-hierarchy layer-quadrant-sub">
          <g
            v-for="tile in visibleQuadrantSubTiles"
            :key="`quad-sub-${tile.key}`"
            @click.stop="focusHierarchyTile(tile)"
          >
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="tile.ww"
              :height="tile.wh"
              class="hierarchy-tile hierarchy-tile-sub"
            />
          </g>
        </g>

        <g v-if="showRegionOverlay" class="layer-hierarchy layer-region">
          <g v-for="tile in visibleRegionTiles" :key="`region-${tile.key}`" @click.stop="focusHierarchyTile(tile)">
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="tile.ww"
              :height="tile.wh"
              class="hierarchy-tile hierarchy-tile-region"
            />
            <text
              v-if="showHierarchyLabels"
              :x="tile.wx + tile.ww * 0.5"
              :y="tile.wy + 14"
              class="hierarchy-label"
              text-anchor="middle"
            >
              {{ tile.label }}
            </text>
          </g>
        </g>

        <g v-if="showRegionSubOverlay" class="layer-hierarchy layer-region-sub">
          <g
            v-for="tile in visibleRegionSubTiles"
            :key="`region-sub-${tile.key}`"
            @click.stop="focusHierarchyTile(tile)"
          >
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="tile.ww"
              :height="tile.wh"
              class="hierarchy-tile hierarchy-tile-sub"
            />
          </g>
        </g>

        <g v-if="showSectorSubOverlay" class="layer-hierarchy layer-sector-sub">
          <g
            v-for="tile in visibleSectorSubTiles"
            :key="`sector-sub-${tile.key}`"
            @click.stop="focusHierarchyTile(tile)"
          >
            <rect
              :x="tile.wx"
              :y="tile.wy"
              :width="tile.ww"
              :height="tile.wh"
              class="hierarchy-tile hierarchy-tile-sub"
            />
          </g>
        </g>

        <!-- 3 ── Hex grid (zoom-gated) -->
        <g v-if="hexGridVisible" class="layer-hex-grid">
          <polygon
            v-for="hex in continuousHexCells"
            :key="hex.key"
            :points="hex.points"
            class="hex-cell hex-cell--guide"
          />
          <polygon
            v-for="hex in visibleHexCells"
            :key="hex.key"
            :points="hex.points"
            class="hex-cell"
            :class="{
              occupied: hex.occupied,
              selected: hex.key === selectedHexKey,
              hovered: hex.key === hoveredHexKey,
            }"
            @click.stop="onHexClick(hex)"
            @mouseenter="hoveredHexKey = hex.key"
            @mouseleave="hoveredHexKey = null"
          />
        </g>

        <!-- 4 ── Travel zone overlays -->
        <g v-if="layerZones && hexGridVisible" class="layer-zones">
          <polygon
            v-for="hex in travelZoneHexes"
            :key="`tz-${hex.key}`"
            :points="hex.points"
            class="zone-hex"
            :class="hex.zoneClass"
          />
        </g>

        <!-- 5 ── Star markers -->
        <g v-if="renderStars" class="layer-stars">
          <g
            v-for="star in visibleStars"
            :key="star.key"
            class="star-group"
            :class="{ selected: star.key === selectedHexKey, hovered: star.key === hoveredHexKey }"
            @click.stop="onStarClick(star)"
            @mouseenter="hoveredHexKey = star.key"
            @mouseleave="hoveredHexKey = null"
          >
            <!-- Selection ring -->
            <circle
              v-if="star.key === selectedHexKey"
              :cx="star.wx"
              :cy="star.wy"
              :r="effectiveStarR + 5"
              fill="none"
              stroke="#4dc2ff"
              stroke-width="1.5"
              opacity="0.8"
            />
            <!-- Primary star -->
            <circle
              :cx="star.wx"
              :cy="star.wy"
              :r="effectiveStarR"
              :fill="starRenderFill(star)"
              class="star-dot"
              filter="url(#softglow)"
            />
            <!-- Secondary companion -->
            <circle
              v-if="star.hasSecondary && currentLod === 'detail'"
              :cx="star.wx + effectiveStarR * 1.9"
              :cy="star.wy - effectiveStarR"
              :r="effectiveStarR * 0.55"
              :fill="star.compColor"
              class="star-dot companion"
            />
            <!-- Hex coord -->
            <text
              v-if="showStarCoords"
              :x="star.wx"
              :y="star.wy + effectiveStarR + 9"
              class="hex-coord-label"
              text-anchor="middle"
            >
              {{ star.coord }}
            </text>
            <!-- System name -->
            <text
              v-if="showStarNames"
              :x="star.wx + effectiveStarR + 5"
              :y="star.wy - effectiveStarR - 3"
              class="star-name-label"
            >
              {{ star.name }}
            </text>
          </g>
        </g>

        <!-- 5b ── Trade routes (5 parsecs and closer) -->
        <g v-if="showTradeRoutes" class="layer-trade-routes">
          <line
            v-for="route in visibleTradeRoutes"
            :key="route.key"
            :x1="route.x1"
            :y1="route.y1"
            :x2="route.x2"
            :y2="route.y2"
            class="trade-route"
          />
        </g>

        <!-- 6 ── Sparse coord labels for empty hexes -->
        <g v-if="showEmptyCoords" class="layer-empty-coords">
          <text
            v-for="hex in sparseCoordHexes"
            :key="`ec-${hex.key}`"
            :x="hex.wx"
            :y="hex.wy + 3"
            class="hex-coord-label empty"
            text-anchor="middle"
          >
            {{ hex.coord }}
          </text>
        </g>
      </g>
      <!-- /cameraTransform -->
    </svg>

    <!-- ── Inspector overlay ──────────────────────────────────────────────── -->
    <transition name="slide-in">
      <aside v-if="inspectorVisible" class="atlas-inspector" @click.stop>
        <button class="inspector-close" @click="clearSelection">✕</button>

        <!-- Sector card -->
        <div v-if="inspectorMode === 'sector'" class="inspector-content">
          <h2 class="inspector-title">{{ inspectorData.name }}</h2>
          <div class="inspector-badge">Sector {{ inspectorData.coords }}</div>
          <div class="inspector-actions">
            <button class="btn btn-primary" @click="focusSectorFromInspector">🔍 Zoom to Sector</button>
            <button class="btn btn-primary" :disabled="isGeneratingInspectorSector" @click="generateInspectorSector">
              {{ isGeneratingInspectorSector ? "Generating..." : "⚡ Generate Sector" }}
            </button>
            <button
              class="btn btn-primary"
              :disabled="isGeneratingInspectorSector"
              @click="generateInspectorSectorSystems"
            >
              {{ isGeneratingInspectorSector ? "Generating..." : "⭐ Generate Systems" }}
            </button>
          </div>
          <div class="detail-grid">
            <div class="dr">
              <span class="dl">Density</span><span class="dv">{{ inspectorData.densityLabel }}</span>
            </div>
            <div class="dr">
              <span class="dl">Systems</span><span class="dv">{{ inspectorData.systemCount }}</span>
            </div>
            <div class="dr">
              <span class="dl">Status</span><span class="dv">{{ inspectorData.status }}</span>
            </div>
          </div>
        </div>

        <!-- Star / system card -->
        <div v-else-if="inspectorMode === 'star'" class="inspector-content">
          <h2 class="inspector-title">{{ inspectorData.name }}</h2>
          <div class="inspector-badge">{{ inspectorData.coord }} · {{ inspectorData.sectorName }}</div>

          <div class="star-inline">
            <svg width="44" height="44" class="star-swatch" overflow="visible">
              <circle cx="22" cy="22" :r="inspectorStarSvgR" :fill="inspectorData.color" filter="url(#softglow)" />
              <circle
                v-if="inspectorData.hasSecondary"
                :cx="22 + inspectorStarSvgR * 1.9"
                :cy="22 - inspectorStarSvgR"
                :r="inspectorStarSvgR * 0.55"
                :fill="inspectorData.compColor"
              />
            </svg>
            <div>
              <div class="star-type-big">{{ inspectorData.starType }}</div>
              <div v-if="inspectorData.hasSecondary" class="star-companion-hint">+ companion</div>
            </div>
          </div>

          <!-- Orbital diagram -->
          <div class="orbital-section">
            <div class="orbital-header">
              <span class="orbital-title">Orbital Map</span>
            </div>
            <svg class="orbital-svg" viewBox="-78 -78 156 156" overflow="visible">
              <!-- Background -->
              <rect x="-78" y="-78" width="156" height="156" fill="#060a1a" rx="6" />
              <rect x="-78" y="-78" width="156" height="156" fill="url(#dustfield)" rx="6" opacity="0.35" />
              <!-- Orbit rings -->
              <ellipse
                v-for="(orb, i) in inspectorOrbits"
                :key="`ring-${i}`"
                cx="0"
                cy="0"
                :rx="orb.rx"
                :ry="orb.ry"
                fill="none"
                :stroke="orb.zoneColor"
                stroke-width="0.7"
                opacity="0.60"
                stroke-dasharray="3 2"
              />
              <!-- Star glow + body -->
              <circle cx="0" cy="0" :r="inspectorStarSvgR * 2.2" :fill="inspectorData.color" opacity="0.10" />
              <circle cx="0" cy="0" :r="inspectorStarSvgR" :fill="inspectorData.color" filter="url(#orbitglow)" />
              <!-- Planets -->
              <g v-for="(orb, i) in inspectorOrbits" :key="`planet-${i}`">
                <circle :cx="orb.px" :cy="orb.py" :r="orb.pr" :fill="orb.color" class="orbit-planet" />
                <text :x="orb.px + orb.pr + 2" :y="orb.py + 3" class="orbit-label">{{ orb.label }}</text>
              </g>
            </svg>
          </div>

          <div class="inspector-actions">
            <button class="btn btn-primary" @click="openOrbitalView">🪐 Orbital View</button>
            <button class="btn btn-primary" @click="openStarSystem">⭐ System Survey</button>
          </div>
        </div>
      </aside>
    </transition>

    <!-- ── Status bar ─────────────────────────────────────────────────────── -->
    <footer class="atlas-status">
      <span class="status-hex">
        {{
          hoveredHexKey
            ? `Hex ${hoveredHexKey.split(":")[1] ?? hoveredHexKey}`
            : "Pan: drag · Zoom: scroll wheel · Click a star to inspect"
        }}
      </span>
      <div class="status-density" v-if="currentLod === 'galaxy' || currentLod === 'sector'">
        <span v-for="band in DENSITY_SCALE" :key="band.label" class="density-chip">
          <span class="density-swatch" :style="{ background: band.color }"></span>
          {{ band.label }} ({{ band.range }})
        </span>
      </div>
      <span class="status-right">{{ visibleStars.length }} stars in view · {{ biasReadout }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import * as sectorApi from "../../api/sectorApi.js";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import * as toastService from "../../utils/toast.js";

const router = useRouter();
const galaxyStore = useGalaxyStore();
const preferencesStore = usePreferencesStore();
const sectorStore = useSectorStore();
const ALL_GALAXIES_VALUE = "__ALL_GALAXIES__";
const PREFERENCES_STORAGE_KEY = "eclipsed-horizons-preferences";

// ── Hex geometry constants (flat-top) ──────────────────────────────────────
const HEX_R = 22;
const HEX_STEP_X = HEX_R * 1.5; // 33
const HEX_STEP_Y = HEX_R * Math.sqrt(3); // ≈38.1
const SECTOR_COLS = 32;
const SECTOR_ROWS = 40;
const REGION_SECTORS = 4;
const QUADRANT_REGIONS = 4;
const QUADRANT_SECTORS = REGION_SECTORS * QUADRANT_REGIONS;
// Total world-space size of one sector tile
const SECTOR_PX_W = SECTOR_COLS * HEX_STEP_X;
const SECTOR_PX_H = SECTOR_ROWS * HEX_STEP_Y;
// Manual alignment bias for sector/subsector overlays against hex lattice (from preferences).
const gridBiasX = computed(() => Number(preferencesStore.atlasGridBiasX) || 0);
const gridBiasY = computed(() => Number(preferencesStore.atlasGridBiasY) || 0);

// ── LOD zoom thresholds ────────────────────────────────────────────────────
const LOD_GALAXY = 0.055; // below: sector tiles only
const LOD_SECTOR = 0.38; // below: dots but no hex grid
const LOD_HEX = 1.2; // above: high-detail markers + labels
// ── Discrete hierarchy zoom levels ──────────────────────────────────────────
// The Atlas zoom ladder maps directly to the requested hierarchy:
// Galaxy -> Quadrant -> Region -> Sector -> Subsector -> Orbital context.
const HIERARCHY_LEVELS = Object.freeze([
  {
    id: "galaxy",
    label: "Galaxy",
    description: "Galaxy level overview",
    parsecsPerHex: 1000,
  },
  {
    id: "quadrant-4x4",
    label: "Quadrant 4x4",
    description: "Quadrant level (4x4 Regions)",
    parsecsPerHex: 500,
  },
  {
    id: "quadrant-2x2",
    label: "Quadrant 2x2",
    description: "Quadrant sublevel (2x2 Regions)",
    parsecsPerHex: 250,
  },
  {
    id: "region-4x4",
    label: "Region 4x4",
    description: "Region level (4x4 Sectors)",
    parsecsPerHex: 120,
  },
  {
    id: "region-2x2",
    label: "Region 2x2",
    description: "Region sublevel (2x2 Sectors)",
    parsecsPerHex: 60,
  },
  {
    id: "sector",
    label: "Sector",
    description: "Sector level",
    parsecsPerHex: 20,
  },
  {
    id: "sector-2x2-subsector",
    label: "Sector 2x2",
    description: "Sector sublevel (2x2 Subsectors)",
    parsecsPerHex: 8,
  },
  {
    id: "subsector",
    label: "Subsector",
    description: "Subsector level",
    parsecsPerHex: 2,
  },
  {
    id: "orbital",
    label: "Orbital",
    description: "Orbital context (opens System Survey for full orbital simulation)",
    parsecsPerHex: 1,
  },
]);

const ALL_ZOOM_LEVELS = HIERARCHY_LEVELS.map((level) => 1 / level.parsecsPerHex).sort((a, b) => a - b);
const DEFAULT_PARSECS_PER_HEX = 60;
const DEFAULT_ZOOM = 1 / DEFAULT_PARSECS_PER_HEX;
const MIN_ZOOM = ALL_ZOOM_LEVELS[0];
const MAX_ZOOM = ALL_ZOOM_LEVELS[ALL_ZOOM_LEVELS.length - 1];
const UNIVERSE_SCALE_PX = 10000; // world px per universe coordinate unit
const GALAXY_DOT_R = 300000; // galaxy blob radius in world space px

// ── Camera ─────────────────────────────────────────────────────────────────
const svgRef = ref(null);
const atlasRootRef = ref(null);
const svgW = ref(window.innerWidth);
const svgH = ref(window.innerHeight);
const zoom = ref(DEFAULT_ZOOM);
const panX = ref(100);
const panY = ref(60);
const dragging = ref(false);
let dragStart = null;
let cameraFrame = 0;
let pendingCamera = null;
const hexPointCache = new Map();

// ── State ──────────────────────────────────────────────────────────────────
const selectedGalaxyId = ref("");
const isLoading = ref(false);
const atlasSectors = ref([]);

const layerHexGrid = ref(true);
const layerNames = ref(true);
const layerCoords = ref(false);
const layerZones = ref(false);

const hoveredHexKey = ref(null);
const hoveredSectorId = ref(null);
const selectedHexKey = ref(null);
const inspectorMode = ref(null); // 'sector' | 'star' | null
const inspectorSector = ref(null);
const inspectorStar = ref(null);
const isGeneratingInspectorSector = ref(false);

const SECTOR_HEX_PRESENCE_RATE = Object.freeze([0.03, 0.03, 0.15, 0.3, 0.5, 0.7]);
const HEX_PRESENCE_COLS = 32;
const HEX_PRESENCE_ROWS = 40;
const HEX_PRESENCE_MORPHOLOGY_SCALE = 0.15;

// ── Store data ─────────────────────────────────────────────────────────────
const galaxies = computed(() => galaxyStore.getAllGalaxies || []);
const sectors = computed(() => atlasSectors.value);

const sectorByCoord = computed(() => {
  const map = new Map();
  for (const s of atlasSectors.value) {
    const sx = Number(s?.coordinates?.x);
    const sy = Number(s?.coordinates?.y);
    if (Number.isFinite(sx) && Number.isFinite(sy)) map.set(`${sx}:${sy}`, s);
  }
  return map;
});

function resolveGalaxyLabel(galaxy) {
  const directName = String(galaxy?.name || "").trim();
  if (directName) return directName;

  const structuredName = galaxy?.galaxyName;
  if (Array.isArray(structuredName) && structuredName.length > 0) {
    const firstName = String(structuredName[0]?.name || structuredName[0] || "").trim();
    if (firstName) return firstName;
  }

  const displayName = String(galaxy?.metadata?.displayName || "").trim();
  if (displayName) return displayName;

  return "Unnamed Galaxy";
}

const galaxyOptions = computed(() =>
  galaxies.value.map((g) => ({
    galaxyId: g.galaxyId,
    label: resolveGalaxyLabel(g),
  })),
);

// ── Grid bounds ────────────────────────────────────────────────────────────
const gridBounds = computed(() => {
  if (!sectors.value.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const xs = sectors.value.map((s) => Number(s?.coordinates?.x)).filter(Number.isFinite);
  const ys = sectors.value.map((s) => Number(s?.coordinates?.y)).filter(Number.isFinite);
  if (!xs.length || !ys.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
});

const minSX = computed(() => gridBounds.value.minX);
const minSY = computed(() => gridBounds.value.minY);

// ── Coordinate helpers ─────────────────────────────────────────────────────
function sectorOrigin(sx, sy) {
  return {
    ox: (sx - minSX.value) * SECTOR_PX_W,
    oy: (sy - minSY.value) * SECTOR_PX_H,
  };
}

function hexWorldCenter(sx, sy, hcol, hrow) {
  const { ox, oy } = sectorOrigin(sx, sy);
  const lcx = HEX_R + (hcol - 1) * HEX_STEP_X;
  const lcy = HEX_STEP_Y * 0.65 + (hrow - 1) * HEX_STEP_Y + (hcol % 2 !== 0 ? HEX_STEP_Y / 2 : 0);
  return { wx: ox + lcx, wy: oy + lcy };
}

function hexPointsAt(wx, wy) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push(`${(wx + HEX_R * Math.cos(a)).toFixed(1)},${(wy + HEX_R * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function getCachedHexPoints(key, wx, wy) {
  const cached = hexPointCache.get(key);
  if (cached) return cached;
  const points = hexPointsAt(wx, wy);
  hexPointCache.set(key, points);
  return points;
}

function queueCameraUpdate(nextPanX, nextPanY, nextZoom) {
  pendingCamera = { panX: nextPanX, panY: nextPanY, zoom: nextZoom };
  if (cameraFrame) return;
  cameraFrame = window.requestAnimationFrame(() => {
    if (pendingCamera) {
      panX.value = pendingCamera.panX;
      panY.value = pendingCamera.panY;
      zoom.value = pendingCamera.zoom;
    }
    pendingCamera = null;
    cameraFrame = 0;
  });
}

// ── Camera transform ───────────────────────────────────────────────────────
const cameraTransform = computed(
  () => `translate(${panX.value.toFixed(2)},${panY.value.toFixed(2)}) scale(${zoom.value})`,
);

// ── Viewport bounds in world space ─────────────────────────────────────────
const viewBounds = computed(() => {
  const pad = HEX_R * 4;
  return {
    x0: -panX.value / zoom.value - pad,
    y0: -panY.value / zoom.value - pad,
    x1: (svgW.value - panX.value) / zoom.value + pad,
    y1: (svgH.value - panY.value) / zoom.value + pad,
  };
});

// ── LOD helpers ────────────────────────────────────────────────────────────
const currentLod = computed(() => {
  if (parsecsPerHex.value > 1000) return "universe";
  if (parsecsPerHex.value > 100) return "galaxy";
  if (parsecsPerHex.value > 20) return "sector";
  if (parsecsPerHex.value > 5) return "hex";
  return "detail";
});

const zoomPct = computed(() => Math.round(zoom.value * 100));
const parsecsPerHex = computed(() => Math.max(1 / MAX_ZOOM, 1 / Math.max(zoom.value, MIN_ZOOM)));
const currentHierarchyLevelIndex = computed(() => {
  const target = parsecsPerHex.value;
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let i = 0; i < HIERARCHY_LEVELS.length; i++) {
    const delta = Math.abs(HIERARCHY_LEVELS[i].parsecsPerHex - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = i;
    }
  }
  return bestIndex;
});
const currentHierarchyLevel = computed(() => HIERARCHY_LEVELS[currentHierarchyLevelIndex.value]);
const lodLabel = computed(() => currentHierarchyLevel.value?.label || "—");
const currentHierarchyId = computed(() => currentHierarchyLevel.value?.id || "galaxy");
const parsecBadge = computed(() => {
  const p = parsecsPerHex.value;
  if (p >= 1000) return `${(p / 1000).toFixed(1)} kpc`;
  if (p >= 100) return `${Math.round(p)} pc`;
  if (p >= 10) return `${p.toFixed(1)} pc`;
  return `${p.toFixed(2)} pc`;
});
const biasReadout = computed(() => `Bias X ${Math.round(gridBiasX.value)} Y ${Math.round(gridBiasY.value)}`);
const showHierarchyLabels = computed(() => !dragging.value && parsecsPerHex.value <= 300);

const sectorTileOpacity = computed(() => {
  if (parsecsPerHex.value > 100) return 0.88;
  if (parsecsPerHex.value > 40) return 0.5;
  if (parsecsPerHex.value > 20) return 0.26;
  return 0.1;
});

// ── Universe LOD: galaxy blobs ───────────────────────────────────────────
const showUniverseLayer = computed(() => parsecsPerHex.value > 1000);

const galaxyDots = computed(() =>
  galaxies.value.map((g, i) => {
    const uc = g?.metadata?.universeCoordinates;
    const ux = Number.isFinite(Number(uc?.x)) ? Number(uc.x) : ((i % 5) - 2) * 100;
    const uy = Number.isFinite(Number(uc?.y)) ? Number(uc.y) : (Math.floor(i / 5) - 1) * 100;
    return {
      galaxyId: g.galaxyId,
      name: resolveGalaxyLabel(g),
      wx: ux * UNIVERSE_SCALE_PX,
      wy: -uy * UNIVERSE_SCALE_PX, // flip Y (positive=up in universe map)
      color: galaxyIndexToColor(i),
      isSelected: g.galaxyId === selectedGalaxyId.value,
    };
  }),
);

const sectorLabelVisible = computed(
  () => !dragging.value && parsecsPerHex.value <= 10 && visibleSectorTiles.value.length <= 80,
);
const sectorLabelSize = computed(() => Math.min(SECTOR_PX_H * (parsecsPerHex.value > 40 ? 0.12 : 0.07), 180));
const showSectorBorders = computed(() => parsecsPerHex.value <= 100);
const showSubsectorBorders = computed(() => !dragging.value && parsecsPerHex.value <= 60);
const sectorBorderWidth = computed(() => Math.max(1, 3 / zoom.value));
const hexGridVisible = computed(() => !dragging.value && layerHexGrid.value && parsecsPerHex.value <= 2);

const continuousSectorTiles = computed(() => {
  if (!showSectorBorders.value && !showSubsectorBorders.value) return [];
  const b = viewBounds.value;
  const padX = SECTOR_PX_W;
  const padY = SECTOR_PX_H;
  const xStart = Math.floor((b.x0 - padX - gridBiasX.value) / SECTOR_PX_W);
  const xEnd = Math.ceil((b.x1 + padX - gridBiasX.value) / SECTOR_PX_W);
  const yStart = Math.floor((b.y0 - padY - gridBiasY.value) / SECTOR_PX_H);
  const yEnd = Math.ceil((b.y1 + padY - gridBiasY.value) / SECTOR_PX_H);

  const tiles = [];
  for (let gx = xStart; gx <= xEnd; gx++) {
    for (let gy = yStart; gy <= yEnd; gy++) {
      tiles.push({
        key: `${gx}:${gy}`,
        wx: gx * SECTOR_PX_W + gridBiasX.value,
        wy: gy * SECTOR_PX_H + gridBiasY.value,
      });
    }
  }
  return tiles;
});

function buildHierarchyTiles(tileSizeInSectors, prefix, labeler) {
  const b = viewBounds.value;
  const tileW = SECTOR_PX_W * tileSizeInSectors;
  const tileH = SECTOR_PX_H * tileSizeInSectors;
  const xStart = Math.floor((b.x0 - tileW) / tileW);
  const xEnd = Math.ceil((b.x1 + tileW) / tileW);
  const yStart = Math.floor((b.y0 - tileH) / tileH);
  const yEnd = Math.ceil((b.y1 + tileH) / tileH);

  const tiles = [];
  for (let gx = xStart; gx <= xEnd; gx++) {
    for (let gy = yStart; gy <= yEnd; gy++) {
      const minSectorX = gx * tileSizeInSectors + minSX.value;
      const minSectorY = gy * tileSizeInSectors + minSY.value;
      tiles.push({
        key: `${prefix}:${gx}:${gy}`,
        wx: gx * tileW,
        wy: gy * tileH,
        ww: tileW,
        wh: tileH,
        hierarchyKeyX: gx,
        hierarchyKeyY: gy,
        minSectorX,
        minSectorY,
        tileSizeInSectors,
        label: labeler(gx, gy),
      });
    }
  }

  return tiles;
}

const quadrantTiles = computed(() =>
  buildHierarchyTiles(QUADRANT_SECTORS, "q4", (gx, gy) => `Q ${gx >= 0 ? `+${gx}` : gx},${gy >= 0 ? `+${gy}` : gy}`),
);
const quadrantSubTiles = computed(() =>
  buildHierarchyTiles(
    QUADRANT_SECTORS / 2,
    "q2",
    (gx, gy) => `Q2 ${gx >= 0 ? `+${gx}` : gx},${gy >= 0 ? `+${gy}` : gy}`,
  ),
);
const regionTiles = computed(() =>
  buildHierarchyTiles(REGION_SECTORS, "r4", (gx, gy) => `R ${gx >= 0 ? `+${gx}` : gx},${gy >= 0 ? `+${gy}` : gy}`),
);
const regionSubTiles = computed(() =>
  buildHierarchyTiles(REGION_SECTORS / 2, "r2", (gx, gy) => `R2 ${gx >= 0 ? `+${gx}` : gx},${gy >= 0 ? `+${gy}` : gy}`),
);
const sectorSubTiles = computed(() =>
  buildHierarchyTiles(0.5, "s2", (gx, gy) => `S2 ${gx >= 0 ? `+${gx}` : gx},${gy >= 0 ? `+${gy}` : gy}`),
);

const visibleQuadrantTiles = computed(() => quadrantTiles.value);
const visibleQuadrantSubTiles = computed(() => quadrantSubTiles.value);
const visibleRegionTiles = computed(() => regionTiles.value);
const visibleRegionSubTiles = computed(() => regionSubTiles.value);
const visibleSectorSubTiles = computed(() => sectorSubTiles.value);

const showQuadrantOverlay = computed(() => currentHierarchyId.value === "quadrant-4x4");
const showQuadrantSubOverlay = computed(() => currentHierarchyId.value === "quadrant-2x2");
const showRegionOverlay = computed(() => currentHierarchyId.value === "region-4x4");
const showRegionSubOverlay = computed(() => currentHierarchyId.value === "region-2x2");
const showSectorSubOverlay = computed(() => currentHierarchyId.value === "sector-2x2-subsector");

const gridClickTiles = computed(() => {
  const b = viewBounds.value;
  const padX = SECTOR_PX_W;
  const padY = SECTOR_PX_H;
  const xStart = Math.floor((b.x0 - padX - gridBiasX.value) / SECTOR_PX_W);
  const xEnd = Math.ceil((b.x1 + padX - gridBiasX.value) / SECTOR_PX_W);
  const yStart = Math.floor((b.y0 - padY - gridBiasY.value) / SECTOR_PX_H);
  const yEnd = Math.ceil((b.y1 + padY - gridBiasY.value) / SECTOR_PX_H);
  const tiles = [];
  for (let gx = xStart; gx <= xEnd; gx++) {
    for (let gy = yStart; gy <= yEnd; gy++) {
      tiles.push({
        key: `${gx}:${gy}`,
        gx,
        gy,
        wx: gx * SECTOR_PX_W + gridBiasX.value,
        wy: gy * SECTOR_PX_H + gridBiasY.value,
      });
    }
  }
  return tiles;
});

const continuousHexSectorTiles = computed(() => {
  if (!hexGridVisible.value) return [];
  const b = viewBounds.value;
  const padX = SECTOR_PX_W;
  const padY = SECTOR_PX_H;
  const xStart = Math.floor((b.x0 - padX) / SECTOR_PX_W);
  const xEnd = Math.ceil((b.x1 + padX) / SECTOR_PX_W);
  const yStart = Math.floor((b.y0 - padY) / SECTOR_PX_H);
  const yEnd = Math.ceil((b.y1 + padY) / SECTOR_PX_H);

  const tiles = [];
  for (let gx = xStart; gx <= xEnd; gx++) {
    for (let gy = yStart; gy <= yEnd; gy++) {
      tiles.push({
        key: `${gx}:${gy}`,
        wx: gx * SECTOR_PX_W,
        wy: gy * SECTOR_PX_H,
      });
    }
  }
  return tiles;
});

const showStars = computed(() => parsecsPerHex.value <= 40);
const renderStars = computed(() => showStars.value && (!dragging.value || parsecsPerHex.value <= 10));
const showStarNames = computed(() => layerNames.value && !dragging.value && parsecsPerHex.value <= 5);
const showStarCoords = computed(() => layerCoords.value && !dragging.value && parsecsPerHex.value <= 10);
const showEmptyCoords = computed(() => layerCoords.value && hexGridVisible.value && parsecsPerHex.value <= 10);
const showTradeRoutes = computed(() => !dragging.value && parsecsPerHex.value <= 5 && visibleStars.value.length <= 320);
const starDataEnabled = computed(() => renderStars.value || hexGridVisible.value || inspectorMode.value === "star");

const effectiveStarR = computed(() => {
  if (parsecsPerHex.value > 20) return 4.5;
  if (parsecsPerHex.value > 5) return 5.5;
  return 7;
});

// ── Sector tiles ───────────────────────────────────────────────────────────
const sectorTileData = computed(() =>
  sectors.value
    .map((sector) => {
      const sx = Number(sector?.coordinates?.x);
      const sy = Number(sector?.coordinates?.y);
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) return null;
      const { ox, oy } = sectorOrigin(sx, sy);
      const densityClass = Math.min(5, Math.max(0, Number(sector.densityClass) || 0));
      const explorationStatus = String(sector?.metadata?.explorationStatus || "").toLowerCase();
      const isExplored = /explored|mapped|charted|surveyed|known/.test(explorationStatus);
      const isVoid = densityClass === 0;
      return {
        sectorId: sector.sectorId,
        sector,
        sx,
        sy,
        wx: ox,
        wy: oy,
        densityClass,
        isVoid,
        showLabel: !isVoid || isExplored,
        name: !isVoid || isExplored ? String(sector?.metadata?.displayName || sector.sectorId) : "",
      };
    })
    .filter(Boolean),
);

const visibleSectorTiles = computed(() => {
  const b = viewBounds.value;
  return sectorTileData.value.filter(
    (t) => t.wx + SECTOR_PX_W >= b.x0 && t.wx <= b.x1 && t.wy + SECTOR_PX_H >= b.y0 && t.wy <= b.y1,
  );
});

// ── Star markers (from sector metadata — no system records needed) ─────────
const allStarMarkers = computed(() => {
  if (!starDataEnabled.value) return [];
  const markers = [];
  for (const tile of visibleSectorTiles.value) {
    const hexStarTypes = tile.sector?.metadata?.hexStarTypes ?? {};
    const occupiedHexes = tile.sector?.metadata?.occupiedHexes ?? [];
    const typedCoords = new Set();

    for (const [coord, info] of Object.entries(hexStarTypes)) {
      const hcol = parseInt(coord.slice(0, 2), 10);
      const hrow = parseInt(coord.slice(2, 4), 10);
      if (!Number.isFinite(hcol) || !Number.isFinite(hrow)) continue;
      const { wx, wy } = hexWorldCenter(tile.sx, tile.sy, hcol, hrow);
      const starType = String(info.starType || "G2");
      typedCoords.add(coord);
      markers.push({
        key: `${tile.sectorId}:${coord}`,
        galaxyId: tile.sector?.galaxyId,
        sectorId: tile.sectorId,
        sectorName: tile.name,
        coord,
        wx,
        wy,
        starType,
        starClass: info.starClass || "",
        color: starTypeToColor(starType, info.starClass || ""),
        compColor: starTypeToColor(info.secondaryStars?.[0] || "M", ""),
        hasSecondary: (info.secondaryStars?.length ?? 0) > 0,
        name: "",
      });
    }

    // Presence-only hexes (from "Generate All Sectors" without star types)
    for (const coord of occupiedHexes) {
      if (typedCoords.has(coord)) continue;
      const hcol = parseInt(coord.slice(0, 2), 10);
      const hrow = parseInt(coord.slice(2, 4), 10);
      if (!Number.isFinite(hcol) || !Number.isFinite(hrow)) continue;
      const { wx, wy } = hexWorldCenter(tile.sx, tile.sy, hcol, hrow);
      markers.push({
        key: `${tile.sectorId}:${coord}`,
        galaxyId: tile.sector?.galaxyId,
        sectorId: tile.sectorId,
        sectorName: tile.name,
        coord,
        wx,
        wy,
        starType: "?",
        starClass: "",
        color: "#909090",
        compColor: "#707070",
        hasSecondary: false,
        name: "",
      });
    }
  }
  return markers;
});

const visibleStars = computed(() => {
  if (!renderStars.value) return [];
  const b = viewBounds.value;
  const stars = allStarMarkers.value.filter((s) => s.wx >= b.x0 && s.wx <= b.x1 && s.wy >= b.y0 && s.wy <= b.y1);
  if (!dragging.value) return stars;
  const stride = parsecsPerHex.value > 20 ? 4 : 2;
  return stars.filter((_, index) => index % stride === 0);
});

const starMarkerByKey = computed(() => new Map(allStarMarkers.value.map((star) => [star.key, star])));

const visibleTradeRoutes = computed(() => {
  if (!showTradeRoutes.value) return [];
  const bySector = new Map();
  for (const star of visibleStars.value) {
    if (!bySector.has(star.sectorId)) bySector.set(star.sectorId, []);
    bySector.get(star.sectorId).push(star);
  }

  const routes = [];
  for (const [sectorId, stars] of bySector.entries()) {
    stars.sort((a, b) => a.coord.localeCompare(b.coord));
    for (let i = 1; i < stars.length; i++) {
      const a = stars[i - 1];
      const b = stars[i];
      const dist = Math.hypot(a.wx - b.wx, a.wy - b.wy);
      if (dist > HEX_STEP_X * 8) continue;
      routes.push({
        key: `${sectorId}:${a.coord}-${b.coord}`,
        x1: a.wx,
        y1: a.wy,
        x2: b.wx,
        y2: b.wy,
      });
    }
  }

  return routes;
});

function starRenderFill(star) {
  if (parsecsPerHex.value <= 10) return "#f8fbff";
  return star.color;
}

// ── Hex grid cells──────────────────────────────────────────────────────────
const occupiedKeySet = computed(() =>
  hexGridVisible.value ? new Set(allStarMarkers.value.map((s) => s.key)) : new Set(),
);

const visibleHexCells = computed(() => {
  if (!hexGridVisible.value) return [];
  const b = viewBounds.value;
  const cells = [];
  for (const tile of visibleSectorTiles.value) {
    const { ox, oy } = sectorOrigin(tile.sx, tile.sy);
    const cStart = Math.max(1, Math.floor((b.x0 - ox - HEX_R) / HEX_STEP_X) + 1);
    const cEnd = Math.min(SECTOR_COLS, Math.ceil((b.x1 - ox - HEX_R) / HEX_STEP_X) + 1);

    for (let c = cStart; c <= cEnd; c++) {
      const colYOffset = HEX_STEP_Y * 0.65 + (c % 2 !== 0 ? HEX_STEP_Y / 2 : 0);
      const rowBase = oy + colYOffset;
      const rStart = Math.max(1, Math.floor((b.y0 - rowBase) / HEX_STEP_Y) + 1);
      const rEnd = Math.min(SECTOR_ROWS, Math.ceil((b.y1 - rowBase) / HEX_STEP_Y) + 1);

      for (let r = rStart; r <= rEnd; r++) {
        const lcx = HEX_R + (c - 1) * HEX_STEP_X;
        const lcy = HEX_STEP_Y * 0.65 + (r - 1) * HEX_STEP_Y + (c % 2 !== 0 ? HEX_STEP_Y / 2 : 0);
        const wx = ox + lcx;
        const wy = oy + lcy;
        const coord = `${String(c).padStart(2, "0")}${String(r).padStart(2, "0")}`;
        const key = `${tile.sectorId}:${coord}`;
        cells.push({
          key,
          coord,
          wx,
          wy,
          occupied: occupiedKeySet.value.has(key),
          points: getCachedHexPoints(key, wx, wy),
        });
      }
    }
  }
  return cells;
});

const continuousHexCells = computed(() => {
  if (!hexGridVisible.value) return [];
  const b = viewBounds.value;
  const cells = [];

  // Build guide hexes from an un-biased virtual sector lattice so the hex overlay stays continuous.
  // Sector/subsector overlay bias is intentionally not applied here.
  for (const tile of continuousHexSectorTiles.value) {
    const ox = tile.wx;
    const oy = tile.wy;
    const cStart = Math.max(1, Math.floor((b.x0 - ox - HEX_R) / HEX_STEP_X) + 1);
    const cEnd = Math.min(SECTOR_COLS, Math.ceil((b.x1 - ox - HEX_R) / HEX_STEP_X) + 1);

    for (let c = cStart; c <= cEnd; c++) {
      const colYOffset = HEX_STEP_Y * 0.65 + (c % 2 !== 0 ? HEX_STEP_Y / 2 : 0);
      const rowBase = oy + colYOffset;
      const rStart = Math.max(1, Math.floor((b.y0 - rowBase) / HEX_STEP_Y) + 1);
      const rEnd = Math.min(SECTOR_ROWS, Math.ceil((b.y1 - rowBase) / HEX_STEP_Y) + 1);

      for (let r = rStart; r <= rEnd; r++) {
        const lcx = HEX_R + (c - 1) * HEX_STEP_X;
        const lcy = HEX_STEP_Y * 0.65 + (r - 1) * HEX_STEP_Y + (c % 2 !== 0 ? HEX_STEP_Y / 2 : 0);
        const wx = ox + lcx;
        const wy = oy + lcy;
        const coord = `${String(c).padStart(2, "0")}${String(r).padStart(2, "0")}`;
        cells.push({
          key: `gh:${tile.key}:${coord}`,
          points: getCachedHexPoints(`gh:${tile.key}:${coord}`, wx, wy),
        });
      }
    }
  }

  return cells;
});

const sparseCoordHexes = computed(() => {
  const step = zoom.value >= LOD_HEX ? 4 : 8;
  return visibleHexCells.value.filter((h, i) => !h.occupied && i % step === 0);
});

// Placeholder — extend when travel zone stored per hex
const travelZoneHexes = computed(() => []);

// ── Inspector computed ─────────────────────────────────────────────────────
const inspectorVisible = computed(() => inspectorMode.value !== null);

const inspectorData = computed(() => {
  if (inspectorMode.value === "sector" && inspectorSector.value) {
    const s = inspectorSector.value;
    const sx = Number(s?.coordinates?.x);
    const sy = Number(s?.coordinates?.y);
    return {
      name: String(s?.metadata?.displayName || s.sectorId),
      coords: `${Number.isFinite(sx) ? sx : "?"},${Number.isFinite(sy) ? sy : "?"}`,
      densityLabel: DENSITY_SCALE[Math.min(5, Math.max(0, Number(s.densityClass) || 0))].label,
      systemCount: s?.metadata?.systemCount ?? "—",
      status: String(s?.metadata?.explorationStatus || "Unexplored"),
    };
  }
  if (inspectorMode.value === "star" && inspectorStar.value) {
    const star = inspectorStar.value;
    return {
      name: star.starType !== "?" ? `${star.starType} Star` : `System ${star.coord}`,
      coord: star.coord,
      sectorName: star.sectorName,
      starType: star.starType,
      color: star.color,
      compColor: star.compColor,
      hasSecondary: star.hasSecondary,
    };
  }
  return {};
});

const inspectorStarSvgR = computed(() => {
  const t = String(inspectorData.value?.starType || "G")
    .charAt(0)
    .toUpperCase();
  return { O: 13, B: 11, A: 10, F: 9, G: 8, K: 7, M: 5, D: 4, L: 4, T: 3, Y: 3 }[t] ?? 7;
});

const inspectorOrbits = computed(() => {
  if (inspectorMode.value !== "star") return [];
  return buildPlaceholderOrbits(inspectorData.value?.starType || "G", inspectorStarSvgR.value);
});

function buildPlaceholderOrbits(starType, starR) {
  const t = String(starType).charAt(0).toUpperCase();
  const count = { O: 6, B: 6, A: 5, F: 5, G: 4, K: 4, M: 3, D: 2, L: 1, T: 0, Y: 0 }[t] ?? 3;
  const baseRx = starR + 9;
  const gap = Math.max(7, (72 - baseRx) / Math.max(count, 1));
  const names = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  return Array.from({ length: count }, (_, i) => {
    const rx = baseRx + i * gap;
    const ry = rx * 0.78;
    const angle = (i * 61 * Math.PI) / 180;
    const frac = i / Math.max(count - 1, 1);
    return {
      rx,
      ry,
      px: Math.cos(angle) * rx,
      py: Math.sin(angle) * ry,
      pr: frac > 0.55 ? 3.8 : frac > 0.3 ? 2.5 : 1.8,
      color: frac < 0.25 ? "#c4855a" : frac < 0.55 ? "#5aac6e" : "#7a9dc8",
      zoneColor: frac < 0.25 ? "#5a3020" : frac < 0.55 ? "#1a4a2a" : "#1a2a4a",
      label: names[i] ?? String(i + 1),
    };
  });
}

// ── Color tables ───────────────────────────────────────────────────────────
const DENSITY_SCALE = [
  { color: "#000000", label: "True Void", range: "1-5%" },
  { color: "#1f1f1f", label: "Outer Ring", range: "5-10%" },
  { color: "#3b3b3b", label: "Mid Ring", range: "10-20%" },
  { color: "#575757", label: "Inner Ring", range: "20-40%" },
  { color: "#7a7a7a", label: "Disk", range: "40-60%" },
  { color: "#a3a3a3", label: "Core", range: "60-80%" },
];

function densityFill(v) {
  return DENSITY_SCALE[Math.min(5, Math.max(0, Number(v) || 0))].color;
}

function starTypeToColor(starType, starClass) {
  const s = String(starClass || starType || "").toUpperCase();
  if (/^O/.test(s)) return "#b8d4ff";
  if (/^B/.test(s)) return "#cce0ff";
  if (/^A/.test(s)) return "#eeeeff";
  if (/^F/.test(s)) return "#ffffcc";
  if (/^G/.test(s)) return "#ffee88";
  if (/^K/.test(s)) return "#ffaa44";
  if (/^M/.test(s)) return "#ff6633";
  if (/^D/.test(s)) return "#aabfdd";
  if (/^L/.test(s)) return "#882200";
  if (/^T/.test(s)) return "#5a1800";
  if (/^Y/.test(s)) return "#3a0e00";
  if (/anomaly|core/i.test(s)) return "#ff44ff";
  return "#ffd575";
}

// ── Universe helpers ───────────────────────────────────────────────────────
function galaxyIndexToColor(index) {
  const PALETTE = ["#4d90ff", "#a050e0", "#e050a0", "#e07030", "#30c070", "#20b0b0", "#d0b020", "#e04040"];
  return PALETTE[index % PALETTE.length];
}

async function onGalaxyDotClick(dot) {
  if (dragging.value) return;
  if (dot.galaxyId !== selectedGalaxyId.value || !sectors.value.length) {
    selectedGalaxyId.value = dot.galaxyId;
    await handleGalaxyChange();
  } else {
    resetView();
  }
}

// ── Interaction ────────────────────────────────────────────────────────────
function onWheel(event) {
  const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
  const currentZoom = pendingCamera?.zoom ?? zoom.value;
  const currentPanX = pendingCamera?.panX ?? panX.value;
  const currentPanY = pendingCamera?.panY ?? panY.value;
  const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom * factor));
  const rect = svgRef.value?.getBoundingClientRect();
  if (!rect) {
    queueCameraUpdate(currentPanX, currentPanY, newZoom);
    return;
  }
  // Zoom to cursor position
  const cx = event.clientX - rect.left;
  const cy = event.clientY - rect.top;
  const nextPanX = cx - (cx - currentPanX) * (newZoom / currentZoom);
  const nextPanY = cy - (cy - currentPanY) * (newZoom / currentZoom);
  queueCameraUpdate(nextPanX, nextPanY, newZoom);
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  dragStart = {
    pointerId: event.pointerId,
    cx: event.clientX,
    cy: event.clientY,
    bpx: panX.value,
    bpy: panY.value,
    moved: false,
  };
  svgRef.value?.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  if (!dragStart || dragStart.pointerId !== event.pointerId) return;
  const dx = event.clientX - dragStart.cx;
  const dy = event.clientY - dragStart.cy;
  if (!dragStart.moved && Math.hypot(dx, dy) < 4) return;
  dragStart.moved = true;
  dragging.value = true;
  queueCameraUpdate(dragStart.bpx + dx, dragStart.bpy + dy, pendingCamera?.zoom ?? zoom.value);
}

function onPointerUp(event) {
  if (!dragStart || dragStart.pointerId !== event.pointerId) return;
  svgRef.value?.releasePointerCapture?.(event.pointerId);
  const wasDragged = dragStart.moved;
  const downX = dragStart.cx;
  const downY = dragStart.cy;
  if (pendingCamera) {
    panX.value = pendingCamera.panX;
    panY.value = pendingCamera.panY;
    zoom.value = pendingCamera.zoom;
    pendingCamera = null;
  }
  dragStart = null;
  dragging.value = false;
  if (!wasDragged) {
    handleMapPointerClick(downX, downY);
  }
}

function handleMapPointerClick(clientX, clientY) {
  const svgRect = svgRef.value?.getBoundingClientRect();
  if (!svgRect) return;

  // Convert client → SVG screen → world coords (inverse camera transform)
  const svgX = clientX - svgRect.left;
  const svgY = clientY - svgRect.top;
  const wx = (svgX - panX.value) / zoom.value;
  const wy = (svgY - panY.value) / zoom.value;

  // Star proximity check when star layer is rendered
  if (renderStars.value && visibleStars.value.length > 0) {
    const hitR = 14 / zoom.value;
    const nearest = visibleStars.value.find((s) => Math.hypot(s.wx - wx, s.wy - wy) <= hitR);
    if (nearest) {
      onStarClick(nearest);
      return;
    }
  }

  // Map world position → sector grid index → DB coordinates
  const gx = Math.floor(wx / SECTOR_PX_W);
  const gy = Math.floor(wy / SECTOR_PX_H);
  const sxCoord = gx + minSX.value;
  const syCoord = gy + minSY.value;

  const existing = sectorByCoord.value.get(`${sxCoord}:${syCoord}`);
  if (existing) {
    inspectorSector.value = existing;
    inspectorMode.value = "sector";
    selectedHexKey.value = null;
    inspectorStar.value = null;
    if (zoom.value < LOD_SECTOR * 0.7) focusSector(existing);
  } else {
    // Unmapped grid cell – show stub so the user can generate it
    inspectorSector.value = {
      sectorId: `grid:${sxCoord}:${syCoord}`,
      coordinates: { x: sxCoord, y: syCoord },
      densityClass: 0,
      metadata: { displayName: `Sector ${sxCoord},${syCoord}`, explorationStatus: "Unknown", systemCount: 0 },
    };
    inspectorMode.value = "sector";
    selectedHexKey.value = null;
    inspectorStar.value = null;
  }
}

function clearSelection() {
  if (dragging.value) return;
  selectedHexKey.value = null;
  inspectorMode.value = null;
  inspectorSector.value = null;
  inspectorStar.value = null;
}

function onSectorTileClick(tile) {
  if (dragging.value) return;

  inspectorSector.value = tile.sector;
  inspectorMode.value = "sector";
  selectedHexKey.value = null;
  inspectorStar.value = null;

  // Also zoom into the clicked sector when far out.
  if (zoom.value < LOD_SECTOR * 0.7) {
    focusSector(tile.sector);
  }
}

function onGridCellClick(tile) {
  if (dragging.value) return;
  const sx = Math.round(tile.gx + minSX.value + gridBiasX.value / SECTOR_PX_W);
  const sy = Math.round(tile.gy + minSY.value + gridBiasY.value / SECTOR_PX_H);
  const existing = sectorByCoord.value.get(`${sx}:${sy}`);
  if (existing) {
    inspectorSector.value = existing;
  } else {
    inspectorSector.value = {
      sectorId: `grid:${sx}:${sy}`,
      coordinates: { x: sx, y: sy },
      densityClass: 0,
      metadata: { displayName: `Sector ${sx},${sy}`, explorationStatus: "Unknown", systemCount: 0 },
    };
  }
  inspectorMode.value = "sector";
  selectedHexKey.value = null;
  inspectorStar.value = null;
  if (zoom.value < LOD_SECTOR * 0.7) {
    focusSector(inspectorSector.value);
  }
}

function onHexClick(hex) {
  if (dragging.value) return;
  if (!hex.occupied) {
    clearSelection();
    return;
  }
  const star = starMarkerByKey.value.get(hex.key);
  if (star) onStarClick(star);
}

function onStarClick(star) {
  if (dragging.value) return;
  selectedHexKey.value = star.key;
  inspectorStar.value = { ...star };
  inspectorMode.value = "star";
  inspectorSector.value = null;
}

function focusSector(sector) {
  const sx = Number(sector?.coordinates?.x);
  const sy = Number(sector?.coordinates?.y);
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
  const { ox, oy } = sectorOrigin(sx, sy);
  const targetZoom = Math.min(MAX_ZOOM, LOD_SECTOR * 1.4);
  panX.value = svgW.value / 2 - (ox + SECTOR_PX_W / 2) * targetZoom;
  panY.value = svgH.value / 2 - (oy + SECTOR_PX_H / 2) * targetZoom;
  zoom.value = targetZoom;
}

function focusSectorFromInspector() {
  if (inspectorSector.value) focusSector(inspectorSector.value);
}

function sectorHexCoord(col, row) {
  return `${String(col).padStart(2, "0")}${String(row).padStart(2, "0")}`;
}

function hasSecondary() {
  return Math.random() < 0.35;
}

function getSectorGenerationContext(sector) {
  if (!sector) return { galaxy: null, densityClass: 3 };
  const galaxy = galaxies.value.find((g) => g.galaxyId === sector.galaxyId) ?? null;
  const densityClass = Math.min(5, Math.max(0, Number(sector.densityClass ?? 3)));
  return { galaxy, densityClass };
}

function isGalacticCenterSector(sector) {
  const gx = Number(sector?.metadata?.gridX);
  const gy = Number(sector?.metadata?.gridY);
  return Number.isFinite(gx) && Number.isFinite(gy) && gx === 0 && gy === 0;
}

function centerAnomalyTypeForGalaxy(galaxy) {
  const raw = String(galaxy?.morphology?.centralAnomaly?.type || "").trim();
  return raw || "Black Hole";
}

function rollOccupiedHexesForSector(galaxy, densityClass) {
  const baseRate = SECTOR_HEX_PRESENCE_RATE[densityClass];
  const occupiedHexes = [];
  for (let c = 1; c <= HEX_PRESENCE_COLS; c++) {
    for (let r = 1; r <= HEX_PRESENCE_ROWS; r++) {
      const prob = calculateHexOccupancyProbability({
        baseRate,
        col: c,
        row: r,
        cols: HEX_PRESENCE_COLS,
        rows: HEX_PRESENCE_ROWS,
        galaxyType: galaxy?.type,
        morphology: galaxy?.morphology,
        realismScale: 1,
        morphologyScale: HEX_PRESENCE_MORPHOLOGY_SCALE,
      });
      if (Math.random() < prob) {
        occupiedHexes.push(sectorHexCoord(c, r));
      }
    }
  }
  return occupiedHexes;
}

function applySectorUpdate(updatedSector) {
  if (!updatedSector?.sectorId) return;
  const idx = atlasSectors.value.findIndex((entry) => entry.sectorId === updatedSector.sectorId);
  if (idx >= 0) {
    atlasSectors.value[idx] = updatedSector;
  }
  inspectorSector.value = updatedSector;
}

async function generateInspectorSector() {
  const sector = inspectorSector.value;
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  try {
    const { galaxy, densityClass } = getSectorGenerationContext(sector);
    const occupiedHexes = rollOccupiedHexesForSector(galaxy, densityClass);
    if (isGalacticCenterSector(sector)) {
      const centerCoord = sectorHexCoord(Math.ceil(HEX_PRESENCE_COLS / 2), Math.ceil(HEX_PRESENCE_ROWS / 2));
      if (!occupiedHexes.includes(centerCoord)) {
        occupiedHexes.push(centerCoord);
      }
    }
    const galacticCenter = isGalacticCenterSector(sector);
    const anomalyType = galacticCenter ? centerAnomalyTypeForGalaxy(galaxy) : null;

    const payload = {
      ...sector,
      metadata: {
        ...(sector.metadata ?? {}),
        systemCount: occupiedHexes.length,
        hexPresenceGenerated: true,
        hexPresenceGeneratedAt: new Date().toISOString(),
        occupiedHexes,
        isGalacticCenterSector: galacticCenter,
        centralAnomalyType: anomalyType,
      },
    };

    const updated = await sectorApi.updateSector(sector.sectorId, payload);
    applySectorUpdate(updated);
    toastService.success(
      `Generated sector presence for ${occupiedHexes.length.toLocaleString()} occupied hexes in ${String(sector.metadata?.displayName || sector.sectorId)}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate sector: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
  }
}

async function generateInspectorSectorSystems() {
  const sector = inspectorSector.value;
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  try {
    const { galaxy, densityClass } = getSectorGenerationContext(sector);
    const existingOccupiedHexes = Array.isArray(sector?.metadata?.occupiedHexes)
      ? sector.metadata.occupiedHexes.filter((coord) => typeof coord === "string")
      : [];
    const occupiedHexes =
      existingOccupiedHexes.length > 0 ? existingOccupiedHexes : rollOccupiedHexesForSector(galaxy, densityClass);
    const galacticCenter = isGalacticCenterSector(sector);
    const centerCoord = sectorHexCoord(Math.ceil(HEX_PRESENCE_COLS / 2), Math.ceil(HEX_PRESENCE_ROWS / 2));
    const anomalyType = galacticCenter ? centerAnomalyTypeForGalaxy(galaxy) : null;
    if (galacticCenter && !occupiedHexes.includes(centerCoord)) {
      occupiedHexes.push(centerCoord);
    }

    const hexStarTypes = {};
    for (const coord of occupiedHexes) {
      if (galacticCenter && coord === centerCoord) {
        hexStarTypes[coord] = {
          starType: anomalyType,
          starClass: "anomaly-core",
          secondaryStars: [],
          anomalyType,
        };
      } else {
        const primary = generatePrimaryStar();
        hexStarTypes[coord] = {
          starType: primary.designation,
          starClass: "",
          secondaryStars: hasSecondary() ? [generatePrimaryStar().designation] : [],
          anomalyType: null,
        };
      }
    }

    const payload = {
      ...sector,
      metadata: {
        ...(sector.metadata ?? {}),
        systemCount: occupiedHexes.length,
        hexPresenceGenerated: true,
        hexPresenceGeneratedAt: new Date().toISOString(),
        occupiedHexes,
        hexStarTypes,
        isGalacticCenterSector: galacticCenter,
        centralAnomalyType: anomalyType,
      },
    };

    const updated = await sectorApi.updateSector(sector.sectorId, payload);
    applySectorUpdate(updated);
    toastService.success(
      `Generated systems for ${occupiedHexes.length.toLocaleString()} hexes in ${String(sector.metadata?.displayName || sector.sectorId)}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate systems: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
  }
}

function zoomToHierarchyLevel(index) {
  const clampedIndex = Math.max(0, Math.min(HIERARCHY_LEVELS.length - 1, index));
  const parsecs = HIERARCHY_LEVELS[clampedIndex].parsecsPerHex;
  applyZoomCentered(1 / parsecs);
}

function zoomToHierarchyLevelId(levelId) {
  const idx = HIERARCHY_LEVELS.findIndex((level) => level.id === levelId);
  if (idx < 0) return;
  zoomToHierarchyLevel(idx);
}

function focusHierarchyTile(tile) {
  const cx = tile.wx + tile.ww / 2;
  const cy = tile.wy + tile.wh / 2;
  const id = currentHierarchyId.value;
  const nextByLevel = {
    "quadrant-4x4": "quadrant-2x2",
    "quadrant-2x2": "region-4x4",
    "region-4x4": "region-2x2",
    "region-2x2": "sector",
    sector: "sector-2x2-subsector",
    "sector-2x2-subsector": "subsector",
  };
  const nextLevelId = nextByLevel[id] || id;
  const nextLevel = HIERARCHY_LEVELS.find((level) => level.id === nextLevelId) || currentHierarchyLevel.value;
  const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, 1 / nextLevel.parsecsPerHex));
  panX.value = svgW.value / 2 - cx * targetZoom;
  panY.value = svgH.value / 2 - cy * targetZoom;
  zoom.value = targetZoom;
}

function zoomToNextHierarchyLevel() {
  if (currentHierarchyId.value === "subsector" && inspectorMode.value === "star") {
    zoomToHierarchyLevelId("orbital");
    openOrbitalView();
    return;
  }
  zoomToHierarchyLevel(currentHierarchyLevelIndex.value + 1);
}

function zoomToPreviousHierarchyLevel() {
  zoomToHierarchyLevel(currentHierarchyLevelIndex.value - 1);
}

function zoomIn() {
  zoomToNextHierarchyLevel();
}

function zoomOut() {
  zoomToPreviousHierarchyLevel();
}

function applyZoomCentered(newZoom) {
  const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
  const cx = svgW.value / 2;
  const cy = svgH.value / 2;
  panX.value = cx - (cx - panX.value) * (clamped / zoom.value);
  panY.value = cy - (cy - panY.value) * (clamped / zoom.value);
  zoom.value = clamped;
}

function resetView() {
  if (!sectors.value.length) {
    // No sectors loaded — show universe overview, fit galaxy blobs
    if (!galaxyDots.value.length) {
      zoom.value = DEFAULT_ZOOM;
      panX.value = svgW.value / 2;
      panY.value = svgH.value / 2;
      return;
    }
    const wxs = galaxyDots.value.map((d) => d.wx);
    const wys = galaxyDots.value.map((d) => d.wy);
    const pad = GALAXY_DOT_R * 5;
    const minWX = Math.min(...wxs) - pad;
    const maxWX = Math.max(...wxs) + pad;
    const minWY = Math.min(...wys) - pad;
    const maxWY = Math.max(...wys) + pad;
    const worldW = Math.max(maxWX - minWX, GALAXY_DOT_R * 10);
    const worldH = Math.max(maxWY - minWY, GALAXY_DOT_R * 10);
    const fitZoom = Math.max(MIN_ZOOM, Math.min((svgW.value * 0.85) / worldW, (svgH.value * 0.85) / worldH));
    zoom.value = fitZoom;
    panX.value = svgW.value / 2 - ((minWX + maxWX) / 2) * fitZoom;
    panY.value = svgH.value / 2 - ((minWY + maxWY) / 2) * fitZoom;
    return;
  }
  const { minX, maxX, minY, maxY } = gridBounds.value;
  const worldW = (maxX - minX + 1) * SECTOR_PX_W;
  const worldH = (maxY - minY + 1) * SECTOR_PX_H;
  const fitZoom = Math.min((svgW.value * 0.88) / worldW, (svgH.value * 0.88) / worldH, 0.45);
  const closestHierarchy = HIERARCHY_LEVELS.reduce(
    (best, level) => {
      const levelZoom = 1 / level.parsecsPerHex;
      const delta = Math.abs(levelZoom - fitZoom);
      return delta < best.delta ? { zoom: levelZoom, delta } : best;
    },
    { zoom: 1 / HIERARCHY_LEVELS[0].parsecsPerHex, delta: Number.POSITIVE_INFINITY },
  );
  zoom.value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, closestHierarchy.zoom));
  panX.value = (svgW.value - worldW * zoom.value) / 2;
  panY.value = (svgH.value - worldH * zoom.value) / 2;
}

function openStarSystem() {
  const star = inspectorStar.value;
  if (!star || !selectedGalaxyId.value) return;
  const targetGalaxyId = selectedGalaxyId.value === ALL_GALAXIES_VALUE ? star.galaxyId : selectedGalaxyId.value;
  if (!targetGalaxyId) return;
  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: targetGalaxyId, sectorId: star.sectorId },
    query: { hex: star.coord, star: star.starType },
  });
}

function openOrbitalView() {
  const star = inspectorStar.value;
  if (!star || !selectedGalaxyId.value) return;
  const targetGalaxyId = selectedGalaxyId.value === ALL_GALAXIES_VALUE ? star.galaxyId : selectedGalaxyId.value;
  if (!targetGalaxyId) return;

  router.push({
    name: "OrbitalView",
    params: { galaxyId: targetGalaxyId, sectorId: star.sectorId },
    query: {
      hex: star.coord,
      star: star.starType,
      from: "atlas",
    },
  });
}

// ── Data loading ───────────────────────────────────────────────────────────
async function handleGalaxyChange() {
  clearSelection();
  if (!selectedGalaxyId.value) {
    atlasSectors.value = [];
    return;
  }

  isLoading.value = true;
  try {
    if (selectedGalaxyId.value === ALL_GALAXIES_VALUE) {
      const galaxyIds = galaxyOptions.value.map((g) => g.galaxyId);
      const sectorsByGalaxy = await Promise.all(galaxyIds.map((galaxyId) => sectorApi.getSectors(galaxyId)));
      atlasSectors.value = sectorsByGalaxy.flat();
    } else {
      await sectorStore.loadSectors(selectedGalaxyId.value);
      atlasSectors.value = sectorStore.getAllSectors || [];
    }
    resetView();
  } catch (err) {
    toastService.error(`Failed to load sectors: ${err.message}`);
    atlasSectors.value = [];
  } finally {
    isLoading.value = false;
  }
}

// ── Resize handler ─────────────────────────────────────────────────────────
function onResize() {
  const root = atlasRootRef.value;
  if (root) {
    const top = root.getBoundingClientRect().top;
    const availableHeight = Math.max(360, Math.floor(window.innerHeight - top));
    root.style.height = `${availableHeight}px`;
    svgW.value = root.clientWidth;
    svgH.value = root.clientHeight;
    return;
  }
  svgW.value = window.innerWidth;
  svgH.value = window.innerHeight;
}

function syncAtlasBiasFromStorage() {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const x = Number(parsed?.atlasGridBiasX);
    const y = Number(parsed?.atlasGridBiasY);
    if (Number.isFinite(x)) preferencesStore.set("atlasGridBiasX", x);
    if (Number.isFinite(y)) preferencesStore.set("atlasGridBiasY", y);
  } catch {
    // Ignore malformed storage payloads.
  }
}

function onPreferencesStorageChanged(event) {
  if (event.key !== PREFERENCES_STORAGE_KEY) return;
  syncAtlasBiasFromStorage();
}

onMounted(async () => {
  window.addEventListener("resize", onResize);
  window.addEventListener("storage", onPreferencesStorageChanged);
  syncAtlasBiasFromStorage();
  onResize();
  isLoading.value = true;
  try {
    await galaxyStore.loadGalaxies();
    if (galaxyStore.currentGalaxyId) {
      selectedGalaxyId.value = galaxyStore.currentGalaxyId;
      await handleGalaxyChange();
    } else {
      // No current galaxy — start at universe overview showing galaxy blobs
      selectedGalaxyId.value = "";
      atlasSectors.value = [];
      resetView();
    }
  } finally {
    isLoading.value = false;
  }
});

watch(
  () => [sectors.value.length, minSX.value, minSY.value],
  () => {
    hexPointCache.clear();
  },
);

onUnmounted(() => {
  if (cameraFrame) window.cancelAnimationFrame(cameraFrame);
  window.removeEventListener("resize", onResize);
  window.removeEventListener("storage", onPreferencesStorageChanged);
});

// Auto-reset view once sector data arrives
watch(
  () => sectors.value.length,
  (len, prev) => {
    if (len > 0 && (!prev || prev === 0)) resetView();
  },
);
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────────────────── */
.atlas-root {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  background: #070b1c;
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */
.atlas-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.4rem 1rem;
  background: rgba(6, 10, 28, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #1e3460;
  flex-wrap: wrap;
}

.toolbar-brand {
  font-size: 0.88rem;
  font-weight: 700;
  color: #4dc2ff;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 1;
  min-width: 0;
}

.atlas-select {
  background: #0d1830;
  color: #c8e8ff;
  border: 1px solid #2b4a78;
  border-radius: 0.35rem;
  padding: 0.26rem 0.55rem;
  font-size: 0.8rem;
  min-width: 150px;
}

.zoom-cluster {
  display: flex;
  border: 1px solid #2b4a78;
  border-radius: 0.35rem;
  overflow: hidden;
}

.level-cluster {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tb-btn {
  background: #0f1e38;
  color: #c0d8f0;
  border: none;
  padding: 0.26rem 0.55rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.tb-btn:hover {
  background: #1a3060;
}

.zoom-badge {
  background: #0d1830;
  color: #7ec9f3;
  border: none;
  padding: 0.26rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  min-width: 44px;
  text-align: center;
}

.zoom-badge:hover {
  color: #b0e0ff;
}

.lod-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.16rem 0.52rem;
  border-radius: 999px;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.lod-galaxy {
  background: #1a2a50;
  color: #7ab8ff;
}
.lod-sector {
  background: #1c3440;
  color: #5dd4b8;
}
.lod-hex {
  background: #2a3020;
  color: #a8d870;
}
.lod-detail {
  background: #3a2810;
  color: #f0aa60;
}
.lod-universe {
  background: #080e28;
  color: #a0d0ff;
}

.toolbar-layers {
  display: flex;
  gap: 0.28rem;
}

.tb-toggle {
  background: #0f1e38;
  color: #6888a8;
  border: 1px solid #2b4a78;
  border-radius: 0.28rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.73rem;
  cursor: pointer;
}

.tb-toggle:hover {
  color: #9ab8d8;
  background: #162840;
}
.tb-toggle.active {
  background: #1a4474;
  color: #7ec9f3;
  border-color: #3a84c8;
}

/* ── SVG ──────────────────────────────────────────────────────────────────── */
.atlas-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  touch-action: none;
  cursor: grab;
}

.atlas-svg.dragging {
  cursor: grabbing;
}

/* ── Sector tiles ─────────────────────────────────────────────────────────── */
.sector-tile {
  stroke: none;
  cursor: pointer;
}
.sector-tile.hovered {
  filter: brightness(1.55);
}

.sector-border {
  stroke: rgba(70, 120, 190, 0.55);
  stroke-width: 1;
  pointer-events: none;
}

.subsector-border {
  stroke: rgba(120, 170, 220, 0.4);
  stroke-width: 1;
  stroke-dasharray: 5 3;
  pointer-events: none;
}

.hierarchy-tile {
  fill: transparent;
  cursor: pointer;
}

.hierarchy-tile-quadrant {
  stroke: rgba(94, 170, 255, 0.75);
  stroke-width: 2.3;
}

.hierarchy-tile-region {
  stroke: rgba(96, 220, 186, 0.72);
  stroke-width: 1.8;
}

.hierarchy-tile-sub {
  stroke: rgba(176, 214, 255, 0.45);
  stroke-width: 1.2;
  stroke-dasharray: 7 4;
}

.hierarchy-tile:hover {
  fill: rgba(120, 185, 255, 0.08);
}

.hierarchy-label {
  fill: rgba(190, 230, 255, 0.92);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  pointer-events: none;
}

.sector-label {
  fill: rgba(180, 220, 255, 0.8);
  text-anchor: middle;
  pointer-events: none;
  font-weight: 600;
}

/* ── Hex grid ─────────────────────────────────────────────────────────────── */
.hex-cell {
  fill: transparent;
  stroke: transparent;
  stroke-width: 1;
  cursor: default;
}

.hex-cell--guide {
  fill: transparent;
  stroke: rgba(110, 170, 240, 0.18);
  stroke-width: 0.9;
  pointer-events: none;
}

.hex-cell.occupied {
  fill: rgba(40, 100, 180, 0.14);
  stroke: rgba(140, 200, 255, 0.32);
  cursor: pointer;
}

.hex-cell.occupied:hover,
.hex-cell.hovered {
  fill: rgba(60, 130, 220, 0.28);
  stroke: rgba(180, 230, 255, 0.58);
}

.hex-cell.selected {
  fill: rgba(80, 180, 255, 0.22);
  stroke: rgba(100, 220, 255, 0.88);
  stroke-width: 1.5;
}

/* ── Travel zones ─────────────────────────────────────────────────────────── */
.zone-hex {
  pointer-events: none;
  opacity: 0.35;
}
.zone-hex.zone-red {
  fill: #ff0000;
}
.zone-hex.zone-amber {
  fill: #ffaa00;
}

/* ── Stars ────────────────────────────────────────────────────────────────── */
.star-dot {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 0.8;
  cursor: pointer;
}

.star-dot.companion {
  stroke: none;
  opacity: 0.82;
}

.star-group.hovered .star-dot {
  filter: brightness(1.3);
}
.star-group.selected .star-dot {
  stroke: rgba(180, 240, 255, 0.5);
  stroke-width: 1.2;
}

.trade-route {
  stroke: rgba(120, 220, 255, 0.45);
  stroke-width: 1.1;
  stroke-dasharray: 4 3;
  pointer-events: none;
}

/* ── Universe galaxy dots ─────────────────────────────────────────── */
.galaxy-dot-name {
  fill: rgba(200, 230, 255, 0.85);
  font-weight: 600;
  letter-spacing: 0.04em;
  pointer-events: none;
}

.star-name-label {
  fill: rgba(240, 230, 200, 0.82);
  font-size: 10px;
  font-weight: 600;
  paint-order: stroke;
  stroke: rgba(4, 7, 16, 0.92);
  stroke-width: 2.5;
  pointer-events: none;
}

.hex-coord-label {
  fill: rgba(160, 200, 240, 0.52);
  font-size: 8px;
  font-family: monospace;
  pointer-events: none;
}

.hex-coord-label.empty {
  fill: rgba(100, 140, 180, 0.28);
  font-size: 7.5px;
}

/* ── Inspector ────────────────────────────────────────────────────────────── */
.atlas-inspector {
  position: absolute;
  top: 48px;
  right: 10px;
  width: 276px;
  max-height: calc(100% - 76px);
  overflow-y: auto;
  background: rgba(8, 14, 32, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #2c4a78;
  border-radius: 0.6rem;
  z-index: 60;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.65);
}

.inspector-close {
  position: absolute;
  top: 0.45rem;
  right: 0.55rem;
  background: transparent;
  border: none;
  color: #4c6888;
  font-size: 0.88rem;
  cursor: pointer;
  line-height: 1;
}

.inspector-close:hover {
  color: #c0d8f0;
}

.inspector-content {
  padding: 0.9rem;
}

.inspector-title {
  margin: 0 1.5rem 0.4rem 0;
  color: #8fe3ff;
  font-size: 1rem;
  line-height: 1.3;
}

.inspector-badge {
  display: inline-block;
  font-size: 0.67rem;
  color: #010c12;
  background: #6ec9f3;
  border-radius: 999px;
  padding: 0.14rem 0.48rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  margin-bottom: 0.9rem;
}

.dr {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed rgba(100, 160, 210, 0.22);
  padding-bottom: 0.32rem;
  font-size: 0.8rem;
}

.dl {
  color: #7aa8cc;
  font-weight: 600;
}
.dv {
  color: #d0e8ff;
}

.inspector-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── Star swatch ──────────────────────────────────────────────────────────── */
.star-inline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.star-swatch {
  flex-shrink: 0;
}

.star-type-big {
  font-size: 1rem;
  font-weight: 700;
  color: #e0d0a8;
  font-family: monospace;
}

.star-companion-hint {
  font-size: 0.73rem;
  color: #a08860;
  margin-top: 0.12rem;
}

/* ── Orbital diagram ──────────────────────────────────────────────────────── */
.orbital-section {
  margin-top: 0.55rem;
}

.orbital-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.orbital-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: #7aa8cc;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.orbital-svg {
  width: 100%;
  height: 175px;
  display: block;
  border-radius: 0.4rem;
  overflow: hidden;
}

.orbit-planet {
  stroke: rgba(255, 255, 255, 0.18);
  stroke-width: 0.5;
}

.orbit-label {
  fill: rgba(200, 220, 255, 0.58);
  font-size: 5.5px;
  pointer-events: none;
}

/* ── Status bar ───────────────────────────────────────────────────────────── */
.atlas-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.22rem 1rem;
  background: rgba(6, 10, 28, 0.82);
  border-top: 1px solid #1e3460;
  font-size: 0.7rem;
  color: #5070a0;
  pointer-events: none;
  z-index: 50;
}

.status-hex {
  color: #8ab8d8;
  font-family: monospace;
}

.status-density {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: #89a9c4;
  font-size: 0.66rem;
}

.density-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  white-space: nowrap;
}

.density-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid rgba(180, 220, 255, 0.28);
}

.status-right {
  color: #405070;
  font-family: monospace;
}

/* ── Slide-in transition ──────────────────────────────────────────────────── */
.slide-in-enter-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.slide-in-leave-active {
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}
.slide-in-enter-from {
  transform: translateX(18px);
  opacity: 0;
}
.slide-in-leave-to {
  transform: translateX(18px);
  opacity: 0;
}

/* ── Buttons ──────────────────────────────────────────────────────────────── */
.btn {
  padding: 0.38rem 0.8rem;
  border: none;
  border-radius: 0.32rem;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #1a5fba;
  color: #dff0ff;
}
.btn-primary:hover {
  background: #2070d0;
}
</style>
