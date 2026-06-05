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
          <span v-if="hoveredHexLabel" class="map-hover-readout">Hover: {{ hoveredHexLabel }}</span>
        </div>

        <div class="map-controls">
          <button type="button" class="map-button" @click="generateTerrain" :disabled="!(activeHexCells?.length ?? 0)">
            Generate Terrain
          </button>
          <button type="button" class="map-button map-button-secondary" @click="clearWaterHexes">Clear Water</button>
          <span class="map-controls-note">Target water: {{ Math.round(hydroTargetRatio * 100) }}%</span>
          <span class="map-controls-note">Mountains: {{ activeMountainHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Hills: {{ activeHillsHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Rainforest: {{ activeForestBiomeHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Tundra: {{ activeTundraHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Chasms: {{ activeChasmHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note">Precipices: {{ activePrecipiceHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="isVacuumWorld">Craters: {{ activeCraterHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="isDesertWorld">Desert: {{ activeDesertHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="activeOceanTriangleCount > 0"
            >Oceans: {{ activeOceanTriangleCount }} triangles / {{ activeOceanGroupCount }} ocean groups</span
          >
          <span class="map-controls-note" v-if="(activeTopologyTriangles?.length ?? 0) > 0"
            >Continents: {{ activeContinentTriangleCount }}</span
          >
          <span class="map-controls-note" v-if="isDieBackWorld">Ruins: {{ activeRuinHexEntries?.length ?? 0 }}</span>
          <span class="map-controls-note" v-if="resourceHexCount > 0"
            >Resource Hexes: {{ resourceHexCount }} ({{ activeResourceHexEntries?.length ?? 0 }} placed)</span
          >
          <span class="map-controls-note" v-if="croplandDicePerContinent > 0"
            >Cropland: {{ activeCroplandHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="isSingleTownSettlementWorld"
            >Towns: {{ activeTownHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeCityHexEntries?.length ?? 0) > 0"
            >Cities: {{ activeCityHexEntries?.length ?? 0 }}<template v-if="domedCityRequired"> (Domed)</template></span
          >
          <span class="map-controls-note" v-if="(activeArcologyHexEntries?.length ?? 0) > 0"
            >Arcologies: {{ activeArcologyHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeRuralHexEntries?.length ?? 0) > 0"
            >Rural: {{ activeRuralHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeWorldPortHexEntries?.length ?? 0) > 0"
            >{{ activeWorldPortHexEntries[0]?.spaceport ? "Spaceport" : "Starport" }}:
            {{ activeWorldPortHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="isTwilightZoneWorld"
            >Twilight Zone: {{ activeTwilightZoneHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="isTwilightZoneWorld && (activeBakedLandHexEntries?.length ?? 0) > 0"
            >Baked Lands: {{ activeBakedLandHexEntries?.length ?? 0 }}</span
          >
          <span
            class="map-controls-note"
            v-if="isTwilightZoneWorld && (activeTwilightFrozenLandHexEntries?.length ?? 0) > 0"
            >Frozen Lands: {{ activeTwilightFrozenLandHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activePenalColonyHexEntries?.length ?? 0) > 0"
            >Penal Colonies: {{ activePenalColonyHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeWastelandHexEntries?.length ?? 0) > 0"
            >Wasteland: {{ activeWastelandHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeExoticHexEntries?.length ?? 0) > 0"
            >Exotic: {{ activeExoticHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="(activeNobleLandHexEntries?.length ?? 0) > 0"
            >Noble Lands: {{ activeNobleLandHexEntries?.length ?? 0 }}</span
          >
          <span class="map-controls-note" v-if="tectonicPlateCount > 0"
            >Tectonics: {{ tectonicPlateCount }} plates / {{ activeTectonicLineSegments.length }} segments</span
          >
        </div>

        <WorldTerrainHexInspector
          :selected-key="selectedTerrainHexKey"
          :selected-hex="selectedTerrainHexEntry"
          :summary="terrainHexInspectorSummary"
          @clear-selection="clearTerrainHexSelection"
        />

        <svg
          id="blankMapSVG"
          class="terrain-map"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xml:space="preserve"
          width="100%"
          :viewBox="activeViewBox"
          @click="handleMapClick"
          @mousemove="handleMapHover"
          @mouseleave="clearMapHover"
          :style="{ cursor: 'crosshair', aspectRatio: activeViewBoxAspectRatio }"
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

          <g id="selected-hex-overlay" pointer-events="none" v-if="selectedTerrainHexEntry">
            <polygon
              :points="selectedTerrainHexEntry.points"
              fill="rgba(255, 196, 61, 0.14)"
              stroke="#b45309"
              stroke-width="2.5"
              stroke-dasharray="7 4"
            />
          </g>

          <g id="ocean-triangle-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeOceanTriangleEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(38, 96, 178, 0.18)"
              stroke="none"
            />
          </g>

          <g id="flatland-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeFlatlandHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="#D2B48C"
              stroke="black"
              stroke-width="0.25"
            />
          </g>

          <g id="hills-hex-overlay" pointer-events="none">
            <g v-for="entry in activeHillsHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="#A0825C" stroke="#6C563B" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#4A3B27"
                style="pointer-events: none; user-select: none"
              >
                H
              </text>
            </g>
          </g>

          <g id="rainforest-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeForestBiomeHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(34, 128, 72, 0.32)"
              stroke="#1D6A3C"
              stroke-width="0.8"
            />
          </g>

          <g id="swamp-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeSwampBiomeHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(95, 122, 66, 0.30)"
              stroke="#4B5F31"
              stroke-width="0.8"
            />
          </g>

          <g id="tundra-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeTundraHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(188, 199, 208, 0.30)"
              stroke="#7A8894"
              stroke-width="0.8"
            />
          </g>

          <g id="water-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeWaterHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="#04529D"
              stroke="black"
              stroke-width="1"
            />
          </g>

          <g id="ice-field-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeIceFieldHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(206, 231, 247, 0.58)"
              stroke="#7ea7c1"
              stroke-width="1.1"
            />
          </g>

          <g id="frozen-lands-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeFrozenLandHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(205, 214, 226, 0.28)"
              stroke="#8592a3"
              stroke-width="0.9"
            />
          </g>

          <g id="cropland-hex-overlay" pointer-events="none">
            <g v-for="entry in activeCroplandHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(124, 176, 84, 0.42)" stroke="#4f7f2f" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#2e4a1b"
                style="pointer-events: none; user-select: none"
              >
                Ag
              </text>
            </g>
          </g>

          <g id="town-hex-overlay" pointer-events="none">
            <g v-for="entry in activeTownHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(219, 168, 96, 0.34)" stroke="#85551a" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#5d3608"
                style="pointer-events: none; user-select: none"
              >
                Tn
              </text>
            </g>
          </g>

          <g id="city-hex-overlay" pointer-events="none">
            <g v-for="entry in activeCityHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="entry.domed ? 'rgba(110, 158, 205, 0.36)' : 'rgba(196, 112, 71, 0.34)'"
                :stroke="entry.domed ? '#2f5c89' : '#7f3e22'"
                stroke-width="1.2"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                :fill="entry.domed ? '#173f64' : '#4f1f10'"
                style="pointer-events: none; user-select: none"
              >
                {{ entry.domed ? "CyD" : "Cy" }}
              </text>
            </g>
          </g>

          <g id="arcology-hex-overlay" pointer-events="none">
            <g v-for="entry in activeArcologyHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(125, 101, 186, 0.34)" stroke="#4a2d8b" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#2f1a5f"
                style="pointer-events: none; user-select: none"
              >
                Ar
              </text>
            </g>
          </g>

          <g id="rural-hex-overlay" pointer-events="none">
            <g v-for="entry in activeRuralHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(142, 183, 92, 0.24)" stroke="#567a2f" stroke-width="1" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#39531f"
                style="pointer-events: none; user-select: none"
              >
                Ru
              </text>
            </g>
          </g>

          <g id="world-port-hex-overlay" pointer-events="none">
            <g v-for="entry in activeWorldPortHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="entry.spaceport ? 'rgba(96, 122, 160, 0.34)' : 'rgba(90, 130, 210, 0.34)'"
                :stroke="entry.spaceport ? '#35557f' : '#1f3f80'"
                stroke-width="1.2"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                :fill="entry.spaceport ? '#223b5d' : '#132e5f'"
                style="pointer-events: none; user-select: none"
              >
                {{ entry.spaceport ? "Sp" : "St" }}
              </text>
            </g>
          </g>

          <g id="twilight-zone-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeTwilightZoneHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(130, 90, 171, 0.20)"
              stroke="#5f3e85"
              stroke-width="0.8"
            />
          </g>

          <g id="twilight-zone-line-overlay" pointer-events="none">
            <line
              v-for="line in activeTwilightZoneGuideLines"
              :key="line.key"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
              :stroke="line.type === 'pole' ? '#4c2e7a' : '#6d4a9f'"
              stroke-width="2"
              stroke-dasharray="8 6"
            />
          </g>

          <g id="baked-lands-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeBakedLandHexEntries"
              :key="entry.key"
              :points="entry.points"
              fill="rgba(205, 124, 74, 0.18)"
              stroke="#9a5326"
              stroke-width="0.8"
            />
          </g>

          <g id="penal-colony-hex-overlay" pointer-events="none">
            <g v-for="entry in activePenalColonyHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(121, 76, 76, 0.34)" stroke="#552525" stroke-width="1.1" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#371717"
                style="pointer-events: none; user-select: none"
              >
                Pe
              </text>
            </g>
          </g>

          <g id="wasteland-hex-overlay" pointer-events="none">
            <g v-for="entry in activeWastelandHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(148, 137, 109, 0.34)" stroke="#665a3f" stroke-width="1.1" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#4b412c"
                style="pointer-events: none; user-select: none"
              >
                Wa
              </text>
            </g>
          </g>

          <g id="exotic-hex-overlay" pointer-events="none">
            <g v-for="entry in activeExoticHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(97, 165, 164, 0.34)" stroke="#2f6f6f" stroke-width="1.1" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#1a4f4f"
                style="pointer-events: none; user-select: none"
              >
                Ex
              </text>
            </g>
          </g>

          <g id="noble-lands-hex-overlay" pointer-events="none">
            <g v-for="entry in activeNobleLandHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(184, 144, 84, 0.34)" stroke="#7a5a1e" stroke-width="1.1" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#5d4212"
                style="pointer-events: none; user-select: none"
              >
                Nb
              </text>
            </g>
          </g>

          <g id="ice-cap-hex-overlay" pointer-events="none">
            <g v-for="entry in activeIceCapHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(226, 242, 255, 0.72)" stroke="#7fa4bf" stroke-width="1.4" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#4a6b83"
                style="pointer-events: none; user-select: none"
              >
                Ic
              </text>
            </g>
          </g>

          <g id="shore-hex-overlay" pointer-events="none">
            <g v-for="entry in activeShoreHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(231, 199, 122, 0.24)" stroke="#b0892f" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#7a5a16"
                style="pointer-events: none; user-select: none"
              >
                Sh
              </text>
            </g>
          </g>

          <g id="desert-hex-overlay" pointer-events="none">
            <g v-for="entry in activeDesertHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(210, 180, 110, 0.30)" stroke="#8e6e2f" stroke-width="1.2" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#6b4e1f"
                style="pointer-events: none; user-select: none"
              >
                De
              </text>
            </g>
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

          <g id="island-hex-overlay" pointer-events="none">
            <g v-for="entry in activeIslandHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(163, 127, 91, 0.38)" stroke="#8a5c31" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#6c4524"
                style="pointer-events: none; user-select: none"
              >
                Is
              </text>
            </g>
          </g>

          <g id="mountain-hex-overlay" pointer-events="none">
            <g v-for="entry in activeMountainHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="#778899" stroke="#4a5a6a" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#1a2a3a"
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

          <g id="crater-hex-overlay" pointer-events="none">
            <g v-for="entry in activeCraterHexEntries" :key="entry.key">
              <polygon :points="entry.points" fill="rgba(110, 110, 110, 0.28)" stroke="#444444" stroke-width="1.5" />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="9"
                font-weight="bold"
                fill="#2b2b2b"
                style="pointer-events: none; user-select: none"
              >
                Cr
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

          <g id="ocean-shoreline-overlay" pointer-events="none">
            <line
              v-for="segment in activeShoreSegments"
              :key="segment.key"
              :x1="segment.x1"
              :y1="segment.y1"
              :x2="segment.x2"
              :y2="segment.y2"
              stroke="#1f4b87"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>

          <g id="tectonic-line-overlay" pointer-events="none">
            <line
              v-for="segment in activeTectonicLineSegments"
              :key="segment.key"
              :x1="segment.x1"
              :y1="segment.y1"
              :x2="segment.x2"
              :y2="segment.y2"
              stroke="#9a3412"
              stroke-width="1.8"
              stroke-linecap="butt"
              stroke-dasharray="4 3"
              opacity="0.9"
            />
          </g>

          <g
            v-if="activeTemplateMaskContent"
            id="terrain-template-mask"
            pointer-events="none"
            v-html="activeTemplateMaskContent"
          ></g>
        </svg>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { normalizeFaceTopologyId } from "../../utils/worldTerrainStartTriangle.js";
import { canonicalizeHexId } from "../../utils/worldMapHexTopology.js";
import {
  WORLD_HEX_TAGS,
  buildWorldHexTagIndex,
  buildWorldTerrainHexTagSnapshot,
} from "../../utils/worldTerrainHexTags.js";
import WorldTerrainHexInspector from "../../components/world/WorldTerrainHexInspector.vue";
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
    return { viewBox: "0 0 1066 998", content: "", maskContent: "" };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) {
    return { viewBox: "0 0 1066 998", content: rawSvg, maskContent: "" };
  }

  // Groups that must render above terrain overlays (masks, outlines, labels)
  const MASK_GROUP_IDS = [
    "map-icosahedral-mask",
    "map-border-mask",
    "map-faces",
    "map-lines",
    "map-references",
    "map-text",
  ];
  const maskParts = [];
  for (const id of MASK_GROUP_IDS) {
    const el = svgEl.querySelector(`#${id}`);
    if (el) {
      maskParts.push(el.outerHTML);
      el.remove();
    }
  }

  return {
    viewBox: svgEl.getAttribute("viewBox") || "0 0 1066 998",
    content: svgEl.innerHTML || "",
    maskContent: maskParts.join(""),
  };
}

const activeViewBox = ref("0 0 1066 998");
const activeTemplateContent = ref("");
const activeTemplateMaskContent = ref("");
const templateStatusLabel = ref("loading");
let templateLoadRequestId = 0;

const activeViewBoxAspectRatio = computed(() => {
  const parts = String(activeViewBox.value || "")
    .trim()
    .split(/\s+/);
  if (parts.length !== 4) {
    return "1066 / 998";
  }

  const width = Number.parseFloat(parts[2]);
  const height = Number.parseFloat(parts[3]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "1066 / 998";
  }

  return `${width} / ${height}`;
});

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
    activeTemplateMaskContent.value = "";
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
    activeTemplateMaskContent.value = parsed.maskContent;
    activeViewBox.value = parsed.viewBox;
    templateStatusLabel.value = parsed.content ? "loaded" : "missing";
  } catch {
    if (requestId !== templateLoadRequestId) {
      return;
    }
    activeTemplateContent.value = "";
    activeTemplateMaskContent.value = "";
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
const shoreHexesBySize = ref(new Map());

const activeWaterHexEntries = computed(() => {
  const mapForSize = waterHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeFlatlandHexEntries = computed(() => {
  const mapForSize = flatlandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeShoreHexEntries = computed(() => {
  const mapForSize = shoreHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
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
      const seamGroupHexId = String(poly.getAttribute("data-seam-group") || "").trim();
      const seamPartnerHexIds = String(poly.getAttribute("data-seam-partners") || "").trim();
      const hexId = String(poly.getAttribute("data-hex-id") || poly.getAttribute("hex-id") || "").trim();

      const c = centroid(points);
      return {
        logicalHexId,
        seamGroupHexId,
        seamPartnerHexIds,
        hexId,
        points,
        cx: c.x,
        cy: c.y,
      };
    })
    .filter(Boolean);

  const seamAliasLookup = buildRowSeamAliasLookup(parsedCells.map((cell) => cell?.hexId));

  return parsedCells.map((cell) => {
    const seamAliasHexId = seamAliasLookup.get(cell.hexId) || "";
    const canonicalHexId =
      canonicalizeHexId(seamAliasHexId) ||
      deriveCanonicalHexKey({
        logicalHexId: cell.logicalHexId,
        seamGroupHexId: cell.seamGroupHexId,
        hexId: cell.hexId,
        seamPartnerHexIds: cell.seamPartnerHexIds,
      });

    return {
      key: canonicalHexId || cell.points,
      hexId: cell.hexId,
      canonicalHexId,
      points: cell.points,
      cx: cell.cx,
      cy: cell.cy,
    };
  });
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

const activeFaceTriangles = computed(() => {
  const topologySource = `${activeTemplateContent.value || ""}${activeTemplateMaskContent.value || ""}`;
  return extractFaceTriangles(topologySource);
});

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

const activeHexRenderVariantsByKey = computed(() => {
  const byKey = new Map();
  for (const cell of activeHexCells.value) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    if (!byKey.has(key)) {
      byKey.set(key, []);
    }
    byKey.get(key).push(cell);
  }
  return byKey;
});

const activeHexCanonicalByHexId = computed(() => {
  const byHexId = new Map();
  for (const cell of activeHexCells.value) {
    const hexId = String(cell?.hexId || "").trim();
    const key = String(cell?.key || "").trim();
    if (!hexId || !key || byHexId.has(hexId)) continue;
    byHexId.set(hexId, key);
  }
  return byHexId;
});

function toLayerEntries(mapForSize) {
  if (!mapForSize) {
    return [];
  }

  const variantsByKey = activeHexRenderVariantsByKey.value;
  const canonicalByHexId = activeHexCanonicalByHexId.value;
  const normalizedLayerMap = new Map();

  for (const [rawKey, rawData] of mapForSize.entries()) {
    const originalKey = String(rawKey || "").trim();
    if (!originalKey) {
      continue;
    }

    let resolvedKey = originalKey;
    if (!variantsByKey.has(resolvedKey)) {
      const mappedHexKey = canonicalByHexId.get(resolvedKey);
      if (mappedHexKey && variantsByKey.has(mappedHexKey)) {
        resolvedKey = mappedHexKey;
      } else {
        const canonicalKey = canonicalizeHexId(resolvedKey);
        if (canonicalKey && variantsByKey.has(canonicalKey)) {
          resolvedKey = canonicalKey;
        }
      }
    }

    if (!normalizedLayerMap.has(resolvedKey)) {
      normalizedLayerMap.set(resolvedKey, rawData);
      continue;
    }

    const existing = normalizedLayerMap.get(resolvedKey);
    if (existing && typeof existing === "object") {
      continue;
    }
    normalizedLayerMap.set(resolvedKey, rawData);
  }

  const entries = [];

  for (const [key, rawData] of normalizedLayerMap.entries()) {
    const base = rawData && typeof rawData === "object" ? rawData : { points: rawData };
    const variants = variantsByKey.get(String(key));

    if (!variants?.length) {
      entries.push({ key, ...base });
      continue;
    }

    for (let index = 0; index < variants.length; index += 1) {
      const cell = variants[index];
      entries.push({
        ...base,
        key: `${key}::${index}`,
        logicalKey: key,
        points: cell?.points || base.points,
        cx: Number.isFinite(cell?.cx) ? cell.cx : base.cx,
        cy: Number.isFinite(cell?.cy) ? cell.cy : base.cy,
      });
    }
  }

  return entries;
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

function parseHydrographicsToScore(value) {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!raw || raw === "—") {
    return 5;
  }

  const exactInt = Number.parseInt(raw, 10);
  if (Number.isFinite(exactInt) && String(exactInt) === raw) {
    return clamp(exactInt, 0, 10);
  }

  const token = raw.match(/[0-9A-F]/)?.[0];
  if (!token) {
    return 5;
  }

  const score = /^[0-9]$/.test(token) ? Number.parseInt(token, 10) : 10;
  return clamp(score, 0, 10);
}

function pointKey(point) {
  const [x, y] = point;
  return `${Math.round(x * 1000) / 1000},${Math.round(y * 1000) / 1000}`;
}

function edgeKey(a, b) {
  const pa = pointKey(a);
  const pb = pointKey(b);
  return pa < pb ? `${pa}|${pb}` : `${pb}|${pa}`;
}

function buildHexAdjacencyGraph(cells = []) {
  const byId = new Map();
  const edgeOwners = new Map();

  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    const points = parsePoints(cell?.points || "");
    if (!key || points.length !== 6) continue;

    const edges = [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[4]],
      [points[4], points[5]],
      [points[5], points[0]],
    ].map(([a, b]) => ({ a, b, key: edgeKey(a, b) }));

    byId.set(key, { ...cell, edges, neighbors: new Set() });

    for (const edge of edges) {
      if (!edgeOwners.has(edge.key)) {
        edgeOwners.set(edge.key, []);
      }
      edgeOwners.get(edge.key).push(key);
    }
  }

  for (const cell of byId.values()) {
    for (const edge of cell.edges) {
      const owners = edgeOwners.get(edge.key) || [];
      for (const owner of owners) {
        if (owner !== cell.key) {
          cell.neighbors.add(owner);
        }
      }
    }
  }

  return { byId, edgeOwners };
}

function buildPolarBandHexMap(cells = [], bandCount = 0) {
  if (!cells.length || bandCount <= 0) {
    return new Map();
  }

  const rowGroups = new Map();
  for (const cell of cells) {
    const rowKey = String(Math.round(Number(cell?.cy || 0) * 1000) / 1000);
    if (!rowGroups.has(rowKey)) {
      rowGroups.set(rowKey, []);
    }
    rowGroups.get(rowKey).push(cell);
  }

  const sortedRows = [...rowGroups.entries()].sort((left, right) => Number(left[0]) - Number(right[0]));
  const selectedRows = new Set([
    ...sortedRows.slice(0, bandCount).map(([rowKey]) => rowKey),
    ...sortedRows.slice(-bandCount).map(([rowKey]) => rowKey),
  ]);

  const placed = new Map();
  for (const [rowKey, rowCells] of rowGroups.entries()) {
    if (!selectedRows.has(rowKey)) {
      continue;
    }

    for (const cell of rowCells) {
      placed.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
    }
  }

  return placed;
}

function buildFaceTopologyGraph(faceTriangles) {
  const byId = new Map();

  for (const face of faceTriangles) {
    const topologyId = normalizeFaceTopologyId(face.faceId);
    if (!topologyId || byId.has(topologyId)) continue;
    byId.set(topologyId, {
      id: topologyId,
      points: face.points,
      vertices: face.vertices,
      edges: [],
      neighbors: new Set(),
    });
  }

  const edgeOwners = new Map();
  for (const triangle of byId.values()) {
    const [v1, v2, v3] = triangle.vertices;
    triangle.edges = [
      { a: v1, b: v2, key: edgeKey(v1, v2) },
      { a: v2, b: v3, key: edgeKey(v2, v3) },
      { a: v3, b: v1, key: edgeKey(v3, v1) },
    ];

    for (const edge of triangle.edges) {
      if (!edgeOwners.has(edge.key)) edgeOwners.set(edge.key, []);
      edgeOwners.get(edge.key).push(triangle.id);
    }
  }

  for (const triangle of byId.values()) {
    for (const edge of triangle.edges) {
      const owners = edgeOwners.get(edge.key) || [];
      for (const ownerId of owners) {
        if (ownerId !== triangle.id) triangle.neighbors.add(ownerId);
      }
    }
  }

  return {
    triangles: [...byId.values()],
    edgeOwners,
  };
}

const hydroTargetRatio = computed(() => parseHydrographicsToRatio(worldInfo.value.hydrographics));
const hydroTriangleScore = computed(() => parseHydrographicsToScore(worldInfo.value.hydrographics));

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

function parseNonNegativeInteger(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return 0;
  return Math.round(num);
}

const tectonicPlateCount = computed(() => {
  const world = selectedWorld.value;
  const values = [
    world?.majorTectonicPlates,
    world?.temperature?.majorTectonicPlates,
    world?.seismology?.majorTectonicPlates,
    route.query.majorTectonicPlates,
    route.query.tectonicPlates,
  ];
  for (const value of values) {
    const parsed = parseNonNegativeInteger(value);
    if (parsed !== null) return parsed;
  }
  return 0;
});

const tectonicStressScore = computed(() => {
  const world = selectedWorld.value;
  const values = [
    world?.seismology?.totalSeismicStress,
    world?.seismology?.residualSeismicStress,
    route.query.totalSeismicStress,
    route.query.seismicStress,
  ];

  for (const value of values) {
    const parsed = parseNonNegativeInteger(value);
    if (parsed !== null) return parsed;
  }

  return 0;
});

function getNormalizedTradeCodes() {
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
}

const resourceHexesBySize = ref(new Map());
const croplandHexesBySize = ref(new Map());
const townHexesBySize = ref(new Map());
const cityHexesBySize = ref(new Map());
const arcologyHexesBySize = ref(new Map());
const ruralHexesBySize = ref(new Map());
const worldPortHexesBySize = ref(new Map());
const twilightZoneHexesBySize = ref(new Map());
const twilightZoneGuideLinesBySize = ref(new Map());
const bakedLandHexesBySize = ref(new Map());
const penalColonyHexesBySize = ref(new Map());
const wastelandHexesBySize = ref(new Map());
const exoticHexesBySize = ref(new Map());
const nobleLandHexesBySize = ref(new Map());
const twilightFrozenLandHexesBySize = ref(new Map());
const twilightOceanDesertHexesBySize = ref(new Map());
const twilightOceanIceFieldHexesBySize = ref(new Map());
const flatlandHexesBySize = ref(new Map());
const hillsHexesBySize = ref(new Map());
const volcanicHexesBySize = ref(new Map());
const forestBiomeHexesBySize = ref(new Map());
const swampBiomeHexesBySize = ref(new Map());
const arcticBiomeHexesBySize = ref(new Map());
const mountainHexesBySize = ref(new Map());
const iceCapHexesBySize = ref(new Map());
const chasmHexesBySize = ref(new Map());
const precipiceHexesBySize = ref(new Map());
const craterHexesBySize = ref(new Map());
const desertHexesBySize = ref(new Map());
const ruinHexesBySize = ref(new Map());
const oceanTrianglesBySize = ref(new Map());
const oceanGroupsBySize = ref(new Map());
const shoreSegmentsBySize = ref(new Map());
const tectonicLineSegmentsBySize = ref(new Map());

const activeTopologyGraph = computed(() => buildFaceTopologyGraph(activeFaceTriangles.value));
const activeTopologyTriangles = computed(() => activeTopologyGraph.value.triangles);

const activeOceanSet = computed(() => new Set(oceanTrianglesBySize.value.get(activeTerrainTemplateSize.value) || []));

const activeOceanTriangleEntries = computed(() => {
  const oceanSet = activeOceanSet.value;
  return activeTopologyTriangles.value
    .filter((triangle) => oceanSet.has(triangle.id))
    .map((triangle) => ({ key: triangle.id, points: triangle.points }));
});

const activeShoreSegments = computed(() => shoreSegmentsBySize.value.get(activeTerrainTemplateSize.value) || []);
const activeTectonicLineSegments = computed(
  () => tectonicLineSegmentsBySize.value.get(activeTerrainTemplateSize.value) || [],
);
const activeOceanTriangleCount = computed(() => activeOceanSet.value.size);
const activeOceanGroupCount = computed(
  () => (oceanGroupsBySize.value.get(activeTerrainTemplateSize.value) || []).length,
);
const activeContinentTriangleCount = computed(() =>
  Math.max(0, activeTopologyTriangles.value.length - activeOceanTriangleCount.value),
);

const activeHexTagIndex = computed(() => {
  const size = activeTerrainTemplateSize.value;
  return buildWorldHexTagIndex({
    cells: activeHexCells.value,
    topologyGraph: activeTopologyGraph.value,
    oceanTriangleIds: oceanTrianglesBySize.value.get(size) || [],
    frozenWorld: (() => {
      const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
        .trim()
        .toUpperCase();
      if (explicit === "FR" || explicit === "FROZEN") {
        return true;
      }
      return getNormalizedTradeCodes().includes("FR");
    })(),
    layerHexMaps: [
      [flatlandHexesBySize.value.get(size), WORLD_HEX_TAGS.FLATLANDS],
      [hillsHexesBySize.value.get(size), WORLD_HEX_TAGS.HILLS],
      [volcanicHexesBySize.value.get(size), WORLD_HEX_TAGS.VOLCANIC],
      [waterHexesBySize.value.get(size), WORLD_HEX_TAGS.WATER],
      [shoreHexesBySize.value.get(size), WORLD_HEX_TAGS.SHORELINE],
      [iceCapHexesBySize.value.get(size), WORLD_HEX_TAGS.ICE_CAP],
      [forestBiomeHexesBySize.value.get(size), WORLD_HEX_TAGS.FOREST],
      [swampBiomeHexesBySize.value.get(size), WORLD_HEX_TAGS.SWAMP],
      [arcticBiomeHexesBySize.value.get(size), WORLD_HEX_TAGS.ARCTIC],
      [croplandHexesBySize.value.get(size), WORLD_HEX_TAGS.CROPLAND],
      [townHexesBySize.value.get(size), WORLD_HEX_TAGS.TOWN],
      [cityHexesBySize.value.get(size), WORLD_HEX_TAGS.CITY],
      [
        (() => {
          const mapForSize = cityHexesBySize.value.get(size);
          if (!mapForSize) return null;
          const domed = new Map();
          for (const [key, data] of mapForSize.entries()) {
            if (data?.domed) {
              domed.set(key, data);
            }
          }
          return domed;
        })(),
        WORLD_HEX_TAGS.DOMED_CITY,
      ],
      [arcologyHexesBySize.value.get(size), WORLD_HEX_TAGS.ARCOLOGY],
      [ruralHexesBySize.value.get(size), WORLD_HEX_TAGS.RURAL],
      [
        (() => {
          const mapForSize = worldPortHexesBySize.value.get(size);
          if (!mapForSize) return null;
          const ports = new Map();
          for (const [key, data] of mapForSize.entries()) {
            if (!data?.spaceport) ports.set(key, data);
          }
          return ports;
        })(),
        WORLD_HEX_TAGS.STARPORT,
      ],
      [
        (() => {
          const mapForSize = worldPortHexesBySize.value.get(size);
          if (!mapForSize) return null;
          const ports = new Map();
          for (const [key, data] of mapForSize.entries()) {
            if (data?.spaceport) ports.set(key, data);
          }
          return ports;
        })(),
        WORLD_HEX_TAGS.SPACEPORT,
      ],
      [twilightZoneHexesBySize.value.get(size), WORLD_HEX_TAGS.TWILIGHT_ZONE],
      [bakedLandHexesBySize.value.get(size), WORLD_HEX_TAGS.BAKED_LANDS],
      [penalColonyHexesBySize.value.get(size), WORLD_HEX_TAGS.PENAL_COLONY],
      [wastelandHexesBySize.value.get(size), WORLD_HEX_TAGS.WASTELAND],
      [exoticHexesBySize.value.get(size), WORLD_HEX_TAGS.EXOTIC],
      [nobleLandHexesBySize.value.get(size), WORLD_HEX_TAGS.NOBLE_LANDS],
      [twilightFrozenLandHexesBySize.value.get(size), WORLD_HEX_TAGS.FROZEN_LANDS],
      [twilightOceanDesertHexesBySize.value.get(size), WORLD_HEX_TAGS.DESERT],
      [twilightOceanIceFieldHexesBySize.value.get(size), WORLD_HEX_TAGS.ICE_FIELD],
      [resourceHexesBySize.value.get(size), WORLD_HEX_TAGS.RESOURCES],
      [mountainHexesBySize.value.get(size), WORLD_HEX_TAGS.MOUNTAIN],
      [chasmHexesBySize.value.get(size), WORLD_HEX_TAGS.CHASM],
      [precipiceHexesBySize.value.get(size), WORLD_HEX_TAGS.PRECIPICE],
      [craterHexesBySize.value.get(size), WORLD_HEX_TAGS.CRATER],
      [desertHexesBySize.value.get(size), WORLD_HEX_TAGS.DESERT],
      [ruinHexesBySize.value.get(size), WORLD_HEX_TAGS.RUINS],
    ],
  });
});

const activeHexTagEntries = computed(() => activeHexTagIndex.value.entries);
const activeHexTagsByKey = computed(() => activeHexTagIndex.value.byKey);
const activeShorelineTriangleIds = computed(() => activeHexTagIndex.value.shorelineTriangleIds);
const activeTerrainTaggedHexCount = computed(
  () => activeHexTagEntries.value.filter((entry) => entry.hasTerrainTags).length,
);
const activeFeatureTaggedHexCount = computed(
  () => activeHexTagEntries.value.filter((entry) => entry.hasFeatureTags).length,
);
const activeBiomeTaggedHexCount = computed(
  () => activeHexTagEntries.value.filter((entry) => entry.hasBiomeTags).length,
);
const selectedTerrainHexKey = ref("");
const selectedTerrainHexEntry = computed(() => activeHexTagsByKey.value.get(selectedTerrainHexKey.value) ?? null);
const hoveredHexInfo = ref(null);
const hoveredHexLabel = computed(() => {
  const hover = hoveredHexInfo.value;
  if (!hover) {
    return "";
  }

  const parts = [];
  if (hover.hexId) {
    parts.push(`hex-id ${hover.hexId}`);
  }
  if (hover.logicalHexId && hover.logicalHexId !== hover.hexId) {
    parts.push(`logical ${hover.logicalHexId}`);
  }
  if (hover.seamGroupHexId && hover.seamGroupHexId !== hover.logicalHexId) {
    parts.push(`seam ${hover.seamGroupHexId}`);
  }
  if (hover.canonicalKey && hover.canonicalKey !== hover.logicalHexId && hover.canonicalKey !== hover.seamGroupHexId) {
    parts.push(`key ${hover.canonicalKey}`);
  }

  return parts.join(" | ");
});
const terrainHexInspectorSummary = computed(() => ({
  taggedHexCount: activeHexTagEntries.value.length,
  terrainTaggedHexCount: activeTerrainTaggedHexCount.value,
  featureTaggedHexCount: activeFeatureTaggedHexCount.value,
  biomeTaggedHexCount: activeBiomeTaggedHexCount.value,
  shorelineTriangleCount: activeShorelineTriangleIds.value.length,
}));
const terrainHexTagPersistTimer = ref(null);
const lastPersistedTerrainHexTagSignature = ref("");

function clearTerrainHexSelection() {
  selectedTerrainHexKey.value = "";
}

function queueTerrainHexTagPersist() {
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
  }

  terrainHexTagPersistTimer.value = setTimeout(() => {
    terrainHexTagPersistTimer.value = null;
    void persistTerrainHexTags();
  }, 0);
}

async function persistTerrainHexTags() {
  const systemId = String(boundSystem.value?.systemId || "").trim();
  const worldIndex = selectedWorldIndex.value;
  const world = selectedWorld.value;

  if (!systemId || worldIndex === null || !world) {
    return false;
  }

  const snapshot = buildWorldTerrainHexTagSnapshot(activeHexTagIndex.value, {
    systemId,
    worldIndex,
    worldName: String(world?.name || worldInfo.value?.name || "").trim(),
    updatedAt: new Date().toISOString(),
  });

  if (!snapshot.signature || snapshot.signature === lastPersistedTerrainHexTagSignature.value) {
    return true;
  }

  const currentPlanets = Array.isArray(boundSystem.value?.planets) ? [...boundSystem.value.planets] : [];
  if (!currentPlanets.length || !currentPlanets[worldIndex]) {
    return false;
  }

  currentPlanets[worldIndex] = {
    ...currentPlanets[worldIndex],
    metadata: {
      ...(currentPlanets[worldIndex].metadata && typeof currentPlanets[worldIndex].metadata === "object"
        ? currentPlanets[worldIndex].metadata
        : {}),
      terrainHexTags: snapshot,
      terrainHexTagsUpdatedAt: snapshot.updatedAt,
    },
  };

  const updatedSystem = await systemStore.updateSystem(systemId, {
    planets: currentPlanets,
    metadata: {
      ...(boundSystem.value?.metadata && typeof boundSystem.value.metadata === "object"
        ? boundSystem.value.metadata
        : {}),
      lastModified: snapshot.updatedAt,
    },
  });

  if (updatedSystem?.systemId) {
    systemStore.setCurrentSystem(updatedSystem.systemId);
  }

  lastPersistedTerrainHexTagSignature.value = snapshot.signature;
  return true;
}

watch(
  [activeHexTagIndex, selectedWorld, selectedWorldIndex],
  () => {
    if (selectedTerrainHexKey.value && !activeHexTagsByKey.value.has(selectedTerrainHexKey.value)) {
      selectedTerrainHexKey.value = "";
    }
    queueTerrainHexTagPersist();
  },
  { deep: true, immediate: true },
);

onBeforeUnmount(() => {
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
    terrainHexTagPersistTimer.value = null;
  }
});

const worldTradeCodes = computed(() => {
  return getNormalizedTradeCodes();
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

const isVacuumWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "VA" || explicit === "VACUUM") {
    return true;
  }
  return worldTradeCodes.value.includes("VA");
});

const isDesertWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "DE" || explicit === "DESERT") {
    return true;
  }
  return worldTradeCodes.value.includes("DE");
});

const isFrozenWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "FR" || explicit === "FROZEN") {
    return true;
  }
  return worldTradeCodes.value.includes("FR");
});

const isAgriculturalWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "AG" || explicit === "AGRICULTURAL") {
    return true;
  }
  return worldTradeCodes.value.includes("AG");
});

const isFarmingWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "FA" || explicit === "FARMING") {
    return true;
  }
  return worldTradeCodes.value.includes("FA");
});

const isLowPopulationWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "LO" || explicit === "LOW" || explicit === "LOWPOPULATION") {
    return true;
  }
  return worldTradeCodes.value.includes("LO");
});

const isNonIndustrialWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "NI" || explicit === "NON-INDUSTRIAL" || explicit === "NONINDUSTRIAL") {
    return true;
  }
  return worldTradeCodes.value.includes("NI");
});

const isSingleTownSettlementWorld = computed(() => isLowPopulationWorld.value || isNonIndustrialWorld.value);

const isHighPopulationWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "HI" || explicit === "HIGH" || explicit === "HIGHPOPULATION") {
    return true;
  }
  return worldTradeCodes.value.includes("HI");
});

const isTwilightZoneWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "TZ" || explicit === "TWILIGHT" || explicit === "TWILIGHTZONE") {
    return true;
  }
  return worldTradeCodes.value.includes("TZ");
});

const isPenalColonyWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "PE" || explicit === "PENAL" || explicit === "PENALCOLONY") {
    return true;
  }
  return worldTradeCodes.value.includes("PE");
});

function parseTravellerCode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!normalized || normalized === "—") return null;

  if (/^[0-9]$/.test(normalized)) {
    return Number.parseInt(normalized, 10);
  }

  if (/^[A-Z]$/.test(normalized) && TRAVELLER_EXTENDED_HEX.has(normalized)) {
    return TRAVELLER_EXTENDED_HEX.get(normalized);
  }

  return null;
}

function parseUwpCodeAt(uwp, index) {
  const normalized = String(uwp ?? "")
    .trim()
    .toUpperCase();
  if (!normalized || normalized.length <= index) return null;
  return parseTravellerCode(normalized[index]);
}

function parseUwpStarportCode(uwp) {
  const normalized = String(uwp ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) return "";
  const code = normalized.match(/[A-Z]/)?.[0] || "";
  return /^[A-EXY]$/.test(code) ? code : "";
}

function normalizePortCode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  return /^[A-EXY]$/.test(normalized) ? normalized : "";
}

const populationCode = computed(() => {
  const world = selectedWorld.value;
  return (
    parseTravellerCode(world?.population) ??
    parseTravellerCode(route.query.population) ??
    parseUwpCodeAt(world?.uwp || worldInfo.value.uwp, 4) ??
    parseTravellerCode(worldInfo.value.population) ??
    0
  );
});

const techLevelCode = computed(() => {
  const world = selectedWorld.value;
  return (
    parseTravellerCode(world?.techLevel) ??
    parseTravellerCode(world?.tl) ??
    parseTravellerCode(world?.technology) ??
    parseTravellerCode(route.query.techLevel) ??
    parseTravellerCode(route.query.tl) ??
    parseUwpCodeAt(world?.uwp || worldInfo.value.uwp, 8) ??
    parseTravellerCode(worldInfo.value.techLevel) ??
    parseTravellerCode(worldInfo.value.tl) ??
    parseTravellerCode(worldInfo.value.technology) ??
    0
  );
});

const atmosphereCode = computed(() => {
  const world = selectedWorld.value;
  return (
    parseTravellerCode(world?.atmosphere) ??
    parseTravellerCode(route.query.atmosphere) ??
    parseUwpCodeAt(world?.uwp || worldInfo.value.uwp, 2) ??
    parseTravellerCode(worldInfo.value.atmosphere)
  );
});

const domedCityRequired = computed(() => {
  const atm = atmosphereCode.value;
  if (atm === null) return false;
  return atm <= 1 || (atm >= 10 && atm <= 12) || atm >= 14;
});

const cityHexTargetCount = computed(() => {
  const pop = Math.max(0, Number(populationCode.value) || 0);
  if (isSingleTownSettlementWorld.value) {
    return 0;
  }
  return pop;
});

const arcologyHexTargetCount = computed(() => {
  const pop = Math.max(0, Number(populationCode.value) || 0);
  if (!isHighPopulationWorld.value || isSingleTownSettlementWorld.value) {
    return 0;
  }
  return Math.floor(pop / 2);
});

const penalColonyHexTargetCount = computed(() => {
  const pop = Math.max(0, Number(populationCode.value) || 0);
  if (!isPenalColonyWorld.value) {
    return 0;
  }
  return pop;
});

const worldPortCode = computed(() => {
  const world = selectedWorld.value;
  return (
    normalizePortCode(world?.starport) ||
    normalizePortCode(route.query.starport) ||
    parseUwpStarportCode(world?.uwp || worldInfo.value.uwp)
  );
});

const isSpaceportWorld = computed(() => {
  const code = worldPortCode.value;
  const desc = String(selectedWorld.value?.starportDesc || route.query.starportDesc || "")
    .trim()
    .toLowerCase();
  if (desc.includes("spaceport")) return true;
  return code === "X" || code === "Y";
});

const croplandDicePerContinent = computed(() => {
  let dice = 0;
  if (isAgriculturalWorld.value) dice += 2;
  if (isFarmingWorld.value) dice += 1;
  return dice;
});

const isIceCappedWorld = computed(() => {
  const explicit = String(route.query.tradeClassification || route.query.tradeClass || "")
    .trim()
    .toUpperCase();
  if (explicit === "IC" || explicit === "ICE-CAPPED" || explicit === "ICECAPPED") {
    return true;
  }
  return worldTradeCodes.value.includes("IC");
});

const activeMountainHexEntries = computed(() => {
  const mapForSize = mountainHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.MOUNTAIN),
  );
});

const activeHillsHexEntries = computed(() => {
  const mapForSize = hillsHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.HILLS),
  );
});

const activeIslandHexEntries = computed(() => {
  const mapForSize = mountainHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.ISLAND),
  );
});

const activeForestBiomeHexEntries = computed(() => {
  const mapForSize = forestBiomeHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value.get(String(entry.logicalKey || entry.key || ""))?.biomeTags?.includes("Forest"),
  );
});

const activeSwampBiomeHexEntries = computed(() => {
  const mapForSize = swampBiomeHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value.get(String(entry.logicalKey || entry.key || ""))?.biomeTags?.includes("Swamp"),
  );
});

const activeTundraHexEntries = computed(() => {
  const mapForSize = arcticBiomeHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.ARCTIC),
  );
});

const activeIceCapHexEntries = computed(() => {
  const mapForSize = iceCapHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeCroplandHexEntries = computed(() => {
  const mapForSize = croplandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeTownHexEntries = computed(() => {
  const mapForSize = townHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeCityHexEntries = computed(() => {
  const mapForSize = cityHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeArcologyHexEntries = computed(() => {
  const mapForSize = arcologyHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeRuralHexEntries = computed(() => {
  const mapForSize = ruralHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeWorldPortHexEntries = computed(() => {
  const mapForSize = worldPortHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeStarportHexMap = computed(() => {
  const mapForSize = worldPortHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return null;
  const ports = new Map();
  for (const [key, data] of mapForSize.entries()) {
    if (!data?.spaceport) ports.set(key, data);
  }
  return ports;
});

const activeSpaceportHexMap = computed(() => {
  const mapForSize = worldPortHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return null;
  const ports = new Map();
  for (const [key, data] of mapForSize.entries()) {
    if (data?.spaceport) ports.set(key, data);
  }
  return ports;
});

const activeTwilightZoneHexEntries = computed(() => {
  const mapForSize = twilightZoneHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeTwilightZoneGuideLines = computed(() => {
  return twilightZoneGuideLinesBySize.value.get(activeTerrainTemplateSize.value) || [];
});

const activeBakedLandHexEntries = computed(() => {
  const mapForSize = bakedLandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activePenalColonyHexEntries = computed(() => {
  const mapForSize = penalColonyHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeWastelandHexEntries = computed(() => {
  const mapForSize = wastelandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeExoticHexEntries = computed(() => {
  const mapForSize = exoticHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeNobleLandHexEntries = computed(() => {
  const mapForSize = nobleLandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeTwilightFrozenLandHexEntries = computed(() => {
  const mapForSize = twilightFrozenLandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeDomedCityHexMap = computed(() => {
  const mapForSize = cityHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return null;
  const domed = new Map();
  for (const [key, data] of mapForSize.entries()) {
    if (data?.domed) {
      domed.set(key, data);
    }
  }
  return domed;
});

const activeIceFieldHexEntries = computed(() =>
  activeHexTagEntries.value.filter((entry) => entry.terrainTags?.includes(WORLD_HEX_TAGS.ICE_FIELD)),
);

const activeFrozenLandHexEntries = computed(() =>
  activeHexTagEntries.value.filter((entry) => entry.terrainTags?.includes(WORLD_HEX_TAGS.FROZEN_LANDS)),
);

const activeChasmHexEntries = computed(() => {
  const mapForSize = chasmHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activePrecipiceHexEntries = computed(() => {
  const mapForSize = precipiceHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeCraterHexEntries = computed(() => {
  const mapForSize = craterHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activeDesertHexEntries = computed(() => {
  const merged = new Map();
  const base = desertHexesBySize.value.get(activeTerrainTemplateSize.value);
  const twilightConverted = twilightOceanDesertHexesBySize.value.get(activeTerrainTemplateSize.value);
  for (const source of [base, twilightConverted]) {
    if (!source) continue;
    for (const [key, data] of source.entries()) {
      merged.set(key, data);
    }
  }
  return toLayerEntries(merged);
});

const activeRuinHexEntries = computed(() => {
  const mapForSize = ruinHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

watch(
  activeFaceTriangles,
  () => {
    placeMountainHexes();
    placeHillsHexes();
    placeChasmHexes();
    placePrecipiceHexes();
    placeCraterHexes();
    placeRuinHexes();
    placeResourceHexes();
    placeDesertHexes();
    placeOceanTriangles();
    placeTectonicLines();
    placeSeaHexes();
    placeIceCapHexes();
    placeBaselineLandHexes();
    placeLatitudeBiomes();
    placeCroplandHexes();
    placeCityHexes();
    placeArcologyHexes();
    placeWorldPortHexes();
    placeRuralHexes();
    placeTwilightZoneHexes();
    placePenalColonyHexes();
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
  { immediate: true },
);

watch(tectonicPlateCount, () => {
  placeMountainHexes();
  placeHillsHexes();
  placeTectonicLines();
});

watch(tectonicStressScore, () => {
  placeMountainHexes();
  placeHillsHexes();
  placeTectonicLines();
});

watch(resourceHexCount, () => {
  placeResourceHexes();
  placeCroplandHexes();
  placeDesertHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isDieBackWorld, () => {
  placeRuinHexes();
  placeDesertHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isVacuumWorld, () => {
  placeCraterHexes();
  placeDesertHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isDesertWorld, () => {
  placeDesertHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isIceCappedWorld, () => {
  placeIceCapHexes();
  placeBaselineLandHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isAgriculturalWorld, () => {
  placeCroplandHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isFarmingWorld, () => {
  placeCroplandHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isLowPopulationWorld, () => {
  placeTownHexes();
  placeCityHexes();
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isNonIndustrialWorld, () => {
  placeTownHexes();
  placeCityHexes();
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isHighPopulationWorld, () => {
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isTwilightZoneWorld, () => {
  placeTwilightZoneHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isPenalColonyWorld, () => {
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(
  () => worldInfo.value.population,
  () => {
    placeTownHexes();
    placeCityHexes();
    placeArcologyHexes();
    placeWorldPortHexes();
    placeRuralHexes();
    placeTwilightZoneHexes();
    placePenalColonyHexes();
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

watch(
  () => worldInfo.value.atmosphere,
  () => {
    placeBaselineLandHexes();
    placeCityHexes();
    placeArcologyHexes();
    placeWorldPortHexes();
    placeRuralHexes();
    placeTwilightZoneHexes();
    placePenalColonyHexes();
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

watch(
  () => [selectedWorld.value?.starport, selectedWorld.value?.starportDesc, worldInfo.value.uwp],
  () => {
    placeWorldPortHexes();
    placeRuralHexes();
    placeTwilightZoneHexes();
    placePenalColonyHexes();
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

watch(
  () => worldInfo.value.hydrographics,
  () => {
    placeOceanTriangles();
    placeTectonicLines();
    placeSeaHexes();
    placeIceCapHexes();
    placeBaselineLandHexes();
    placeLatitudeBiomes();
    placeCroplandHexes();
    placeTownHexes();
    placeCityHexes();
    placeArcologyHexes();
    placeWorldPortHexes();
    placeRuralHexes();
    placeTwilightZoneHexes();
    placePenalColonyHexes();
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

watch(
  () => [systemInfo.value.zone, route.query.zone],
  () => {
    placeBaselineLandHexes();
  },
);

watch(
  () => [selectedWorld.value?.techLevel, selectedWorld.value?.tl, selectedWorld.value?.technology, worldInfo.value.uwp],
  () => {
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

function estimateHexHorizontalStep(cells = []) {
  const adjacency = buildHexAdjacencyGraph(cells);
  const samples = [];

  for (const cell of adjacency.byId.values()) {
    for (const neighborKey of cell.neighbors) {
      if (String(neighborKey) < String(cell.key)) continue;
      const neighbor = adjacency.byId.get(neighborKey);
      if (!neighbor) continue;
      const dx = Math.abs((neighbor.cx || 0) - (cell.cx || 0));
      const dy = Math.abs((neighbor.cy || 0) - (cell.cy || 0));
      if (dx > 0 && dx >= dy) {
        samples.push(dx);
      }
    }
  }

  if (!samples.length) {
    const widths = cells
      .map((cell) => {
        const points = parsePoints(cell.points || "");
        if (!points.length) return null;
        const xs = points.map(([x]) => x);
        return Math.max(...xs) - Math.min(...xs);
      })
      .filter((value) => Number.isFinite(value) && value > 0);
    if (!widths.length) return 1;
    widths.sort((a, b) => a - b);
    return widths[Math.floor(widths.length / 2)] || 1;
  }

  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)] || 1;
}

const activeResourceHexEntries = computed(() => {
  const mapForSize = resourceHexesBySize.value.get(activeTerrainTemplateSize.value);
  if (!mapForSize) return [];
  return Array.from(mapForSize.entries()).map(([key, data]) => ({ key, ...data }));
});

function placeResourceHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
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

function placeCroplandHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const dicePerContinent = croplandDicePerContinent.value;
  if (dicePerContinent <= 0 || !cells.length) {
    const nextBySize = new Map(croplandHexesBySize.value);
    nextBySize.delete(size);
    croplandHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId)) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);

  const placed = new Map();
  for (const faceCells of byFace.values()) {
    if (!faceCells.length) continue;

    let rolled = 0;
    for (let i = 0; i < dicePerContinent; i += 1) {
      rolled += 1 + Math.floor(rng() * 6);
    }
    const target = Math.min(faceCells.length, rolled);
    const pool = faceCells.filter((cell) => !occupied.has(cell.key));

    for (let i = 0; i < target && pool.length; i += 1) {
      const pickIndex = Math.floor(rng() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      if (!pick) continue;
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    }
  }

  const nextBySize = new Map(croplandHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  croplandHexesBySize.value = nextBySize;
}

function placeTownHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!isSingleTownSettlementWorld.value || !cells.length) {
    const nextBySize = new Map(townHexesBySize.value);
    nextBySize.delete(size);
    townHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);

  const candidates = cells.filter((cell) => {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    return faceId && !oceanSet.has(faceId) && !occupied.has(cell.key);
  });

  const pool = candidates.length
    ? candidates
    : cells.filter((cell) => {
        const faceId = normalizeFaceTopologyId(cell.faceId);
        return faceId && !oceanSet.has(faceId);
      });

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|town-placement`,
          ),
        );

  const nextBySize = new Map(townHexesBySize.value);
  if (!pool.length) {
    nextBySize.delete(size);
    townHexesBySize.value = nextBySize;
    return;
  }

  const pick = pool[Math.floor(roller() * pool.length)];
  if (!pick) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, new Map([[pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy }]]));
  }
  townHexesBySize.value = nextBySize;
}

function placeCityHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const requested = cityHexTargetCount.value;

  if (requested <= 0 || !cells.length) {
    const nextBySize = new Map(cityHexesBySize.value);
    nextBySize.delete(size);
    cityHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
    ...(townHexesBySize.value.get(size)?.keys() || []),
  ]);

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || occupied.has(cell.key)) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const faceIds = [...byFace.keys()];
  const target = Math.min(requested, faceIds.length);
  const nextBySize = new Map(cityHexesBySize.value);
  if (target <= 0) {
    nextBySize.delete(size);
    cityHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|city-placement`,
          ),
        );

  for (let i = faceIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(roller() * (i + 1));
    [faceIds[i], faceIds[j]] = [faceIds[j], faceIds[i]];
  }

  const placed = new Map();
  const domed = domedCityRequired.value && requested > 0;
  for (const faceId of faceIds.slice(0, target)) {
    const pool = byFace.get(faceId) || [];
    if (!pool.length) continue;
    const pick = pool[Math.floor(roller() * pool.length)];
    if (!pick) continue;
    placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy, domed });
  }

  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  cityHexesBySize.value = nextBySize;
}

function placeArcologyHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const requested = arcologyHexTargetCount.value;

  if (requested <= 0 || !cells.length) {
    const nextBySize = new Map(arcologyHexesBySize.value);
    nextBySize.delete(size);
    arcologyHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
    ...(townHexesBySize.value.get(size)?.keys() || []),
    ...(cityHexesBySize.value.get(size)?.keys() || []),
  ]);

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || occupied.has(cell.key)) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const totalEligible = [...byFace.values()].reduce((sum, faceCells) => sum + faceCells.length, 0);
  const target = Math.min(requested, totalEligible);
  const nextBySize = new Map(arcologyHexesBySize.value);
  if (target <= 0) {
    nextBySize.delete(size);
    arcologyHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|arcology-placement`,
          ),
        );

  const faceIds = [...byFace.keys()];
  for (let i = faceIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(roller() * (i + 1));
    [faceIds[i], faceIds[j]] = [faceIds[j], faceIds[i]];
  }

  const pools = new Map(faceIds.map((faceId) => [faceId, [...(byFace.get(faceId) || [])]]));
  const placed = new Map();
  while (placed.size < target) {
    let progressed = false;
    for (const faceId of faceIds) {
      if (placed.size >= target) break;
      const pool = pools.get(faceId) || [];
      if (!pool.length) continue;
      const pickIndex = Math.floor(roller() * pool.length);
      const pick = pool.splice(pickIndex, 1)[0];
      if (!pick || placed.has(pick.key)) continue;
      placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
      progressed = true;
    }
    if (!progressed) break;
  }

  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  arcologyHexesBySize.value = nextBySize;
}

function placeRuralHexes() {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const cityMap = cityHexesBySize.value.get(size);
  const popDistance = Math.max(0, Number(populationCode.value) || 0);

  if (!cells.length || !cityMap || cityMap.size === 0 || popDistance <= 0) {
    const nextBySize = new Map(ruralHexesBySize.value);
    nextBySize.delete(size);
    ruralHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(shoreHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
    ...(croplandHexesBySize.value.get(size)?.keys() || []),
    ...(resourceHexesBySize.value.get(size)?.keys() || []),
    ...(mountainHexesBySize.value.get(size)?.keys() || []),
    ...(chasmHexesBySize.value.get(size)?.keys() || []),
    ...(precipiceHexesBySize.value.get(size)?.keys() || []),
    ...(craterHexesBySize.value.get(size)?.keys() || []),
    ...(desertHexesBySize.value.get(size)?.keys() || []),
    ...(ruinHexesBySize.value.get(size)?.keys() || []),
    ...(townHexesBySize.value.get(size)?.keys() || []),
    ...(cityHexesBySize.value.get(size)?.keys() || []),
    ...(arcologyHexesBySize.value.get(size)?.keys() || []),
    ...(worldPortHexesBySize.value.get(size)?.keys() || []),
  ]);

  const adjacency = buildHexAdjacencyGraph(cells);
  const queue = [];
  const visited = new Set();
  for (const key of cityMap.keys()) {
    if (!adjacency.byId.has(key)) continue;
    visited.add(key);
    queue.push({ key, distance: 0 });
  }

  const inRange = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current) continue;
    if (current.distance >= popDistance) continue;

    const neighbors = adjacency.byId.get(current.key)?.neighbors || [];
    for (const neighborKey of neighbors) {
      if (visited.has(neighborKey)) continue;
      visited.add(neighborKey);
      inRange.add(neighborKey);
      queue.push({ key: neighborKey, distance: current.distance + 1 });
    }
  }

  const placed = new Map();
  for (const key of inRange) {
    const cell = adjacency.byId.get(key);
    if (!cell) continue;
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || occupied.has(key)) continue;
    placed.set(key, { points: cell.points, cx: cell.cx, cy: cell.cy });
  }

  const nextBySize = new Map(ruralHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  ruralHexesBySize.value = nextBySize;
}

function placeWorldPortHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!cells.length) {
    const nextBySize = new Map(worldPortHexesBySize.value);
    nextBySize.delete(size);
    worldPortHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const blocked = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);

  const byKey = new Map(cells.map((cell) => [cell.key, cell]));
  const preferred = [
    ...(cityHexesBySize.value.get(size)?.keys() || []),
    ...(arcologyHexesBySize.value.get(size)?.keys() || []),
    ...(townHexesBySize.value.get(size)?.keys() || []),
  ];

  let pick = null;
  for (const key of preferred) {
    const candidate = byKey.get(key);
    const faceId = normalizeFaceTopologyId(candidate?.faceId);
    if (!candidate || !faceId || oceanSet.has(faceId) || blocked.has(key)) continue;
    pick = candidate;
    break;
  }

  if (!pick) {
    const landCandidates = cells.filter((cell) => {
      const faceId = normalizeFaceTopologyId(cell.faceId);
      return faceId && !oceanSet.has(faceId) && !blocked.has(cell.key);
    });

    if (!landCandidates.length) {
      const nextBySize = new Map(worldPortHexesBySize.value);
      nextBySize.delete(size);
      worldPortHexesBySize.value = nextBySize;
      return;
    }

    const roller =
      typeof rng === "function"
        ? rng
        : mulberry32(
            hashString(
              `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|world-port-placement`,
            ),
          );
    pick = landCandidates[Math.floor(roller() * landCandidates.length)] || null;
  }

  const nextBySize = new Map(worldPortHexesBySize.value);
  if (!pick) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(
      size,
      new Map([
        [
          pick.key,
          {
            points: pick.points,
            cx: pick.cx,
            cy: pick.cy,
            code: worldPortCode.value || "X",
            spaceport: isSpaceportWorld.value,
          },
        ],
      ]),
    );
  }
  worldPortHexesBySize.value = nextBySize;
}

function placePenalColonyHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const requested = Math.max(0, Number(penalColonyHexTargetCount.value) || 0);

  if (!cells.length || requested <= 0) {
    const nextBySize = new Map(penalColonyHexesBySize.value);
    nextBySize.delete(size);
    penalColonyHexesBySize.value = nextBySize;
    return;
  }

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const blocked = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);
  const byFace = new Map();

  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || blocked.has(cell.key)) continue;

    if (!byFace.has(faceId)) {
      byFace.set(faceId, []);
    }
    byFace.get(faceId).push(cell);
  }

  const faceIds = Array.from(byFace.keys());
  if (!faceIds.length) {
    const nextBySize = new Map(penalColonyHexesBySize.value);
    nextBySize.delete(size);
    penalColonyHexesBySize.value = nextBySize;
    return;
  }

  const target = Math.min(requested, faceIds.length);
  if (target <= 0) {
    const nextBySize = new Map(penalColonyHexesBySize.value);
    nextBySize.delete(size);
    penalColonyHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|penal-colony-placement`,
          ),
        );

  for (let i = faceIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(roller() * (i + 1));
    [faceIds[i], faceIds[j]] = [faceIds[j], faceIds[i]];
  }

  const placed = new Map();
  for (const faceId of faceIds) {
    if (placed.size >= target) break;
    const pool = byFace.get(faceId) || [];
    if (!pool.length) continue;
    const pick = pool[Math.floor(roller() * pool.length)] || null;
    if (!pick) continue;
    placed.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
  }

  const nextBySize = new Map(penalColonyHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  penalColonyHexesBySize.value = nextBySize;
}

function placeWastelandHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const techLevel = Math.max(0, Number(techLevelCode.value) || 0);

  if (!cells.length || techLevel <= 5) {
    const nextBySize = new Map(wastelandHexesBySize.value);
    nextBySize.delete(size);
    wastelandHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|wasteland-placement`,
          ),
        );

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const blocked = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);
  const byFace = new Map();

  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || blocked.has(cell.key)) continue;
    if (!byFace.has(faceId)) {
      byFace.set(faceId, []);
    }
    byFace.get(faceId).push(cell);
  }

  const faceIds = Array.from(byFace.keys());
  if (!faceIds.length) {
    const nextBySize = new Map(wastelandHexesBySize.value);
    nextBySize.delete(size);
    wastelandHexesBySize.value = nextBySize;
    return;
  }

  const faceId = faceIds[Math.floor(roller() * faceIds.length)] || "";
  const faceCells = byFace.get(faceId) || [];
  if (!faceCells.length) {
    const nextBySize = new Map(wastelandHexesBySize.value);
    nextBySize.delete(size);
    wastelandHexesBySize.value = nextBySize;
    return;
  }

  const target = Math.min(faceCells.length, 1 + Math.floor(roller() * 6));
  const adjacency = buildHexAdjacencyGraph(cells);
  const faceKeys = new Set(faceCells.map((cell) => cell.key));
  const start = faceCells[Math.floor(roller() * faceCells.length)] || null;
  const placedKeys = [];
  const placedSet = new Set();
  const visited = new Set();
  const queue = [];

  if (start?.key) {
    queue.push(start.key);
    visited.add(start.key);
  }

  while (queue.length && placedKeys.length < target) {
    const key = queue.shift();
    if (!key || !faceKeys.has(key) || placedSet.has(key)) continue;
    placedSet.add(key);
    placedKeys.push(key);

    const neighbors = [...(adjacency.byId.get(key)?.neighbors || [])].filter(
      (neighborKey) => faceKeys.has(neighborKey) && !visited.has(neighborKey),
    );
    for (let i = neighbors.length - 1; i > 0; i -= 1) {
      const j = Math.floor(roller() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    for (const neighborKey of neighbors) {
      visited.add(neighborKey);
      queue.push(neighborKey);
    }
  }

  if (placedKeys.length < target) {
    const remaining = faceCells.filter((cell) => !placedSet.has(cell.key));
    for (let i = remaining.length - 1; i > 0; i -= 1) {
      const j = Math.floor(roller() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const cell of remaining) {
      if (placedKeys.length >= target) break;
      placedSet.add(cell.key);
      placedKeys.push(cell.key);
    }
  }

  const byKey = new Map(cells.map((cell) => [cell.key, cell]));
  const placed = new Map();
  for (const key of placedKeys) {
    const cell = byKey.get(key);
    if (!cell) continue;
    placed.set(key, { points: cell.points, cx: cell.cx, cy: cell.cy });
  }

  const nextBySize = new Map(wastelandHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  wastelandHexesBySize.value = nextBySize;
}

function placeExoticHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!cells.length) {
    const nextBySize = new Map(exoticHexesBySize.value);
    nextBySize.delete(size);
    exoticHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|exotic-placement`,
          ),
        );

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const blocked = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);
  const byFace = new Map();

  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || blocked.has(cell.key)) continue;
    if (!byFace.has(faceId)) {
      byFace.set(faceId, []);
    }
    byFace.get(faceId).push(cell);
  }

  const faceIds = Array.from(byFace.keys());
  if (!faceIds.length) {
    const nextBySize = new Map(exoticHexesBySize.value);
    nextBySize.delete(size);
    exoticHexesBySize.value = nextBySize;
    return;
  }

  const faceId = faceIds[Math.floor(roller() * faceIds.length)] || "";
  const pool = byFace.get(faceId) || [];
  const pick = pool[Math.floor(roller() * pool.length)] || null;

  const nextBySize = new Map(exoticHexesBySize.value);
  if (!pick) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(
      size,
      new Map([
        [
          pick.key,
          {
            points: pick.points,
            cx: pick.cx,
            cy: pick.cy,
          },
        ],
      ]),
    );
  }
  exoticHexesBySize.value = nextBySize;
}

function placeNobleLandHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!cells.length) {
    const nextBySize = new Map(nobleLandHexesBySize.value);
    nextBySize.delete(size);
    nobleLandHexesBySize.value = nextBySize;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|noble-lands-placement`,
          ),
        );

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const blocked = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);
  const exoticMap = exoticHexesBySize.value.get(size);
  if (exoticMap) {
    for (const key of exoticMap.keys()) {
      blocked.add(key);
    }
  }
  const byFace = new Map();

  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId || oceanSet.has(faceId) || blocked.has(cell.key)) continue;
    if (!byFace.has(faceId)) {
      byFace.set(faceId, []);
    }
    byFace.get(faceId).push(cell);
  }

  const faceIds = Array.from(byFace.keys());
  if (!faceIds.length) {
    const nextBySize = new Map(nobleLandHexesBySize.value);
    nextBySize.delete(size);
    nobleLandHexesBySize.value = nextBySize;
    return;
  }

  const faceId = faceIds[Math.floor(roller() * faceIds.length)] || "";
  const pool = byFace.get(faceId) || [];
  const pick = pool[Math.floor(roller() * pool.length)] || null;

  const nextBySize = new Map(nobleLandHexesBySize.value);
  if (!pick) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(
      size,
      new Map([
        [
          pick.key,
          {
            points: pick.points,
            cx: pick.cx,
            cy: pick.cy,
          },
        ],
      ]),
    );
  }
  nobleLandHexesBySize.value = nextBySize;
}

function clearTwilightHemisphereHexes(size) {
  const nextBaked = new Map(bakedLandHexesBySize.value);
  nextBaked.delete(size);
  bakedLandHexesBySize.value = nextBaked;

  const nextFrozen = new Map(twilightFrozenLandHexesBySize.value);
  nextFrozen.delete(size);
  twilightFrozenLandHexesBySize.value = nextFrozen;

  const nextOceanDesert = new Map(twilightOceanDesertHexesBySize.value);
  nextOceanDesert.delete(size);
  twilightOceanDesertHexesBySize.value = nextOceanDesert;

  const nextOceanIce = new Map(twilightOceanIceFieldHexesBySize.value);
  nextOceanIce.delete(size);
  twilightOceanIceFieldHexesBySize.value = nextOceanIce;
}

function placeTwilightHemisphereHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const twilightMap = twilightZoneHexesBySize.value.get(size);
  const lines = twilightZoneGuideLinesBySize.value.get(size) || [];
  const twilightLine = lines.find((line) => line.type === "twilight");

  if (!isTwilightZoneWorld.value || !cells.length || !twilightMap?.size || !twilightLine) {
    clearTwilightHemisphereHexes(size);
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|twilight-hemispheres`,
          ),
        );

  const hexStep = estimateHexHorizontalStep(cells);
  const threshold = Math.max(1, hexStep / 2);
  const twilightSet = new Set(twilightMap.keys());
  const left = [];
  const right = [];

  for (const cell of cells) {
    if (twilightSet.has(cell.key)) continue;
    if (cell.cx < twilightLine.x1 - threshold) {
      left.push(cell);
    } else if (cell.cx > twilightLine.x1 + threshold) {
      right.push(cell);
    }
  }

  const bakedIsLeft = roller() < 0.5;
  const bakedCells = bakedIsLeft ? left : right;
  const frozenCells = bakedIsLeft ? right : left;

  const bakedMap = new Map(bakedCells.map((cell) => [cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy }]));
  const frozenMap = new Map(frozenCells.map((cell) => [cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy }]));

  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const oceanAsDesert = new Map();
  for (const cell of bakedCells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (faceId && oceanSet.has(faceId)) {
      oceanAsDesert.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
    }
  }

  const oceanAsIceField = new Map();
  for (const cell of frozenCells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (faceId && oceanSet.has(faceId)) {
      oceanAsIceField.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
    }
  }

  const nextBaked = new Map(bakedLandHexesBySize.value);
  if (!bakedMap.size) nextBaked.delete(size);
  else nextBaked.set(size, bakedMap);
  bakedLandHexesBySize.value = nextBaked;

  const nextFrozen = new Map(twilightFrozenLandHexesBySize.value);
  if (!frozenMap.size) nextFrozen.delete(size);
  else nextFrozen.set(size, frozenMap);
  twilightFrozenLandHexesBySize.value = nextFrozen;

  const nextOceanDesert = new Map(twilightOceanDesertHexesBySize.value);
  if (!oceanAsDesert.size) nextOceanDesert.delete(size);
  else nextOceanDesert.set(size, oceanAsDesert);
  twilightOceanDesertHexesBySize.value = nextOceanDesert;

  const nextOceanIce = new Map(twilightOceanIceFieldHexesBySize.value);
  if (!oceanAsIceField.size) nextOceanIce.delete(size);
  else nextOceanIce.set(size, oceanAsIceField);
  twilightOceanIceFieldHexesBySize.value = nextOceanIce;
}

function placeTwilightZoneHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!isTwilightZoneWorld.value || !cells.length || !activeTopologyTriangles.value.length) {
    const nextHexes = new Map(twilightZoneHexesBySize.value);
    nextHexes.delete(size);
    twilightZoneHexesBySize.value = nextHexes;
    const nextLines = new Map(twilightZoneGuideLinesBySize.value);
    nextLines.delete(size);
    twilightZoneGuideLinesBySize.value = nextLines;
    clearTwilightHemisphereHexes(size);
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|twilight-zone`,
          ),
        );

  const triangles = activeTopologyTriangles.value
    .map((triangle) => {
      const c = centroid(triangle.points);
      return { ...triangle, cx: c.x, cy: c.y };
    })
    .filter((triangle) => Number.isFinite(triangle.cx) && Number.isFinite(triangle.cy));

  if (!triangles.length) {
    const nextHexes = new Map(twilightZoneHexesBySize.value);
    nextHexes.delete(size);
    twilightZoneHexesBySize.value = nextHexes;
    const nextLines = new Map(twilightZoneGuideLinesBySize.value);
    nextLines.delete(size);
    twilightZoneGuideLinesBySize.value = nextLines;
    clearTwilightHemisphereHexes(size);
    return;
  }

  const minTriY = Math.min(...triangles.map((triangle) => triangle.cy));
  const maxTriY = Math.max(...triangles.map((triangle) => triangle.cy));
  const triRange = Math.max(1, maxTriY - minTriY);
  const bandTolerance = Math.max(1, triRange * 0.05);
  const northCandidates = triangles.filter((triangle) => triangle.cy <= minTriY + bandTolerance);
  const southCandidates = triangles.filter((triangle) => triangle.cy >= maxTriY - bandTolerance);
  const polePool = roller() < 0.5 ? northCandidates : southCandidates;
  const fallbackPool = polePool.length ? polePool : northCandidates.length ? northCandidates : southCandidates;
  const selectedPole = fallbackPool[Math.floor(roller() * fallbackPool.length)] || triangles[0];

  const hexStep = estimateHexHorizontalStep(cells);
  const shift = 2.5 * Math.max(1, Number(size) || 1) * hexStep;
  const side = roller() < 0.5 ? -1 : 1;
  const xs = cells.map((cell) => cell.cx);
  const ys = cells.map((cell) => cell.cy);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const poleLineX = clamp(selectedPole.cx, minX, maxX);
  const twilightLineX = clamp(poleLineX + side * shift, minX, maxX);
  const bandHalfWidth = Math.max(1, hexStep / 2);

  const placed = new Map();
  for (const cell of cells) {
    if (Math.abs(cell.cx - twilightLineX) <= bandHalfWidth) {
      placed.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
    }
  }

  const nextHexes = new Map(twilightZoneHexesBySize.value);
  if (!placed.size) {
    nextHexes.delete(size);
  } else {
    nextHexes.set(size, placed);
  }
  twilightZoneHexesBySize.value = nextHexes;

  const nextLines = new Map(twilightZoneGuideLinesBySize.value);
  nextLines.set(size, [
    { key: `pole-${size}`, type: "pole", x1: poleLineX, y1: minY, x2: poleLineX, y2: maxY },
    { key: `twilight-${size}`, type: "twilight", x1: twilightLineX, y1: minY, x2: twilightLineX, y2: maxY },
  ]);
  twilightZoneGuideLinesBySize.value = nextLines;

  placeTwilightHemisphereHexes(roller);
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
  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);

  const eligibleCells = cells.filter((cell) => !waterSet.has(cell.key));
  if (!eligibleCells.length) {
    const nextBySize = new Map(mountainHexesBySize.value);
    nextBySize.delete(size);
    mountainHexesBySize.value = nextBySize;
    return;
  }

  const adjacency = buildHexAdjacencyGraph(eligibleCells);
  const eligibleByKey = new Map(eligibleCells.map((cell) => [cell.key, cell]));
  const seedPool = [...eligibleByKey.keys()];

  for (let i = seedPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [seedPool[i], seedPool[j]] = [seedPool[j], seedPool[i]];
  }

  const seedCount = Math.min(seedPool.length, Math.max(1, 1 + Math.floor(rng() * 6) + tectonicPlateCount.value));
  const initialSeeds = seedPool.slice(0, seedCount);
  const placed = new Map();
  const frontier = [...initialSeeds];
  const visitedSeeds = new Set(initialSeeds);

  const sizeBand = Number(worldInfo.value.size) || 0;
  const threshold = clamp(
    10 -
      Math.min(3, Math.floor(sizeBand / 2)) -
      Math.min(2, Math.floor(tectonicPlateCount.value / 3)) -
      Math.min(2, Math.floor(tectonicStressScore.value / 10)),
    4,
    11,
  );

  while (frontier.length > 0) {
    const currentKey = frontier.shift();
    if (!currentKey || placed.has(currentKey)) {
      continue;
    }

    const currentCell = eligibleByKey.get(currentKey);
    if (!currentCell) continue;

    placed.set(currentKey, { points: currentCell.points, cx: currentCell.cx, cy: currentCell.cy });

    const neighbors = [...(adjacency.byId.get(currentKey)?.neighbors || [])].filter(
      (neighborKey) => eligibleByKey.has(neighborKey) && !placed.has(neighborKey),
    );
    if (!neighbors.length) {
      continue;
    }

    const expansionRoll = 2 + Math.floor(rng() * 6) + Math.floor(rng() * 6);
    if (expansionRoll > threshold) {
      const nextKey = neighbors[Math.floor(rng() * neighbors.length)];
      if (nextKey && !visitedSeeds.has(nextKey)) {
        visitedSeeds.add(nextKey);
        frontier.push(nextKey);
      }
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

const HILLS_SPREAD_CONFIG = Object.freeze({
  // Higher ratio/minimum grows broader hill belts around mountains.
  additionalCoverageRatio: 0.25,
  minimumAdditionalHexes: 3,
  // Lower threshold increases outward expansion frequency.
  baseExpandThreshold: 16,
  stressBonusDivisor: 5,
  plateBonusDivisor: 4,
  maxStressBonus: 2,
  maxPlateBonus: 1,
  thresholdMin: 4,
  thresholdMax: 10,
});

function placeHillsHexes(rng = Math.random) {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const mountainMap = mountainHexesBySize.value.get(size);

  if (!cells.length || !mountainMap?.size) {
    const nextBySize = new Map(hillsHexesBySize.value);
    nextBySize.delete(size);
    hillsHexesBySize.value = nextBySize;
    return;
  }

  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);
  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const mountainSet = new Set(mountainMap.keys());
  const adjacency = buildHexAdjacencyGraph(cells);
  const byKey = new Map(cells.map((cell) => [cell.key, cell]));

  const canPlaceHill = (key) => {
    if (!key || mountainSet.has(key) || waterSet.has(key)) return false;
    const cell = byKey.get(key);
    if (!cell) return false;
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (faceId && oceanSet.has(faceId)) return false;
    return true;
  };

  const placed = new Map();
  const frontier = [];
  const queued = new Set();

  // First ring: every eligible neighbor around every mountain hex becomes hills.
  for (const mountainKey of mountainSet) {
    const neighbors = adjacency.byId.get(mountainKey)?.neighbors || [];
    for (const neighborKey of neighbors) {
      if (!canPlaceHill(neighborKey) || placed.has(neighborKey)) continue;
      const neighbor = byKey.get(neighborKey);
      placed.set(neighborKey, { points: neighbor.points, cx: neighbor.cx, cy: neighbor.cy });
      if (!queued.has(neighborKey)) {
        frontier.push(neighborKey);
        queued.add(neighborKey);
      }
    }
  }

  if (!placed.size) {
    const nextBySize = new Map(hillsHexesBySize.value);
    nextBySize.delete(size);
    hillsHexesBySize.value = nextBySize;
    return;
  }

  const eligibleCount = cells.filter((cell) => canPlaceHill(cell.key)).length;
  const maxHills = Math.max(
    placed.size,
    Math.min(
      eligibleCount,
      placed.size +
        Math.max(
          HILLS_SPREAD_CONFIG.minimumAdditionalHexes,
          Math.floor(eligibleCount * HILLS_SPREAD_CONFIG.additionalCoverageRatio),
        ),
    ),
  );
  const expandThreshold = clamp(
    HILLS_SPREAD_CONFIG.baseExpandThreshold -
      Math.min(
        HILLS_SPREAD_CONFIG.maxStressBonus,
        Math.floor(tectonicStressScore.value / HILLS_SPREAD_CONFIG.stressBonusDivisor),
      ) -
      Math.min(
        HILLS_SPREAD_CONFIG.maxPlateBonus,
        Math.floor(tectonicPlateCount.value / HILLS_SPREAD_CONFIG.plateBonusDivisor),
      ),
    HILLS_SPREAD_CONFIG.thresholdMin,
    HILLS_SPREAD_CONFIG.thresholdMax,
  );

  while (frontier.length && placed.size < maxHills) {
    const currentKey = frontier.shift();
    if (!currentKey) continue;

    const neighbors = [...(adjacency.byId.get(currentKey)?.neighbors || [])].filter(
      (neighborKey) => canPlaceHill(neighborKey) && !placed.has(neighborKey),
    );

    for (let i = neighbors.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }

    for (const neighborKey of neighbors) {
      if (placed.size >= maxHills) break;
      const expansionRoll = 2 + Math.floor(rng() * 6) + Math.floor(rng() * 6);
      if (expansionRoll < expandThreshold) continue;

      const neighbor = byKey.get(neighborKey);
      if (!neighbor) continue;
      placed.set(neighborKey, { points: neighbor.points, cx: neighbor.cx, cy: neighbor.cy });
      if (!queued.has(neighborKey)) {
        frontier.push(neighborKey);
        queued.add(neighborKey);
      }
    }
  }

  const nextBySize = new Map(hillsHexesBySize.value);
  nextBySize.set(size, placed);
  hillsHexesBySize.value = nextBySize;
}

function clearLatitudeBiomes(size) {
  const nextForest = new Map(forestBiomeHexesBySize.value);
  nextForest.delete(size);
  forestBiomeHexesBySize.value = nextForest;

  const nextSwamp = new Map(swampBiomeHexesBySize.value);
  nextSwamp.delete(size);
  swampBiomeHexesBySize.value = nextSwamp;

  const nextArctic = new Map(arcticBiomeHexesBySize.value);
  nextArctic.delete(size);
  arcticBiomeHexesBySize.value = nextArctic;
}

function placeLatitudeBiomes(rng = null) {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${size}|${worldInfo.value.hydrographics}|biomes-latitude`,
          ),
        );

  if (!cells.length) {
    clearLatitudeBiomes(size);
    return;
  }

  const ys = cells.map((cell) => Number(cell.cy)).filter(Number.isFinite);
  if (!ys.length) {
    clearLatitudeBiomes(size);
    return;
  }

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const halfSpan = Math.max(1, (maxY - minY) / 2);
  const midY = (maxY + minY) / 2;
  const hydro = clamp(hydroTargetRatio.value, 0, 1);

  // Treat equator-centered lines at +/-23.5deg as tropical boundaries.
  const tropicLatitudeAbs = 23.5 / 90;
  // Above/below tropics is temperate until high-latitude tundra begins.
  const tundraStart = clamp(0.72 - hydro * 0.05, 0.6, 0.8);
  const rainforestChance = clamp(0.45 + hydro * 0.4, 0.35, 0.9);
  const swampChance = clamp(0.08 + hydro * 0.22, 0.06, 0.32);

  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);
  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);
  const mountainSet = new Set(mountainHexesBySize.value.get(size)?.keys() || []);
  const blockedSet = new Set([
    ...mountainSet,
    ...(chasmHexesBySize.value.get(size)?.keys() || []),
    ...(precipiceHexesBySize.value.get(size)?.keys() || []),
    ...(craterHexesBySize.value.get(size)?.keys() || []),
    ...(iceCapHexesBySize.value.get(size)?.keys() || []),
  ]);

  const adjacency = buildHexAdjacencyGraph(cells);
  const byKey = new Map(cells.map((cell) => [cell.key, cell]));
  const forestPlaced = new Map();
  const swampPlaced = new Map();
  const tundraPlaced = new Map();

  for (const cell of cells) {
    const key = cell.key;
    if (!key || blockedSet.has(key) || waterSet.has(key)) continue;
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (faceId && oceanSet.has(faceId)) continue;

    const latitudeAbs = Math.abs((Number(cell.cy) - midY) / halfSpan);
    if (!Number.isFinite(latitudeAbs)) continue;

    const isTropical = latitudeAbs <= tropicLatitudeAbs;
    const isTemperate = latitudeAbs > tropicLatitudeAbs && latitudeAbs < tundraStart;

    if (latitudeAbs >= tundraStart) {
      tundraPlaced.set(key, { points: cell.points, cx: cell.cx, cy: cell.cy });
      continue;
    }

    if (isTropical && roller() < rainforestChance) {
      forestPlaced.set(key, { points: cell.points, cx: cell.cx, cy: cell.cy });
      continue;
    }

    const nearWater = [...(adjacency.byId.get(key)?.neighbors || [])].some((neighborKey) => {
      if (waterSet.has(neighborKey)) return true;
      const neighbor = byKey.get(neighborKey);
      const neighborFace = normalizeFaceTopologyId(neighbor?.faceId);
      return Boolean(neighborFace && oceanSet.has(neighborFace));
    });

    if (nearWater && (isTropical || isTemperate) && roller() < swampChance) {
      swampPlaced.set(key, { points: cell.points, cx: cell.cx, cy: cell.cy });
    }
  }

  const nextForest = new Map(forestBiomeHexesBySize.value);
  if (forestPlaced.size) nextForest.set(size, forestPlaced);
  else nextForest.delete(size);
  forestBiomeHexesBySize.value = nextForest;

  const nextSwamp = new Map(swampBiomeHexesBySize.value);
  if (swampPlaced.size) nextSwamp.set(size, swampPlaced);
  else nextSwamp.delete(size);
  swampBiomeHexesBySize.value = nextSwamp;

  const nextArctic = new Map(arcticBiomeHexesBySize.value);
  if (tundraPlaced.size) nextArctic.set(size, tundraPlaced);
  else nextArctic.delete(size);
  arcticBiomeHexesBySize.value = nextArctic;
}

function placeChasmHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const worldSize = Math.max(0, Number(size) || 0);
  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);

  if (!cells.length || worldSize <= 0) {
    const nextBySize = new Map(chasmHexesBySize.value);
    nextBySize.delete(size);
    chasmHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    if (waterSet.has(cell.key)) continue;
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
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const worldSize = Math.max(0, Number(size) || 0);
  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);

  if (!cells.length || worldSize <= 0) {
    const nextBySize = new Map(precipiceHexesBySize.value);
    nextBySize.delete(size);
    precipiceHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    if (waterSet.has(cell.key)) continue;
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

function placeCraterHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const worldSize = Math.max(0, Number(size) || 0);
  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);

  if (!isVacuumWorld.value || !cells.length || worldSize <= 0) {
    const nextBySize = new Map(craterHexesBySize.value);
    nextBySize.delete(size);
    craterHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    if (waterSet.has(cell.key)) continue;
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

  const nextBySize = new Map(craterHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  craterHexesBySize.value = nextBySize;
}

function placeBaselineLandHexes() {
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!cells.length) {
    const nextFlat = new Map(flatlandHexesBySize.value);
    nextFlat.delete(size);
    flatlandHexesBySize.value = nextFlat;

    const nextHills = new Map(hillsHexesBySize.value);
    nextHills.delete(size);
    hillsHexesBySize.value = nextHills;

    const nextVolcanic = new Map(volcanicHexesBySize.value);
    nextVolcanic.delete(size);
    volcanicHexesBySize.value = nextVolcanic;

    const nextForest = new Map(forestBiomeHexesBySize.value);
    nextForest.delete(size);
    forestBiomeHexesBySize.value = nextForest;

    const nextSwamp = new Map(swampBiomeHexesBySize.value);
    nextSwamp.delete(size);
    swampBiomeHexesBySize.value = nextSwamp;

    const nextArctic = new Map(arcticBiomeHexesBySize.value);
    nextArctic.delete(size);
    arcticBiomeHexesBySize.value = nextArctic;
    return;
  }

  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);
  const oceanSet = new Set(oceanTrianglesBySize.value.get(size) || []);

  const flatMap = new Map();

  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (waterSet.has(cell.key) || (faceId && oceanSet.has(faceId))) {
      continue;
    }
    flatMap.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
  }

  const nextFlat = new Map(flatlandHexesBySize.value);
  if (flatMap.size) nextFlat.set(size, flatMap);
  else nextFlat.delete(size);
  flatlandHexesBySize.value = nextFlat;

  const nextVolcanic = new Map(volcanicHexesBySize.value);
  nextVolcanic.delete(size);
  volcanicHexesBySize.value = nextVolcanic;

  const nextForest = new Map(forestBiomeHexesBySize.value);
  nextForest.delete(size);
  forestBiomeHexesBySize.value = nextForest;

  const nextSwamp = new Map(swampBiomeHexesBySize.value);
  nextSwamp.delete(size);
  swampBiomeHexesBySize.value = nextSwamp;

  const nextArctic = new Map(arcticBiomeHexesBySize.value);
  nextArctic.delete(size);
  arcticBiomeHexesBySize.value = nextArctic;

  placeLatitudeBiomes();
}

function buildRandomWaterCells(cells, targetCount, rng = Math.random) {
  if (!Array.isArray(cells) || cells.length === 0 || targetCount <= 0) {
    return [];
  }

  const pool = [...cells];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(targetCount, pool.length));
}

function placeDesertHexes() {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;

  if (!isDesertWorld.value || !cells.length) {
    const nextBySize = new Map(desertHexesBySize.value);
    nextBySize.delete(size);
    desertHexesBySize.value = nextBySize;
    return;
  }

  const marked = new Set();
  const layers = [
    waterHexesBySize.value.get(size),
    resourceHexesBySize.value.get(size),
    mountainHexesBySize.value.get(size),
    chasmHexesBySize.value.get(size),
    precipiceHexesBySize.value.get(size),
    craterHexesBySize.value.get(size),
    ruinHexesBySize.value.get(size),
  ];

  for (const layer of layers) {
    if (!layer) continue;
    for (const key of layer.keys()) {
      marked.add(key);
    }
  }

  const placed = new Map();
  for (const cell of cells) {
    if (marked.has(cell.key)) continue;
    placed.set(cell.key, { points: cell.points, cx: cell.cx, cy: cell.cy });
  }

  const nextBySize = new Map(desertHexesBySize.value);
  if (placed.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, placed);
  }
  desertHexesBySize.value = nextBySize;
}

function placeSeaHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const faceIds = [...new Set(cells.map((cell) => normalizeFaceTopologyId(cell.faceId)).filter(Boolean))];
  const target = Math.min(faceIds.length, Math.max(0, hydroTriangleScore.value));

  if (!cells.length || target <= 0) {
    const nextShore = new Map(shoreHexesBySize.value);
    nextShore.delete(size);
    shoreHexesBySize.value = nextShore;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    const faceId = normalizeFaceTopologyId(cell.faceId);
    if (!faceId) continue;
    if (!byFace.has(faceId)) byFace.set(faceId, []);
    byFace.get(faceId).push(cell);
  }

  const occupied = new Set([
    ...(waterHexesBySize.value.get(size)?.keys() || []),
    ...(resourceHexesBySize.value.get(size)?.keys() || []),
    ...(mountainHexesBySize.value.get(size)?.keys() || []),
    ...(chasmHexesBySize.value.get(size)?.keys() || []),
    ...(precipiceHexesBySize.value.get(size)?.keys() || []),
    ...(craterHexesBySize.value.get(size)?.keys() || []),
    ...(desertHexesBySize.value.get(size)?.keys() || []),
    ...(ruinHexesBySize.value.get(size)?.keys() || []),
  ]);

  const availableFaceIds = [...byFace.keys()];
  for (let i = availableFaceIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [availableFaceIds[i], availableFaceIds[j]] = [availableFaceIds[j], availableFaceIds[i]];
  }

  const adjacency = buildHexAdjacencyGraph(cells);
  const seaCells = new Map();
  const shoreCells = new Map();

  for (const faceId of availableFaceIds) {
    if (seaCells.size >= target) break;

    const candidates = (byFace.get(faceId) || []).filter((cell) => !occupied.has(cell.key) && !seaCells.has(cell.key));
    if (!candidates.length) continue;

    const pick = candidates[Math.floor(rng() * candidates.length)];
    if (!pick) continue;

    seaCells.set(pick.key, { points: pick.points, cx: pick.cx, cy: pick.cy });
    occupied.add(pick.key);

    const neighbors = [...(adjacency.byId.get(pick.key)?.neighbors || [])];
    for (const neighborKey of neighbors) {
      if (seaCells.has(neighborKey) || occupied.has(neighborKey)) {
        continue;
      }
      const neighbor = adjacency.byId.get(neighborKey);
      if (!neighbor) continue;
      shoreCells.set(neighborKey, { points: neighbor.points, cx: neighbor.cx, cy: neighbor.cy });
    }
  }

  const nextWater = new Map(waterHexesBySize.value);
  const existingWater = new Map(nextWater.get(size) || []);
  for (const [key, value] of seaCells.entries()) {
    existingWater.set(key, value);
  }
  if (existingWater.size === 0) {
    nextWater.delete(size);
  } else {
    nextWater.set(size, existingWater);
  }
  waterHexesBySize.value = nextWater;

  const nextShore = new Map(shoreHexesBySize.value);
  if (shoreCells.size === 0) {
    nextShore.delete(size);
  } else {
    nextShore.set(size, shoreCells);
  }
  shoreHexesBySize.value = nextShore;
}

function placeIceCapHexes(rng = null) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const baseBandCount = Math.floor(hydroTriangleScore.value / 2);

  if (!cells.length || baseBandCount <= 0) {
    const nextIceCaps = new Map(iceCapHexesBySize.value);
    nextIceCaps.delete(size);
    iceCapHexesBySize.value = nextIceCaps;
    return;
  }

  const roller =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|ice-cap-bonus`,
          ),
        );
  const bonusRows = isIceCappedWorld.value ? 1 + Math.floor(roller() * 6) : 0;
  const bandCount = baseBandCount + bonusRows;

  const placed = buildPolarBandHexMap(cells, bandCount);
  const nextIceCaps = new Map(iceCapHexesBySize.value);
  if (placed.size === 0) {
    nextIceCaps.delete(size);
  } else {
    nextIceCaps.set(size, placed);
  }
  iceCapHexesBySize.value = nextIceCaps;
}

function placeOceanTriangles(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const size = activeTerrainTemplateSize.value;
  const graph = activeTopologyGraph.value;
  const triangles = graph.triangles;
  const target = Math.min(triangles.length, Math.max(0, hydroTriangleScore.value * 2));

  if (!triangles.length || target <= 0) {
    const nextOceans = new Map(oceanTrianglesBySize.value);
    nextOceans.delete(size);
    oceanTrianglesBySize.value = nextOceans;

    const nextGroups = new Map(oceanGroupsBySize.value);
    nextGroups.delete(size);
    oceanGroupsBySize.value = nextGroups;

    const nextShore = new Map(shoreSegmentsBySize.value);
    nextShore.delete(size);
    shoreSegmentsBySize.value = nextShore;
    return;
  }

  const byId = new Map(triangles.map((triangle) => [triangle.id, triangle]));
  const remaining = new Set(triangles.map((triangle) => triangle.id));
  const selected = new Set();
  const frontier = [];

  while (selected.size < target && remaining.size > 0) {
    let nextId = "";

    if (frontier.length > 0) {
      const idx = Math.floor(rng() * frontier.length);
      nextId = frontier.splice(idx, 1)[0] || "";
    } else {
      const options = [...remaining];
      nextId = options[Math.floor(rng() * options.length)] || "";
    }

    if (!nextId || !remaining.has(nextId)) continue;
    remaining.delete(nextId);
    selected.add(nextId);

    const neighbors = [...(byId.get(nextId)?.neighbors || [])].filter((id) => remaining.has(id));
    for (const neighbor of neighbors) {
      frontier.push(neighbor);
    }
  }

  const groups = [];
  const visited = new Set();
  for (const id of selected) {
    if (visited.has(id)) continue;
    const queue = [id];
    const group = [];
    visited.add(id);

    while (queue.length) {
      const current = queue.shift();
      if (!current) continue;
      group.push(current);

      const neighbors = [...(byId.get(current)?.neighbors || [])].filter(
        (neighborId) => selected.has(neighborId) && !visited.has(neighborId),
      );
      for (const neighbor of neighbors) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }

    groups.push(group);
  }

  const shoreSegments = [];
  const usedShore = new Set();
  for (const id of selected) {
    const triangle = byId.get(id);
    if (!triangle) continue;

    for (const edge of triangle.edges) {
      const owners = graph.edgeOwners.get(edge.key) || [];
      const hasNonOceanNeighbor = owners.some((ownerId) => !selected.has(ownerId));
      const isExteriorEdge = owners.length === 1;
      if (!hasNonOceanNeighbor && !isExteriorEdge) continue;
      if (usedShore.has(edge.key)) continue;

      usedShore.add(edge.key);
      shoreSegments.push({
        key: edge.key,
        x1: edge.a[0],
        y1: edge.a[1],
        x2: edge.b[0],
        y2: edge.b[1],
      });
    }
  }

  const nextOceans = new Map(oceanTrianglesBySize.value);
  nextOceans.set(size, [...selected]);
  oceanTrianglesBySize.value = nextOceans;

  const nextGroups = new Map(oceanGroupsBySize.value);
  nextGroups.set(size, groups);
  oceanGroupsBySize.value = nextGroups;

  const nextShore = new Map(shoreSegmentsBySize.value);
  nextShore.set(size, shoreSegments);
  shoreSegmentsBySize.value = nextShore;
}

function computeTriangleCentroid(vertices = []) {
  if (!Array.isArray(vertices) || vertices.length !== 3) {
    return { x: 0, y: 0 };
  }

  const x = (Number(vertices[0]?.[0]) + Number(vertices[1]?.[0]) + Number(vertices[2]?.[0])) / 3;
  const y = (Number(vertices[0]?.[1]) + Number(vertices[1]?.[1]) + Number(vertices[2]?.[1])) / 3;
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
  };
}

function parseViewBoxRect(viewBox) {
  const fallback = { minX: 0, minY: 0, maxX: 1066, maxY: 998 };
  const parts = String(viewBox || "")
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseFloat(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return fallback;
  }

  const [x, y, width, height] = parts;
  if (width <= 0 || height <= 0) {
    return fallback;
  }

  return {
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
  };
}

function findSegmentIntersectionPoint(a, b, epsilon = 1e-6) {
  const x1 = Number(a?.x1);
  const y1 = Number(a?.y1);
  const x2 = Number(a?.x2);
  const y2 = Number(a?.y2);
  const x3 = Number(b?.x1);
  const y3 = Number(b?.y1);
  const x4 = Number(b?.x2);
  const y4 = Number(b?.y2);

  if (![x1, y1, x2, y2, x3, y3, x4, y4].every(Number.isFinite)) {
    return null;
  }

  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denominator) <= epsilon) {
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / denominator;

  if (t < -epsilon || t > 1 + epsilon || u < -epsilon || u > 1 + epsilon) {
    return null;
  }

  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

function findClosestSegmentIntersection(segment, existingSegments, epsilon = 1e-3) {
  let closestPoint = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const existing of existingSegments || []) {
    const intersection = findSegmentIntersectionPoint(segment, existing);
    if (!intersection) continue;

    const distance = Math.hypot(intersection.x - segment.x1, intersection.y - segment.y1);
    if (distance <= epsilon || distance >= closestDistance) continue;

    closestPoint = intersection;
    closestDistance = distance;
  }

  return closestPoint;
}

function extendRayToViewBoxBoundary(start, direction, bounds, epsilon = 1e-6) {
  const sx = Number(start?.x);
  const sy = Number(start?.y);
  const dxRaw = Number(direction?.x);
  const dyRaw = Number(direction?.y);
  if (![sx, sy, dxRaw, dyRaw].every(Number.isFinite)) {
    return null;
  }

  const magnitude = Math.hypot(dxRaw, dyRaw);
  if (!Number.isFinite(magnitude) || magnitude <= epsilon) {
    return null;
  }

  const dx = dxRaw / magnitude;
  const dy = dyRaw / magnitude;
  const candidates = [];
  const minY = bounds.minY - epsilon;
  const maxY = bounds.maxY + epsilon;
  const minX = bounds.minX - epsilon;
  const maxX = bounds.maxX + epsilon;

  if (Math.abs(dx) > epsilon) {
    const tMinX = (bounds.minX - sx) / dx;
    const yAtMinX = sy + tMinX * dy;
    if (tMinX > epsilon && yAtMinX >= minY && yAtMinX <= maxY) {
      candidates.push({ t: tMinX, x: bounds.minX, y: yAtMinX });
    }

    const tMaxX = (bounds.maxX - sx) / dx;
    const yAtMaxX = sy + tMaxX * dy;
    if (tMaxX > epsilon && yAtMaxX >= minY && yAtMaxX <= maxY) {
      candidates.push({ t: tMaxX, x: bounds.maxX, y: yAtMaxX });
    }
  }

  if (Math.abs(dy) > epsilon) {
    const tMinY = (bounds.minY - sy) / dy;
    const xAtMinY = sx + tMinY * dx;
    if (tMinY > epsilon && xAtMinY >= minX && xAtMinY <= maxX) {
      candidates.push({ t: tMinY, x: xAtMinY, y: bounds.minY });
    }

    const tMaxY = (bounds.maxY - sy) / dy;
    const xAtMaxY = sx + tMaxY * dx;
    if (tMaxY > epsilon && xAtMaxY >= minX && xAtMaxY <= maxX) {
      candidates.push({ t: tMaxY, x: xAtMaxY, y: bounds.maxY });
    }
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((left, right) => left.t - right.t);
  return candidates[0];
}

function findClosestRayBoundaryHit(start, direction, boundarySegments, bounds, epsilon = 1e-3) {
  const fallbackHit = extendRayToViewBoxBoundary(start, direction, bounds);
  if (!fallbackHit) {
    return null;
  }

  const raySegment = {
    x1: Number(start?.x),
    y1: Number(start?.y),
    x2: Number(fallbackHit.x),
    y2: Number(fallbackHit.y),
  };

  let closestPoint = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const boundarySegment of boundarySegments || []) {
    const intersection = findSegmentIntersectionPoint(raySegment, boundarySegment);
    if (!intersection) continue;

    const distance = Math.hypot(intersection.x - raySegment.x1, intersection.y - raySegment.y1);
    if (distance <= epsilon || distance >= closestDistance) continue;

    closestPoint = intersection;
    closestDistance = distance;
  }

  return closestPoint || { x: fallbackHit.x, y: fallbackHit.y };
}

function nudgeBoundaryEndpoint(start, boundaryHit, distance = 0.9, epsilon = 1e-6) {
  const sx = Number(start?.x);
  const sy = Number(start?.y);
  const bx = Number(boundaryHit?.x);
  const by = Number(boundaryHit?.y);
  if (![sx, sy, bx, by].every(Number.isFinite)) {
    return boundaryHit;
  }

  const dx = bx - sx;
  const dy = by - sy;
  const magnitude = Math.hypot(dx, dy);
  if (!Number.isFinite(magnitude) || magnitude <= epsilon) {
    return boundaryHit;
  }

  return {
    x: bx + (dx / magnitude) * distance,
    y: by + (dy / magnitude) * distance,
  };
}

function pickNextTectonicNeighbor(current, previousId, byId, visitedIds, rng = Math.random) {
  const neighbors = [...(current?.neighbors || [])].filter((id) => id !== previousId && byId.has(id));
  if (!neighbors.length) {
    return null;
  }

  const unvisited = neighbors.filter((id) => !visitedIds.has(id));
  const pool = unvisited.length ? unvisited : neighbors;
  return pool[Math.floor(rng() * pool.length)] || null;
}

function placeTectonicLines(rng = Math.random) {
  const size = activeTerrainTemplateSize.value;
  const triangles = activeTopologyTriangles.value;
  const lineCountTarget = Math.max(0, Number(tectonicPlateCount.value) || 0);

  if (!triangles.length || lineCountTarget <= 0) {
    const nextBySize = new Map(tectonicLineSegmentsBySize.value);
    nextBySize.delete(size);
    tectonicLineSegmentsBySize.value = nextBySize;
    return;
  }

  const byId = new Map(triangles.map((triangle) => [triangle.id, triangle]));
  const triangleIds = [...byId.keys()];
  const bounds = parseViewBoxRect(activeViewBox.value);
  const edgeOwners = activeTopologyGraph.value?.edgeOwners;
  const boundarySegments = [];
  const boundaryEdgeKeys = new Set();
  const boundaryTriangleIds = new Set();

  if (edgeOwners instanceof Map) {
    for (const triangle of triangles) {
      if (!Array.isArray(triangle?.edges)) continue;
      let hasExteriorEdge = false;
      for (const edge of triangle.edges) {
        const isExterior = (edgeOwners.get(edge.key) || []).length === 1;
        if (isExterior) {
          hasExteriorEdge = true;
          if (!boundaryEdgeKeys.has(edge.key)) {
            boundarySegments.push({
              key: `boundary-${edge.key}`,
              x1: Number(edge.a?.[0]),
              y1: Number(edge.a?.[1]),
              x2: Number(edge.b?.[0]),
              y2: Number(edge.b?.[1]),
            });
            boundaryEdgeKeys.add(edge.key);
          }
        }
      }
      if (hasExteriorEdge) {
        boundaryTriangleIds.add(triangle.id);
      }
    }
  }

  for (let i = triangleIds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [triangleIds[i], triangleIds[j]] = [triangleIds[j], triangleIds[i]];
  }

  const segments = [];
  const committedSegments = [];
  const lineCount = Math.min(lineCountTarget, triangleIds.length);

  function normalizeSegmentGeometry(segment) {
    const x1 = Number(segment?.x1);
    const y1 = Number(segment?.y1);
    const x2 = Number(segment?.x2);
    const y2 = Number(segment?.y2);
    if (![x1, y1, x2, y2].every(Number.isFinite)) {
      return null;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (!Number.isFinite(length) || length <= 0) {
      return null;
    }

    let ux = dx / length;
    let uy = dy / length;
    if (ux < 0 || (Math.abs(ux) < 1e-6 && uy < 0)) {
      ux *= -1;
      uy *= -1;
    }

    return {
      x1,
      y1,
      x2,
      y2,
      length,
      ux,
      uy,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2,
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2),
    };
  }

  function segmentsLookMirroredOrDuplicate(candidate, existing) {
    const a = normalizeSegmentGeometry(candidate);
    const b = normalizeSegmentGeometry(existing);
    if (!a || !b) {
      return false;
    }

    const directionSimilarity = Math.abs(a.ux * b.ux + a.uy * b.uy);
    if (directionSimilarity < 0.985) {
      return false;
    }

    const midDistance = Math.hypot(a.midX - b.midX, a.midY - b.midY);
    const minLen = Math.min(a.length, b.length);

    // Direct near-duplicate in same area.
    if (midDistance <= 9 && minLen >= 10) {
      return true;
    }

    // Common mirror artifact: nearly vertical twins sharing the same Y span.
    const bothMostlyVertical = Math.abs(a.ux) < 0.25 && Math.abs(b.ux) < 0.25;
    if (bothMostlyVertical) {
      const xDelta = Math.abs(a.midX - b.midX);
      const overlapY = Math.max(0, Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY));
      if (xDelta <= 12 && overlapY >= minLen * 0.6) {
        return true;
      }
    }

    // Common mirror artifact: nearly horizontal twins sharing the same X span.
    const bothMostlyHorizontal = Math.abs(a.uy) < 0.25 && Math.abs(b.uy) < 0.25;
    if (bothMostlyHorizontal) {
      const yDelta = Math.abs(a.midY - b.midY);
      const overlapX = Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX));
      if (yDelta <= 12 && overlapX >= minLen * 0.6) {
        return true;
      }
    }

    return false;
  }

  function segmentRunsAlongBorder(candidate) {
    const geometry = normalizeSegmentGeometry(candidate);
    if (!geometry) {
      return false;
    }

    const spanX = Math.max(1, bounds.maxX - bounds.minX);
    const spanY = Math.max(1, bounds.maxY - bounds.minY);
    const edgeBufferX = Math.max(10, spanX * 0.025);
    const edgeBufferY = Math.max(10, spanY * 0.025);

    const nearTop =
      Math.abs(geometry.y1 - bounds.minY) <= edgeBufferY && Math.abs(geometry.y2 - bounds.minY) <= edgeBufferY;
    const nearBottom =
      Math.abs(geometry.y1 - bounds.maxY) <= edgeBufferY && Math.abs(geometry.y2 - bounds.maxY) <= edgeBufferY;
    const nearLeft =
      Math.abs(geometry.x1 - bounds.minX) <= edgeBufferX && Math.abs(geometry.x2 - bounds.minX) <= edgeBufferX;
    const nearRight =
      Math.abs(geometry.x1 - bounds.maxX) <= edgeBufferX && Math.abs(geometry.x2 - bounds.maxX) <= edgeBufferX;

    const mostlyHorizontal = Math.abs(geometry.uy) < 0.25;
    const mostlyVertical = Math.abs(geometry.ux) < 0.25;

    if ((nearTop || nearBottom) && mostlyHorizontal) {
      return true;
    }

    if ((nearLeft || nearRight) && mostlyVertical) {
      return true;
    }

    return false;
  }

  function maybePushSegment(target, candidate) {
    const boundedCandidate = {
      ...candidate,
      x1: clamp(Number(candidate?.x1), bounds.minX, bounds.maxX),
      y1: clamp(Number(candidate?.y1), bounds.minY, bounds.maxY),
      x2: clamp(Number(candidate?.x2), bounds.minX, bounds.maxX),
      y2: clamp(Number(candidate?.y2), bounds.minY, bounds.maxY),
    };

    const length = Math.hypot(
      Number(boundedCandidate?.x2) - Number(boundedCandidate?.x1),
      Number(boundedCandidate?.y2) - Number(boundedCandidate?.y1),
    );
    if (!Number.isFinite(length) || length < 4) {
      return;
    }

    if (segmentRunsAlongBorder(boundedCandidate)) {
      return;
    }

    const existing = [...committedSegments, ...target];
    if (existing.some((segment) => segmentsLookMirroredOrDuplicate(boundedCandidate, segment))) {
      return;
    }

    target.push(boundedCandidate);
  }

  function appendIrregularSegment(target, candidate, keyPrefix) {
    const x1 = Number(candidate?.x1);
    const y1 = Number(candidate?.y1);
    const x2 = Number(candidate?.x2);
    const y2 = Number(candidate?.y2);
    const length = Math.hypot(x2 - x1, y2 - y1);

    if (!Number.isFinite(length) || length < 4) {
      return;
    }

    // Keep very short links straight to avoid noisy jitter at triangle boundaries.
    if (length < 18) {
      maybePushSegment(target, {
        ...candidate,
        key: `${keyPrefix}-straight`,
      });
      return;
    }

    const ux = (x2 - x1) / length;
    const uy = (y2 - y1) / length;
    const px = -uy;
    const py = ux;
    const midpointT = 0.35 + rng() * 0.3;
    const jitter = Math.min(10, length * 0.2) * (0.45 + rng() * 0.55) * (rng() < 0.5 ? -1 : 1);
    const mid = {
      x: clamp(x1 + (x2 - x1) * midpointT + px * jitter, bounds.minX, bounds.maxX),
      y: clamp(y1 + (y2 - y1) * midpointT + py * jitter, bounds.minY, bounds.maxY),
    };

    const pieces = [
      {
        key: `${keyPrefix}-a`,
        x1,
        y1,
        x2: mid.x,
        y2: mid.y,
      },
      {
        key: `${keyPrefix}-b`,
        x1: mid.x,
        y1: mid.y,
        x2,
        y2,
      },
    ];

    for (let i = 0; i < pieces.length; i += 1) {
      const piece = pieces[i];
      const intersection = findClosestSegmentIntersection(piece, committedSegments);
      if (intersection) {
        maybePushSegment(target, {
          ...piece,
          key: `${keyPrefix}-hit-${i}`,
          x2: intersection.x,
          y2: intersection.y,
        });
        return;
      }

      maybePushSegment(target, piece);
    }
  }

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    let currentId = triangleIds[lineIndex];
    let previousId = "";
    let previousPoint = null;
    const visitedIds = new Set([currentId]);
    const lineSegments = [];
    const maxSteps = Math.max(8, triangles.length * 2);
    let terminated = false;

    for (let step = 0; step < maxSteps; step += 1) {
      const current = byId.get(currentId);
      if (!current) break;
      const currentCentroid = computeTriangleCentroid(current.vertices);

      const nextId = pickNextTectonicNeighbor(current, previousId, byId, visitedIds, rng);
      if (!nextId) {
        const direction = previousPoint
          ? { x: currentCentroid.x - previousPoint.x, y: currentCentroid.y - previousPoint.y }
          : { x: Math.cos(rng() * Math.PI * 2), y: Math.sin(rng() * Math.PI * 2) };

        const boundaryHit = findClosestRayBoundaryHit(currentCentroid, direction, boundarySegments, bounds);
        if (boundaryHit) {
          const nudgedBoundaryHit = nudgeBoundaryEndpoint(currentCentroid, boundaryHit);
          const boundarySegment = {
            key: `tectonic-${lineIndex}-${step}-boundary-stop`,
            x1: currentCentroid.x,
            y1: currentCentroid.y,
            x2: nudgedBoundaryHit.x,
            y2: nudgedBoundaryHit.y,
          };
          const intersection = findClosestSegmentIntersection(boundarySegment, committedSegments);
          if (intersection) {
            maybePushSegment(lineSegments, {
              ...boundarySegment,
              key: `tectonic-${lineIndex}-${step}-intersection-stop`,
              x2: intersection.x,
              y2: intersection.y,
            });
          } else {
            appendIrregularSegment(lineSegments, boundarySegment, `tectonic-${lineIndex}-${step}-boundary-stop`);
          }
        }
        terminated = true;
        break;
      }

      const nextTriangle = byId.get(nextId);
      const nextCentroid = computeTriangleCentroid(nextTriangle?.vertices);
      const candidate = {
        key: `tectonic-${lineIndex}-${step}-${currentId}|${nextId}`,
        x1: currentCentroid.x,
        y1: currentCentroid.y,
        x2: nextCentroid.x,
        y2: nextCentroid.y,
      };

      const intersection = findClosestSegmentIntersection(candidate, committedSegments);
      if (intersection) {
        maybePushSegment(lineSegments, {
          ...candidate,
          key: `tectonic-${lineIndex}-${step}-intersection-hit`,
          x2: intersection.x,
          y2: intersection.y,
        });
        terminated = true;
        break;
      }

      appendIrregularSegment(lineSegments, candidate, `tectonic-${lineIndex}-${step}`);
      previousPoint = currentCentroid;
      previousId = currentId;
      currentId = nextId;
      visitedIds.add(currentId);

      if (boundaryTriangleIds.has(currentId)) {
        const direction = previousPoint
          ? { x: nextCentroid.x - previousPoint.x, y: nextCentroid.y - previousPoint.y }
          : { x: Math.cos(rng() * Math.PI * 2), y: Math.sin(rng() * Math.PI * 2) };
        const boundaryHit = findClosestRayBoundaryHit(nextCentroid, direction, boundarySegments, bounds);
        if (boundaryHit) {
          const nudgedBoundaryHit = nudgeBoundaryEndpoint(nextCentroid, boundaryHit);
          const boundarySegment = {
            key: `tectonic-${lineIndex}-${step}-boundary-hit`,
            x1: nextCentroid.x,
            y1: nextCentroid.y,
            x2: nudgedBoundaryHit.x,
            y2: nudgedBoundaryHit.y,
          };
          const boundaryIntersection = findClosestSegmentIntersection(boundarySegment, committedSegments);
          if (boundaryIntersection) {
            maybePushSegment(lineSegments, {
              ...boundarySegment,
              key: `tectonic-${lineIndex}-${step}-boundary-intersection`,
              x2: boundaryIntersection.x,
              y2: boundaryIntersection.y,
            });
          } else {
            appendIrregularSegment(lineSegments, boundarySegment, `tectonic-${lineIndex}-${step}-boundary-hit`);
          }
        }
        terminated = true;
        break;
      }
    }

    if (!terminated && lineSegments.length) {
      const tail = lineSegments[lineSegments.length - 1];
      const direction = {
        x: Number(tail.x2) - Number(tail.x1),
        y: Number(tail.y2) - Number(tail.y1),
      };
      const boundaryHit = findClosestRayBoundaryHit({ x: tail.x2, y: tail.y2 }, direction, boundarySegments, bounds);
      if (boundaryHit) {
        const nudgedBoundaryHit = nudgeBoundaryEndpoint({ x: tail.x2, y: tail.y2 }, boundaryHit);
        const boundarySegment = {
          key: `tectonic-${lineIndex}-tail-boundary`,
          x1: Number(tail.x2),
          y1: Number(tail.y2),
          x2: nudgedBoundaryHit.x,
          y2: nudgedBoundaryHit.y,
        };
        const boundaryIntersection = findClosestSegmentIntersection(boundarySegment, committedSegments);
        if (boundaryIntersection) {
          maybePushSegment(lineSegments, {
            ...boundarySegment,
            key: `tectonic-${lineIndex}-tail-intersection`,
            x2: boundaryIntersection.x,
            y2: boundaryIntersection.y,
          });
        } else {
          appendIrregularSegment(lineSegments, boundarySegment, `tectonic-${lineIndex}-tail`);
        }
      }
    }

    if (lineSegments.length) {
      segments.push(...lineSegments);
      committedSegments.push(...lineSegments);
    }
  }

  const nextBySize = new Map(tectonicLineSegmentsBySize.value);
  if (segments.length === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, segments);
  }
  tectonicLineSegmentsBySize.value = nextBySize;
}

function placeRuinHexes(rng = Math.random) {
  // TODO: re-enable when step-terrain generation is implemented
  return;
  const cells = activeHexCells.value;
  const size = activeTerrainTemplateSize.value;
  const waterSet = new Set(waterHexesBySize.value.get(size)?.keys() || []);

  if (!isDieBackWorld.value || !cells.length) {
    const nextBySize = new Map(ruinHexesBySize.value);
    nextBySize.delete(size);
    ruinHexesBySize.value = nextBySize;
    return;
  }

  const byFace = new Map();
  for (const cell of cells) {
    if (waterSet.has(cell.key)) continue;
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
  const nextShoreHexes = new Map(shoreHexesBySize.value);
  nextShoreHexes.delete(activeTerrainTemplateSize.value);
  shoreHexesBySize.value = nextShoreHexes;
  const nextIceCaps = new Map(iceCapHexesBySize.value);
  nextIceCaps.delete(activeTerrainTemplateSize.value);
  iceCapHexesBySize.value = nextIceCaps;
  const nextCropland = new Map(croplandHexesBySize.value);
  nextCropland.delete(activeTerrainTemplateSize.value);
  croplandHexesBySize.value = nextCropland;
  const nextTowns = new Map(townHexesBySize.value);
  nextTowns.delete(activeTerrainTemplateSize.value);
  townHexesBySize.value = nextTowns;
  const nextCities = new Map(cityHexesBySize.value);
  nextCities.delete(activeTerrainTemplateSize.value);
  cityHexesBySize.value = nextCities;
  const nextArcologies = new Map(arcologyHexesBySize.value);
  nextArcologies.delete(activeTerrainTemplateSize.value);
  arcologyHexesBySize.value = nextArcologies;
  const nextRural = new Map(ruralHexesBySize.value);
  nextRural.delete(activeTerrainTemplateSize.value);
  ruralHexesBySize.value = nextRural;
  const nextWorldPort = new Map(worldPortHexesBySize.value);
  nextWorldPort.delete(activeTerrainTemplateSize.value);
  worldPortHexesBySize.value = nextWorldPort;
  const nextPenal = new Map(penalColonyHexesBySize.value);
  nextPenal.delete(activeTerrainTemplateSize.value);
  penalColonyHexesBySize.value = nextPenal;
  const nextWasteland = new Map(wastelandHexesBySize.value);
  nextWasteland.delete(activeTerrainTemplateSize.value);
  wastelandHexesBySize.value = nextWasteland;
  const nextExotic = new Map(exoticHexesBySize.value);
  nextExotic.delete(activeTerrainTemplateSize.value);
  exoticHexesBySize.value = nextExotic;
  const nextNoble = new Map(nobleLandHexesBySize.value);
  nextNoble.delete(activeTerrainTemplateSize.value);
  nobleLandHexesBySize.value = nextNoble;
  const nextTwilight = new Map(twilightZoneHexesBySize.value);
  nextTwilight.delete(activeTerrainTemplateSize.value);
  twilightZoneHexesBySize.value = nextTwilight;
  const nextTwilightLines = new Map(twilightZoneGuideLinesBySize.value);
  nextTwilightLines.delete(activeTerrainTemplateSize.value);
  twilightZoneGuideLinesBySize.value = nextTwilightLines;
  const nextFlat = new Map(flatlandHexesBySize.value);
  nextFlat.delete(activeTerrainTemplateSize.value);
  flatlandHexesBySize.value = nextFlat;
  const nextHills = new Map(hillsHexesBySize.value);
  nextHills.delete(activeTerrainTemplateSize.value);
  hillsHexesBySize.value = nextHills;
  const nextVolcanic = new Map(volcanicHexesBySize.value);
  nextVolcanic.delete(activeTerrainTemplateSize.value);
  volcanicHexesBySize.value = nextVolcanic;
  const nextForest = new Map(forestBiomeHexesBySize.value);
  nextForest.delete(activeTerrainTemplateSize.value);
  forestBiomeHexesBySize.value = nextForest;
  const nextSwamp = new Map(swampBiomeHexesBySize.value);
  nextSwamp.delete(activeTerrainTemplateSize.value);
  swampBiomeHexesBySize.value = nextSwamp;
  const nextArctic = new Map(arcticBiomeHexesBySize.value);
  nextArctic.delete(activeTerrainTemplateSize.value);
  arcticBiomeHexesBySize.value = nextArctic;
  const nextTectonics = new Map(tectonicLineSegmentsBySize.value);
  nextTectonics.delete(activeTerrainTemplateSize.value);
  tectonicLineSegmentsBySize.value = nextTectonics;
  clearTwilightHemisphereHexes(activeTerrainTemplateSize.value);
  placeMountainHexes();
  placeHillsHexes();
  placeChasmHexes();
  placePrecipiceHexes();
  placeCraterHexes();
  placeRuinHexes();
  placeDesertHexes();
  placeOceanTriangles();
  placeTectonicLines();
  placeSeaHexes();
  placeIceCapHexes();
  placeBaselineLandHexes();
  placeHillsHexes();
  placeLatitudeBiomes();
  placeCroplandHexes();
  placeTownHexes();
  placeCityHexes();
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
}

const terrainGenerationNonce = ref(0);

function generateTerrain() {
  const cells = activeHexCells.value;
  if (!cells.length) {
    return;
  }

  terrainGenerationNonce.value += 1;

  const seed = hashString(
    `${worldInfo.value.name}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|${worldInfo.value.hydrographics}|${terrainGenerationNonce.value}`,
  );
  const rand = mulberry32(seed);
  const tectonicRand = mulberry32(hashString(`${seed}|tectonic-lines`));

  const targetCount = clamp(Math.round(cells.length * hydroTargetRatio.value), 0, cells.length);
  if (targetCount === 0) {
    clearWaterHexes();
    placeTectonicLines(tectonicRand);
    return;
  }

  const ranked = buildRandomWaterCells(cells, targetCount, rand);

  const nextBySize = new Map(waterHexesBySize.value);
  nextBySize.set(activeTerrainTemplateSize.value, new Map(ranked.map((cell) => [cell.key, cell.points])));
  waterHexesBySize.value = nextBySize;

  placeMountainHexes(rand);
  placeHillsHexes(rand);
  placeChasmHexes(rand);
  placePrecipiceHexes(rand);
  placeCraterHexes(rand);
  placeRuinHexes(rand);
  placeResourceHexes();
  placeDesertHexes();
  placeOceanTriangles(rand);
  placeTectonicLines(tectonicRand);
  placeSeaHexes(rand);
  placeIceCapHexes(rand);
  placeBaselineLandHexes();
  placeHillsHexes(rand);
  placeLatitudeBiomes(rand);
}

function handleMapClick(event) {
  const hoveredHex = extractHexIdentity(event?.target);
  if (!hoveredHex) {
    return;
  }
  const key = hoveredHex.canonicalKey || hoveredHex.points;
  selectedTerrainHexKey.value = key;
  const size = activeTerrainTemplateSize.value;

  const nextBySize = new Map(waterHexesBySize.value);
  const nextForSize = new Map(nextBySize.get(size) ?? []);

  if (nextForSize.has(key)) {
    nextForSize.delete(key);
  } else {
    nextForSize.set(key, hoveredHex.points);
  }

  if (nextForSize.size === 0) {
    nextBySize.delete(size);
  } else {
    nextBySize.set(size, nextForSize);
  }

  waterHexesBySize.value = nextBySize;
  placeMountainHexes();
  placeHillsHexes();
  placeChasmHexes();
  placePrecipiceHexes();
  placeCraterHexes();
  placeRuinHexes();
  placeDesertHexes();
  placeBaselineLandHexes();
  placeHillsHexes();
  placeLatitudeBiomes();
  placeCityHexes();
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
}

function extractHexIdentity(el) {
  if (!el || String(el.tagName).toLowerCase() !== "polygon") {
    return null;
  }

  if (el.closest("#water-hex-overlay")) {
    return null;
  }

  const points = normalizePoints(el.getAttribute("points"));
  if (!points) {
    return null;
  }

  const logicalHexId = String(el.getAttribute("data-logical-hex-id") || "").trim();
  const seamGroupHexId = String(el.getAttribute("data-seam-group") || "").trim();
  const seamPartnerHexIds = String(el.getAttribute("data-seam-partners") || "").trim();
  const hexId = String(el.getAttribute("data-hex-id") || el.getAttribute("hex-id") || "").trim();
  const extractedHexKey = activeHexCanonicalByHexId.value.get(hexId);
  const canonicalKey =
    extractedHexKey ||
    deriveCanonicalHexKey({
      logicalHexId,
      seamGroupHexId,
      hexId,
      seamPartnerHexIds,
    });

  return {
    points,
    hexId,
    logicalHexId,
    seamGroupHexId,
    canonicalKey,
  };
}

function handleMapHover(event) {
  const hoveredHex = extractHexIdentity(event?.target);
  if (!hoveredHex) {
    hoveredHexInfo.value = null;
    return;
  }

  hoveredHexInfo.value = hoveredHex;
}

function clearMapHover() {
  hoveredHexInfo.value = null;
}
</script>

<style scoped>
.terrain-page {
  min-height: 100vh;
  height: auto;
  background: #f6f6f6;
  color: #0f0f0f;
  padding: 1rem;
  overflow-y: visible;
  overflow-x: hidden;
  box-sizing: border-box;
}

.terrain-shell {
  max-width: 1200px;
  width: 100%;
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
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  color: #333;
}

.map-hover-readout {
  font-family: "Courier New", monospace;
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
  display: block;
  height: auto;
  aspect-ratio: auto;
  border: 3px solid #111;
  background: #fff;
  overflow: visible;
}

.terrain-map #terrain-template-loaded polygon {
  fill: #d2b48c !important;
  pointer-events: all;
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
