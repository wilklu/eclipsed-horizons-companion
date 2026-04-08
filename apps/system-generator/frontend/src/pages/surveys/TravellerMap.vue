<template>
  <div ref="atlasRootRef" class="atlas-root">
    <LoadingSpinner :isVisible="isLoading" context="atlas" tone="sync" message="Loading atlas data..." />
    <LoadingSpinner
      :isVisible="atlasGenerationProgress.active"
      context="atlas"
      tone="fabrication"
      kicker="Atlas Relay"
      stateLabel="REGION FABRICATION"
      title="Atlas Generation In Progress"
      :message="atlasGenerationProgress.label"
      barLabel="Projecting atlas sectors and overlays"
      statusCode="ATLAS-FAB"
      :diagnostics="atlasGenerationDiagnostics"
      :ledger="atlasGenerationLedger"
      :progressCurrent="atlasGenerationProgress.current"
      :progressTotal="atlasGenerationProgress.total"
      :progressPercent="atlasGenerationProgressPercent"
      :progressMeta="`${atlasGenerationProgressPercent}% complete`"
    />

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
          :class="{ active: layerSectorNames }"
          @click="layerSectorNames = !layerSectorNames"
          title="Sector names"
        >
          Sector Names
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
            :class="{
              'star-group--presence': star.presenceOnly,
              selected: star.key === selectedHexKey,
              hovered: star.key === hoveredHexKey,
            }"
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
              v-if="!star.presenceOnly"
              :cx="star.wx"
              :cy="star.wy"
              :r="effectiveStarR"
              :fill="starRenderFill(star)"
              class="star-dot"
              filter="url(#softglow)"
            />
            <circle
              v-else
              :cx="star.wx"
              :cy="star.wy"
              :r="Math.max(3, effectiveStarR - 1.5)"
              fill="none"
              stroke="#b8c0cc"
              stroke-width="1.4"
              class="star-dot star-dot--presence"
            />
            <circle v-if="star.presenceOnly" :cx="star.wx" :cy="star.wy" :r="1.5" fill="#8f98a6" opacity="0.9" />
            <!-- Secondary companion -->
            <circle
              v-if="!star.presenceOnly && star.hasSecondary && currentLod === 'detail'"
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
          <div class="inspector-subtitle">Galaxy {{ inspectorData.galaxyName }}</div>
          <div class="inspector-badge">Sector {{ inspectorData.coords }}</div>
          <div class="inspector-actions">
            <button class="btn btn-primary" @click="focusSectorFromInspector">🔍 Zoom to Sector</button>
            <button class="btn btn-primary" @click="openSectorSurvey">🧭 Sector Survey</button>
            <button class="btn btn-secondary" @click="openSubsectorSurvey">🧭 Subsector Survey</button>
          </div>
          <div class="inspector-generation-panel">
            <div class="inspector-generation-row">
              <div class="inspector-field">
                <label class="inspector-field-label">Area</label>
                <select v-model="atlasGenerationArea" class="inspector-select">
                  <option v-for="option in atlasGenerationAreaOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="inspector-field">
                <label class="inspector-field-label">Generate</label>
                <select v-model="atlasGenerationMode" class="inspector-select">
                  <option v-for="option in atlasGenerationModeOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="inspector-field-help">{{ atlasGenerationAction.description }}</div>
            <button
              class="btn btn-primary"
              :disabled="isGeneratingInspectorSector"
              @click="runInspectorGenerationAction"
            >
              {{ isGeneratingInspectorSector ? "Generating..." : atlasGenerationAction.label }}
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
            <div v-if="inspectorData.legacyReconstructedCount" class="dr">
              <span class="dl">Legacy Trees</span><span class="dv">{{ inspectorData.legacyReconstructedCount }}</span>
            </div>
            <div v-if="inspectorData.legacyHierarchyUnknownCount" class="dr">
              <span class="dl">Inferred Links</span
              ><span class="dv">{{ inspectorData.legacyHierarchyUnknownCount }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="inspectorMode === 'hierarchy'" class="inspector-content">
          <h2 class="inspector-title">{{ inspectorData.name }}</h2>
          <div class="inspector-badge">{{ inspectorData.coords }}</div>
          <div class="inspector-actions">
            <button class="btn btn-primary" @click="focusHierarchyInspector">🔍 Zoom to Area</button>
          </div>
          <div class="inspector-generation-panel">
            <div class="inspector-field">
              <label class="inspector-field-label">Generate</label>
              <select v-model="atlasGenerationMode" class="inspector-select">
                <option v-for="option in atlasGenerationModeOptions" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="inspector-field-help">{{ hierarchyGenerationAction.description }}</div>
            <button
              class="btn btn-primary"
              :disabled="isGeneratingInspectorSector"
              @click="runHierarchyGenerationAction"
            >
              {{ isGeneratingInspectorSector ? "Generating..." : hierarchyGenerationAction.label }}
            </button>
          </div>
          <div class="detail-grid">
            <div class="dr">
              <span class="dl">Area Type</span><span class="dv">{{ inspectorData.areaType }}</span>
            </div>
            <div class="dr">
              <span class="dl">Sector Span</span><span class="dv">{{ inspectorData.areaSpan }}</span>
            </div>
          </div>
        </div>

        <!-- Star / system card -->
        <div v-else-if="inspectorMode === 'star'" class="inspector-content">
          <h2 class="inspector-title">{{ inspectorData.name }}</h2>
          <div class="inspector-badge">{{ inspectorData.coord }} · {{ inspectorData.sectorName }}</div>

          <div class="star-inline">
            <svg width="44" height="44" class="star-swatch" overflow="visible">
              <circle
                v-if="!inspectorData.presenceOnly"
                cx="22"
                cy="22"
                :r="inspectorStarSvgR"
                :fill="inspectorData.color"
                filter="url(#softglow)"
              />
              <circle
                v-else
                cx="22"
                cy="22"
                :r="Math.max(3, inspectorStarSvgR - 1.5)"
                fill="none"
                stroke="#b8c0cc"
                stroke-width="1.4"
              />
              <circle v-if="inspectorData.presenceOnly" cx="22" cy="22" r="1.5" fill="#8f98a6" opacity="0.9" />
              <circle
                v-if="!inspectorData.presenceOnly && inspectorData.hasSecondary"
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

          <div class="detail-grid detail-grid--system">
            <div class="dr">
              <span class="dl">Survey</span><span class="dv">{{ inspectorData.surveyStatus }}</span>
            </div>
            <div class="dr">
              <span class="dl">UWP</span><span class="dv dv--mono">{{ inspectorData.uwp }}</span>
            </div>
            <div class="dr">
              <span class="dl">Starport</span><span class="dv">{{ inspectorData.starport }}</span>
            </div>
            <div class="dr">
              <span class="dl">Gas Giants</span><span class="dv">{{ inspectorData.gasGiants }}</span>
            </div>
            <div class="dr">
              <span class="dl">Bases</span
              ><span class="dv">{{ inspectorData.bases?.length ? inspectorData.bases.join(", ") : "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Importance</span><span class="dv">{{ inspectorData.importance }}</span>
            </div>
            <div class="dr">
              <span class="dl">Travel Zone</span><span class="dv">{{ inspectorData.travelZone }}</span>
            </div>
            <div class="dr">
              <span class="dl">Minimum TL</span
              ><span class="dv">{{ inspectorData.minimumSustainableTechLevel || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Settlement</span
              ><span class="dv">{{ inspectorData.populationConcentration || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Urbanization</span><span class="dv">{{ inspectorData.urbanization || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Major Cities</span><span class="dv">{{ inspectorData.majorCities || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Government</span><span class="dv">{{ inspectorData.governmentProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Justice</span><span class="dv">{{ inspectorData.justiceProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Law</span><span class="dv">{{ inspectorData.lawProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Appeals</span><span class="dv">{{ inspectorData.appealProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Private Law</span><span class="dv">{{ inspectorData.privateLawProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Personal Rights</span
              ><span class="dv">{{ inspectorData.personalRightsProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Factions</span><span class="dv">{{ inspectorData.factionsProfile || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Mainworld</span><span class="dv">{{ inspectorData.mainworldName || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Mainworld Type</span><span class="dv">{{ inspectorData.mainworldType || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Parent World</span><span class="dv">{{ inspectorData.mainworldParent || "—" }}</span>
            </div>
            <div class="dr">
              <span class="dl">Habitability</span><span class="dv">{{ inspectorData.habitability }}</span>
            </div>
            <div class="dr">
              <span class="dl">Resources</span><span class="dv">{{ inspectorData.resourceRating }}</span>
            </div>
          </div>

          <div v-if="inspectorData.bases?.length" class="base-code-strip">
            <span v-for="base in inspectorData.bases" :key="base" class="base-code-chip">{{ base }}</span>
          </div>

          <div
            v-if="inspectorData.legacyReconstructed || inspectorData.legacyHierarchyUnknown"
            class="legacy-code-strip"
          >
            <span v-if="inspectorData.legacyReconstructed" class="legacy-code-chip">Legacy Star Tree</span>
            <span v-if="inspectorData.legacyHierarchyUnknown" class="legacy-code-chip">Hierarchy Inferred</span>
          </div>

          <div v-if="inspectorData.tradeCodes?.length" class="trade-code-strip">
            <span v-for="code in inspectorData.tradeCodes" :key="code" class="trade-code-chip">{{ code }}</span>
          </div>
          <p v-else-if="!inspectorData.hasSavedSystem" class="inspector-note">
            Generate or save a system survey to populate UWP, starport, bases, importance, gas giants, and trade codes
            here.
          </p>
          <p v-if="inspectorData.legacyReconstructed" class="inspector-note">
            This system’s star hierarchy was reconstructed from older flat-label metadata. Companion ordering is
            preserved, but original WBH hierarchy detail was not stored.
          </p>
          <p v-if="inspectorData.legacyHierarchyUnknown" class="inspector-note">
            Legacy import data did not retain explicit hierarchy links, so near/far relationships were inferred during
            normalization.
          </p>
          <p v-if="inspectorData.presenceOnly" class="inspector-note">
            This marker is a detected stellar presence only. Atlas can show it as a known object, but it is not yet a
            generated system survey.
          </p>

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
            <button class="btn btn-primary" @click="openSectorSurvey">🧭 Sector Survey</button>
            <button class="btn btn-secondary" @click="openSubsectorSurvey">🧭 Subsector Survey</button>
            <button
              class="btn btn-primary"
              :disabled="inspectorData.presenceOnly"
              :title="inspectorData.presenceOnly ? 'Orbital View is only available after system survey generation' : ''"
              @click="openOrbitalView"
            >
              🪐 Orbital View
            </button>
            <button class="btn btn-primary" @click="openStarSystem">⭐ System Survey</button>
          </div>
          <div class="inspector-generation-panel">
            <div class="inspector-generation-row">
              <div class="inspector-field">
                <label class="inspector-field-label">Area</label>
                <select v-model="atlasGenerationArea" class="inspector-select">
                  <option v-for="option in atlasGenerationAreaOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="inspector-field">
                <label class="inspector-field-label">Generate</label>
                <select v-model="atlasGenerationMode" class="inspector-select">
                  <option v-for="option in atlasGenerationModeOptions" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="inspector-field-help">{{ atlasGenerationAction.description }}</div>
            <button
              class="btn btn-primary"
              :disabled="isGeneratingInspectorSector"
              @click="runInspectorGenerationAction"
            >
              {{ isGeneratingInspectorSector ? "Generating..." : atlasGenerationAction.label }}
            </button>
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
      <span class="status-right">{{ visibleStars.length }} stellar detections in view · {{ biasReadout }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import * as sectorApi from "../../api/sectorApi.js";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { generatePrimaryStar } from "../../utils/primaryStarGenerator.js";
import { starDescriptorToColor, starDescriptorToCssClass } from "../../utils/starDisplay.js";
import { serializeReturnRoute } from "../../utils/returnRoute.js";
import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import { generateGalaxySectorLayoutWindow } from "../../utils/sectorLayoutGenerator.js";
import { summarizeSystemRecord as summarizeSavedSystemRecord } from "../../utils/systemSummary.js";
import {
  buildGeneratedStars,
  buildHexStarTypeMetadata,
  resolveGeneratedStarsFromSystem,
  summarizeLegacyStarMetadata,
} from "../../utils/systemStarMetadata.js";
import { SUBSECTOR_LETTERS, getSubsectorLetterForHex } from "../../utils/subsector.js";
import * as toastService from "../../utils/toast.js";

const router = useRouter();
const galaxyStore = useGalaxyStore();
const preferencesStore = usePreferencesStore();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const ALL_GALAXIES_VALUE = "__ALL_GALAXIES__";
const PREFERENCES_STORAGE_KEY = "eclipsed-horizons-preferences";
const STARPORT_LABELS = Object.freeze({
  A: "Excellent",
  B: "Good",
  C: "Routine",
  D: "Poor",
  E: "Frontier",
  X: "No starport",
});

// ── Hex geometry constants (flat-top) ──────────────────────────────────────
const HEX_R = 22;
const HEX_STEP_X = HEX_R * 1.5; // 33
const HEX_STEP_Y = HEX_R * Math.sqrt(3); // ≈38.1
const SECTOR_COLS = 32;
const SECTOR_ROWS = 40;
const SELECTED_GALAXY_WINDOW_RADIUS = 12;
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
  {
    id: "deep-detail",
    label: "Deep Detail",
    description: "Deep detail zoom for local system context",
    parsecsPerHex: 0.1,
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
const layerSectorNames = ref(false);
const layerCoords = ref(false);
const layerZones = ref(false);

const hoveredHexKey = ref(null);
const hoveredSectorId = ref(null);
const selectedHexKey = ref(null);
const inspectorMode = ref(null); // 'sector' | 'hierarchy' | 'star' | null
const inspectorSector = ref(null);
const inspectorHierarchy = ref(null);
const inspectorStar = ref(null);
const atlasGenerationArea = ref("sector");
const atlasGenerationMode = ref("name-presence");
const isGeneratingInspectorSector = ref(false);
const atlasGenerationProgress = ref({
  active: false,
  label: "",
  current: 0,
  total: 0,
  legacyReconstructedCount: 0,
  legacyHierarchyUnknownCount: 0,
});

const atlasGenerationProgressPercent = computed(() => {
  if (!atlasGenerationProgress.value.active || atlasGenerationProgress.value.total <= 0) return 0;
  const pct = Math.round((atlasGenerationProgress.value.current / atlasGenerationProgress.value.total) * 100);
  return Math.max(0, Math.min(100, pct));
});

const atlasGenerationDiagnostics = computed(() => {
  const progress = atlasGenerationProgress.value;
  const diagnostics = [
    { label: "Stage", value: progress.label || "Queued" },
    { label: "Coverage", value: `${progress.current.toLocaleString()} / ${progress.total.toLocaleString()}` },
    { label: "Completion", value: `${atlasGenerationProgressPercent.value}%` },
  ];
  if (progress.legacyReconstructedCount) {
    diagnostics.push({ label: "Legacy Trees Seen", value: progress.legacyReconstructedCount.toLocaleString() });
  }
  if (progress.legacyHierarchyUnknownCount) {
    diagnostics.push({
      label: "Inferred Links Seen",
      value: progress.legacyHierarchyUnknownCount.toLocaleString(),
    });
  }
  return diagnostics;
});

const atlasGenerationLedger = computed(() => {
  const progress = atlasGenerationProgress.value;
  const ledger = [
    "Traveller Atlas",
    `${progress.current.toLocaleString()} sectors processed`,
    progress.label || "Awaiting atlas directive",
  ];
  if (progress.legacyReconstructedCount || progress.legacyHierarchyUnknownCount) {
    ledger.push(
      `${progress.legacyReconstructedCount.toLocaleString()} legacy trees, ${progress.legacyHierarchyUnknownCount.toLocaleString()} inferred links encountered`,
    );
  }
  return ledger;
});

function summarizeSectorLegacyProgress(sector) {
  return summarizeLegacyStarMetadata({
    hexStarTypes: sector?.metadata?.hexStarTypes,
  });
}

const SECTOR_HEX_PRESENCE_RATE = Object.freeze([0.03, 0.03, 0.15, 0.3, 0.5, 0.7]);
const HEX_PRESENCE_COLS = 32;
const HEX_PRESENCE_ROWS = 40;
const HEX_PRESENCE_MORPHOLOGY_SCALE = 0.15;
const ATLAS_GENERATION_AREA_OPTIONS = Object.freeze([
  { id: "sector", label: "Sector" },
  { id: "surrounding", label: "Sector + Surrounding" },
  { id: "region", label: "Region" },
  { id: "quadrant", label: "Quadrant" },
]);
const ATLAS_GENERATION_MODE_OPTIONS = Object.freeze([
  { id: "name", label: "Name" },
  { id: "name-presence", label: "Name + Presence" },
  { id: "presence", label: "Presence Only" },
  { id: "name-systems", label: "Name + Systems" },
]);
const ATLAS_SEEDED_NAME_ONSETS = Object.freeze([
  "Al",
  "Bel",
  "Cor",
  "Dor",
  "El",
  "Fen",
  "Gal",
  "Hal",
  "Ir",
  "Kel",
  "Lor",
  "Mor",
  "Nor",
  "Or",
  "Pra",
  "Qua",
  "Ryn",
  "Sol",
  "Tal",
  "Vor",
]);
const ATLAS_SEEDED_NAME_VOWELS = Object.freeze(["a", "e", "i", "o", "u", "ae", "ia", "oa", "ei"]);
const ATLAS_SEEDED_NAME_CODAS = Object.freeze([
  "n",
  "r",
  "s",
  "th",
  "l",
  "m",
  "x",
  "dr",
  "v",
  "nd",
  "ria",
  "tor",
  "lon",
  "vek",
  "mere",
]);
const ATLAS_SEEDED_NAME_MEDIALS = Object.freeze(["", "", "n", "r", "l", "s", "th", "v", "dr"]);
const ATLAS_SEEDED_NAME_SUFFIXES = Object.freeze([
  "Reach",
  "March",
  "Span",
  "Expanse",
  "Drift",
  "Crown",
  "Basin",
  "Gate",
]);
// ── Store data ─────────────────────────────────────────────────────────────
const galaxies = computed(() => galaxyStore.getAllGalaxies || []);
const currentGalaxy = computed(
  () => galaxies.value.find((galaxy) => String(galaxy?.galaxyId) === String(selectedGalaxyId.value)) || null,
);
const sectors = computed(() => atlasSectors.value);

function toAtlasSectorRecord(sector) {
  const metadata = sector?.metadata && typeof sector.metadata === "object" ? sector.metadata : {};
  const x = Number(sector?.coordinates?.x ?? metadata.gridX ?? sector?.x ?? sector?.sectorX ?? 0);
  const y = Number(sector?.coordinates?.y ?? metadata.gridY ?? sector?.y ?? sector?.sectorY ?? 0);
  const normalizedSector = {
    ...sector,
    galaxyId: String(sector?.galaxyId ?? metadata.galaxyId ?? ""),
    sectorId: String(sector?.sectorId || `${sector?.galaxyId || metadata.galaxyId || "galaxy"}:${x},${y}`),
    coordinates: { x, y },
    densityClass: Number(sector?.densityClass ?? 0),
    densityVariation: Number(sector?.densityVariation ?? 0),
  };
  return {
    ...normalizedSector,
    metadata: {
      ...ensureAtlasSectorNamingMetadata(normalizedSector, metadata),
      gridX: x,
      gridY: y,
    },
  };
}

function mergeAtlasSectorsWithGalaxyLayout(galaxy, persistedSectors = [], bounds = {}) {
  const normalizedPersisted = (Array.isArray(persistedSectors) ? persistedSectors : []).map(toAtlasSectorRecord);
  if (!galaxy) {
    return normalizedPersisted;
  }

  const layoutSectors = generateGalaxySectorLayoutWindow(galaxy, {
    scale: "true",
    xMin: bounds.xMin ?? -SELECTED_GALAXY_WINDOW_RADIUS,
    xMax: bounds.xMax ?? SELECTED_GALAXY_WINDOW_RADIUS,
    yMin: bounds.yMin ?? -SELECTED_GALAXY_WINDOW_RADIUS,
    yMax: bounds.yMax ?? SELECTED_GALAXY_WINDOW_RADIUS,
  }).map(toAtlasSectorRecord);
  const merged = new Map(layoutSectors.map((sector) => [sector.sectorId, sector]));

  for (const sector of normalizedPersisted) {
    const existing = merged.get(sector.sectorId);
    if (!existing) {
      merged.set(sector.sectorId, sector);
      continue;
    }

    merged.set(sector.sectorId, {
      ...existing,
      ...sector,
      coordinates: sector.coordinates ?? existing.coordinates,
      densityClass: Number.isFinite(Number(existing.densityClass))
        ? Number(existing.densityClass)
        : Number(sector.densityClass ?? 0),
      densityVariation: Number.isFinite(Number(sector.densityVariation))
        ? Number(sector.densityVariation)
        : Number(existing.densityVariation ?? 0),
      metadata: {
        ...(existing.metadata ?? {}),
        ...(sector.metadata ?? {}),
        gridX: Number(
          sector?.metadata?.gridX ??
            sector?.coordinates?.x ??
            existing?.metadata?.gridX ??
            existing?.coordinates?.x ??
            0,
        ),
        gridY: Number(
          sector?.metadata?.gridY ??
            sector?.coordinates?.y ??
            existing?.metadata?.gridY ??
            existing?.coordinates?.y ??
            0,
        ),
        densityScore: existing?.metadata?.densityScore ?? sector?.metadata?.densityScore,
      },
    });
  }

  return Array.from(merged.values());
}

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
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const sector of sectors.value) {
    const sx = Number(sector?.coordinates?.x);
    const sy = Number(sector?.coordinates?.y);
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) continue;
    if (sx < minX) minX = sx;
    if (sx > maxX) maxX = sx;
    if (sy < minY) minY = sy;
    if (sy > maxY) maxY = sy;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  return { minX, maxX, minY, maxY };
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
const sectorTilesEnabled = computed(() => parsecsPerHex.value <= 250);
const showStars = computed(() => parsecsPerHex.value <= 40);
const renderStars = computed(() => showStars.value && (!dragging.value || parsecsPerHex.value <= 10));
const showStarNames = computed(() => layerNames.value && !dragging.value && parsecsPerHex.value <= 5);
const showStarCoords = computed(() => layerCoords.value && !dragging.value && parsecsPerHex.value <= 10);
const showEmptyCoords = computed(() => layerCoords.value && hexGridVisible.value && parsecsPerHex.value <= 10);
const showTradeRoutes = computed(() => !dragging.value && parsecsPerHex.value <= 5 && visibleStars.value.length <= 320);

const sectorTileOpacity = computed(() => {
  if (parsecsPerHex.value > 100) return 0.88;
  if (parsecsPerHex.value > 40) return 0.5;
  if (parsecsPerHex.value > 20) return 0.26;
  if (parsecsPerHex.value <= 5) return 0;
  return 0.1;
});

// ── Universe LOD: galaxy blobs ───────────────────────────────────────────
const showUniverseLayer = computed(() => !sectorTilesEnabled.value);

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
  () =>
    layerSectorNames.value &&
    !dragging.value &&
    parsecsPerHex.value <= 10 &&
    parsecsPerHex.value > 1 &&
    visibleSectorTiles.value.length <= 80,
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

const gridClickTiles = computed(() => {
  if (!sectorTilesEnabled.value) return [];
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

const starDataEnabled = computed(() => renderStars.value || hexGridVisible.value || inspectorMode.value === "star");

const effectiveStarR = computed(() => {
  if (parsecsPerHex.value > 20) return 4.5;
  if (parsecsPerHex.value > 5) return 5.5;
  return 7;
});

// ── Sector tiles ───────────────────────────────────────────────────────────
const visibleSectorTiles = computed(() => {
  if (!sectorTilesEnabled.value || !sectors.value.length) return [];
  const b = viewBounds.value;

  if (sectors.value.length <= 5000) {
    return sectors.value
      .map(toSectorTile)
      .filter(
        (tile) =>
          tile && tile.wx + SECTOR_PX_W >= b.x0 && tile.wx <= b.x1 && tile.wy + SECTOR_PX_H >= b.y0 && tile.wy <= b.y1,
      );
  }

  const xStart = Math.max(gridBounds.value.minX, Math.floor(b.x0 / SECTOR_PX_W) + minSX.value);
  const xEnd = Math.min(gridBounds.value.maxX, Math.ceil(b.x1 / SECTOR_PX_W) + minSX.value);
  const yStart = Math.max(gridBounds.value.minY, Math.floor(b.y0 / SECTOR_PX_H) + minSY.value);
  const yEnd = Math.min(gridBounds.value.maxY, Math.ceil(b.y1 / SECTOR_PX_H) + minSY.value);
  const tiles = [];

  for (let sx = xStart; sx <= xEnd; sx++) {
    for (let sy = yStart; sy <= yEnd; sy++) {
      const sector = sectorByCoord.value.get(`${sx}:${sy}`);
      if (!sector) continue;

      const tile = toSectorTile(sector);
      if (tile) tiles.push(tile);
    }
  }

  return tiles;
});

// ── Star markers (prefer persisted system records, fall back to sector metadata) ──
const allStarMarkers = computed(() => {
  if (!starDataEnabled.value) return [];
  const markers = [];
  const markerByKey = new Map();
  const tileBySectorId = new Map(visibleSectorTiles.value.map((tile) => [String(tile.sectorId), tile]));

  for (const system of atlasSystemRecords.value) {
    const sectorId = String(system?.sectorId || "");
    const tile = tileBySectorId.get(sectorId);
    if (!tile) continue;

    const x = Number(system?.hexCoordinates?.x);
    const y = Number(system?.hexCoordinates?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    const coord = `${String(Math.trunc(x)).padStart(2, "0")}${String(Math.trunc(y)).padStart(2, "0")}`;
    const key = `${tile.sectorId}:${coord}`;
    const { wx, wy } = hexWorldCenter(tile.sx, tile.sy, Math.trunc(x), Math.trunc(y));
    const generatedStars = resolveGeneratedStarsFromSystem(system);
    const starMetadata = buildHexStarTypeMetadata({
      generatedStars,
      primary: system?.primaryStar,
      secondaryStars: system?.companionStars,
      anomalyType:
        system?.metadata?.anomalyType ||
        system?.metadata?.generatedSurvey?.anomalyType ||
        tile.sector?.metadata?.hexStarTypes?.[coord]?.anomalyType ||
        null,
      fallbackStarType: tile.sector?.metadata?.hexStarTypes?.[coord]?.starType || "G2V",
      legacyReconstructed:
        system?.metadata?.generatedSurvey?.legacyReconstructed ??
        system?.metadata?.legacyReconstructed ??
        tile.sector?.metadata?.hexStarTypes?.[coord]?.legacyReconstructed ??
        false,
      legacyHierarchyUnknown:
        system?.metadata?.generatedSurvey?.legacyHierarchyUnknown ??
        system?.metadata?.legacyHierarchyUnknown ??
        tile.sector?.metadata?.hexStarTypes?.[coord]?.legacyHierarchyUnknown ??
        false,
    });
    const starType = normalizeGeneratedStarType(starMetadata.starType);
    const secondaryStars = starMetadata.secondaryStars.map((star) => normalizeGeneratedStarType(star)).filter(Boolean);
    const starClass =
      String(tile.sector?.metadata?.hexStarTypes?.[coord]?.starClass || "").trim() || starTypeToCssClass(starType);

    const marker = {
      key,
      galaxyId: tile.sector?.galaxyId,
      sectorId: tile.sectorId,
      sectorName: tile.name,
      coord,
      wx,
      wy,
      starType,
      starClass,
      color: starTypeToColor(starType, starClass),
      compColor: starTypeToColor(secondaryStars[0] || "M", ""),
      hasSecondary: secondaryStars.length > 0,
      legacyReconstructed: Boolean(starMetadata.legacyReconstructed),
      legacyHierarchyUnknown: Boolean(starMetadata.legacyHierarchyUnknown),
      presenceOnly: false,
      name: "",
    };
    markerByKey.set(key, marker);
    markers.push(marker);
  }

  for (const tile of visibleSectorTiles.value) {
    const hexStarTypes = tile.sector?.metadata?.hexStarTypes ?? {};
    const occupiedHexes = tile.sector?.metadata?.occupiedHexes ?? [];
    const typedCoords = new Set();

    for (const [coord, info] of Object.entries(hexStarTypes)) {
      const key = `${tile.sectorId}:${coord}`;
      if (markerByKey.has(key)) {
        typedCoords.add(coord);
        continue;
      }
      const hcol = parseInt(coord.slice(0, 2), 10);
      const hrow = parseInt(coord.slice(2, 4), 10);
      if (!Number.isFinite(hcol) || !Number.isFinite(hrow)) continue;
      const { wx, wy } = hexWorldCenter(tile.sx, tile.sy, hcol, hrow);
      const starMetadata = buildHexStarTypeMetadata({
        generatedStars: info?.generatedStars,
        primary: info?.starType,
        secondaryStars: info?.secondaryStars,
        anomalyType: info?.anomalyType ?? null,
        fallbackStarType: String(info?.starType || "G2"),
        legacyReconstructed: info?.legacyReconstructed ?? false,
        legacyHierarchyUnknown: info?.legacyHierarchyUnknown ?? false,
      });
      const starType = normalizeGeneratedStarType(starMetadata.starType);
      typedCoords.add(coord);
      const marker = {
        key,
        galaxyId: tile.sector?.galaxyId,
        sectorId: tile.sectorId,
        sectorName: tile.name,
        coord,
        wx,
        wy,
        starType,
        starClass: info.starClass || "",
        color: starTypeToColor(starType, info.starClass || ""),
        compColor: starTypeToColor(starMetadata.secondaryStars?.[0] || "M", ""),
        hasSecondary: starMetadata.secondaryStars.length > 0,
        legacyReconstructed: Boolean(starMetadata.legacyReconstructed),
        legacyHierarchyUnknown: Boolean(starMetadata.legacyHierarchyUnknown),
        presenceOnly: false,
        name: "",
      };
      markerByKey.set(key, marker);
      markers.push(marker);
    }

    // Presence-only hexes (from "Generate All Sectors" without star types)
    for (const coord of occupiedHexes) {
      if (typedCoords.has(coord)) continue;
      const key = `${tile.sectorId}:${coord}`;
      if (markerByKey.has(key)) continue;
      const hcol = parseInt(coord.slice(0, 2), 10);
      const hrow = parseInt(coord.slice(2, 4), 10);
      if (!Number.isFinite(hcol) || !Number.isFinite(hrow)) continue;
      const { wx, wy } = hexWorldCenter(tile.sx, tile.sy, hcol, hrow);
      const marker = {
        key,
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
        presenceOnly: true,
        name: "",
      };
      markerByKey.set(key, marker);
      markers.push(marker);
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

function firstNonEmptyString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeTradeCodes(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(/[\s,;/]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isTruthySurveyValue(value) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  return Boolean(text) && !["none", "no", "false", "0", "n", "na", "n/a"].includes(text);
}

function splitSurveyList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? "").trim()).filter(Boolean);
  }
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(/[;,/|]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractStarportCode(...sources) {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === "string") {
      const code = source.trim().charAt(0).toUpperCase();
      if (/^[A-EX]$/.test(code)) {
        return code;
      }
      continue;
    }
    if (typeof source === "object") {
      const code = String(source.class ?? source.code ?? "")
        .trim()
        .charAt(0)
        .toUpperCase();
      if (/^[A-EX]$/.test(code)) {
        return code;
      }
    }
  }
  return "";
}

function extractBaseSummary(...sources) {
  const bases = [];
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      bases.push(...source.map((entry) => String(entry ?? "").trim()).filter(Boolean));
      continue;
    }
    if (typeof source === "string") {
      bases.push(...splitSurveyList(source));
      continue;
    }
    if (typeof source === "object") {
      if (isTruthySurveyValue(source.navy)) bases.push("Navy");
      if (isTruthySurveyValue(source.scout)) bases.push("Scout");
      if (isTruthySurveyValue(source.military)) bases.push("Military");
      if (isTruthySurveyValue(source.corsair)) bases.push("Corsair");
      if (isTruthySurveyValue(source.pirate)) bases.push("Pirate");
      if (isTruthySurveyValue(source.research)) bases.push("Research");
      if (isTruthySurveyValue(source.highport)) bases.push("Highport");
      if (isTruthySurveyValue(source.other)) bases.push(...splitSurveyList(source.other));
      if (Array.isArray(source.bases)) bases.push(...source.bases.map((entry) => String(entry ?? "").trim()));
    }
  }
  return Array.from(new Set(bases.filter(Boolean)));
}

function inferStarportCode(uwp) {
  const code = String(uwp ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return /^[A-EX]$/.test(code) ? code : "";
}

function formatStarport(code) {
  const normalized = String(code ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();
  if (!normalized) return "—";
  return STARPORT_LABELS[normalized] ? `${normalized} — ${STARPORT_LABELS[normalized]}` : normalized;
}

function countGasGiantsFromBodies(bodies) {
  if (!Array.isArray(bodies)) return null;
  const matches = bodies.filter((body) => {
    const type = String(body?.type ?? body?.designation ?? "").toLowerCase();
    return type.includes("gas giant") || type === "gg";
  }).length;
  return matches > 0 ? matches : null;
}

const atlasSystemRecords = computed(() => {
  const merged = new Map();
  for (const system of Array.isArray(systemStore.systems) ? systemStore.systems : []) {
    if (system?.systemId) {
      merged.set(String(system.systemId), system);
    }
  }
  return Array.from(merged.values());
});

function findSystemRecordForStar(star) {
  if (!star) return null;
  const hexX = Number(String(star.coord ?? "").slice(0, 2));
  const hexY = Number(String(star.coord ?? "").slice(2, 4));
  if (!Number.isFinite(hexX) || !Number.isFinite(hexY)) return null;

  return (
    atlasSystemRecords.value.find(
      (system) =>
        String(system?.galaxyId ?? "") === String(star.galaxyId ?? "") &&
        String(system?.sectorId ?? "") === String(star.sectorId ?? "") &&
        Number(system?.hexCoordinates?.x) === hexX &&
        Number(system?.hexCoordinates?.y) === hexY,
    ) ?? null
  );
}

function summarizeSystemRecord(system) {
  return summarizeSavedSystemRecord(system);
}

const inspectorSystemSummary = computed(() => summarizeSystemRecord(findSystemRecordForStar(inspectorStar.value)));

const inspectorData = computed(() => {
  if (inspectorMode.value === "sector" && inspectorSector.value) {
    const s = inspectorSector.value;
    const sx = Number(s?.coordinates?.x);
    const sy = Number(s?.coordinates?.y);
    const sectorGalaxy = galaxies.value.find((galaxy) => String(galaxy?.galaxyId) === String(s?.galaxyId)) || null;
    const legacySummary = summarizeLegacyStarMetadata({ hexStarTypes: s?.metadata?.hexStarTypes ?? {} });
    return {
      name: String(
        s?.metadata?.displayName || `Sector ${Number.isFinite(sx) ? sx : "?"},${Number.isFinite(sy) ? sy : "?"}`,
      ),
      galaxyName: resolveGalaxyLabel(sectorGalaxy),
      coords: `${Number.isFinite(sx) ? sx : "?"},${Number.isFinite(sy) ? sy : "?"}`,
      densityLabel: DENSITY_SCALE[Math.min(5, Math.max(0, Number(s.densityClass) || 0))].label,
      systemCount: s?.metadata?.systemCount ?? "—",
      status: String(s?.metadata?.explorationStatus || "Unexplored"),
      legacyReconstructedCount: legacySummary.legacyReconstructedCount,
      legacyHierarchyUnknownCount: legacySummary.legacyHierarchyUnknownCount,
    };
  }
  if (inspectorMode.value === "hierarchy" && inspectorHierarchy.value) {
    const tile = inspectorHierarchy.value;
    const areaType = inferHierarchyAreaScope(tile) === "quadrant" ? "Quadrant" : "Region";
    return {
      name: tile.label,
      coords: `${tile.minSectorX},${tile.minSectorY}`,
      areaType,
      areaSpan: `${tile.tileSizeInSectors}×${tile.tileSizeInSectors} sectors`,
    };
  }
  if (inspectorMode.value === "star" && inspectorStar.value) {
    const star = inspectorStar.value;
    const systemSummary = inspectorSystemSummary.value;
    return {
      name: systemSummary.systemName || (star.starType !== "?" ? `${star.starType} Star` : `System ${star.coord}`),
      coord: star.coord,
      sectorName: star.sectorName,
      starType: star.starType,
      color: star.color,
      compColor: star.compColor,
      hasSecondary: star.hasSecondary,
      uwp: systemSummary.uwp,
      starport: systemSummary.starport,
      bases: systemSummary.bases,
      gasGiants: systemSummary.gasGiants,
      importance: systemSummary.importance,
      travelZone: systemSummary.travelZone,
      minimumSustainableTechLevel: systemSummary.minimumSustainableTechLevel,
      populationConcentration: systemSummary.populationConcentration,
      urbanization: systemSummary.urbanization,
      majorCities: systemSummary.majorCities,
      governmentProfile: systemSummary.governmentProfile,
      justiceProfile: systemSummary.justiceProfile,
      lawProfile: systemSummary.lawProfile,
      appealProfile: systemSummary.appealProfile,
      privateLawProfile: systemSummary.privateLawProfile,
      personalRightsProfile: systemSummary.personalRightsProfile,
      factionsProfile: systemSummary.factionsProfile,
      mainworldName: systemSummary.mainworldName,
      mainworldType: systemSummary.mainworldType,
      mainworldParent: systemSummary.mainworldParent,
      tradeCodes: systemSummary.tradeCodes,
      surveyStatus: systemSummary.surveyStatus,
      hasSavedSystem: systemSummary.hasSavedSystem,
      legacyReconstructed: Boolean(star.legacyReconstructed),
      legacyHierarchyUnknown: Boolean(star.legacyHierarchyUnknown),
      presenceOnly: Boolean(star.presenceOnly),
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

const atlasGenerationAreaOptions = computed(() => ATLAS_GENERATION_AREA_OPTIONS);
const atlasGenerationModeOptions = computed(() => ATLAS_GENERATION_MODE_OPTIONS);

const atlasGenerationAction = computed(() => {
  const areaLabel = getAtlasGenerationAreaLabel(atlasGenerationArea.value);
  const modeMeta = getAtlasGenerationModeMeta(atlasGenerationMode.value);
  return {
    label: `${modeMeta.icon} ${modeMeta.shortLabel} · ${areaLabel}`,
    description: `${modeMeta.description} Applies to the selected ${areaLabel.toLowerCase()}.`,
  };
});

const hierarchyGenerationAction = computed(() => {
  const areaScope = inferHierarchyAreaScope(inspectorHierarchy.value);
  const areaLabel = getAtlasGenerationAreaLabel(areaScope);
  const modeMeta = getAtlasGenerationModeMeta(atlasGenerationMode.value);
  return {
    label: `${modeMeta.icon} ${modeMeta.shortLabel} · ${areaLabel}`,
    description: `${modeMeta.description} Applies to the selected ${areaLabel.toLowerCase()}.`,
  };
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

function hashString(value) {
  const input = String(value || "");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildAtlasSeededSectorName(seed) {
  const hash = hashString(seed);
  const mode = String(preferencesStore.sectorNameMode || "list");
  if (mode === "list") {
    const base = [
      "Spinward Reaches",
      "Coreward Expanse",
      "Trailing Void",
      "Rimward Depths",
      "Starfall Sector",
      "Irongate Sector",
    ][hash % 6];
    const suffix = ATLAS_SEEDED_NAME_SUFFIXES[Math.floor(hash / 7) % ATLAS_SEEDED_NAME_SUFFIXES.length];
    return `${base} ${suffix}`;
  }

  const onset = ATLAS_SEEDED_NAME_ONSETS[hash % ATLAS_SEEDED_NAME_ONSETS.length].toLowerCase();
  const vowelA = ATLAS_SEEDED_NAME_VOWELS[Math.floor(hash / 7) % ATLAS_SEEDED_NAME_VOWELS.length];
  const medial = ATLAS_SEEDED_NAME_MEDIALS[Math.floor(hash / 17) % ATLAS_SEEDED_NAME_MEDIALS.length];
  const vowelB = ATLAS_SEEDED_NAME_VOWELS[Math.floor(hash / 37) % ATLAS_SEEDED_NAME_VOWELS.length];
  const coda = ATLAS_SEEDED_NAME_CODAS[Math.floor(hash / 71) % ATLAS_SEEDED_NAME_CODAS.length];
  const includeSecondVowel = (hash & 1) === 1 || coda.length <= 2;

  let name = `${onset}${vowelA}`;
  if (includeSecondVowel) {
    name += `${medial}${vowelB}`;
  } else if (medial) {
    name += medial;
  }
  name += coda;

  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function isAtlasPlaceholderSectorName(value) {
  const name = String(value || "").trim();
  if (!name) return true;
  return /^sector\s+-?\d+\s*,\s*-?\d+$/i.test(name);
}

function isAtlasLegacySeededSectorName(value) {
  const name = String(value || "").trim();
  if (!name || /\s/.test(name)) return false;
  return /^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(name);
}

function ensureAtlasSectorNamingMetadata(sector, metadata = {}) {
  const baseMetadata = metadata && typeof metadata === "object" ? { ...metadata } : {};
  const currentDisplayName = String(baseMetadata.displayName || "").trim();
  const displayName =
    !currentDisplayName ||
    isAtlasPlaceholderSectorName(currentDisplayName) ||
    isAtlasLegacySeededSectorName(currentDisplayName)
      ? buildAtlasSeededSectorName(`${sector.sectorId}:sector`)
      : currentDisplayName;
  const existingSubsectorNames =
    baseMetadata.subsectorNames && typeof baseMetadata.subsectorNames === "object"
      ? { ...baseMetadata.subsectorNames }
      : {};
  const subsectorNames = Object.fromEntries(
    SUBSECTOR_LETTERS.map((letter) => [
      letter,
      (() => {
        const existingName = String(existingSubsectorNames[letter] || "").trim();
        if (!existingName || isAtlasLegacySeededSectorName(existingName)) {
          return buildAtlasSeededSectorName(`${sector.sectorId}:subsector:${letter}`);
        }
        return existingName;
      })(),
    ]),
  );

  return {
    ...baseMetadata,
    displayName,
    subsectorNames,
  };
}

function toSectorTile(sector) {
  const sx = Number(sector?.coordinates?.x);
  const sy = Number(sector?.coordinates?.y);
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) return null;

  const { ox, oy } = sectorOrigin(sx, sy);
  const densityClass = Math.min(5, Math.max(0, Number(sector.densityClass) || 0));
  const explorationStatus = String(sector?.metadata?.explorationStatus || "").toLowerCase();
  const displayName = String(sector?.metadata?.displayName || "").trim();
  const hasGeneratedName = displayName && !isAtlasPlaceholderSectorName(displayName);
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
    showLabel: hasGeneratedName || !isVoid || isExplored,
    name: hasGeneratedName ? displayName : "",
  };
}

function starTypeToColor(starType, starClass) {
  return starDescriptorToColor(starClass || starType, "#ffd575");
}

function starTypeToCssClass(starType, starClass) {
  return starDescriptorToCssClass(starClass || starType, "spectral-g");
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
    inspectorHierarchy.value = null;
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
    inspectorHierarchy.value = null;
    inspectorStar.value = null;
  }
}

function clearSelection() {
  if (dragging.value) return;
  selectedHexKey.value = null;
  inspectorMode.value = null;
  inspectorSector.value = null;
  inspectorHierarchy.value = null;
  inspectorStar.value = null;
}

function setAtlasGenerationDefaultsForScope(areaScope) {
  atlasGenerationArea.value = String(areaScope || "sector");
}

function getAtlasGenerationAreaLabel(area) {
  return (
    {
      sector: "Sector",
      surrounding: "Sector + Surrounding",
      region: "Region",
      quadrant: "Quadrant",
    }[String(area || "sector")] || "Sector"
  );
}

function getAtlasGenerationModeMeta(mode) {
  const normalized = String(mode || "name-presence");
  switch (normalized) {
    case "name":
      return {
        icon: "✍",
        shortLabel: "Name",
        progressLabel: "Generating names",
        description: "Generate sector names only. No presence or full system data is rolled.",
      };
    case "presence":
      return {
        icon: "🗺",
        shortLabel: "Presence Only",
        progressLabel: "Generating presence",
        description: "Roll occupied hexes only and preserve any existing sector name.",
      };
    case "name-systems":
      return {
        icon: "⭐",
        shortLabel: "Name + Systems",
        progressLabel: "Generating names and systems",
        description: "Generate sector names and full stellar system data.",
      };
    default:
      return {
        icon: "⚡",
        shortLabel: "Name + Presence",
        progressLabel: "Generating names and presence",
        description: "Generate sector names and roll occupied hexes without full system data.",
      };
  }
}

function inferHierarchyAreaScope(tile) {
  return Number(tile?.tileSizeInSectors) >= QUADRANT_SECTORS / 2 ? "quadrant" : "region";
}

function onSectorTileClick(tile) {
  if (dragging.value) return;

  setAtlasGenerationDefaultsForScope("sector");
  inspectorSector.value = tile.sector;
  syncAtlasSelectionState(tile.sector);
  inspectorMode.value = "sector";
  selectedHexKey.value = null;
  inspectorHierarchy.value = null;
  inspectorStar.value = null;

  // Also zoom into the clicked sector when far out.
  if (zoom.value < LOD_SECTOR * 0.7) {
    focusSector(tile.sector);
  }
}

function onGridCellClick(tile) {
  if (dragging.value) return;
  setAtlasGenerationDefaultsForScope("sector");
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
  syncAtlasSelectionState(inspectorSector.value);
  inspectorMode.value = "sector";
  selectedHexKey.value = null;
  inspectorHierarchy.value = null;
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
  setAtlasGenerationDefaultsForScope("sector");
  selectedHexKey.value = star.key;
  inspectorStar.value = { ...star };
  syncAtlasSelectionState({
    sectorId: star.sectorId,
    galaxyId: star.galaxyId,
    coordinates:
      Number.isFinite(Number(star.sectorX)) && Number.isFinite(Number(star.sectorY))
        ? { x: Number(star.sectorX), y: Number(star.sectorY) }
        : null,
    metadata: {
      displayName: star.sectorName,
      gridX: Number(star.sectorX),
      gridY: Number(star.sectorY),
    },
  });
  inspectorMode.value = "star";
  inspectorSector.value = null;
  inspectorHierarchy.value = null;
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
  const sector = resolveInspectorSector();
  if (sector) focusSector(sector);
}

function resolveInspectorSector() {
  if (inspectorSector.value) {
    return inspectorSector.value;
  }

  const star = inspectorStar.value;
  if (!star?.sectorId) {
    return null;
  }

  return (
    atlasSectors.value.find((sector) => String(sector?.sectorId) === String(star.sectorId)) ||
    sectorStore.sectors.find((sector) => String(sector?.sectorId) === String(star.sectorId)) || {
      sectorId: star.sectorId,
      galaxyId: star.galaxyId,
      coordinates: null,
      metadata: {
        displayName: star.sectorName || String(star.sectorId),
      },
    }
  );
}

function openSectorSurvey() {
  const sector = resolveInspectorSector();
  if (!sector) return;

  const targetGalaxyId =
    selectedGalaxyId.value === ALL_GALAXIES_VALUE
      ? sector.galaxyId || inspectorStar.value?.galaxyId
      : selectedGalaxyId.value || sector.galaxyId || inspectorStar.value?.galaxyId;
  if (!targetGalaxyId) return;

  const gridX = Number(sector?.coordinates?.x ?? sector?.metadata?.gridX);
  const gridY = Number(sector?.coordinates?.y ?? sector?.metadata?.gridY);
  const currentDisplayName = String(sector?.metadata?.displayName || "").trim();
  const fallbackSeed =
    Number.isFinite(gridX) && Number.isFinite(gridY)
      ? `atlas:${targetGalaxyId}:${gridX}:${gridY}:sector`
      : `${String(sector?.sectorId || "sector")}:sector`;
  const sectorName =
    currentDisplayName && !isAtlasPlaceholderSectorName(currentDisplayName)
      ? currentDisplayName
      : buildAtlasSeededSectorName(fallbackSeed);
  const sectorId = String(sector?.sectorId || "").startsWith("grid:") ? "" : String(sector?.sectorId || "");
  const returnTo = serializeReturnRoute({
    name: "TravellerAtlas",
    query: selectedGalaxyId.value ? { galaxyId: String(selectedGalaxyId.value) } : {},
  });

  router.push({
    name: "SectorSurvey",
    params: { galaxyId: targetGalaxyId },
    query: {
      ...(sectorId ? { sectorId } : {}),
      ...(Number.isFinite(gridX) ? { gridX: String(gridX) } : {}),
      ...(Number.isFinite(gridY) ? { gridY: String(gridY) } : {}),
      ...(sectorName ? { sectorName } : {}),
      from: "atlas",
      atlasGalaxyId: String(selectedGalaxyId.value || ""),
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

function openSubsectorSurvey() {
  const sector = resolveInspectorSector();
  if (!sector) return;

  const targetGalaxyId =
    selectedGalaxyId.value === ALL_GALAXIES_VALUE
      ? sector.galaxyId || inspectorStar.value?.galaxyId
      : selectedGalaxyId.value || sector.galaxyId || inspectorStar.value?.galaxyId;
  if (!targetGalaxyId) return;

  const gridX = Number(sector?.coordinates?.x ?? sector?.metadata?.gridX);
  const gridY = Number(sector?.coordinates?.y ?? sector?.metadata?.gridY);
  const currentDisplayName = String(sector?.metadata?.displayName || "").trim();
  const fallbackSeed =
    Number.isFinite(gridX) && Number.isFinite(gridY)
      ? `atlas:${targetGalaxyId}:${gridX}:${gridY}:sector`
      : `${String(sector?.sectorId || "sector")}:sector`;
  const sectorName =
    currentDisplayName && !isAtlasPlaceholderSectorName(currentDisplayName)
      ? currentDisplayName
      : buildAtlasSeededSectorName(fallbackSeed);
  const sectorId = String(sector?.sectorId || "").startsWith("grid:") ? "" : String(sector?.sectorId || "");
  const returnTo = serializeReturnRoute({
    name: "TravellerAtlas",
    query: selectedGalaxyId.value ? { galaxyId: String(selectedGalaxyId.value) } : {},
  });
  const starX = inspectorStar.value?.hexCoordinates?.x ?? inspectorStar.value?.x;
  const starY = inspectorStar.value?.hexCoordinates?.y ?? inspectorStar.value?.y;
  const subsectorLetter = inspectorMode.value === "star" ? getSubsectorLetterForHex(starX, starY) : undefined;
  const subsectorName = subsectorLetter
    ? String(sector?.metadata?.subsectorNames?.[subsectorLetter] || "").trim() || undefined
    : undefined;

  router.push({
    name: "SubsectorSurvey",
    params: { galaxyId: targetGalaxyId },
    query: {
      ...(sectorId ? { sectorId } : {}),
      ...(Number.isFinite(gridX) ? { gridX: String(gridX) } : {}),
      ...(Number.isFinite(gridY) ? { gridY: String(gridY) } : {}),
      ...(sectorName ? { sectorName } : {}),
      ...(subsectorLetter ? { subsector: subsectorLetter } : {}),
      ...(subsectorName ? { subsectorName } : {}),
      viewScope: "subsector",
      from: "atlas",
      atlasGalaxyId: String(selectedGalaxyId.value || ""),
      ...(returnTo ? { returnTo } : {}),
    },
  });
}

function sectorHexCoord(col, row) {
  return `${String(col).padStart(2, "0")}${String(row).padStart(2, "0")}`;
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
  } else {
    atlasSectors.value.unshift(updatedSector);
  }
  inspectorSector.value = updatedSector;
  syncAtlasSelectionState(updatedSector);
}

function syncAtlasSelectionState(sector) {
  const targetGalaxyId = String(sector?.galaxyId || "").trim();
  if (targetGalaxyId && targetGalaxyId !== ALL_GALAXIES_VALUE) {
    galaxyStore.setCurrentGalaxy(targetGalaxyId);
  }

  const sectorId = String(sector?.sectorId || "").trim();
  if (!sectorId || sectorId.startsWith("grid:")) {
    sectorStore.setCurrentSector(null);
    return;
  }

  sectorStore.setCurrentSector(sectorId);
}

function startAtlasGenerationProgress(label, total) {
  atlasGenerationProgress.value = {
    active: true,
    label,
    current: 0,
    total: Math.max(1, Number(total) || 1),
    legacyReconstructedCount: 0,
    legacyHierarchyUnknownCount: 0,
  };
}

function updateAtlasGenerationProgress(
  current,
  label = atlasGenerationProgress.value.label,
  total = atlasGenerationProgress.value.total,
  legacySummary = atlasGenerationProgress.value,
) {
  atlasGenerationProgress.value = {
    active: true,
    label,
    current: Math.max(0, Number(current) || 0),
    total: Math.max(1, Number(total) || 1),
    legacyReconstructedCount: Math.max(0, Number(legacySummary?.legacyReconstructedCount) || 0),
    legacyHierarchyUnknownCount: Math.max(0, Number(legacySummary?.legacyHierarchyUnknownCount) || 0),
  };
}

function resetAtlasGenerationProgress() {
  atlasGenerationProgress.value = {
    active: false,
    label: "",
    current: 0,
    total: 0,
    legacyReconstructedCount: 0,
    legacyHierarchyUnknownCount: 0,
  };
}

function buildPersistableSector(sector) {
  if (!sector) return null;
  const sx = Number(sector?.coordinates?.x ?? sector?.metadata?.gridX ?? 0);
  const sy = Number(sector?.coordinates?.y ?? sector?.metadata?.gridY ?? 0);
  const targetGalaxyId =
    selectedGalaxyId.value === ALL_GALAXIES_VALUE ? sector?.galaxyId : selectedGalaxyId.value || sector?.galaxyId;
  if (!targetGalaxyId) return null;
  const galaxyId = String(targetGalaxyId);
  return {
    ...sector,
    sectorId: String(sector?.sectorId || `${galaxyId}:${sx},${sy}`).replace(/^grid:/, `${galaxyId}:`),
    galaxyId,
    coordinates: { x: sx, y: sy },
    densityClass: Number(sector?.densityClass ?? 0),
    metadata: {
      ...(sector?.metadata ?? {}),
      galaxyId,
      gridX: sx,
      gridY: sy,
      explorationStatus: sector?.metadata?.explorationStatus || "unexplored",
    },
  };
}

function parseHexCoordinates(coord) {
  const raw = String(coord || "0000")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
  return {
    x: Number(raw.slice(0, 2)) || 0,
    y: Number(raw.slice(2, 4)) || 0,
  };
}

function normalizeGeneratedStarType(star) {
  const normalized = String(star?.designation || star?.spectralType || star?.spectralClass || "").trim();
  if (!normalized) {
    return "G2V";
  }

  const lowered = normalized.toLowerCase();
  return lowered === "undefined" || lowered === "null" || lowered === "nan" ? "G2V" : normalized;
}

function buildAtlasGeneratedSystem(sector, coord, primaryStar, secondaryStars = [], anomalyType = null) {
  const starMetadata = buildHexStarTypeMetadata({
    generatedStars: buildGeneratedStars({
      primary: primaryStar,
      secondaryStars,
      anomalyType,
      fallbackStarType: normalizeGeneratedStarType(primaryStar),
    }),
    anomalyType,
    fallbackStarType: anomalyType ? String(anomalyType).trim() : normalizeGeneratedStarType(primaryStar),
  });
  const generatedStars = starMetadata.generatedStars;
  const primaryType = normalizeGeneratedStarType(starMetadata.starType);

  return {
    systemId: `${sector.sectorId}:${coord}`,
    galaxyId: sector.galaxyId,
    sectorId: sector.sectorId,
    hexCoordinates: parseHexCoordinates(coord),
    starCount: Math.max(1, Math.min(4, generatedStars.length || 1)),
    primaryStar: {
      spectralClass: primaryType,
    },
    companionStars: generatedStars.slice(1).map((star) => ({ spectralClass: star.spectralClass })),
    metadata: {
      generatedSurvey: {
        stars: generatedStars,
        anomalyType: anomalyType || null,
      },
      lastModified: new Date().toISOString(),
      source: "atlas",
      anomalyType: anomalyType || null,
    },
  };
}

function getNeighborSectors(sector, radius = 1) {
  const sx = Number(sector?.coordinates?.x);
  const sy = Number(sector?.coordinates?.y);
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) return [];

  const neighbors = [];
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      const nx = sx + dx;
      const ny = sy + dy;
      neighbors.push(
        sectorByCoord.value.get(`${nx}:${ny}`) || {
          sectorId: `${selectedGalaxyId.value}:${nx},${ny}`,
          galaxyId: selectedGalaxyId.value,
          coordinates: { x: nx, y: ny },
          densityClass: Number(sector?.densityClass ?? 0),
          metadata: { gridX: nx, gridY: ny, displayName: `Sector ${nx},${ny}`, explorationStatus: "unexplored" },
        },
      );
    }
  }
  return neighbors;
}

function getHierarchyTileSectors(tile) {
  const tileGalaxyId = String(tile?.galaxyId || selectedGalaxyId.value || "").trim();
  if (!tile || !tileGalaxyId || tileGalaxyId === ALL_GALAXIES_VALUE) return [];
  const tileSize = Math.max(1, Math.round(Number(tile.tileSizeInSectors) || 1));
  const targets = [];
  for (let sx = tile.minSectorX; sx < tile.minSectorX + tileSize; sx += 1) {
    for (let sy = tile.minSectorY; sy < tile.minSectorY + tileSize; sy += 1) {
      targets.push(
        sectorByCoord.value.get(`${sx}:${sy}`) || {
          sectorId: `${tileGalaxyId}:${sx},${sy}`,
          galaxyId: tileGalaxyId,
          coordinates: { x: sx, y: sy },
          densityClass: 0,
          metadata: { gridX: sx, gridY: sy, displayName: `Sector ${sx},${sy}`, explorationStatus: "unexplored" },
        },
      );
    }
  }
  return targets;
}

async function generateSectorNameOnlyInternal(sector) {
  const targetSector = buildPersistableSector(sector);
  if (!targetSector) return null;
  const updated = await sectorApi.upsertSector({
    ...targetSector,
    metadata: ensureAtlasSectorNamingMetadata(targetSector, targetSector.metadata ?? {}),
  });
  applySectorUpdate(updated);
  return updated;
}

async function generateInspectorSectorName() {
  const sector = resolveInspectorSector();
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  startAtlasGenerationProgress("Generating sector name", 1);
  try {
    const legacySummary = summarizeSectorLegacyProgress(sector);
    const updated = await generateSectorNameOnlyInternal(sector);
    updateAtlasGenerationProgress(1, undefined, undefined, legacySummary);
    toastService.success(
      `Generated a sector name for ${String(updated?.metadata?.displayName || updated?.sectorId || "sector")}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate sector name: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
  }
}

async function generateInspectorSectorPresenceInternal(sector) {
  return generateInspectorSectorPresenceInternalWithOptions(sector, { includeNames: true });
}

async function generateInspectorSectorPresenceInternalWithOptions(sector, { includeNames = true } = {}) {
  const targetSector = buildPersistableSector(sector);
  const { galaxy, densityClass } = getSectorGenerationContext(targetSector);
  const occupiedHexes = rollOccupiedHexesForSector(galaxy, densityClass);
  if (isGalacticCenterSector(targetSector)) {
    const centerCoord = sectorHexCoord(Math.ceil(HEX_PRESENCE_COLS / 2), Math.ceil(HEX_PRESENCE_ROWS / 2));
    if (!occupiedHexes.includes(centerCoord)) {
      occupiedHexes.push(centerCoord);
    }
  }
  const galacticCenter = isGalacticCenterSector(targetSector);
  const anomalyType = galacticCenter ? centerAnomalyTypeForGalaxy(galaxy) : null;

  const payload = {
    ...targetSector,
    metadata: (includeNames ? ensureAtlasSectorNamingMetadata : (_sector, metadata) => metadata)(targetSector, {
      ...(targetSector.metadata ?? {}),
      systemCount: occupiedHexes.length,
      explorationStatus: occupiedHexes.length > 0 ? "mapped" : "unexplored",
      hexPresenceGenerated: true,
      hexPresenceGeneratedAt: new Date().toISOString(),
      occupiedHexes,
      hexStarTypes: {},
      isGalacticCenterSector: galacticCenter,
      centralAnomalyType: anomalyType,
    }),
  };

  const updated = await sectorApi.upsertSector(payload);
  applySectorUpdate(updated);
  return { updated, occupiedHexes };
}

async function generateInspectorSector() {
  const sector = resolveInspectorSector();
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  startAtlasGenerationProgress("Generating sector presence", 1);
  try {
    const legacySummary = summarizeSectorLegacyProgress(sector);
    const { updated, occupiedHexes } = await generateInspectorSectorPresenceInternal(sector);
    updateAtlasGenerationProgress(1, undefined, undefined, legacySummary);
    toastService.success(
      `Generated sector presence for ${occupiedHexes.length.toLocaleString()} occupied hexes in ${String(updated.metadata?.displayName || updated.sectorId)}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate sector: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
  }
}

async function generateInspectorSectorSystemsInternal(sector) {
  return generateInspectorSectorSystemsInternalWithOptions(sector, { includeNames: true });
}

async function generateInspectorSectorSystemsInternalWithOptions(sector, { includeNames = true } = {}) {
  const targetSector = buildPersistableSector(sector);
  const { galaxy, densityClass } = getSectorGenerationContext(targetSector);
  const existingStarTypes =
    targetSector?.metadata?.hexStarTypes && typeof targetSector.metadata.hexStarTypes === "object"
      ? targetSector.metadata.hexStarTypes
      : {};
  const existingOccupiedHexes = Array.isArray(targetSector?.metadata?.occupiedHexes)
    ? targetSector.metadata.occupiedHexes.filter((coord) => typeof coord === "string")
    : [];
  const hasSurveyedSystems = Object.keys(existingStarTypes).length > 0;
  const occupiedHexes =
    !hasSurveyedSystems && existingOccupiedHexes.length > 0
      ? [...existingOccupiedHexes]
      : rollOccupiedHexesForSector(galaxy, densityClass);
  const galacticCenter = isGalacticCenterSector(targetSector);
  const centerCoord = sectorHexCoord(Math.ceil(HEX_PRESENCE_COLS / 2), Math.ceil(HEX_PRESENCE_ROWS / 2));
  const anomalyType = galacticCenter ? centerAnomalyTypeForGalaxy(galaxy) : null;
  if (galacticCenter && !occupiedHexes.includes(centerCoord)) {
    occupiedHexes.push(centerCoord);
  }

  const hexStarTypes = {};
  const generatedSystems = [];
  for (const coord of occupiedHexes) {
    if (galacticCenter && coord === centerCoord) {
      const starMetadata = buildHexStarTypeMetadata({
        anomalyType,
        generatedStars: buildGeneratedStars({ anomalyType, fallbackStarType: anomalyType || "G2V" }),
        fallbackStarType: anomalyType || "G2V",
      });
      hexStarTypes[coord] = {
        starType: starMetadata.starType,
        starClass: "anomaly-core",
        secondaryStars: starMetadata.secondaryStars,
        generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: starMetadata.anomalyType,
      };
      generatedSystems.push(buildAtlasGeneratedSystem(targetSector, coord, null, [], anomalyType));
    } else {
      const primary = generatePrimaryStar();
      const starMetadata = buildHexStarTypeMetadata({
        generatedStars: buildGeneratedStars({ primary, fallbackStarType: normalizeGeneratedStarType(primary) }),
        primary,
        fallbackStarType: normalizeGeneratedStarType(primary),
      });
      const primaryType = normalizeGeneratedStarType(starMetadata.starType);
      hexStarTypes[coord] = {
        starType: primaryType,
        starClass: starTypeToCssClass(primaryType),
        secondaryStars: starMetadata.secondaryStars,
        generatedStars: starMetadata.generatedStars.map((star) => ({ ...star })),
        anomalyType: starMetadata.anomalyType,
      };
      generatedSystems.push(buildAtlasGeneratedSystem(targetSector, coord, primary, [], null));
    }
  }

  const payload = {
    ...targetSector,
    metadata: (includeNames ? ensureAtlasSectorNamingMetadata : (_sector, metadata) => metadata)(targetSector, {
      ...(targetSector.metadata ?? {}),
      systemCount: occupiedHexes.length,
      explorationStatus: occupiedHexes.length > 0 ? "surveyed" : "unexplored",
      hexPresenceGenerated: true,
      hexPresenceGeneratedAt: new Date().toISOString(),
      occupiedHexes,
      hexStarTypes,
      isGalacticCenterSector: galacticCenter,
      centralAnomalyType: anomalyType,
    }),
  };

  const updated = await sectorApi.upsertSector(payload);
  await systemStore.replaceSectorSystems(
    updated.sectorId,
    generatedSystems.map((system) => ({
      ...system,
      galaxyId: updated.galaxyId,
      sectorId: updated.sectorId,
      systemId: `${updated.sectorId}:${String(system?.systemId || "")
        .split(":")
        .pop()}`,
    })),
  );
  applySectorUpdate(updated);
  return { updated, occupiedHexes };
}

async function generateInspectorSectorSystems() {
  const sector = resolveInspectorSector();
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  startAtlasGenerationProgress("Generating sector systems", 1);
  try {
    const legacySummary = summarizeSectorLegacyProgress(sector);
    const { updated, occupiedHexes } = await generateInspectorSectorSystemsInternal(sector);
    updateAtlasGenerationProgress(1, undefined, undefined, legacySummary);
    toastService.success(
      `Generated systems for ${occupiedHexes.length.toLocaleString()} hexes in ${String(updated.metadata?.displayName || updated.sectorId)}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate systems: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
  }
}

async function generateInspectorSectorAndSurroundingSystems() {
  const sector = resolveInspectorSector();
  if (!sector || isGeneratingInspectorSector.value) return;

  isGeneratingInspectorSector.value = true;
  try {
    const targets = getNeighborSectors(sector, 1);
    startAtlasGenerationProgress("Generating sector and surrounding sectors", targets.length);
    let generatedCount = 0;
    let legacyReconstructedCount = 0;
    let legacyHierarchyUnknownCount = 0;
    for (const target of targets) {
      const legacySummary = summarizeSectorLegacyProgress(target);
      legacyReconstructedCount += legacySummary.legacyReconstructedCount;
      legacyHierarchyUnknownCount += legacySummary.legacyHierarchyUnknownCount;
      await generateInspectorSectorSystemsInternal(target);
      generatedCount += 1;
      updateAtlasGenerationProgress(generatedCount, undefined, undefined, {
        legacyReconstructedCount,
        legacyHierarchyUnknownCount,
      });
    }
    toastService.success(
      `Generated names and systems for ${generatedCount.toLocaleString()} sectors in the selected area.`,
    );
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
  }
}

function getGenerationTargetsForSector(sector, areaScope) {
  const targetSector = buildPersistableSector(sector);
  if (!targetSector) return [];

  if (areaScope === "sector") {
    return [targetSector];
  }

  if (areaScope === "surrounding") {
    return getNeighborSectors(targetSector, 1)
      .map((entry) => buildPersistableSector(entry))
      .filter(Boolean);
  }

  const size = areaScope === "quadrant" ? QUADRANT_SECTORS : REGION_SECTORS;
  const sx = Number(targetSector?.coordinates?.x);
  const sy = Number(targetSector?.coordinates?.y);
  if (!Number.isFinite(sx) || !Number.isFinite(sy)) return [targetSector];

  const tile = {
    galaxyId: targetSector.galaxyId,
    minSectorX: Math.floor(sx / size) * size,
    minSectorY: Math.floor(sy / size) * size,
    tileSizeInSectors: size,
  };

  return getHierarchyTileSectors(tile)
    .map((entry) => buildPersistableSector(entry))
    .filter(Boolean);
}

async function applyAtlasGenerationModeToSector(target, generationMode) {
  switch (generationMode) {
    case "name":
      await generateSectorNameOnlyInternal(target);
      return;
    case "presence":
      await generateInspectorSectorPresenceInternalWithOptions(target, { includeNames: false });
      return;
    case "name-systems":
      await generateInspectorSectorSystemsInternalWithOptions(target, { includeNames: true });
      return;
    default:
      await generateInspectorSectorPresenceInternalWithOptions(target, { includeNames: true });
  }
}

async function runInspectorGenerationAction() {
  const sector = resolveInspectorSector();
  if (!sector || isGeneratingInspectorSector.value) return;

  const targets = getGenerationTargetsForSector(sector, atlasGenerationArea.value);
  const modeMeta = getAtlasGenerationModeMeta(atlasGenerationMode.value);
  const areaLabel = getAtlasGenerationAreaLabel(atlasGenerationArea.value).toLowerCase();

  isGeneratingInspectorSector.value = true;
  try {
    startAtlasGenerationProgress(modeMeta.progressLabel, Math.max(1, targets.length));
    let generatedCount = 0;
    let legacyReconstructedCount = 0;
    let legacyHierarchyUnknownCount = 0;
    for (const target of targets) {
      const legacySummary = summarizeSectorLegacyProgress(target);
      legacyReconstructedCount += legacySummary.legacyReconstructedCount;
      legacyHierarchyUnknownCount += legacySummary.legacyHierarchyUnknownCount;
      await applyAtlasGenerationModeToSector(target, atlasGenerationMode.value);
      generatedCount += 1;
      updateAtlasGenerationProgress(generatedCount, modeMeta.progressLabel, Math.max(1, targets.length), {
        legacyReconstructedCount,
        legacyHierarchyUnknownCount,
      });
    }
    toastService.success(
      `${modeMeta.shortLabel} completed for ${generatedCount.toLocaleString()} sector${generatedCount !== 1 ? "s" : ""} in the selected ${areaLabel}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate selected ${areaLabel}: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
  }
}

function focusHierarchyInspector() {
  if (inspectorHierarchy.value) {
    focusHierarchyTile(inspectorHierarchy.value);
  }
}

async function generateHierarchyAreaSystems() {
  await runHierarchyGenerationAction();
}

async function runHierarchyGenerationAction() {
  const tile = inspectorHierarchy.value;
  if (!tile || isGeneratingInspectorSector.value) return;

  const targets = getHierarchyTileSectors(tile)
    .map((entry) => buildPersistableSector(entry))
    .filter(Boolean);
  const modeMeta = getAtlasGenerationModeMeta(atlasGenerationMode.value);
  const areaType = inferHierarchyAreaScope(tile);

  isGeneratingInspectorSector.value = true;
  try {
    startAtlasGenerationProgress(modeMeta.progressLabel, Math.max(1, targets.length));
    let generatedCount = 0;
    let legacyReconstructedCount = 0;
    let legacyHierarchyUnknownCount = 0;
    for (const target of targets) {
      const legacySummary = summarizeSectorLegacyProgress(target);
      legacyReconstructedCount += legacySummary.legacyReconstructedCount;
      legacyHierarchyUnknownCount += legacySummary.legacyHierarchyUnknownCount;
      await applyAtlasGenerationModeToSector(target, atlasGenerationMode.value);
      generatedCount += 1;
      updateAtlasGenerationProgress(generatedCount, modeMeta.progressLabel, Math.max(1, targets.length), {
        legacyReconstructedCount,
        legacyHierarchyUnknownCount,
      });
    }
    toastService.success(
      `${modeMeta.shortLabel} completed for ${generatedCount.toLocaleString()} sectors in the selected ${areaType}.`,
    );
  } catch (err) {
    toastService.error(`Failed to generate selected ${areaType}: ${err.message}`);
  } finally {
    isGeneratingInspectorSector.value = false;
    resetAtlasGenerationProgress();
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
  setAtlasGenerationDefaultsForScope(inferHierarchyAreaScope(tile));
  inspectorHierarchy.value = tile;
  inspectorMode.value = "hierarchy";
  inspectorSector.value = null;
  inspectorStar.value = null;
  selectedHexKey.value = null;
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
  const systemRecord = findSystemRecordForStar(star);
  const returnTo = serializeReturnRoute({
    name: "TravellerAtlas",
    query: selectedGalaxyId.value ? { galaxyId: String(selectedGalaxyId.value) } : {},
  });

  if (systemRecord?.systemId) {
    systemStore.setCurrentSystem(systemRecord.systemId);
    router.push({
      name: "SystemSurvey",
      params: {
        galaxyId: targetGalaxyId,
        sectorId: star.sectorId,
        systemId: systemRecord.systemId,
      },
      query: {
        systemId: systemRecord.systemId,
        systemRecordId: systemRecord.systemId,
        hex: star.coord,
        star: star.starType,
        ...(returnTo ? { returnTo } : {}),
      },
    });
    return;
  }

  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: targetGalaxyId, sectorId: star.sectorId },
    query: { hex: star.coord, star: star.starType, ...(returnTo ? { returnTo } : {}) },
  });
}

function openOrbitalView() {
  const star = inspectorStar.value;
  if (!star || !selectedGalaxyId.value) return;
  const targetGalaxyId = selectedGalaxyId.value === ALL_GALAXIES_VALUE ? star.galaxyId : selectedGalaxyId.value;
  if (!targetGalaxyId) return;
  const returnTo = serializeReturnRoute({
    name: "TravellerAtlas",
    query: selectedGalaxyId.value ? { galaxyId: String(selectedGalaxyId.value) } : {},
  });

  router.push({
    name: "OrbitalView",
    params: { galaxyId: targetGalaxyId, sectorId: star.sectorId },
    query: {
      hex: star.coord,
      star: star.starType,
      from: "atlas",
      ...(returnTo ? { returnTo } : {}),
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

  if (selectedGalaxyId.value !== ALL_GALAXIES_VALUE) {
    galaxyStore.setCurrentGalaxy(selectedGalaxyId.value);
  }

  isLoading.value = true;
  try {
    if (selectedGalaxyId.value === ALL_GALAXIES_VALUE) {
      const galaxyIds = galaxyOptions.value.map((g) => g.galaxyId);
      const sectorsByGalaxy = await Promise.all(galaxyIds.map((galaxyId) => sectorApi.getSectors(galaxyId)));
      atlasSectors.value = sectorsByGalaxy.flat();
      await nextTick();
      resetView();
    } else {
      const layoutBounds = {
        xMin: -SELECTED_GALAXY_WINDOW_RADIUS,
        xMax: SELECTED_GALAXY_WINDOW_RADIUS,
        yMin: -SELECTED_GALAXY_WINDOW_RADIUS,
        yMax: SELECTED_GALAXY_WINDOW_RADIUS,
      };
      const loadedSectors = await sectorApi.getSectorsWindow(selectedGalaxyId.value, {
        xMin: layoutBounds.xMin,
        xMax: layoutBounds.xMax,
        yMin: layoutBounds.yMin,
        yMax: layoutBounds.yMax,
        limit: 2500,
      });
      sectorStore.sectors = Array.isArray(loadedSectors) ? [...loadedSectors] : [];

      let nextSectors = mergeAtlasSectorsWithGalaxyLayout(currentGalaxy.value, loadedSectors, layoutBounds);
      const centerSectorId = `${selectedGalaxyId.value}:0,0`;
      let focusTarget = nextSectors.find((sector) => sector?.sectorId === centerSectorId) ?? null;

      if (!focusTarget) {
        try {
          const centerSector = await sectorApi.getSector(centerSectorId);
          if (centerSector?.galaxyId === selectedGalaxyId.value) {
            nextSectors = mergeAtlasSectorsWithGalaxyLayout(
              currentGalaxy.value,
              [centerSector, ...nextSectors],
              layoutBounds,
            );
            focusTarget = nextSectors.find((sector) => sector?.sectorId === centerSectorId) ?? centerSector;
          }
        } catch {
          // Ignore missing center-sector fetches and fall back to loaded slice.
        }
      }

      atlasSectors.value = nextSectors;
      await nextTick();

      if (focusTarget) {
        focusSector(focusTarget);
      } else {
        resetView();
      }
    }
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
  user-select: none;
  -webkit-user-select: none;
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
  user-select: none;
  -webkit-user-select: none;
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
  user-select: none;
  -webkit-user-select: none;
}

.star-name-label {
  fill: rgba(240, 230, 200, 0.82);
  font-size: 10px;
  font-weight: 600;
  paint-order: stroke;
  stroke: rgba(4, 7, 16, 0.92);
  stroke-width: 2.5;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
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
  font-family: "Circular Std", Circular, "Lineto Circular", "Segoe UI", sans-serif;
}

.atlas-inspector button,
.atlas-inspector .inspector-title,
.atlas-inspector .inspector-badge,
.atlas-inspector .detail-grid,
.atlas-inspector .star-type-big,
.atlas-inspector .star-companion-hint,
.atlas-inspector .orbital-title,
.atlas-inspector .orbit-label {
  font-family: inherit;
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

.inspector-subtitle {
  margin-bottom: 0.45rem;
  color: #b8c0cc;
  font-size: 0.82rem;
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

.dv--mono {
  font-family: "Consolas", "SFMono-Regular", "Liberation Mono", monospace;
  letter-spacing: 0.04em;
}

.inspector-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.inspector-generation-panel {
  margin-top: 0.75rem;
  margin-bottom: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.inspector-generation-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.inspector-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.inspector-field-label {
  color: #7aa8cc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.inspector-select {
  width: 100%;
  padding: 0.45rem 0.55rem;
  background: rgba(13, 22, 45, 0.95);
  border: 1px solid rgba(110, 201, 243, 0.35);
  border-radius: 0.35rem;
  color: #d0e8ff;
  font-size: 0.82rem;
}

.inspector-field-help {
  color: #b8c0cc;
  font-size: 0.76rem;
  line-height: 1.35;
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
}

.star-companion-hint {
  font-size: 0.73rem;
  color: #a08860;
  margin-top: 0.12rem;
}

.detail-grid--system {
  margin-bottom: 0.7rem;
}

.trade-code-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.base-code-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.legacy-code-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.trade-code-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.45rem;
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  background: rgba(70, 130, 210, 0.2);
  border: 1px solid rgba(120, 190, 255, 0.24);
  color: #bfe3ff;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.base-code-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.45rem;
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  background: rgba(214, 155, 66, 0.18);
  border: 1px solid rgba(237, 190, 108, 0.24);
  color: #f0d49a;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.legacy-code-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.45rem;
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  background: rgba(210, 124, 70, 0.18);
  border: 1px solid rgba(255, 178, 118, 0.28);
  color: #ffd4ab;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.inspector-note {
  margin: 0 0 0.75rem;
  color: #88a7c9;
  font-size: 0.73rem;
  line-height: 1.45;
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
