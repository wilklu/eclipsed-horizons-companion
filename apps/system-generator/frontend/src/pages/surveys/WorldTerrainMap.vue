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
              <dd>
                {{ mapProfileLabel
                }}<template v-if="activeTerrainTemplateSize"> — Size {{ activeTerrainTemplateSize }}</template>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="map-panel">
        <div class="map-meta">
          <span v-if="hoveredHexLabel" class="map-hover-readout">Hover: {{ hoveredHexLabel }}</span>
        </div>

        <section class="legend-preferences-panel" aria-label="Terrain legend and color preferences">
          <div class="legend-preferences-card">
            <div class="legend-preferences-header">
              <h3 class="legend-preferences-title">Hex Legend</h3>
              <span class="legend-total-assigned"
                >Total Assigned: {{ totalSurveyPlacedHexes }}/{{ totalSurveyTargetHexes }}</span
              >
            </div>
            <ul class="hex-legend-list">
              <li
                v-for="entry in hexLegendEntries"
                :key="entry.id"
                class="hex-legend-item"
                v-show="entry.count > 0 || entry.target > 0"
              >
                <span class="hex-legend-swatch" :style="{ backgroundColor: entry.color }" aria-hidden="true"></span>
                <span class="hex-legend-label">{{ entry.label }}</span>
                <span class="hex-legend-count">{{
                  entry.target > 0 ? `${entry.count}/${entry.target}` : entry.count
                }}</span>
              </li>
            </ul>
          </div>

          <div class="legend-preferences-card">
            <h3 class="legend-preferences-title">Terrain Colors</h3>
            <div class="terrain-color-grid" role="group" aria-label="Terrain color preferences">
              <label v-for="terrain in terrainColorPreferenceEntries" :key="terrain.id" class="terrain-color-row">
                <span>{{ terrain.label }}</span>
                <input type="color" :value="terrain.color" @input="setTerrainColor(terrain.id, $event.target.value)" />
              </label>
            </div>
            <button type="button" class="map-button map-button-secondary" @click="resetTerrainColors">
              Reset Terrain Colors
            </button>
          </div>
        </section>

        <div class="map-controls">
          <button
            type="button"
            class="map-button"
            @click="applyTerrainSurveyToMap"
            :disabled="!(activeHexCells?.length ?? 0) || !hasTerrainSurveyComposition"
            title="Seed map terrain from Terrain Survey composition"
          >
            Apply Terrain
          </button>
          <button
            type="button"
            class="map-button map-button-secondary"
            @click="generateTerrain"
            :disabled="!(activeHexCells?.length ?? 0)"
          >
            Regenerate Terrain
          </button>
          <button
            type="button"
            class="map-button map-button-secondary"
            @click="saveCurrentTerrainBaseline"
            :disabled="!(activeHexCells?.length ?? 0)"
            title="Save current terrain as the regeneration baseline"
          >
            Save Current Terrain
          </button>
          <button
            type="button"
            class="map-button map-button-secondary"
            @click="clearWaterHexes"
            :disabled="!(activeHexCells?.length ?? 0)"
          >
            Clear Terrain
          </button>
        </div>

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
              :fill="withAlpha(terrainColor('water'), 0.18)"
              stroke="none"
            />
          </g>

          <g id="plains-hex-overlay" pointer-events="none">
            <g v-for="entry in activePlainsHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('plains'), 0.14)"
                :stroke="terrainColor('plains')"
                stroke-width="0.9"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#6f5a34"
                style="pointer-events: none; user-select: none"
              >
                Pl
              </text>
            </g>
          </g>

          <g id="hills-hex-overlay" pointer-events="none">
            <g v-for="entry in activeHillsHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('hills'), 0.65)"
                :stroke="terrainColor('hills')"
                stroke-width="1.2"
              />
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

          <g id="volcanic-hex-overlay" pointer-events="none">
            <g v-for="entry in activeVolcanicHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('volcanic'), 0.42)"
                :stroke="terrainColor('volcanic')"
                stroke-width="1.3"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#351207"
                style="pointer-events: none; user-select: none"
              >
                V
              </text>
            </g>
          </g>

          <g id="rainforest-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeForestBiomeHexEntries"
              :key="entry.key"
              :points="entry.points"
              :fill="withAlpha(terrainColor('forest'), 0.32)"
              :stroke="terrainColor('forest')"
              stroke-width="0.8"
            />
          </g>

          <g id="swamp-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeSwampBiomeHexEntries"
              :key="entry.key"
              :points="entry.points"
              :fill="withAlpha(terrainColor('swamp'), 0.3)"
              :stroke="terrainColor('swamp')"
              stroke-width="0.8"
            />
          </g>

          <g id="tundra-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeTundraHexEntries"
              :key="entry.key"
              :points="entry.points"
              :fill="withAlpha(terrainColor('tundra'), 0.3)"
              :stroke="terrainColor('tundra')"
              stroke-width="0.8"
            />
          </g>

          <g id="water-hex-overlay" pointer-events="none">
            <polygon
              v-for="entry in activeWaterHexEntries"
              :key="entry.key"
              :points="entry.points"
              :fill="terrainColor('water')"
              stroke="black"
              stroke-width="1"
            />
          </g>

          <g id="ice-field-hex-overlay" pointer-events="none">
            <g v-for="entry in activeIceFieldHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('icefield'), 0.58)"
                :stroke="terrainColor('icefield')"
                stroke-width="1.1"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#375a70"
                style="pointer-events: none; user-select: none"
              >
                If
              </text>
            </g>
          </g>

          <g id="frozen-lands-hex-overlay" pointer-events="none">
            <g v-for="entry in activeFrozenLandHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('frozenland'), 0.28)"
                :stroke="terrainColor('frozenland')"
                stroke-width="0.9"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#4b5565"
                style="pointer-events: none; user-select: none"
              >
                Fr
              </text>
            </g>
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

          <g id="latitude-guide-line-overlay" pointer-events="none">
            <line
              v-for="line in activeLatitudeGuideLines"
              :key="line.key"
              :x1="line.x1"
              :y1="line.y1"
              :x2="line.x2"
              :y2="line.y2"
              :stroke="line.type === 'equator' ? '#cf7f00' : line.type === 'tropic' ? '#b24a00' : '#336f9c'"
              :stroke-width="line.type === 'equator' ? 1.8 : 1.3"
              :stroke-dasharray="line.type === 'equator' ? '0' : '7 5'"
              stroke-linecap="round"
              opacity="0.85"
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
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('icecap'), 0.72)"
                :stroke="terrainColor('icecap')"
                stroke-width="1.4"
              />
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

          <g id="glacier-hex-overlay" pointer-events="none">
            <g v-for="entry in activeGlacierHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('glacier'), 0.52)"
                :stroke="terrainColor('glacier')"
                stroke-width="1.2"
              />
              <text
                :x="entry.cx"
                :y="entry.cy + 4"
                text-anchor="middle"
                font-size="8"
                font-weight="bold"
                fill="#2f6285"
                style="pointer-events: none; user-select: none"
              >
                Gl
              </text>
            </g>
          </g>

          <g id="shore-hex-overlay" pointer-events="none">
            <g v-for="entry in activeShoreHexEntries" :key="entry.key">
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('shore'), 0.24)"
                :stroke="terrainColor('shore')"
                stroke-width="1.2"
              />
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
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('desert'), 0.3)"
                :stroke="terrainColor('desert')"
                stroke-width="1.2"
              />
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
              <polygon
                :points="entry.points"
                :fill="withAlpha(terrainColor('island'), 0.38)"
                :stroke="terrainColor('island')"
                stroke-width="1.5"
              />
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
              <polygon
                :points="entry.points"
                :fill="terrainColor('mountain')"
                :stroke="terrainColor('mountain')"
                stroke-width="1.5"
              />
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
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { usePreferencesStore } from "../../stores/preferencesStore.js";
import { normalizeFaceTopologyId } from "../../utils/worldTerrainStartTriangle.js";
import { canonicalizeHexId } from "../../utils/worldMapHexTopology.js";
import { resolveTerrainCoreCountsFromBudget } from "../../utils/terrainPlacement.js";
import {
  WORLD_HEX_TAGS,
  buildWorldHexTagIndex,
  buildWorldTerrainHexTagSnapshot,
} from "../../utils/worldTerrainHexTags.js";
const route = useRoute();
const systemStore = useSystemStore();
const preferencesStore = usePreferencesStore();

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

const terrainPaintTypes = Object.freeze([
  { id: "water", label: "Water" },
  { id: "shore", label: "Shore" },
  { id: "plains", label: "Plains" },
  { id: "island", label: "Island" },
  { id: "hills", label: "Hills" },
  { id: "forest", label: "Forest" },
  { id: "mountain", label: "Mountain" },
  { id: "volcanic", label: "Volcanic" },
  { id: "icecap", label: "Icecap" },
  { id: "glacier", label: "Glacier" },
  { id: "icefield", label: "Ice Field" },
  { id: "frozenland", label: "Frozen Lands" },
  { id: "desert", label: "Desert" },
  { id: "tundra", label: "Tundra" },
  { id: "swamp", label: "Swamp" },
  { id: "urban", label: "Urban" },
]);

const TERRAIN_COLOR_DEFAULTS = Object.freeze({
  water: "#04529d",
  shore: "#e7c77a",
  plains: "#d6c18d",
  island: "#a37f5b",
  hills: "#a0825c",
  forest: "#228048",
  mountain: "#778899",
  volcanic: "#8a3a1c",
  icecap: "#e2f2ff",
  glacier: "#c1e5fa",
  icefield: "#cee7f7",
  frozenland: "#cdd6e2",
  desert: "#d2b46e",
  tundra: "#bcc7d0",
  swamp: "#5f7a42",
  urban: "#9e9e9e",
});

const FEATURE_LEGEND_COLORS = Object.freeze({
  resource: "#228b22",
  chasm: "#79429f",
  precipice: "#c95432",
  crater: "#6e6e6e",
  ruin: "#5a5a5a",
  cropland: "#7cb054",
  town: "#dba860",
  city: "#c47047",
  arcology: "#7d65ba",
  rural: "#8eb75c",
  worldport: "#5a82d2",
  twilight: "#825aab",
  bakedland: "#cd7c4a",
  penal: "#794c4c",
  wasteland: "#94896d",
  exotic: "#61a5a4",
  noble: "#b89054",
});

function normalizeHexColor(value, fallback = "#888888") {
  const normalized = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }
  return fallback;
}

function withAlpha(hexColor, alpha = 0.35) {
  const safeHex = normalizeHexColor(hexColor, "#888888").replace("#", "");
  const safeAlpha = Math.max(0, Math.min(1, Number(alpha) || 0));
  const r = Number.parseInt(safeHex.slice(0, 2), 16);
  const g = Number.parseInt(safeHex.slice(2, 4), 16);
  const b = Number.parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha.toFixed(3)})`;
}

const terrainColorOverrides = computed(() => {
  const raw = preferencesStore.terrainColorOverrides;
  return raw && typeof raw === "object" ? raw : {};
});

function terrainColor(id) {
  const terrainId = String(id || "").trim();
  const fallback = TERRAIN_COLOR_DEFAULTS[terrainId] || "#888888";
  return normalizeHexColor(terrainColorOverrides.value[terrainId], fallback);
}

function setTerrainColor(id, color) {
  const terrainId = String(id || "").trim();
  if (!terrainId) return;
  const next = {
    ...(terrainColorOverrides.value || {}),
    [terrainId]: normalizeHexColor(color, TERRAIN_COLOR_DEFAULTS[terrainId] || "#888888"),
  };
  preferencesStore.set("terrainColorOverrides", next);
}

function resetTerrainColors() {
  preferencesStore.set("terrainColorOverrides", {});
}

const terrainColorPreferenceEntries = computed(() =>
  terrainPaintTypes.map((terrain) => ({
    ...terrain,
    color: terrainColor(terrain.id),
  })),
);

function legendTarget(terrain) {
  const budgetTarget = Number(terrainBudgetByType.value.get(terrain) || 0);
  if (budgetTarget > 0) {
    return budgetTarget;
  }
  return Number(activeSurveyPlacedCountsByTerrain.value.get(terrain) || 0);
}

function uniqueHexCount(entries) {
  const seen = new Set();
  for (const entry of entries) {
    seen.add(entry.logicalKey ?? entry.key);
  }
  return seen.size;
}

const hexLegendEntries = computed(() => [
  {
    id: "water",
    label: "Ocean",
    color: terrainColor("water"),
    count: uniqueHexCount(activeWaterHexEntries.value),
    target: legendTarget("water"),
  },
  {
    id: "shore",
    label: "Shore",
    color: terrainColor("shore"),
    count: uniqueHexCount(activeShoreHexEntries.value),
    target: legendTarget("shore"),
  },
  {
    id: "island",
    label: "Islands",
    color: terrainColor("island"),
    count: uniqueHexCount(activeIslandHexEntries.value),
    target: legendTarget("island"),
  },
  {
    id: "mountain",
    label: "Mountains",
    color: terrainColor("mountain"),
    count: uniqueHexCount(activeMountainHexEntries.value),
    target: legendTarget("mountain"),
  },
  {
    id: "hills",
    label: "Hills",
    color: terrainColor("hills"),
    count: uniqueHexCount(activeHillsHexEntries.value),
    target: legendTarget("hills"),
  },
  {
    id: "plains",
    label: "Plains",
    color: terrainColor("plains"),
    count: Number(activeSurveyPlacedCountsByTerrain.value.get("plains") || 0),
    target: legendTarget("plains"),
  },
  {
    id: "volcanic",
    label: "Volcanic",
    color: terrainColor("volcanic"),
    count: uniqueHexCount(activeVolcanicHexEntries.value),
    target: legendTarget("volcanic"),
  },
  {
    id: "forest",
    label: "Forest",
    color: terrainColor("forest"),
    count: uniqueHexCount(activeForestBiomeHexEntries.value),
    target: legendTarget("forest"),
  },
  {
    id: "swamp",
    label: "Swamp",
    color: terrainColor("swamp"),
    count: uniqueHexCount(activeSwampBiomeHexEntries.value),
    target: legendTarget("swamp"),
  },
  {
    id: "tundra",
    label: "Tundra",
    color: terrainColor("tundra"),
    count: uniqueHexCount(activeTundraHexEntries.value),
    target: legendTarget("tundra"),
  },
  {
    id: "icecap",
    label: "Ice Cap",
    color: terrainColor("icecap"),
    count: uniqueHexCount(activeIceCapHexEntries.value),
    target: legendTarget("icecap"),
  },
  {
    id: "glacier",
    label: "Glacier",
    color: terrainColor("glacier"),
    count: uniqueHexCount(activeGlacierHexEntries.value),
    target: legendTarget("glacier"),
  },
  {
    id: "icefield",
    label: "Ice Field",
    color: terrainColor("icefield"),
    count: uniqueHexCount(activeIceFieldHexEntries.value),
    target: legendTarget("icefield"),
  },
  {
    id: "frozenland",
    label: "Frozen Lands",
    color: terrainColor("frozenland"),
    count: uniqueHexCount(activeFrozenLandHexEntries.value),
    target: legendTarget("frozenland"),
  },
  {
    id: "desert",
    label: "Desert",
    color: terrainColor("desert"),
    count: uniqueHexCount(activeDesertHexEntries.value),
    target: legendTarget("desert"),
  },
  {
    id: "bakedland",
    label: "Baked Lands",
    color: FEATURE_LEGEND_COLORS.bakedland,
    count: uniqueHexCount(activeBakedLandHexEntries.value),
    target: 0,
  },
  {
    id: "chasm",
    label: "Chasm",
    color: FEATURE_LEGEND_COLORS.chasm,
    count: uniqueHexCount(activeChasmHexEntries.value),
    target: 0,
  },
  {
    id: "precipice",
    label: "Precipice",
    color: FEATURE_LEGEND_COLORS.precipice,
    count: uniqueHexCount(activePrecipiceHexEntries.value),
    target: 0,
  },
  {
    id: "crater",
    label: "Crater",
    color: FEATURE_LEGEND_COLORS.crater,
    count: uniqueHexCount(activeCraterHexEntries.value),
    target: 0,
  },
  {
    id: "ruin",
    label: "Ruins",
    color: FEATURE_LEGEND_COLORS.ruin,
    count: uniqueHexCount(activeRuinHexEntries.value),
    target: 0,
  },
  {
    id: "resource",
    label: "Resources",
    color: FEATURE_LEGEND_COLORS.resource,
    count: uniqueHexCount(activeResourceHexEntries.value),
    target: 0,
  },
  {
    id: "cropland",
    label: "Cropland",
    color: FEATURE_LEGEND_COLORS.cropland,
    count: uniqueHexCount(activeCroplandHexEntries.value),
    target: 0,
  },
  {
    id: "town",
    label: "Towns",
    color: FEATURE_LEGEND_COLORS.town,
    count: uniqueHexCount(activeTownHexEntries.value),
    target: 0,
  },
  {
    id: "city",
    label: "Cities",
    color: FEATURE_LEGEND_COLORS.city,
    count: uniqueHexCount(activeCityHexEntries.value),
    target: 0,
  },
  {
    id: "arcology",
    label: "Arcologies",
    color: FEATURE_LEGEND_COLORS.arcology,
    count: uniqueHexCount(activeArcologyHexEntries.value),
    target: 0,
  },
  {
    id: "rural",
    label: "Rural",
    color: FEATURE_LEGEND_COLORS.rural,
    count: uniqueHexCount(activeRuralHexEntries.value),
    target: 0,
  },
  {
    id: "worldport",
    label: "Starport / Spaceport",
    color: FEATURE_LEGEND_COLORS.worldport,
    count: uniqueHexCount(activeWorldPortHexEntries.value),
    target: 0,
  },
  {
    id: "twilight",
    label: "Twilight Zone",
    color: FEATURE_LEGEND_COLORS.twilight,
    count: uniqueHexCount(activeTwilightZoneHexEntries.value),
    target: 0,
  },
  {
    id: "penal",
    label: "Penal Colony",
    color: FEATURE_LEGEND_COLORS.penal,
    count: uniqueHexCount(activePenalColonyHexEntries.value),
    target: 0,
  },
  {
    id: "wasteland",
    label: "Wasteland",
    color: FEATURE_LEGEND_COLORS.wasteland,
    count: uniqueHexCount(activeWastelandHexEntries.value),
    target: 0,
  },
  {
    id: "exotic",
    label: "Exotic",
    color: FEATURE_LEGEND_COLORS.exotic,
    count: uniqueHexCount(activeExoticHexEntries.value),
    target: legendTarget("exotic"),
  },
  {
    id: "noble",
    label: "Noble Lands",
    color: FEATURE_LEGEND_COLORS.noble,
    count: uniqueHexCount(activeNobleLandHexEntries.value),
    target: 0,
  },
]);

function normalizeSurveyTerrainType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]+/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

const SURVEY_TYPE_TO_TERRAIN = new Map([
  ["wetland", "swamp"],
  ["wetlands", "swamp"],
  ["wet woods", "forest"],
  ["shore", "shore"],
  ["shores", "shore"],
  ["ocean", "water"],
  ["oceans", "water"],
  ["river", "water"],
  ["rivers", "water"],
  ["lake", "water"],
  ["lakes", "water"],
  ["island", "island"],
  ["islands", "island"],
  ["icecap", "icecap"],
  ["icecaps", "icecap"],
  ["ice cap", "icecap"],
  ["ice caps", "icecap"],
  ["glacier", "glacier"],
  ["glaciers", "glacier"],
  ["ice field", "icefield"],
  ["ice fields", "icefield"],
  ["frozen land", "frozenland"],
  ["frozen lands", "frozenland"],
  ["tundra", "tundra"],
  ["mountain", "mountain"],
  ["mountains", "mountain"],
  ["rough", "hills"],
  ["rouch", "hills"],
  ["volcano", "volcanic"],
  ["volcanoes", "volcanic"],
  ["volcanos", "volcanic"],
  ["volacano", "volcanic"],
  ["volacanos", "volcanic"],
  ["desert", "desert"],
  ["deserts", "desert"],
  ["baked land", "desert"],
  ["baked lands", "desert"],
  ["woods", "forest"],
  ["wood", "forest"],
  ["forest", "forest"],
  ["rough woods", "forest"],
  ["exotic", "exotic"],
  ["clear", "plains"],
  ["flat", "plains"],
  ["flatland", "plains"],
  ["flatlands", "plains"],
  ["flat land", "plains"],
  ["flat lands", "plains"],
  ["plains", "plains"],
]);

function mapSurveyTypeToTerrain(value) {
  const normalized = normalizeSurveyTerrainType(value);
  return SURVEY_TYPE_TO_TERRAIN.get(normalized) || "plains";
}

const selectedOverlayTerrain = ref("water");

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

  const sizeFromWorldSizeRoute = parseWorldSizeCode(route.query.worldSize);
  if (sizeFromWorldSizeRoute !== null) {
    return sizeFromWorldSizeRoute;
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

const activeShoreHexEntries = computed(() => {
  const mapForSize = shoreHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize);
});

const activePlainsHexEntries = computed(() => {
  const mapForSize = flatlandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.FLATLANDS),
  );
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
    const canonicalFromMetadata = deriveCanonicalHexKey({
      logicalHexId: cell.logicalHexId,
      seamGroupHexId: cell.seamGroupHexId,
      hexId: cell.hexId,
      seamPartnerHexIds: cell.seamPartnerHexIds,
    });
    const canonicalHexId = canonicalFromMetadata || canonicalizeHexId(seamAliasHexId);

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
const islandHexesBySize = ref(new Map());
const hillsHexesBySize = ref(new Map());
const volcanicHexesBySize = ref(new Map());
const forestBiomeHexesBySize = ref(new Map());
const swampBiomeHexesBySize = ref(new Map());
const arcticBiomeHexesBySize = ref(new Map());
const mountainHexesBySize = ref(new Map());
const iceCapHexesBySize = ref(new Map());
const glacierHexesBySize = ref(new Map());
const iceFieldHexesBySize = ref(new Map());
const frozenLandHexesBySize = ref(new Map());
const chasmHexesBySize = ref(new Map());
const precipiceHexesBySize = ref(new Map());
const craterHexesBySize = ref(new Map());
const desertHexesBySize = ref(new Map());
const ruinHexesBySize = ref(new Map());
const oceanTrianglesBySize = ref(new Map());
const oceanGroupsBySize = ref(new Map());
const shoreSegmentsBySize = ref(new Map());
const tectonicPlatePolygonsBySize = ref(new Map());
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
const activeTectonicPlateEntries = computed(
  () => tectonicPlatePolygonsBySize.value.get(activeTerrainTemplateSize.value) || [],
);
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

const disableLegacyTerrainGeneration = true;
const useSurveyOverlayHexes = ref(false);
const isApplyingOverlayLayers = ref(false);
const savedTerrainCompositionByWorld = ref(null);
const savedTerrainCompositionWorldKey = ref("");

function getCurrentWorldTerrainKey() {
  const systemId = String(boundSystem.value?.systemId || "").trim();
  const worldIndex = selectedWorldIndex.value;
  if (!systemId || worldIndex === null) {
    return "";
  }
  return `${systemId}:${worldIndex}`;
}

function getEffectiveTerrainComposition() {
  const currentKey = getCurrentWorldTerrainKey();
  if (
    currentKey &&
    savedTerrainCompositionWorldKey.value === currentKey &&
    savedTerrainCompositionByWorld.value &&
    typeof savedTerrainCompositionByWorld.value === "object"
  ) {
    return savedTerrainCompositionByWorld.value;
  }

  return selectedWorld.value?.terrainComposition && typeof selectedWorld.value.terrainComposition === "object"
    ? selectedWorld.value.terrainComposition
    : null;
}

const hasTerrainSurveyComposition = computed(() => {
  const counts = getEffectiveTerrainComposition()?.hexCounts;
  return Array.isArray(counts) && counts.length > 0;
});

function getLayerHexCount(layerRef, size = activeTerrainTemplateSize.value) {
  const mapForSize = layerRef.value.get(size);
  return mapForSize instanceof Map ? mapForSize.size : 0;
}

const activeWaterHexCount = computed(() => getLayerHexCount(waterHexesBySize));
const activeShoreHexCount = computed(() => getLayerHexCount(shoreHexesBySize));
const activeMountainHexCount = computed(() => getLayerHexCount(mountainHexesBySize));
const activeHillsHexCount = computed(() => getLayerHexCount(hillsHexesBySize));
const activePlainsHexCount = computed(() => getLayerHexCount(flatlandHexesBySize));
const activeVolcanicHexCount = computed(() => getLayerHexCount(volcanicHexesBySize));
const activeForestBiomeHexCount = computed(() => getLayerHexCount(forestBiomeHexesBySize));
const activeTundraHexCount = computed(() => getLayerHexCount(arcticBiomeHexesBySize));
const activeIceFieldHexCount = computed(() => getLayerHexCount(iceFieldHexesBySize));
const activeFrozenLandHexCount = computed(() => getLayerHexCount(frozenLandHexesBySize));
const activeGlacierHexCount = computed(() => getLayerHexCount(glacierHexesBySize));
const activeCraterHexCount = computed(() => getLayerHexCount(craterHexesBySize));
const activeDesertHexCount = computed(() => getLayerHexCount(desertHexesBySize));
const activeRuinHexCount = computed(() => getLayerHexCount(ruinHexesBySize));
const activeCroplandHexCount = computed(() => getLayerHexCount(croplandHexesBySize));
const activeTownHexCount = computed(() => getLayerHexCount(townHexesBySize));
const activeCityHexCount = computed(() => getLayerHexCount(cityHexesBySize));
const activeArcologyHexCount = computed(() => getLayerHexCount(arcologyHexesBySize));
const activeRuralHexCount = computed(() => getLayerHexCount(ruralHexesBySize));
const activeWorldPortHexCount = computed(() => getLayerHexCount(worldPortHexesBySize));
const activeTwilightZoneHexCount = computed(() => getLayerHexCount(twilightZoneHexesBySize));
const activeBakedLandHexCount = computed(() => getLayerHexCount(bakedLandHexesBySize));
const activeTwilightFrozenLandHexCount = computed(() => getLayerHexCount(twilightFrozenLandHexesBySize));
const activePenalColonyHexCount = computed(() => getLayerHexCount(penalColonyHexesBySize));
const activeWastelandHexCount = computed(() => getLayerHexCount(wastelandHexesBySize));
const activeExoticHexCount = computed(() => getLayerHexCount(exoticHexesBySize));
const activeNobleLandHexCount = computed(() => getLayerHexCount(nobleLandHexesBySize));

function setLayerMapForSize(layerRef, size, map) {
  const next = new Map(layerRef.value);
  if (map instanceof Map && map.size) {
    next.set(size, map);
  } else {
    next.delete(size);
  }
  layerRef.value = next;
}

function clearLayerMapForSize(layerRef, size) {
  const next = new Map(layerRef.value);
  next.delete(size);
  layerRef.value = next;
}

function resetTerrainLayersForSize(size) {
  const refsToClear = [
    waterHexesBySize,
    shoreHexesBySize,
    resourceHexesBySize,
    croplandHexesBySize,
    townHexesBySize,
    cityHexesBySize,
    arcologyHexesBySize,
    ruralHexesBySize,
    worldPortHexesBySize,
    twilightZoneHexesBySize,
    twilightZoneGuideLinesBySize,
    bakedLandHexesBySize,
    penalColonyHexesBySize,
    wastelandHexesBySize,
    exoticHexesBySize,
    nobleLandHexesBySize,
    twilightFrozenLandHexesBySize,
    twilightOceanDesertHexesBySize,
    twilightOceanIceFieldHexesBySize,
    flatlandHexesBySize,
    islandHexesBySize,
    hillsHexesBySize,
    volcanicHexesBySize,
    forestBiomeHexesBySize,
    swampBiomeHexesBySize,
    arcticBiomeHexesBySize,
    mountainHexesBySize,
    iceCapHexesBySize,
    glacierHexesBySize,
    iceFieldHexesBySize,
    frozenLandHexesBySize,
    chasmHexesBySize,
    precipiceHexesBySize,
    craterHexesBySize,
    desertHexesBySize,
    ruinHexesBySize,
    oceanTrianglesBySize,
    oceanGroupsBySize,
    shoreSegmentsBySize,
    tectonicPlatePolygonsBySize,
    tectonicLineSegmentsBySize,
  ];

  for (const layerRef of refsToClear) {
    clearLayerMapForSize(layerRef, size);
  }
}

function normalizeOverlayEntriesByKey(rawEntries) {
  const legacyLayerToTerrain = {
    water: "water",
    shore: "shore",
    flatland: "plains",
    flatlands: "plains",
    plains: "plains",
    island: "island",
    islands: "island",
    hills: "hills",
    forest: "forest",
    mountain: "mountain",
    volcanic: "volcanic",
    icecap: "icecap",
    glacier: "glacier",
    icefield: "icefield",
    frozenland: "frozenland",
    desert: "desert",
    arctic: "tundra",
    tundra: "tundra",
    swamp: "swamp",
    city: "urban",
    urban: "urban",
    exotic: "exotic",
  };

  const sourceEntries = (() => {
    if (Array.isArray(rawEntries)) {
      return rawEntries;
    }

    if (!rawEntries || typeof rawEntries !== "object") {
      return [];
    }

    const out = [];
    for (const [layerName, payload] of Object.entries(rawEntries)) {
      const terrain =
        legacyLayerToTerrain[
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
            out.push({ key: item, terrain });
            continue;
          }
          if (item && typeof item === "object") {
            out.push({ ...item, terrain });
          }
        }
        continue;
      }

      if (payload && typeof payload === "object") {
        for (const [entryKey, entryValue] of Object.entries(payload)) {
          if (entryValue && typeof entryValue === "object") {
            out.push({ key: entryKey, ...entryValue, terrain });
          } else {
            out.push({ key: entryKey, terrain });
          }
        }
      }
    }

    return out;
  })();

  if (!sourceEntries.length) {
    return new Map();
  }

  const variantsByKey = activeHexRenderVariantsByKey.value;
  const canonicalByHexId = activeHexCanonicalByHexId.value;
  const cellsByKey = new Map();
  const cellsByPoints = new Map();
  for (const cell of activeHexCells.value) {
    const key = String(cell?.key || "").trim();
    if (key && !cellsByKey.has(key)) {
      cellsByKey.set(key, cell);
    }
    const points = normalizePoints(cell?.points || "");
    if (points && !cellsByPoints.has(points)) {
      cellsByPoints.set(points, cell);
    }
  }

  const out = new Map();
  for (const entry of sourceEntries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const rawPoints = normalizePoints(entry.points);
    let key = String(entry.key || "").trim();

    if (rawPoints) {
      const pointsCell = cellsByPoints.get(rawPoints);
      if (pointsCell?.key) {
        key = String(pointsCell.key || key).trim();
      }
    }

    if (key && !variantsByKey.has(key)) {
      const mappedHexKey = canonicalByHexId.get(key);
      if (mappedHexKey && variantsByKey.has(mappedHexKey)) {
        key = mappedHexKey;
      } else {
        const canonicalKey = canonicalizeHexId(key);
        if (canonicalKey && variantsByKey.has(canonicalKey)) {
          key = canonicalKey;
        }
      }
    }

    if (!key) {
      continue;
    }

    const terrain = String(entry.terrain || "")
      .trim()
      .toLowerCase();
    if (!terrain) {
      continue;
    }

    out.set(key, {
      points: rawPoints || cellsByKey.get(key)?.points || "",
      terrain,
    });
  }

  return out;
}

function buildOverlayEntriesByKeyFromCurrentLayers(size) {
  const layerSources = [
    [waterHexesBySize.value.get(size), "water"],
    [shoreHexesBySize.value.get(size), "shore"],
    [islandHexesBySize.value.get(size), "island"],
    [hillsHexesBySize.value.get(size), "hills"],
    [mountainHexesBySize.value.get(size), "mountain"],
    [volcanicHexesBySize.value.get(size), "volcanic"],
    [iceCapHexesBySize.value.get(size), "icecap"],
    [glacierHexesBySize.value.get(size), "glacier"],
    [iceFieldHexesBySize.value.get(size), "icefield"],
    [frozenLandHexesBySize.value.get(size), "frozenland"],
    [forestBiomeHexesBySize.value.get(size), "forest"],
    [desertHexesBySize.value.get(size), "desert"],
    [arcticBiomeHexesBySize.value.get(size), "tundra"],
    [swampBiomeHexesBySize.value.get(size), "swamp"],
    [exoticHexesBySize.value.get(size), "exotic"],
    [cityHexesBySize.value.get(size), "urban"],
    [flatlandHexesBySize.value.get(size), "plains"],
  ];

  const byKey = new Map();
  for (const [layerMap, terrain] of layerSources) {
    for (const entry of toLayerEntries(layerMap)) {
      const key = String(entry.logicalKey || entry.key || "")
        .trim()
        .split("::")[0];
      if (!key || byKey.has(key)) continue;
      const points = normalizePoints(entry.points);
      if (!points) continue;
      byKey.set(key, { key, points, terrain });
    }
  }

  return byKey;
}

function buildOverlayEntriesByKeyFromRenderedLayers() {
  const layerSources = [
    [activeWaterHexEntries.value, "water"],
    [activeShoreHexEntries.value, "shore"],
    [activeIslandHexEntries.value, "island"],
    [activeHillsHexEntries.value, "hills"],
    [activeMountainHexEntries.value, "mountain"],
    [activeVolcanicHexEntries.value, "volcanic"],
    [activeIceCapHexEntries.value, "icecap"],
    [activeGlacierHexEntries.value, "glacier"],
    [activeIceFieldHexEntries.value, "icefield"],
    [activeFrozenLandHexEntries.value, "frozenland"],
    [activeForestBiomeHexEntries.value, "forest"],
    [activeDesertHexEntries.value, "desert"],
    [activeTundraHexEntries.value, "tundra"],
    [activeSwampBiomeHexEntries.value, "swamp"],
    [activeExoticHexEntries.value, "exotic"],
    [activeCityHexEntries.value, "urban"],
    [activePlainsHexEntries.value, "plains"],
  ];

  const byKey = new Map();
  for (const [entries, terrain] of layerSources) {
    const list = Array.isArray(entries) ? entries : [];
    for (const entry of list) {
      const key = String(entry?.logicalKey || entry?.key || "")
        .trim()
        .split("::")[0];
      const points = normalizePoints(entry?.points || "");
      if (!key || !points || byKey.has(key)) {
        continue;
      }
      byKey.set(key, { key, points, terrain });
    }
  }

  return byKey;
}

function serializeTerrainOverlayBySize(activeSizeOverride = null) {
  const activeSize = Number.isFinite(Number(activeSizeOverride))
    ? Number(activeSizeOverride)
    : activeTerrainTemplateSize.value;
  const nextOverlay =
    selectedWorld.value?.terrainOverlayBySize && typeof selectedWorld.value.terrainOverlayBySize === "object"
      ? { ...selectedWorld.value.terrainOverlayBySize }
      : {};

  let entries = [...buildOverlayEntriesByKeyFromCurrentLayers(activeSize).values()];
  if (!entries.length) {
    entries = [...buildOverlayEntriesByKeyFromRenderedLayers().values()];
  }
  if (entries.length) {
    nextOverlay[String(activeSize)] = entries;
  } else {
    // During route transitions/template swaps, active map cells can momentarily be unavailable.
    // Preserve existing persisted overlay in that transient state to avoid destructive blank writes.
    if (!activeHexCells.value.length) {
      return nextOverlay;
    }
    delete nextOverlay[String(activeSize)];
  }

  return nextOverlay;
}

const TERRAIN_COMPOSITION_TYPE_BY_OVERLAY = Object.freeze({
  water: "Ocean",
  shore: "Shore",
  island: "Islands",
  hills: "Rough",
  plains: "Clear",
  mountain: "Mountain",
  volcanic: "Volcano",
  forest: "Forest",
  swamp: "Wetland",
  tundra: "Tundra",
  icecap: "Ice cap",
  glacier: "Glacier",
  icefield: "Ice field",
  frozenland: "Frozen lands",
  desert: "Desert",
  exotic: "Exotic",
  urban: "Urban",
});

const TERRAIN_COMPOSITION_ORDER = Object.freeze([
  "water",
  "shore",
  "island",
  "mountain",
  "hills",
  "plains",
  "volcanic",
  "forest",
  "swamp",
  "tundra",
  "icecap",
  "glacier",
  "icefield",
  "frozenland",
  "desert",
  "exotic",
  "urban",
]);

function buildTerrainCompositionFromOverlay(activeSizeOverride = null) {
  const activeSize = Number.isFinite(Number(activeSizeOverride))
    ? Number(activeSizeOverride)
    : activeTerrainTemplateSize.value;
  const explicitEntries = buildOverlayEntriesByKeyFromCurrentLayers(activeSize);
  if (!explicitEntries.size) {
    return {
      ...(selectedWorld.value?.terrainComposition && typeof selectedWorld.value.terrainComposition === "object"
        ? selectedWorld.value.terrainComposition
        : {}),
    };
  }
  const countsByTerrain = new Map();

  for (const entry of explicitEntries.values()) {
    const terrain = String(entry?.terrain || "")
      .trim()
      .toLowerCase();
    if (!terrain) {
      continue;
    }

    countsByTerrain.set(terrain, (countsByTerrain.get(terrain) || 0) + 1);
  }

  const totalMapHexes = Math.max(
    0,
    Number(activeHexRenderVariantsByKey.value.size || selectedWorld.value?.terrainComposition?.totalMapHexes || 0),
  );

  const orderedTerrains = [
    ...TERRAIN_COMPOSITION_ORDER.filter((terrain) => (countsByTerrain.get(terrain) || 0) > 0),
    ...[...countsByTerrain.keys()].filter(
      (terrain) => !TERRAIN_COMPOSITION_ORDER.includes(terrain) && (countsByTerrain.get(terrain) || 0) > 0,
    ),
  ];

  const toPercent = (hexes) => {
    if (!totalMapHexes) {
      return "0";
    }
    return String(Math.round((Math.max(0, Number(hexes) || 0) / totalMapHexes) * 100));
  };

  const hexCounts = orderedTerrains.map((terrain) => {
    const hexes = Math.max(0, Number(countsByTerrain.get(terrain) || 0));
    return {
      type: TERRAIN_COMPOSITION_TYPE_BY_OVERLAY[terrain] || terrain,
      hexes,
      percent: toPercent(hexes),
    };
  });

  const surfaceProfile = Array.isArray(selectedWorld.value?.terrainComposition?.surfaceProfile)
    ? [...selectedWorld.value.terrainComposition.surfaceProfile]
    : ["Terrain map overlay committed"];

  return {
    ...(selectedWorld.value?.terrainComposition && typeof selectedWorld.value.terrainComposition === "object"
      ? selectedWorld.value.terrainComposition
      : {}),
    surfaceProfile,
    hexCounts,
    assignedHexes: hexCounts.reduce((sum, entry) => sum + Math.max(0, Number(entry?.hexes) || 0), 0),
    totalMapHexes,
  };
}

function buildTerrainWeightsFromSurveyComposition() {
  const composition = getEffectiveTerrainComposition();
  const counts = Array.isArray(composition?.hexCounts) ? composition.hexCounts : [];
  if (!counts.length) {
    return [];
  }

  const merged = new Map();
  for (const entry of counts) {
    const terrain = mapSurveyTypeToTerrain(entry?.type);
    const hexes = Number(entry?.hexes || 0);
    const percent = Number.parseFloat(String(entry?.percent || "0").replace("%", ""));
    const weight = Number.isFinite(hexes) && hexes > 0 ? hexes : Number.isFinite(percent) && percent > 0 ? percent : 0;
    if (weight <= 0) continue;
    merged.set(terrain, (merged.get(terrain) || 0) + weight);
  }

  return [...merged.entries()].map(([terrain, weight]) => ({ terrain, weight }));
}

function buildTerrainCountPlanFromSurveyComposition() {
  return [...buildTerrainBudgetMapFromSurveyComposition().entries()].map(([terrain, hexes]) => ({ terrain, hexes }));
}

function buildTerrainBudgetMapFromOverlay() {
  const composition = buildTerrainCompositionFromOverlay();
  const counts = Array.isArray(composition?.hexCounts) ? composition.hexCounts : [];
  const merged = new Map();

  for (const entry of counts) {
    const terrain = mapSurveyTypeToTerrain(entry?.type);
    const hexes = Math.max(0, Number(entry?.hexes) || 0);
    if (!terrain || hexes <= 0) {
      continue;
    }
    merged.set(terrain, (merged.get(terrain) || 0) + hexes);
  }

  return merged;
}

const terrainBudgetByType = computed(() => {
  const persistedBudget = buildTerrainBudgetMapFromSurveyComposition();
  const hasLiveOverlay = buildOverlayEntriesByKeyFromCurrentLayers(activeTerrainTemplateSize.value).size > 0;

  if (hasUserInteractedWithTerrain.value && hasLiveOverlay) {
    return buildTerrainBudgetMapFromOverlay();
  }

  return persistedBudget;
});

const activeSurveyPlacedCountsByTerrain = computed(() => {
  const placedByTerrain = new Map();
  const entriesByKey = buildOverlayEntriesByKeyFromCurrentLayers(activeTerrainTemplateSize.value);
  for (const entry of entriesByKey.values()) {
    const terrain = String(entry?.terrain || "")
      .trim()
      .toLowerCase();
    if (!terrain) continue;
    placedByTerrain.set(terrain, (placedByTerrain.get(terrain) || 0) + 1);
  }

  return placedByTerrain;
});

const totalSurveyTargetHexes = computed(() => {
  let total = 0;
  for (const value of terrainBudgetByType.value.values()) {
    total += Math.max(0, Number(value) || 0);
  }
  return total;
});

const totalSurveyPlacedHexes = computed(() => {
  let total = 0;
  for (const terrain of terrainBudgetByType.value.keys()) {
    total += Math.max(0, Number(activeSurveyPlacedCountsByTerrain.value.get(terrain) || 0));
  }
  return total;
});

function formatPlacedVsTarget(label, terrain, placed) {
  const dedupedPlaced = Number(activeSurveyPlacedCountsByTerrain.value.get(terrain) || 0);
  const target = Number(terrainBudgetByType.value.get(terrain) || 0);
  const placedCount =
    Number.isFinite(dedupedPlaced) && dedupedPlaced >= 0 ? dedupedPlaced : Math.max(0, Number(placed) || 0);
  return `${label}: ${placedCount}/${Math.max(0, target)}`;
}

function buildTerrainBudgetMapFromSurveyComposition() {
  const composition = getEffectiveTerrainComposition();
  const counts = Array.isArray(composition?.hexCounts) ? composition.hexCounts : [];
  if (!counts.length) {
    return new Map();
  }

  const merged = new Map();
  const totalMapHexes = Math.max(
    0,
    Number(composition?.totalMapHexes || composition?.assignedHexes || activeHexRenderVariantsByKey.value.size || 0),
  );

  for (const entry of counts) {
    const terrain = mapSurveyTypeToTerrain(entry?.type);
    const hexesValue = Number(entry?.hexes);
    const percentValue = Number.parseFloat(String(entry?.percent || "").replace("%", ""));
    const hexes = Number.isFinite(hexesValue)
      ? Math.max(0, hexesValue)
      : Number.isFinite(percentValue) && percentValue > 0 && totalMapHexes > 0
        ? Math.max(0, Math.round((percentValue / 100) * totalMapHexes))
        : 0;
    if (!Number.isFinite(hexes) || hexes <= 0) continue;
    merged.set(terrain, (merged.get(terrain) || 0) + hexes);
  }

  const capacityHexes = Math.max(0, activeHexRenderVariantsByKey.value.size || totalMapHexes || 0);
  let overage =
    [...merged.values()].reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0) - Math.max(0, capacityHexes);

  if (overage > 0) {
    // Plains are implicit filler terrain, so trim them first when the survey totals
    // overcommit the logical map capacity due rounding or legacy data.
    const trimOrder = [
      "plains",
      "shore",
      "hills",
      "frozenland",
      "volcanic",
      "island",
      "mountain",
      "water",
      "icecap",
      "glacier",
      "icefield",
      "forest",
      "desert",
      "tundra",
      "swamp",
      "urban",
    ];

    for (const terrain of trimOrder) {
      if (overage <= 0) break;
      const current = Math.max(0, Number(merged.get(terrain) || 0));
      if (current <= 0) continue;
      const delta = Math.min(current, overage);
      merged.set(terrain, current - delta);
      overage -= delta;
    }

    if (overage > 0) {
      for (const [terrain, value] of merged.entries()) {
        if (overage <= 0) break;
        const current = Math.max(0, Number(value) || 0);
        if (current <= 0) continue;
        const delta = Math.min(current, overage);
        merged.set(terrain, current - delta);
        overage -= delta;
      }
    }

    for (const [terrain, value] of [...merged.entries()]) {
      if (!Number.isFinite(Number(value)) || Number(value) <= 0) {
        merged.delete(terrain);
      }
    }
  }

  return merged;
}

function buildTerrainInteriorDistanceMap(cells, adjacencyById = new Map()) {
  const distanceByKey = new Map();
  if (!Array.isArray(cells) || !cells.length) {
    return distanceByKey;
  }

  const borderKeys = [];
  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    const neighborCount = adjacencyById.get(key)?.neighbors?.size || 0;
    if (neighborCount < 6) {
      distanceByKey.set(key, 0);
      borderKeys.push(key);
    }
  }

  const queue = [...borderKeys];
  while (queue.length) {
    const key = queue.shift();
    const baseDistance = distanceByKey.get(key) || 0;
    const neighbors = adjacencyById.get(key)?.neighbors || new Set();
    for (const neighborKey of neighbors) {
      const nextDistance = baseDistance + 1;
      // Keep the shortest known distance from any border hex.
      if (distanceByKey.has(neighborKey) && distanceByKey.get(neighborKey) <= nextDistance) {
        continue;
      }
      distanceByKey.set(neighborKey, nextDistance);
      queue.push(neighborKey);
    }
  }

  return distanceByKey;
}

function buildTerrainPlacementScoreMap(cells, seed, adjacencyById = new Map()) {
  const byKey = new Map();
  if (!Array.isArray(cells) || !cells.length) {
    return byKey;
  }

  const cxValues = cells.map((cell) => Number(cell?.cx)).filter(Number.isFinite);
  const cyValues = cells.map((cell) => Number(cell?.cy)).filter(Number.isFinite);
  const centerX = cxValues.length ? cxValues.reduce((sum, value) => sum + value, 0) / cxValues.length : 0;
  const centerY = cyValues.length ? cyValues.reduce((sum, value) => sum + value, 0) / cyValues.length : 0;
  const maxDistance = Math.max(
    1,
    ...cells.map((cell) => Math.hypot(Number(cell?.cx) - centerX, Number(cell?.cy) - centerY)).filter(Number.isFinite),
  );
  const interiorDistanceByKey = buildTerrainInteriorDistanceMap(cells, adjacencyById);
  const maxInteriorDistance = Math.max(1, ...interiorDistanceByKey.values(), 0);

  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    const noise = mulberry32(hashString(`${seed}|${key}`))();
    const centerBias =
      1 - Math.min(1, Math.hypot(Number(cell?.cx) - centerX, Number(cell?.cy) - centerY) / maxDistance);
    const degreeBias = Math.min(1, ((adjacencyById.get(key)?.neighbors?.size || 0) - 2) / 4);
    const interiorBias = Math.min(1, (interiorDistanceByKey.get(key) || 0) / maxInteriorDistance);
    const faceBias = (() => {
      const faceId = normalizeFaceTopologyId(cell?.faceId);
      if (!faceId) return 0;
      return ((hashString(`${seed}|face|${faceId}`) % 1000) / 1000) * 0.15;
    })();

    byKey.set(key, noise * 0.2 + centerBias * 0.15 + degreeBias * 0.3 + interiorBias * 0.35 + faceBias);
  }

  return byKey;
}

function applyTerrainSurveyToMap(options = {}) {
  const trackUserInteraction = options?.trackUserInteraction !== false;
  const persistAfterApply = options?.persistAfterApply !== false;
  if (trackUserInteraction) {
    markTerrainUserInteraction();
  }
  const cells = activeHexCells.value;
  if (!cells.length) {
    return false;
  }

  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  if (!budgetMap.size) {
    return false;
  }

  const sourceComposition = getEffectiveTerrainComposition();
  const sourceCounts = Array.isArray(sourceComposition?.hexCounts) ? sourceComposition.hexCounts : [];
  const normalizeSurveyType = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const sumHexesForTypes = (types = []) => {
    const lookup = new Set(types.map((value) => normalizeSurveyType(value)));
    return sourceCounts
      .filter((entry) => lookup.has(normalizeSurveyType(entry?.type)))
      .reduce((sum, entry) => sum + Math.max(0, Number(entry?.hexes) || 0), 0);
  };
  const requestedLakeHexes = sumHexesForTypes(["lake", "lakes", "river", "rivers"]);
  const requestedRoughWoodsHexes = sumHexesForTypes(["rough woods"]);
  const requestedWetWoodsHexes = sumHexesForTypes(["wet woods"]);

  const positiveTerrains = [...budgetMap.entries()]
    .filter(([, hexes]) => Number(hexes) > 0)
    .map(([terrain]) =>
      String(terrain || "")
        .trim()
        .toLowerCase(),
    );
  const hasOnlyOceanIslandShore =
    positiveTerrains.length > 0 && positiveTerrains.every((terrain) => ["water", "island", "shore"].includes(terrain));
  if (hasOnlyOceanIslandShore) {
    const shoreBudget = Math.max(0, Number(budgetMap.get("shore") || 0));
    if (shoreBudget > 0) {
      budgetMap.set("island", Math.max(0, Number(budgetMap.get("island") || 0)) + shoreBudget);
      budgetMap.set("shore", 0);
    }
  }

  const size = activeTerrainTemplateSize.value;
  const worldName = String(worldInfo.value?.name || "").trim();
  const countPlan = [...budgetMap.entries()].map(([terrain, hexes]) => [terrain, hexes]);
  const seedSalt = String(options?.seedSalt || "").trim();
  const seed = hashString(
    `${worldName}|${systemInfo.value.hex}|${size}|overlay-seed|${JSON.stringify(countPlan)}|${seedSalt}`,
  );
  const adjacency = buildHexAdjacencyGraph(cells);
  const scoreByKey = buildTerrainPlacementScoreMap(cells, seed, adjacency.byId);
  const entriesByKey = new Map();

  const allCellsByKey = new Map(cells.map((cell) => [String(cell?.key || "").trim(), cell]));
  const availableKeys = new Set(allCellsByKey.keys());
  const cyValues = cells.map((cell) => Number(cell?.cy)).filter(Number.isFinite);
  const minY = cyValues.length ? Math.min(...cyValues) : 0;
  const maxY = cyValues.length ? Math.max(...cyValues) : 0;
  const halfSpan = Math.max(1, (maxY - minY) / 2);
  const midY = (maxY + minY) / 2;
  const orderedCellsDesc = [...cells]
    .filter((cell) => String(cell?.key || "").trim())
    .sort(
      (left, right) => (scoreByKey.get(String(right.key || "")) || 0) - (scoreByKey.get(String(left.key || "")) || 0),
    );
  const orderedCellsAsc = [...orderedCellsDesc].reverse();

  const takeCells = (pool, count, comparator = null) => {
    const taken = [];
    const sortedPool = comparator ? [...pool].sort(comparator) : [...pool];
    for (const cell of sortedPool) {
      if (taken.length >= count) break;
      const key = String(cell?.key || "").trim();
      if (!key || !availableKeys.has(key)) continue;
      taken.push(cell);
      availableKeys.delete(key);
    }
    return taken;
  };

  const selectClusteredCells = (targetCount, pool, terrainLabel, options = {}) => {
    const requested = Math.max(0, Number(targetCount) || 0);
    if (requested <= 0 || !Array.isArray(pool) || !pool.length) {
      return [];
    }

    const candidateByKey = new Map();
    for (const cell of pool) {
      const key = String(cell?.key || "").trim();
      if (!key || !availableKeys.has(key) || entriesByKey.has(key)) {
        continue;
      }
      if (!candidateByKey.has(key)) {
        candidateByKey.set(key, cell);
      }
    }
    if (!candidateByKey.size) {
      return [];
    }

    const rng = mulberry32(hashString(`${seed}|${terrainLabel}|cluster|${String(options?.salt || "")}`));
    const continuationBias = clamp(Number(options?.continuationBias ?? 0.72), 0, 1);
    const neighborBias = clamp(Number(options?.neighborBias ?? 0.65), 0, 1);
    const remaining = new Set(candidateByKey.keys());
    const selectedKeys = [];
    const frontier = [];
    const frontierSeen = new Set();
    let lastSeedKey = null;

    const pickRandom = (items) => {
      if (!Array.isArray(items) || !items.length) return null;
      const idx = Math.floor(rng() * items.length);
      return items[Math.max(0, Math.min(items.length - 1, idx))] || null;
    };

    const shuffleWithRng = (items) => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    };

    if (options?.preferConnectedToExisting) {
      const existingTerrain = String(options?.existingTerrainLabel || terrainLabel)
        .trim()
        .toLowerCase();
      const connectedSeeds = new Set();

      for (const [existingKey, existingEntry] of entriesByKey.entries()) {
        const existingEntryTerrain = String(existingEntry?.terrain || "")
          .trim()
          .toLowerCase();
        if (!existingKey || existingEntryTerrain !== existingTerrain) {
          continue;
        }

        const neighbors = adjacency.byId.get(existingKey)?.neighbors || new Set();
        for (const neighborKeyRaw of neighbors) {
          const neighborKey = String(neighborKeyRaw || "").trim();
          if (neighborKey && remaining.has(neighborKey)) {
            connectedSeeds.add(neighborKey);
          }
        }
      }

      for (const key of shuffleWithRng([...connectedSeeds])) {
        if (!frontierSeen.has(key)) {
          frontier.push(key);
          frontierSeen.add(key);
        }
      }
    }

    while (selectedKeys.length < requested && remaining.size > 0) {
      const canContinueCurrentCluster = frontier.length > 0 && rng() < continuationBias;
      if (!canContinueCurrentCluster) {
        if (frontier.length && rng() > neighborBias) {
          frontier.length = 0;
          frontierSeen.clear();
        }
      }

      if (!frontier.length) {
        const seedKey = pickRandom([...remaining]);
        if (!seedKey) break;
        frontier.push(seedKey);
        frontierSeen.add(seedKey);
        lastSeedKey = seedKey;
      }

      const key = frontier.splice(Math.floor(rng() * frontier.length), 1)[0];
      if (!key || !remaining.has(key)) {
        continue;
      }

      remaining.delete(key);
      selectedKeys.push(key);
      lastSeedKey = key;

      const neighborKeys = adjacency.byId.get(key)?.neighbors || new Set();
      const candidateNeighbors = [];
      for (const neighborKeyRaw of neighborKeys) {
        const neighborKey = String(neighborKeyRaw || "").trim();
        if (!neighborKey || !remaining.has(neighborKey) || frontierSeen.has(neighborKey)) {
          continue;
        }
        candidateNeighbors.push(neighborKey);
      }

      for (const neighborKey of shuffleWithRng(candidateNeighbors)) {
        frontier.push(neighborKey);
        frontierSeen.add(neighborKey);
      }
    }

    const selectedCells = [];
    for (const key of selectedKeys) {
      const cell = candidateByKey.get(key);
      if (!cell) continue;
      selectedCells.push(cell);
      availableKeys.delete(key);
    }
    return selectedCells;
  };

  const axialTilt = clamp(Number(selectedWorld.value?.axialTilt) || 0, 0, 90);
  const axialTiltRatio = axialTilt / 90;
  // Lower tilt favors broader permanent polar caps; higher tilt narrows stable cap zones.
  const iceCapPolarStart = clamp(0.62 + axialTiltRatio * 0.18, 0.58, 0.82);

  const getLatitudeAbs = (cell) => {
    const cy = Number(cell?.cy);
    if (!Number.isFinite(cy)) {
      return 0;
    }
    return Math.abs((cy - midY) / halfSpan);
  };

  const {
    waterCount: oceanCount,
    mountainCount,
    shoreCount,
  } = resolveTerrainCoreCountsFromBudget(budgetMap, cells.length);

  const lakeHexCount = Math.min(Math.max(0, requestedLakeHexes), oceanCount);
  const openOceanCount = Math.max(0, oceanCount - lakeHexCount);

  const capPreWaterPlacement = (requestedCount) => {
    const requested = Math.max(0, Number(requestedCount) || 0);
    // Reserve enough free hexes so ocean can always hit its budget target.
    const maxAllowed = Math.max(0, availableKeys.size - openOceanCount - lakeHexCount);
    return Math.min(requested, maxAllowed);
  };

  const requestedIceCapCount = clamp(Number(budgetMap.get("icecap") || 0), 0, cells.length);
  if (requestedIceCapCount > 0) {
    const iceCapCandidates = [...cells]
      .filter((cell) => {
        const key = String(cell?.key || "").trim();
        return key && availableKeys.has(key) && getLatitudeAbs(cell) >= iceCapPolarStart;
      })
      .sort((left, right) => getLatitudeAbs(right) - getLatitudeAbs(left));

    // Prioritize polar cells first, but still allow spillover placement across remaining cells
    // when the requested ice-cap budget exceeds strict polar availability.
    const fallbackCandidates = [...cells]
      .filter((cell) => {
        const key = String(cell?.key || "").trim();
        return key && availableKeys.has(key);
      })
      .sort((left, right) => getLatitudeAbs(right) - getLatitudeAbs(left));

    const seenKeys = new Set();
    const prioritizedIceCapPool = [];
    for (const cell of [...iceCapCandidates, ...fallbackCandidates]) {
      const key = String(cell?.key || "").trim();
      if (!key || seenKeys.has(key)) continue;
      seenKeys.add(key);
      prioritizedIceCapPool.push(cell);
    }

    const iceCapCells = selectClusteredCells(
      capPreWaterPlacement(requestedIceCapCount),
      prioritizedIceCapPool,
      "icecap",
      {
        preferConnectedToExisting: true,
        existingTerrainLabel: "icecap",
        continuationBias: 0.9,
        neighborBias: 0.82,
      },
    );
    for (const cell of iceCapCells) {
      const key = String(cell?.key || "").trim();
      if (!key) continue;
      entriesByKey.set(key, {
        points: normalizePoints(cell?.points || ""),
        terrain: "icecap",
      });
    }
  }

  const requestedGlacierCount = clamp(Number(budgetMap.get("glacier") || 0), 0, cells.length);
  if (requestedGlacierCount > 0) {
    const glacierCandidates = [...cells]
      .filter((cell) => {
        const key = String(cell?.key || "").trim();
        return key && availableKeys.has(key);
      })
      .sort((left, right) => getLatitudeAbs(right) - getLatitudeAbs(left));

    const glacierCells = selectClusteredCells(
      capPreWaterPlacement(requestedGlacierCount),
      glacierCandidates,
      "glacier",
      {
        preferConnectedToExisting: true,
        existingTerrainLabel: "glacier",
        continuationBias: 0.88,
        neighborBias: 0.8,
      },
    );
    for (const cell of glacierCells) {
      const key = String(cell?.key || "").trim();
      if (!key) continue;
      entriesByKey.set(key, {
        points: normalizePoints(cell?.points || ""),
        terrain: "glacier",
      });
    }
  }

  const mountainCells = selectClusteredCells(capPreWaterPlacement(mountainCount), orderedCellsDesc, "mountain", {
    preferConnectedToExisting: true,
    existingTerrainLabel: "mountain",
    continuationBias: 0.82,
    neighborBias: 0.76,
  });
  for (const cell of mountainCells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    entriesByKey.set(key, {
      points: normalizePoints(cell?.points || ""),
      terrain: "mountain",
    });
  }

  const waterCandidates = orderedCellsAsc.filter((cell) => !entriesByKey.has(String(cell?.key || "").trim()));
  const waterCells = selectClusteredCells(openOceanCount, waterCandidates, "water", {
    preferConnectedToExisting: true,
    existingTerrainLabel: "water",
    continuationBias: 0.94,
    neighborBias: 0.86,
  });
  const oceanKeys = new Set();
  for (const cell of waterCells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    oceanKeys.add(key);
    entriesByKey.set(key, {
      points: normalizePoints(cell?.points || ""),
      terrain: "water",
    });
  }

  if (lakeHexCount > 0) {
    const lakeCandidates = orderedCellsDesc.filter((cell) => {
      const key = String(cell?.key || "").trim();
      if (!key || entriesByKey.has(key)) {
        return false;
      }
      const neighborKeys = adjacency.byId.get(key)?.neighbors || new Set();
      for (const neighborKey of neighborKeys) {
        if (oceanKeys.has(String(neighborKey || "").trim())) {
          return false;
        }
      }
      return true;
    });

    const lakeCells = selectClusteredCells(lakeHexCount, lakeCandidates, "lake", {
      preferConnectedToExisting: true,
      existingTerrainLabel: "water",
      continuationBias: 0.9,
      neighborBias: 0.82,
    });

    for (const cell of lakeCells) {
      const key = String(cell?.key || "").trim();
      if (!key) continue;
      entriesByKey.set(key, {
        points: normalizePoints(cell?.points || ""),
        terrain: "water",
      });
    }
  }

  const secondaryTerrains = countPlan.filter(
    ([terrain]) => !["mountain", "water", "shore", "icecap", "glacier"].includes(terrain),
  );
  secondaryTerrains.sort((left, right) => {
    const leftIsPlains = left[0] === "plains";
    const rightIsPlains = right[0] === "plains";
    if (leftIsPlains && !rightIsPlains) return 1;
    if (!leftIsPlains && rightIsPlains) return -1;
    return 0;
  });
  const remainingCells = [...cells].filter((cell) => {
    const key = String(cell?.key || "").trim();
    return key && !entriesByKey.has(key);
  });

  const reservedShore = Math.min(remainingCells.length, shoreCount);
  const explicitTerrainCounts = new Map();
  for (const [terrain, hexes] of secondaryTerrains) {
    explicitTerrainCounts.set(terrain, Math.max(0, Number(hexes) || 0));
  }

  let placedNonPlainsSecondaryCount = 0;
  const placeSecondaryTerrainCell = (terrain, cell) => {
    const key = String(cell?.key || "").trim();
    if (!key || entriesByKey.has(key)) {
      return false;
    }
    entriesByKey.set(key, {
      points: normalizePoints(cell?.points || ""),
      terrain,
    });
    placedNonPlainsSecondaryCount += 1;
    explicitTerrainCounts.set(terrain, Math.max(0, Number(explicitTerrainCounts.get(terrain) || 0) - 1));
    return true;
  };

  const placeTerrainWithGlobalLimit = (terrain, count) => {
    const requested = Math.max(0, Number(count) || 0);
    for (let placed = 0; placed < requested; ) {
      const maxNonPlainsAllowed = Math.max(0, remainingCells.length - reservedShore - placedNonPlainsSecondaryCount);
      if (maxNonPlainsAllowed <= 0) break;
      const candidates = orderedCellsDesc.filter((cell) => {
        const key = String(cell?.key || "").trim();
        return key && availableKeys.has(key) && !entriesByKey.has(key);
      });
      const chunk = Math.min(requested - placed, maxNonPlainsAllowed);
      const selectedCells = selectClusteredCells(chunk, candidates, terrain, {
        preferConnectedToExisting: true,
        existingTerrainLabel: terrain,
        continuationBias: terrain === "volcanic" ? 0.72 : 0.68,
        neighborBias: terrain === "volcanic" ? 0.7 : 0.66,
      });
      if (!selectedCells.length) {
        break;
      }
      for (const selectedCell of selectedCells) {
        if (placeSecondaryTerrainCell(terrain, selectedCell)) {
          placed += 1;
        }
      }
    }
  };

  const placePlainsWithReserve = (count) => {
    const requested = Math.max(0, Number(count) || 0);
    if (requested <= 0) return;

    const plainsCandidates = orderedCellsAsc.filter((cell) => {
      const key = String(cell?.key || "").trim();
      return key && !entriesByKey.has(key);
    });

    let placed = 0;
    for (;;) {
      if (placed >= requested) break;

      // Keep enough unassigned hexes available for shoreline conversion.
      const remainingUnassigned = cells.length - entriesByKey.size;
      const maxPlainsAllowed = Math.max(0, remainingUnassigned - reservedShore);
      if (maxPlainsAllowed <= 0) {
        break;
      }

      const chunk = Math.min(requested - placed, maxPlainsAllowed);
      const selectedCells = selectClusteredCells(chunk, plainsCandidates, "plains", {
        preferConnectedToExisting: true,
        existingTerrainLabel: "plains",
        continuationBias: 0.45,
        neighborBias: 0.5,
      });
      if (!selectedCells.length) {
        break;
      }

      for (const selectedCell of selectedCells) {
        const key = String(selectedCell?.key || "").trim();
        if (!key || entriesByKey.has(key)) continue;
        entriesByKey.set(key, {
          points: normalizePoints(selectedCell?.points || ""),
          terrain: "plains",
        });
        placed += 1;
      }
    }
  };

  // Place anchor terrains first so constrained woods can reference final neighbors.
  placeTerrainWithGlobalLimit("hills", explicitTerrainCounts.get("hills") || 0);
  placeTerrainWithGlobalLimit("swamp", explicitTerrainCounts.get("swamp") || 0);

  const hasNeighborTerrain = (key, requiredTerrains) => {
    const neighborKeys = adjacency.byId.get(key)?.neighbors || new Set();
    for (const neighborKey of neighborKeys) {
      const normalizedNeighbor = String(neighborKey || "").trim();
      const neighborTerrain = String(entriesByKey.get(normalizedNeighbor)?.terrain || "plains");
      if (requiredTerrains.has(neighborTerrain)) {
        return true;
      }
    }
    return false;
  };

  const placeConstrainedForest = (count, requiredTerrains) => {
    const requested = Math.max(0, Number(count) || 0);
    let placed = 0;
    if (requested <= 0) return 0;
    const candidates = orderedCellsDesc.filter((cell) => {
      const key = String(cell?.key || "").trim();
      return key && !entriesByKey.has(key) && hasNeighborTerrain(key, requiredTerrains);
    });
    for (;;) {
      if (placed >= requested) break;
      const maxNonPlainsAllowed = Math.max(0, remainingCells.length - reservedShore - placedNonPlainsSecondaryCount);
      if (maxNonPlainsAllowed <= 0) break;
      const chunk = Math.min(requested - placed, maxNonPlainsAllowed);
      const selectedCells = selectClusteredCells(chunk, candidates, "forest", {
        preferConnectedToExisting: true,
        existingTerrainLabel: "forest",
        continuationBias: 0.76,
        neighborBias: 0.7,
      });
      if (!selectedCells.length) {
        break;
      }
      for (const selectedCell of selectedCells) {
        if (placeSecondaryTerrainCell("forest", selectedCell)) {
          placed += 1;
        }
      }
    }
    return placed;
  };

  const placeConstrainedTerrain = (terrain, count, requiredTerrains) => {
    const requested = Math.max(0, Number(count) || 0);
    let placed = 0;
    if (requested <= 0) return 0;
    const candidates = orderedCellsDesc.filter((cell) => {
      const key = String(cell?.key || "").trim();
      return key && !entriesByKey.has(key) && hasNeighborTerrain(key, requiredTerrains);
    });
    for (;;) {
      if (placed >= requested) break;
      const maxNonPlainsAllowed = Math.max(0, remainingCells.length - reservedShore - placedNonPlainsSecondaryCount);
      if (maxNonPlainsAllowed <= 0) break;
      const chunk = Math.min(requested - placed, maxNonPlainsAllowed);
      const selectedCells = selectClusteredCells(chunk, candidates, terrain, {
        preferConnectedToExisting: true,
        existingTerrainLabel: terrain,
        continuationBias: 0.7,
        neighborBias: 0.68,
      });
      if (!selectedCells.length) {
        break;
      }
      for (const selectedCell of selectedCells) {
        if (placeSecondaryTerrainCell(terrain, selectedCell)) {
          placed += 1;
        }
      }
    }
    return placed;
  };

  const roughWoodsTarget = Math.min(
    Math.max(0, requestedRoughWoodsHexes),
    Math.max(0, Number(explicitTerrainCounts.get("forest") || 0)),
  );
  placeConstrainedForest(roughWoodsTarget, new Set(["hills"]));

  const wetWoodsTarget = Math.min(
    Math.max(0, requestedWetWoodsHexes),
    Math.max(0, Number(explicitTerrainCounts.get("forest") || 0)),
  );
  placeConstrainedForest(wetWoodsTarget, new Set(["swamp"]));

  placeTerrainWithGlobalLimit("forest", explicitTerrainCounts.get("forest") || 0);

  const volcanicTarget = Math.max(0, Number(explicitTerrainCounts.get("volcanic") || 0));
  if (volcanicTarget > 0) {
    const placedAdjacentMountain = placeConstrainedTerrain("volcanic", volcanicTarget, new Set(["mountain"]));
    const remainingAfterMountain = Math.max(0, volcanicTarget - placedAdjacentMountain);
    const placedAdjacentHills = placeConstrainedTerrain("volcanic", remainingAfterMountain, new Set(["hills"]));
    const remainingVolcanic = Math.max(0, remainingAfterMountain - placedAdjacentHills);
    if (remainingVolcanic > 0) {
      placeTerrainWithGlobalLimit("volcanic", remainingVolcanic);
    }
  }

  for (const [terrain, hexes] of secondaryTerrains) {
    const requestedHexes = Math.max(0, Number(hexes) || 0);
    if (requestedHexes <= 0 || ["plains", "hills", "swamp", "forest", "volcanic"].includes(terrain)) {
      continue;
    }
    placeTerrainWithGlobalLimit(terrain, explicitTerrainCounts.get(terrain) || requestedHexes);
  }

  const requestedPlainsCount = Math.max(0, Number(explicitTerrainCounts.get("plains") || 0));
  placePlainsWithReserve(requestedPlainsCount);

  // Apply shoreline last so coastline follows the final land/water layout.
  const shoreCandidates = [];
  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;

    const currentTerrain = String(entriesByKey.get(key)?.terrain || "plains");
    if (currentTerrain !== "plains") {
      continue;
    }

    const neighborKeys = adjacency.byId.get(key)?.neighbors || [];
    let waterNeighborCount = 0;
    let landNeighborCount = 0;
    for (const neighborKey of Array.from(neighborKeys)) {
      if (oceanKeys.has(String(neighborKey || "").trim())) {
        waterNeighborCount += 1;
        continue;
      }
      const neighborTerrain = String(entriesByKey.get(neighborKey)?.terrain || "plains");
      if (neighborTerrain !== "island") {
        landNeighborCount += 1;
      }
    }

    if (waterNeighborCount <= 0 || landNeighborCount <= 0) {
      continue;
    }

    shoreCandidates.push({
      cell,
      waterNeighborCount,
      landNeighborCount,
      score: scoreByKey.get(key) || 0,
    });
  }

  shoreCandidates.sort((left, right) => {
    if (right.waterNeighborCount !== left.waterNeighborCount) {
      return right.waterNeighborCount - left.waterNeighborCount;
    }
    if (right.landNeighborCount !== left.landNeighborCount) {
      return right.landNeighborCount - left.landNeighborCount;
    }
    return right.score - left.score;
  });

  const hasStableLandNeighborForShore = (hexKey, selectedShoreKeys = new Set()) => {
    const neighborKeys = adjacency.byId.get(hexKey)?.neighbors || [];
    for (const neighborKey of Array.from(neighborKeys)) {
      if (oceanKeys.has(String(neighborKey || "").trim())) {
        continue;
      }
      const neighborTerrain = String(entriesByKey.get(neighborKey)?.terrain || "plains");
      if (!["water", "shore", "island", "plains"].includes(neighborTerrain)) {
        return true;
      }
      // Plains can anchor shoreline only when they are not selected as shore in the final state.
      if (neighborTerrain === "plains" && !selectedShoreKeys.has(String(neighborKey || "").trim())) {
        return true;
      }
    }
    return false;
  };

  let placedShoreCount = 0;
  const shoreCandidateKeys = new Set(shoreCandidates.map(({ cell }) => String(cell?.key || "").trim()).filter(Boolean));
  const selectedShoreKeys = new Set();
  for (const { cell } of shoreCandidates) {
    if (placedShoreCount >= shoreCount) {
      break;
    }
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    const currentTerrain = String(entriesByKey.get(key)?.terrain || "plains");
    if (currentTerrain !== "plains") {
      continue;
    }

    const nextSelected = new Set(selectedShoreKeys);
    nextSelected.add(key);

    // Ensure the new shore hex and nearby already-selected shore hexes remain valid
    // against the final selected shoreline set.
    const impactedKeys = [key];
    const neighborKeys = adjacency.byId.get(key)?.neighbors || [];
    for (const neighborKey of Array.from(neighborKeys)) {
      const normalizedNeighborKey = String(neighborKey || "").trim();
      if (selectedShoreKeys.has(normalizedNeighborKey)) {
        impactedKeys.push(normalizedNeighborKey);
      }
    }

    const keepsStableLandAnchor = impactedKeys.every((candidateKey) =>
      hasStableLandNeighborForShore(candidateKey, nextSelected),
    );
    if (!keepsStableLandAnchor) {
      continue;
    }

    entriesByKey.set(key, {
      points: normalizePoints(cell?.points || ""),
      terrain: "shore",
    });
    selectedShoreKeys.add(key);
    shoreCandidateKeys.delete(key);
    placedShoreCount += 1;
  }

  if (requestedPlainsCount > 0) {
    let currentPlainsCount = 0;
    for (const entry of entriesByKey.values()) {
      if (String(entry?.terrain || "") === "plains") {
        currentPlainsCount += 1;
      }
    }

    const plainsDeficit = Math.max(0, requestedPlainsCount - currentPlainsCount);
    if (plainsDeficit > 0) {
      const fallbackPlainsCells = orderedCellsAsc.filter((cell) => {
        const key = String(cell?.key || "").trim();
        return key && !entriesByKey.has(key);
      });

      let toppedUp = 0;
      for (const cell of fallbackPlainsCells) {
        if (toppedUp >= plainsDeficit) break;
        const key = String(cell?.key || "").trim();
        if (!key || entriesByKey.has(key)) continue;
        entriesByKey.set(key, {
          points: normalizePoints(cell?.points || ""),
          terrain: "plains",
        });
        toppedUp += 1;
      }
    }
  }

  // Leave remaining unassigned cells implicit as a final fallback.

  useSurveyOverlayHexes.value = true;
  applySurveyOverlayTerrainForSize(size, entriesByKey);
  placeTectonicLines();
  if (persistAfterApply) {
    queueTerrainOverlayPersist();
  }
  return true;
}

function applyFallbackTerrainOverlay() {
  markTerrainUserInteraction();
  const cells = activeHexCells.value;
  if (!cells.length) {
    return false;
  }

  const size = activeTerrainTemplateSize.value;
  const worldName = String(worldInfo.value?.name || "").trim();
  const seed = hashString(
    `${worldName}|${systemInfo.value.hex}|${size}|fallback-overlay|${worldInfo.value.hydrographics}`,
  );
  const rand = mulberry32(seed);
  const targetWaterCount = clamp(Math.round(cells.length * hydroTargetRatio.value), 0, cells.length);
  const waterCells = new Set(
    buildRandomWaterCells(cells, targetWaterCount, rand).map((cell) => String(cell?.key || "").trim()),
  );

  const entriesByKey = new Map();
  for (const cell of cells) {
    const key = String(cell?.key || "").trim();
    if (!key) continue;
    entriesByKey.set(key, {
      points: normalizePoints(cell?.points || ""),
      terrain: waterCells.has(key) ? "water" : "plains",
    });
  }

  useSurveyOverlayHexes.value = true;
  applySurveyOverlayTerrainForSize(size, entriesByKey);
  placeTectonicLines();
  queueTerrainOverlayPersist();
  return true;
}

function applyOverlayPaintAtHex(key, points) {
  const size = activeTerrainTemplateSize.value;
  const normalizedKey = String(key || "").trim();
  const normalizedPoints = normalizePoints(points);
  if (!normalizedKey || !normalizedPoints) {
    return;
  }

  const layerRefs = [
    waterHexesBySize,
    shoreHexesBySize,
    flatlandHexesBySize,
    islandHexesBySize,
    hillsHexesBySize,
    forestBiomeHexesBySize,
    mountainHexesBySize,
    volcanicHexesBySize,
    iceCapHexesBySize,
    glacierHexesBySize,
    iceFieldHexesBySize,
    frozenLandHexesBySize,
    desertHexesBySize,
    arcticBiomeHexesBySize,
    swampBiomeHexesBySize,
    cityHexesBySize,
  ];

  const cleanedLayers = [];
  for (const layerRef of layerRefs) {
    const nextBySize = new Map(layerRef.value);
    const mapForSize = new Map(nextBySize.get(size) || []);
    mapForSize.delete(normalizedKey);
    if (mapForSize.size) {
      nextBySize.set(size, mapForSize);
    } else {
      nextBySize.delete(size);
    }
    cleanedLayers.push([layerRef, nextBySize]);
  }

  for (const [layerRef, nextBySize] of cleanedLayers) {
    layerRef.value = nextBySize;
  }

  const selected = selectedOverlayTerrain.value;
  if (selected === null) {
    queueTerrainOverlayPersist();
    return;
  }

  const targetByTerrain = {
    water: waterHexesBySize,
    plains: flatlandHexesBySize,
    island: islandHexesBySize,
    hills: hillsHexesBySize,
    forest: forestBiomeHexesBySize,
    mountain: mountainHexesBySize,
    volcanic: volcanicHexesBySize,
    icecap: iceCapHexesBySize,
    glacier: glacierHexesBySize,
    icefield: iceFieldHexesBySize,
    frozenland: frozenLandHexesBySize,
    desert: desertHexesBySize,
    tundra: arcticBiomeHexesBySize,
    swamp: swampBiomeHexesBySize,
    urban: cityHexesBySize,
  };

  const targetRef = targetByTerrain[selected];
  if (!targetRef) {
    queueTerrainOverlayPersist();
    return;
  }

  const nextBySize = new Map(targetRef.value);
  const mapForSize = new Map(nextBySize.get(size) || []);
  mapForSize.set(normalizedKey, { points: normalizedPoints });
  nextBySize.set(size, mapForSize);
  targetRef.value = nextBySize;

  queueTerrainOverlayPersist();
}

function resolveSerializedEntryKeyToTemplateKey(rawKey, rawPoints) {
  const key = String(rawKey || "").trim();
  const points = normalizePoints(rawPoints || "");
  const variantsByKey = activeHexRenderVariantsByKey.value;
  const canonicalByHexId = activeHexCanonicalByHexId.value;

  // Match by exact polygon points first (most reliable)
  const cellsByPoints = new Map();
  for (const cell of activeHexCells.value) {
    const p = normalizePoints(cell?.points || "");
    if (p && !cellsByPoints.has(p)) cellsByPoints.set(p, cell);
  }
  if (points && cellsByPoints.has(points)) {
    return String(cellsByPoints.get(points).key || "").trim();
  }

  // If the key already corresponds to a render variant, keep it
  if (variantsByKey.has(key)) return key;

  // Try hex-id -> canonical key map
  const mappedHexKey = canonicalByHexId.get(key);
  if (mappedHexKey && variantsByKey.has(mappedHexKey)) return mappedHexKey;

  // Try general canonicalization
  const canonicalKey = canonicalizeHexId(key);
  if (canonicalKey && variantsByKey.has(canonicalKey)) return canonicalKey;

  // Fallback: scan active cells for any matching metadata
  for (const cell of activeHexCells.value) {
    if (!cell) continue;
    if (
      String(cell.key || "") === key ||
      String(cell.hexId || "") === key ||
      String(cell.canonicalHexId || "") === key ||
      normalizePoints(cell.points || "") === points
    ) {
      return String(cell.key || "").trim();
    }
  }

  return key;
}

function applySurveyOverlayTerrainForSize(size, entriesByKey) {
  isApplyingOverlayLayers.value = true;
  try {
    resetTerrainLayersForSize(size);

    const water = new Map();
    const shore = new Map();
    const flatlands = new Map();
    const islands = new Map();
    const forests = new Map();
    const hills = new Map();
    const mountains = new Map();
    const volcanic = new Map();
    const iceCaps = new Map();
    const glaciers = new Map();
    const iceFields = new Map();
    const frozenLands = new Map();
    const deserts = new Map();
    const arctic = new Map();
    const swamps = new Map();
    const exotic = new Map();
    const cities = new Map();

    for (const [rawKey, value] of entriesByKey.entries()) {
      const resolvedKey = resolveSerializedEntryKeyToTemplateKey(rawKey, value?.points);
      if (resolvedKey !== String(rawKey || "").trim()) {
        console.log("[TERRAIN APPLY] remapped key", { from: rawKey, to: resolvedKey });
      }
      const payload = { points: value.points };
      switch (value.terrain) {
        case "water":
          water.set(resolvedKey, payload);
          break;
        case "shore":
          shore.set(resolvedKey, payload);
          break;
        case "plains":
          flatlands.set(resolvedKey, payload);
          break;
        case "island":
          islands.set(resolvedKey, payload);
          break;
        case "hills":
          hills.set(resolvedKey, payload);
          break;
        case "forest":
          forests.set(resolvedKey, payload);
          break;
        case "mountain":
          mountains.set(resolvedKey, payload);
          break;
        case "volcanic":
          volcanic.set(resolvedKey, payload);
          break;
        case "icecap":
          iceCaps.set(resolvedKey, payload);
          break;
        case "glacier":
          glaciers.set(resolvedKey, payload);
          break;
        case "icefield":
          iceFields.set(resolvedKey, payload);
          break;
        case "frozenland":
          frozenLands.set(resolvedKey, payload);
          break;
        case "desert":
          deserts.set(resolvedKey, payload);
          break;
        case "tundra":
          arctic.set(resolvedKey, payload);
          break;
        case "swamp":
          swamps.set(resolvedKey, payload);
          break;
        case "exotic":
          exotic.set(resolvedKey, payload);
          break;
        case "urban":
          cities.set(resolvedKey, payload);
          break;
        default:
          flatlands.set(resolvedKey, payload);
          break;
      }
    }

    setLayerMapForSize(waterHexesBySize, size, water);
    setLayerMapForSize(shoreHexesBySize, size, shore);
    setLayerMapForSize(flatlandHexesBySize, size, flatlands);
    setLayerMapForSize(islandHexesBySize, size, islands);
    setLayerMapForSize(hillsHexesBySize, size, hills);
    setLayerMapForSize(forestBiomeHexesBySize, size, forests);
    setLayerMapForSize(mountainHexesBySize, size, mountains);
    setLayerMapForSize(volcanicHexesBySize, size, volcanic);
    setLayerMapForSize(iceCapHexesBySize, size, iceCaps);
    setLayerMapForSize(glacierHexesBySize, size, glaciers);
    setLayerMapForSize(iceFieldHexesBySize, size, iceFields);
    setLayerMapForSize(frozenLandHexesBySize, size, frozenLands);
    setLayerMapForSize(desertHexesBySize, size, deserts);
    setLayerMapForSize(arcticBiomeHexesBySize, size, arctic);
    setLayerMapForSize(swampBiomeHexesBySize, size, swamps);
    setLayerMapForSize(exoticHexesBySize, size, exotic);
    setLayerMapForSize(cityHexesBySize, size, cities);
  } finally {
    isApplyingOverlayLayers.value = false;
  }
}

function tryApplySurveyOverlayTerrain() {
  const size = activeTerrainTemplateSize.value;
  const cells = activeHexCells.value;
  const bySize = selectedWorld.value?.terrainOverlayBySize;
  const terrainMapWasGenerated = selectedWorld.value?.terrainMapGenerated === true;
  // DEBUG: terrain read path
  let serialized = bySize && typeof bySize === "object" ? bySize[String(size)] : null;
  let fallbackKeyUsed = null;
  if (!serialized && bySize && typeof bySize === "object") {
    const fallbackKey = Object.keys(bySize).find((key) => {
      const value = bySize[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
    });
    if (fallbackKey) {
      serialized = bySize[fallbackKey];
      fallbackKeyUsed = fallbackKey;
    }
  }
  console.log("[TERRAIN READ] tryApplySurveyOverlayTerrain", {
    size,
    cellCount: cells.length,
    terrainMapWasGenerated,
    bySizeKeys: bySize && typeof bySize === "object" ? Object.keys(bySize) : "null/missing",
    exactKeyMatch: bySize && typeof bySize === "object" ? bySize[String(size)] !== undefined : false,
    fallbackKeyUsed,
    serializedLength: Array.isArray(serialized)
      ? serialized.length
      : serialized && typeof serialized === "object"
        ? Object.keys(serialized).length
        : 0,
    useSurveyOverlay: useSurveyOverlayHexes.value,
  });
  const entriesByKey = normalizeOverlayEntriesByKey(serialized);
  const inMemoryEntriesByKey = buildOverlayEntriesByKeyFromCurrentLayers(size);

  if (!cells.length || !entriesByKey.size) {
    // Keep locally-generated overlay visible while persisted world data catches up.
    // Without this guard, watcher-driven reapply can clear oceans immediately after step generation.
    if (cells.length && useSurveyOverlayHexes.value && inMemoryEntriesByKey.size) {
      return true;
    }

    const hasSurveyComposition = Array.isArray(selectedWorld.value?.terrainComposition?.hexCounts)
      ? selectedWorld.value.terrainComposition.hexCounts.length > 0
      : false;
    if (cells.length && !inMemoryEntriesByKey.size && hasSurveyComposition && terrainMapWasGenerated) {
      const rebuiltFromComposition = applyTerrainSurveyToMap({
        seedSalt: `rehydrate-${size}`,
        trackUserInteraction: false,
        persistAfterApply: false,
      });
      if (rebuiltFromComposition) {
        return true;
      }
    }

    useSurveyOverlayHexes.value = Boolean(disableLegacyTerrainGeneration);
    if (disableLegacyTerrainGeneration) {
      placeTectonicLines();
    }
    return false;
  }

  useSurveyOverlayHexes.value = true;
  applySurveyOverlayTerrainForSize(size, entriesByKey);
  placeTectonicLines();
  return true;
}

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
      [islandHexesBySize.value.get(size), WORLD_HEX_TAGS.ISLAND],
      [hillsHexesBySize.value.get(size), WORLD_HEX_TAGS.HILLS],
      [volcanicHexesBySize.value.get(size), WORLD_HEX_TAGS.VOLCANIC],
      [waterHexesBySize.value.get(size), WORLD_HEX_TAGS.WATER],
      [shoreHexesBySize.value.get(size), WORLD_HEX_TAGS.SHORELINE],
      [iceCapHexesBySize.value.get(size), WORLD_HEX_TAGS.ICE_CAP],
      [glacierHexesBySize.value.get(size), WORLD_HEX_TAGS.GLACIER],
      [iceFieldHexesBySize.value.get(size), WORLD_HEX_TAGS.ICE_FIELD],
      [frozenLandHexesBySize.value.get(size), WORLD_HEX_TAGS.FROZEN_LANDS],
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
const terrainOverlayPersistTimer = ref(null);
const hasUserInteractedWithTerrain = ref(false);
const terrainRegenerationNonce = ref(0);

function markTerrainUserInteraction() {
  hasUserInteractedWithTerrain.value = true;
}

function clearTerrainHexSelection() {
  selectedTerrainHexKey.value = "";
}

function queueTerrainHexTagPersist() {
  if (!hasUserInteractedWithTerrain.value) {
    return;
  }
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
  }

  terrainHexTagPersistTimer.value = setTimeout(() => {
    terrainHexTagPersistTimer.value = null;
    void persistTerrainHexTags();
  }, 0);
}

function queueTerrainOverlayPersist() {
  if (!hasUserInteractedWithTerrain.value) {
    return;
  }
  if (terrainOverlayPersistTimer.value) {
    clearTimeout(terrainOverlayPersistTimer.value);
  }

  terrainOverlayPersistTimer.value = setTimeout(() => {
    terrainOverlayPersistTimer.value = null;
    void persistTerrainOverlay();
  }, 0);
}

async function persistTerrainOverlay() {
  if (!hasUserInteractedWithTerrain.value) {
    return false;
  }
  const systemId = String(boundSystem.value?.systemId || "").trim();
  const worldIndex = selectedWorldIndex.value;

  if (!systemId || worldIndex === null) {
    return false;
  }

  const currentPlanets = Array.isArray(boundSystem.value?.planets) ? [...boundSystem.value.planets] : [];
  if (!currentPlanets.length || !currentPlanets[worldIndex]) {
    return false;
  }

  const nextOverlay = serializeTerrainOverlayBySize();
  const nextTerrainComposition = buildTerrainCompositionFromOverlay();
  const terrainMapGenerated = Object.keys(nextOverlay).length > 0;

  const existingOverlayForTags =
    selectedWorld.value?.terrainOverlayBySize && typeof selectedWorld.value.terrainOverlayBySize === "object"
      ? selectedWorld.value.terrainOverlayBySize
      : {};
  if (
    !Object.keys(nextOverlay).length &&
    Object.keys(existingOverlayForTags).length > 0 &&
    !activeHexCells.value.length
  ) {
    console.warn("[TERRAIN SAVE] persistTerrainHexTags skipping empty overlay to avoid destructive overwrite", {
      systemId,
      worldIndex,
      activeTemplateSize: activeTerrainTemplateSize.value,
    });
    return false;
  }

  // If the map's active cells are momentarily unavailable (template swap, routing),
  // avoid persisting an empty overlay which would destructively overwrite a
  // previously saved overlay for this world.
  const existingOverlay =
    selectedWorld.value?.terrainOverlayBySize && typeof selectedWorld.value.terrainOverlayBySize === "object"
      ? selectedWorld.value.terrainOverlayBySize
      : {};
  if (!Object.keys(nextOverlay).length && Object.keys(existingOverlay).length > 0 && !activeHexCells.value.length) {
    console.warn("[TERRAIN SAVE] persistTerrainOverlay skipping empty overlay to avoid destructive overwrite", {
      systemId,
      worldIndex,
      activeTemplateSize: activeTerrainTemplateSize.value,
    });
    return false;
  }
  // DEBUG: terrain save path
  console.log("[TERRAIN SAVE] persistTerrainOverlay", {
    systemId,
    worldIndex,
    terrainMapGenerated,
    overlaySizes: Object.keys(nextOverlay),
    activeTemplateSize: activeTerrainTemplateSize.value,
    worldSize: selectedWorld.value?.size,
    overlayEntryCounts: Object.fromEntries(
      Object.entries(nextOverlay).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.length : typeof v === "object" ? Object.keys(v).length : 0,
      ]),
    ),
  });
  currentPlanets[worldIndex] = {
    ...currentPlanets[worldIndex],
    terrainMapGenerated,
    terrainOverlayBySize: nextOverlay,
    terrainComposition: nextTerrainComposition,
  };

  const updatedAt = new Date().toISOString();
  const updatedSystem = await systemStore.updateSystem(systemId, {
    planets: currentPlanets,
    metadata: {
      ...(boundSystem.value?.metadata && typeof boundSystem.value.metadata === "object"
        ? boundSystem.value.metadata
        : {}),
      lastModified: updatedAt,
    },
  });

  // DEBUG: log what the API returned
  console.log("[TERRAIN SAVE] persistTerrainOverlay API response", {
    returnedSystemId: updatedSystem?.systemId,
    returnedTerrainMapGenerated: updatedSystem?.planets?.[worldIndex]?.terrainMapGenerated,
    returnedOverlaySizes: updatedSystem?.planets?.[worldIndex]?.terrainOverlayBySize
      ? Object.keys(updatedSystem.planets[worldIndex].terrainOverlayBySize)
      : "missing",
  });

  if (updatedSystem?.systemId) {
    systemStore.setCurrentSystem(updatedSystem.systemId);
  }

  return true;
}

async function persistTerrainHexTags() {
  if (!hasUserInteractedWithTerrain.value) {
    return false;
  }
  if (!activeHexCells.value.length) {
    return false;
  }
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

  const nextOverlay = serializeTerrainOverlayBySize();
  const nextTerrainComposition = buildTerrainCompositionFromOverlay();
  const terrainMapGenerated = Object.keys(nextOverlay).length > 0;

  const currentPlanets = Array.isArray(boundSystem.value?.planets) ? [...boundSystem.value.planets] : [];
  if (!currentPlanets.length || !currentPlanets[worldIndex]) {
    return false;
  }

  currentPlanets[worldIndex] = {
    ...currentPlanets[worldIndex],
    terrainMapGenerated,
    terrainOverlayBySize: nextOverlay,
    terrainComposition: nextTerrainComposition,
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

async function flushPendingTerrainPersistence(options = {}) {
  if (!hasUserInteractedWithTerrain.value) {
    return;
  }

  const forceOverlayPersist = options?.forceOverlayPersist === true;

  const hadPendingOverlayPersist = Boolean(terrainOverlayPersistTimer.value);

  if (terrainOverlayPersistTimer.value) {
    clearTimeout(terrainOverlayPersistTimer.value);
    terrainOverlayPersistTimer.value = null;
  }
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
    terrainHexTagPersistTimer.value = null;
  }

  if (hadPendingOverlayPersist || forceOverlayPersist) {
    await persistTerrainOverlay();
  }
  await persistTerrainHexTags();
}

async function saveCurrentTerrainBaseline() {
  if (!(activeHexCells.value?.length ?? 0)) {
    return false;
  }

  markTerrainUserInteraction();
  const nextComposition = buildTerrainCompositionFromOverlay();
  const currentKey = getCurrentWorldTerrainKey();
  if (currentKey && nextComposition && typeof nextComposition === "object") {
    savedTerrainCompositionWorldKey.value = currentKey;
    savedTerrainCompositionByWorld.value = nextComposition;
  }

  if (terrainOverlayPersistTimer.value) {
    clearTimeout(terrainOverlayPersistTimer.value);
    terrainOverlayPersistTimer.value = null;
  }
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
    terrainHexTagPersistTimer.value = null;
  }

  const overlayPersisted = await persistTerrainOverlay();
  const tagsPersisted = await persistTerrainHexTags();
  return Boolean(overlayPersisted || tagsPersisted);
}

watch(
  [activeHexTagIndex, selectedWorld, selectedWorldIndex],
  () => {
    if (isApplyingOverlayLayers.value) {
      return;
    }
    if (selectedTerrainHexKey.value && !activeHexTagsByKey.value.has(selectedTerrainHexKey.value)) {
      selectedTerrainHexKey.value = "";
    }
    queueTerrainHexTagPersist();
  },
  { deep: false, immediate: false },
);

onBeforeUnmount(() => {
  if (terrainHexTagPersistTimer.value) {
    clearTimeout(terrainHexTagPersistTimer.value);
    terrainHexTagPersistTimer.value = null;
  }
  if (terrainOverlayPersistTimer.value) {
    clearTimeout(terrainOverlayPersistTimer.value);
    terrainOverlayPersistTimer.value = null;
  }
});

onBeforeRouteLeave(async () => {
  await flushPendingTerrainPersistence();
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

const activeVolcanicHexEntries = computed(() => {
  const mapForSize = volcanicHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.VOLCANIC),
  );
});

const activeIslandHexEntries = computed(() => {
  const mapForSize = islandHexesBySize.value.get(activeTerrainTemplateSize.value);
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

const activeGlacierHexEntries = computed(() => {
  const mapForSize = glacierHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.GLACIER),
  );
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

const activeLatitudeGuideLines = computed(() => {
  const cells = activeHexCells.value;
  if (!Array.isArray(cells) || !cells.length) {
    return [];
  }

  const cyValues = cells.map((cell) => Number(cell?.cy)).filter(Number.isFinite);
  if (!cyValues.length) {
    return [];
  }

  const minY = Math.min(...cyValues);
  const maxY = Math.max(...cyValues);
  const halfSpan = Math.max(1, (maxY - minY) / 2);
  const midY = (maxY + minY) / 2;
  const bounds = parseViewBoxRect(activeViewBox.value);

  const axialTilt = clamp(Number(selectedWorld.value?.axialTilt) || 0, 0, 90);
  const tiltRatio = axialTilt / 90;
  const tropicOffset = halfSpan * tiltRatio;
  const arcticOffset = halfSpan * (1 - tiltRatio);

  const lines = [
    {
      key: "equator",
      type: "equator",
      x1: bounds.minX,
      x2: bounds.maxX,
      y1: midY,
      y2: midY,
    },
  ];

  const tropicNorthY = midY - tropicOffset;
  const tropicSouthY = midY + tropicOffset;
  lines.push(
    {
      key: "tropic-north",
      type: "tropic",
      x1: bounds.minX,
      x2: bounds.maxX,
      y1: tropicNorthY,
      y2: tropicNorthY,
    },
    {
      key: "tropic-south",
      type: "tropic",
      x1: bounds.minX,
      x2: bounds.maxX,
      y1: tropicSouthY,
      y2: tropicSouthY,
    },
  );

  const arcticNorthY = midY - arcticOffset;
  const arcticSouthY = midY + arcticOffset;
  lines.push(
    {
      key: "arctic-north",
      type: "arctic",
      x1: bounds.minX,
      x2: bounds.maxX,
      y1: arcticNorthY,
      y2: arcticNorthY,
    },
    {
      key: "arctic-south",
      type: "arctic",
      x1: bounds.minX,
      x2: bounds.maxX,
      y1: arcticSouthY,
      y2: arcticSouthY,
    },
  );

  return lines;
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

const activeIceFieldHexEntries = computed(() => {
  const mapForSize = iceFieldHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.ICE_FIELD),
  );
});

const activeFrozenLandHexEntries = computed(() => {
  const mapForSize = frozenLandHexesBySize.value.get(activeTerrainTemplateSize.value);
  return toLayerEntries(mapForSize).filter((entry) =>
    activeHexTagsByKey.value
      .get(String(entry.logicalKey || entry.key || ""))
      ?.terrainTags?.includes(WORLD_HEX_TAGS.FROZEN_LANDS),
  );
});

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
    if (tryApplySurveyOverlayTerrain()) {
      return;
    }
    if (disableLegacyTerrainGeneration) {
      placeTectonicLines();
      return;
    }
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

watch(
  activeHexCells,
  () => {
    if (!activeHexCells.value.length) {
      return;
    }
    if (tryApplySurveyOverlayTerrain()) {
      return;
    }
    if (disableLegacyTerrainGeneration) {
      placeTectonicLines();
    }
  },
  { immediate: true },
);

watch(
  () => [selectedWorld.value?.terrainOverlayBySize, activeTerrainTemplateSize.value],
  () => {
    if (!activeHexCells.value.length) {
      return;
    }
    if (tryApplySurveyOverlayTerrain()) {
      return;
    }
    if (disableLegacyTerrainGeneration) {
      placeTectonicLines();
    }
  },
  { immediate: true, deep: true },
);

watch(tectonicPlateCount, () => {
  if (disableLegacyTerrainGeneration) {
    placeTectonicLines();
    return;
  }
  if (useSurveyOverlayHexes.value) return;
  placeMountainHexes();
  placeHillsHexes();
  placeTectonicLines();
});

watch(tectonicStressScore, () => {
  if (disableLegacyTerrainGeneration) {
    placeTectonicLines();
    return;
  }
  if (useSurveyOverlayHexes.value) return;
  placeMountainHexes();
  placeHillsHexes();
  placeTectonicLines();
});

watch(resourceHexCount, () => {
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
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
  if (useSurveyOverlayHexes.value) return;
  placeArcologyHexes();
  placeWorldPortHexes();
  placeRuralHexes();
  placeTwilightZoneHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isTwilightZoneWorld, () => {
  if (useSurveyOverlayHexes.value) return;
  placeTwilightZoneHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(isPenalColonyWorld, () => {
  if (useSurveyOverlayHexes.value) return;
  placePenalColonyHexes();
  placeWastelandHexes();
  placeExoticHexes();
  placeNobleLandHexes();
});

watch(
  () => worldInfo.value.population,
  () => {
    if (useSurveyOverlayHexes.value) return;
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
    if (useSurveyOverlayHexes.value) return;
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
    if (useSurveyOverlayHexes.value) return;
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
    if (useSurveyOverlayHexes.value) return;
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
    if (useSurveyOverlayHexes.value) return;
    placeBaselineLandHexes();
  },
);

watch(
  () => [selectedWorld.value?.techLevel, selectedWorld.value?.tl, selectedWorld.value?.technology, worldInfo.value.uwp],
  () => {
    if (useSurveyOverlayHexes.value) return;
    placeWastelandHexes();
    placeExoticHexes();
    placeNobleLandHexes();
  },
);

watch(
  () => [selectedWorld.value?.terrainOverlayBySize, activeTerrainTemplateSize.value, activeHexCells.value.length],
  () => {
    void tryApplySurveyOverlayTerrain();
  },
  { immediate: true },
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
    iceCapHexesBySize.value.get(size),
    forestBiomeHexesBySize.value.get(size),
    swampBiomeHexesBySize.value.get(size),
    arcticBiomeHexesBySize.value.get(size),
    twilightFrozenLandHexesBySize.value.get(size),
    twilightOceanIceFieldHexesBySize.value.get(size),
    twilightOceanDesertHexesBySize.value.get(size),
    townHexesBySize.value.get(size),
    cityHexesBySize.value.get(size),
    arcologyHexesBySize.value.get(size),
    ruralHexesBySize.value.get(size),
    worldPortHexesBySize.value.get(size),
    twilightZoneHexesBySize.value.get(size),
    penalColonyHexesBySize.value.get(size),
    wastelandHexesBySize.value.get(size),
    exoticHexesBySize.value.get(size),
    nobleLandHexesBySize.value.get(size),
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

function formatSvgCoordinate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "0";
  }

  if (Number.isInteger(numeric)) {
    return String(numeric);
  }

  return String(Number(numeric.toFixed(3)));
}

function formatSvgPoint(point) {
  return `${formatSvgCoordinate(point?.[0])},${formatSvgCoordinate(point?.[1])}`;
}

function makeSvgVertexKey(point) {
  return `${formatSvgCoordinate(point?.[0])}|${formatSvgCoordinate(point?.[1])}`;
}

function isSameSvgPoint(left, right) {
  return makeSvgVertexKey(left) === makeSvgVertexKey(right);
}

function buildSvgPathFromLoops(loops = []) {
  return loops
    .map((loop) => {
      const normalizedLoop = Array.isArray(loop) ? [...loop] : [];
      if (normalizedLoop.length >= 2 && isSameSvgPoint(normalizedLoop[0], normalizedLoop.at(-1))) {
        normalizedLoop.pop();
      }
      if (normalizedLoop.length < 3) {
        return "";
      }

      return `M ${normalizedLoop.map((point) => formatSvgPoint(point)).join(" L ")} Z`;
    })
    .filter(Boolean)
    .join(" ");
}

function buildPlateBoundaryLoops(plateTriangles = [], plateAssignments = new Map(), edgeOwners = new Map(), plateId) {
  if (!Array.isArray(plateTriangles) || !plateTriangles.length || !(edgeOwners instanceof Map)) {
    return [];
  }

  const boundaryEdges = new Map();
  for (const triangle of plateTriangles) {
    for (const edge of triangle.edges || []) {
      if (!edge?.key || boundaryEdges.has(edge.key)) {
        continue;
      }

      const owners = edgeOwners.get(edge.key) || [];
      const isBoundary = owners.length <= 1 || owners.some((ownerId) => plateAssignments.get(ownerId) !== plateId);

      if (!isBoundary) {
        continue;
      }

      const a = Array.isArray(edge.a) ? edge.a : null;
      const b = Array.isArray(edge.b) ? edge.b : null;
      if (!a || !b) {
        continue;
      }

      boundaryEdges.set(edge.key, {
        key: edge.key,
        a,
        b,
        aKey: makeSvgVertexKey(a),
        bKey: makeSvgVertexKey(b),
      });
    }
  }

  if (!boundaryEdges.size) {
    return [];
  }

  const adjacency = new Map();
  for (const edge of boundaryEdges.values()) {
    if (!adjacency.has(edge.aKey)) {
      adjacency.set(edge.aKey, []);
    }
    if (!adjacency.has(edge.bKey)) {
      adjacency.set(edge.bKey, []);
    }
    adjacency.get(edge.aKey).push(edge.key);
    adjacency.get(edge.bKey).push(edge.key);
  }

  const unusedEdgeKeys = new Set(boundaryEdges.keys());
  const loops = [];

  while (unusedEdgeKeys.size) {
    const [startEdgeKey] = unusedEdgeKeys;
    const startEdge = boundaryEdges.get(startEdgeKey);
    if (!startEdge) {
      unusedEdgeKeys.delete(startEdgeKey);
      continue;
    }

    unusedEdgeKeys.delete(startEdgeKey);
    const loop = [startEdge.a, startEdge.b];
    const startVertexKey = startEdge.aKey;
    let previousVertexKey = startEdge.aKey;
    let currentVertexKey = startEdge.bKey;
    let safety = boundaryEdges.size + 2;

    while (currentVertexKey !== startVertexKey && safety > 0) {
      safety -= 1;
      const candidateEdgeKeys = (adjacency.get(currentVertexKey) || []).filter((edgeKey) =>
        unusedEdgeKeys.has(edgeKey),
      );

      if (!candidateEdgeKeys.length) {
        break;
      }

      const nextEdgeKey =
        candidateEdgeKeys.find((edgeKey) => {
          const candidate = boundaryEdges.get(edgeKey);
          if (!candidate) {
            return false;
          }

          const nextVertexKey =
            candidate.aKey === currentVertexKey
              ? candidate.bKey
              : candidate.bKey === currentVertexKey
                ? candidate.aKey
                : null;

          return nextVertexKey !== null && nextVertexKey !== previousVertexKey;
        }) || candidateEdgeKeys[0];

      const nextEdge = boundaryEdges.get(nextEdgeKey);
      unusedEdgeKeys.delete(nextEdgeKey);
      if (!nextEdge) {
        break;
      }

      const nextPoint = nextEdge.aKey === currentVertexKey ? nextEdge.b : nextEdge.a;
      const nextVertexKey = nextEdge.aKey === currentVertexKey ? nextEdge.bKey : nextEdge.aKey;
      loop.push(nextPoint);
      previousVertexKey = currentVertexKey;
      currentVertexKey = nextVertexKey;
    }

    if (loop.length >= 3) {
      loops.push(loop);
    }
  }

  return loops;
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

function placeTectonicLines(rng = null) {
  const size = activeTerrainTemplateSize.value;
  const triangles = activeTopologyTriangles.value;
  const plateTarget = Math.max(0, Number(tectonicPlateCount.value) || 0);
  const graph = activeTopologyGraph.value;
  const edgeOwners = graph?.edgeOwners;

  if (!triangles.length || plateTarget <= 0 || !(edgeOwners instanceof Map)) {
    const nextPlates = new Map(tectonicPlatePolygonsBySize.value);
    nextPlates.delete(size);
    tectonicPlatePolygonsBySize.value = nextPlates;

    const nextLines = new Map(tectonicLineSegmentsBySize.value);
    nextLines.delete(size);
    tectonicLineSegmentsBySize.value = nextLines;
    return;
  }

  const seededRng =
    typeof rng === "function"
      ? rng
      : mulberry32(
          hashString(
            `${worldInfo.value.name}|${systemInfo.value.hex}|${size}|plates|${plateTarget}|${tectonicStressScore.value}`,
          ),
        );

  const byId = new Map(triangles.map((triangle) => [triangle.id, triangle]));
  const centroids = new Map(triangles.map((triangle) => [triangle.id, computeTriangleCentroid(triangle.vertices)]));
  const bounds = parseViewBoxRect(activeViewBox.value);
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanY = Math.max(1, bounds.maxY - bounds.minY);
  const insetX = Math.max(16, spanX * 0.05);
  const insetY = Math.max(16, spanY * 0.05);

  const interiorIds = triangles
    .filter((triangle) => {
      const c = centroids.get(triangle.id);
      if (!c) return false;
      return (
        c.x > bounds.minX + insetX &&
        c.x < bounds.maxX - insetX &&
        c.y > bounds.minY + insetY &&
        c.y < bounds.maxY - insetY
      );
    })
    .map((triangle) => triangle.id);

  const seedPool = interiorIds.length >= plateTarget ? interiorIds : triangles.map((triangle) => triangle.id);
  const shuffledPool = [...seedPool];
  for (let i = shuffledPool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRng() * (i + 1));
    [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
  }

  // Keep enough triangles per plate so rendered regions read as irregular polygons, not single-triangle wedges.
  const maxRenderablePlateCount = Math.max(1, Math.floor(shuffledPool.length / 3));
  const plateCount = Math.min(Math.max(1, plateTarget), maxRenderablePlateCount);
  const seedIds = shuffledPool.slice(0, plateCount);

  const plateAssignments = new Map();
  const plateSizes = new Map();
  const frontiers = new Map();

  function addFrontierNeighbors(plateId, triangleId) {
    const triangle = byId.get(triangleId);
    if (!triangle) return;
    if (!frontiers.has(plateId)) {
      frontiers.set(plateId, new Set());
    }
    const frontier = frontiers.get(plateId);
    for (const neighborId of triangle.neighbors || []) {
      if (!plateAssignments.has(neighborId)) {
        frontier.add(neighborId);
      }
    }
    frontier.delete(triangleId);
  }

  function assignTriangle(plateId, triangleId) {
    if (plateAssignments.has(triangleId)) {
      return;
    }
    plateAssignments.set(triangleId, plateId);
    plateSizes.set(plateId, (plateSizes.get(plateId) || 0) + 1);
    addFrontierNeighbors(plateId, triangleId);
  }

  for (let plateId = 0; plateId < seedIds.length; plateId += 1) {
    assignTriangle(plateId, seedIds[plateId]);
  }

  const allTriangleIds = triangles.map((triangle) => triangle.id);
  while (plateAssignments.size < allTriangleIds.length) {
    const candidatePlates = [...frontiers.entries()]
      .filter(([, frontier]) => frontier.size > 0)
      .map(([plateId]) => plateId);

    if (!candidatePlates.length) {
      const unassigned = allTriangleIds.filter((id) => !plateAssignments.has(id));
      if (!unassigned.length) break;
      const pickedTriangle = unassigned[Math.floor(seededRng() * unassigned.length)];
      const smallestPlate = [...plateSizes.entries()].sort((a, b) => a[1] - b[1])[0]?.[0] ?? 0;
      assignTriangle(smallestPlate, pickedTriangle);
      continue;
    }

    const pickedPlate = candidatePlates[Math.floor(seededRng() * candidatePlates.length)];
    const frontier = frontiers.get(pickedPlate);
    const options = [...frontier];
    const pickedTriangle = options[Math.floor(seededRng() * options.length)];
    frontier.delete(pickedTriangle);

    if (!plateAssignments.has(pickedTriangle)) {
      assignTriangle(pickedPlate, pickedTriangle);
    }
  }

  function plateFill(plateId) {
    const hue = (plateId * 67 + size * 19) % 360;
    return `hsla(${hue}, 72%, 48%, 0.14)`;
  }

  const trianglesByPlate = new Map();
  for (const triangle of triangles) {
    const plateId = plateAssignments.get(triangle.id);
    if (!Number.isInteger(plateId)) continue;
    if (!trianglesByPlate.has(plateId)) {
      trianglesByPlate.set(plateId, []);
    }
    trianglesByPlate.get(plateId).push(triangle);
  }

  const plateEntries = [];
  for (const [plateId, plateTriangles] of trianglesByPlate.entries()) {
    const path = buildSvgPathFromLoops(buildPlateBoundaryLoops(plateTriangles, plateAssignments, edgeOwners, plateId));

    if (!path) {
      continue;
    }

    plateEntries.push({
      key: `plate-${plateId}`,
      path,
      plateId,
      fill: plateFill(plateId),
    });
  }

  const boundarySegments = [];
  const seenEdges = new Set();
  for (const triangle of triangles) {
    const ownPlateId = plateAssignments.get(triangle.id);
    if (!Number.isInteger(ownPlateId)) continue;

    for (const edge of triangle.edges || []) {
      if (seenEdges.has(edge.key)) continue;
      seenEdges.add(edge.key);
      const owners = edgeOwners.get(edge.key) || [];
      if (owners.length !== 2) continue;
      const [leftId, rightId] = owners;
      const leftPlate = plateAssignments.get(leftId);
      const rightPlate = plateAssignments.get(rightId);
      if (!Number.isInteger(leftPlate) || !Number.isInteger(rightPlate) || leftPlate === rightPlate) {
        continue;
      }
      boundarySegments.push({
        key: `tectonic-boundary-${edge.key}`,
        x1: Number(edge.a?.[0]),
        y1: Number(edge.a?.[1]),
        x2: Number(edge.b?.[0]),
        y2: Number(edge.b?.[1]),
      });
    }
  }

  const nextPlates = new Map(tectonicPlatePolygonsBySize.value);
  nextPlates.set(size, plateEntries);
  tectonicPlatePolygonsBySize.value = nextPlates;

  const nextLines = new Map(tectonicLineSegmentsBySize.value);
  nextLines.set(size, boundarySegments);
  tectonicLineSegmentsBySize.value = nextLines;
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
  markTerrainUserInteraction();
  const size = activeTerrainTemplateSize.value;
  resetTerrainLayersForSize(size);
  useSurveyOverlayHexes.value = false;
  queueTerrainOverlayPersist();
}

function generateOceansStep() {
  markTerrainUserInteraction();
  const cells = activeHexCells.value;
  if (!(cells?.length ?? 0)) {
    return;
  }

  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedWater = Number(budgetMap.get("water") || 0);
  const targetCount = clamp(requestedWater, 0, cells.length);
  const seed = hashString(
    `${String(worldInfo.value?.name || "")}|${systemInfo.value.hex}|${activeTerrainTemplateSize.value}|ocean-step|${targetCount}`,
  );
  const rand = mulberry32(seed);

  applyBudgetedTerrainStep("water", targetCount, {
    orderCells: (eligibleCells) => buildRandomWaterCells(eligibleCells, eligibleCells.length, rand),
  });
}

function applyBudgetedTerrainStep(terrain, requestedCount, options = {}) {
  const size = activeTerrainTemplateSize.value;
  const cells = activeHexCells.value;
  if (!(cells?.length ?? 0)) {
    return;
  }

  const preservedOceanTriangles = oceanTrianglesBySize.value.get(size) ? [...oceanTrianglesBySize.value.get(size)] : [];
  const preservedOceanGroups = oceanGroupsBySize.value.get(size) ? [...oceanGroupsBySize.value.get(size)] : [];
  const preservedShoreSegments = shoreSegmentsBySize.value.get(size) ? [...shoreSegmentsBySize.value.get(size)] : [];

  const entriesByKey = new Map();
  const currentEntriesByKey = buildOverlayEntriesByKeyFromCurrentLayers(size);
  for (const [key, entry] of currentEntriesByKey.entries()) {
    if (entry?.terrain === terrain) {
      continue;
    }
    entriesByKey.set(key, {
      points: normalizePoints(entry?.points || ""),
      terrain: entry?.terrain,
    });
  }

  const cappedCount = clamp(Number(requestedCount) || 0, 0, cells.length);
  if (cappedCount > 0) {
    const occupiedKeys = new Set(entriesByKey.keys());
    const eligibleCells = cells.filter((cell) => {
      const key = String(cell?.key || "").trim();
      if (!key || occupiedKeys.has(key)) {
        return false;
      }
      if (typeof options.predicate === "function") {
        return options.predicate(cell, { entriesByKey, cells });
      }
      return true;
    });

    const selectionPool =
      typeof options.orderCells === "function"
        ? options.orderCells(eligibleCells, { entriesByKey, cells })
        : eligibleCells;
    for (const cell of selectionPool.slice(0, Math.min(cappedCount, selectionPool.length))) {
      const key = String(cell?.key || "").trim();
      if (!key || entriesByKey.has(key)) continue;
      entriesByKey.set(key, {
        points: normalizePoints(cell?.points || ""),
        terrain,
      });
    }
  }

  useSurveyOverlayHexes.value = true;
  applySurveyOverlayTerrainForSize(size, entriesByKey);

  if (preservedOceanTriangles.length) {
    setLayerMapForSize(oceanTrianglesBySize, size, preservedOceanTriangles);
  }
  if (preservedOceanGroups.length) {
    setLayerMapForSize(oceanGroupsBySize, size, preservedOceanGroups);
  }
  if (preservedShoreSegments.length) {
    setLayerMapForSize(shoreSegmentsBySize, size, preservedShoreSegments);
  }

  placeTectonicLines();
  queueTerrainOverlayPersist();
}

function generateMountainsStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedMountain = Number(budgetMap.get("mountain") || 0);
  applyBudgetedTerrainStep("mountain", requestedMountain);
}

function generateVolcanoStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedVolcanic = Number(budgetMap.get("volcanic") || 0);
  applyBudgetedTerrainStep("volcanic", requestedVolcanic);
}

function generateShoresStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const shoreBudget = Number(budgetMap.get("shore") || 0);
  const size = activeTerrainTemplateSize.value;
  const cells = activeHexCells.value;
  const waterKeys = new Set(waterHexesBySize.value.get(size)?.keys() || []);
  const terrainEntriesByKey = buildOverlayEntriesByKeyFromCurrentLayers(size);
  const adjacency = buildHexAdjacencyGraph(cells);
  const cellKeys = new Set(cells.map((cell) => String(cell?.key || "").trim()).filter(Boolean));

  applyBudgetedTerrainStep("shore", shoreBudget, {
    predicate: (cell) => {
      const key = String(cell?.key || "").trim();
      if (!key) return false;
      const neighbors = adjacency.byId.get(key)?.neighbors || new Set();
      let hasWaterNeighbor = false;
      let hasLandNeighbor = false;
      for (const neighborKey of neighbors) {
        if (waterKeys.has(neighborKey)) {
          hasWaterNeighbor = true;
          continue;
        }
        const neighborTerrain = String(terrainEntriesByKey.get(neighborKey)?.terrain || "plains");
        if (cellKeys.has(neighborKey) && neighborTerrain !== "island") {
          hasLandNeighbor = true;
        }
      }
      return hasWaterNeighbor && hasLandNeighbor;
    },
    orderCells: (eligibleCells) => {
      const withWeight = eligibleCells.map((cell) => {
        const key = String(cell?.key || "").trim();
        const neighbors = adjacency.byId.get(key)?.neighbors || new Set();
        let waterNeighborCount = 0;
        let landNeighborCount = 0;
        for (const neighborKey of neighbors) {
          if (waterKeys.has(neighborKey)) {
            waterNeighborCount += 1;
            continue;
          }
          const neighborTerrain = String(terrainEntriesByKey.get(neighborKey)?.terrain || "plains");
          if (cellKeys.has(neighborKey) && neighborTerrain !== "island") {
            landNeighborCount += 1;
          }
        }
        return { cell, waterNeighborCount, landNeighborCount };
      });

      withWeight.sort((left, right) => {
        if (right.waterNeighborCount !== left.waterNeighborCount) {
          return right.waterNeighborCount - left.waterNeighborCount;
        }
        return right.landNeighborCount - left.landNeighborCount;
      });
      return withWeight.map((entry) => entry.cell);
    },
  });
}

function generateIceCapsStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedIceCaps = Number(budgetMap.get("icecap") || budgetMap.get("tundra") || 0);
  applyBudgetedTerrainStep("icecap", requestedIceCaps);
}

function generateDesertStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedDesert = Number(budgetMap.get("desert") || 0);
  applyBudgetedTerrainStep("desert", requestedDesert);
}

function generateForestStep() {
  markTerrainUserInteraction();
  const budgetMap = buildTerrainBudgetMapFromSurveyComposition();
  const requestedForest = Number(budgetMap.get("forest") || 0);
  applyBudgetedTerrainStep("forest", requestedForest);
}

function generateTerrain() {
  // Regenerate terrain from scratch using survey-card composition counts.
  markTerrainUserInteraction();
  const size = activeTerrainTemplateSize.value;
  resetTerrainLayersForSize(size);
  useSurveyOverlayHexes.value = false;
  terrainRegenerationNonce.value += 1;
  const regenerated = applyTerrainSurveyToMap({
    seedSalt: `regen-${terrainRegenerationNonce.value}`,
  });
  if (!regenerated) {
    queueTerrainOverlayPersist();
  }
}

function handleMapClick(event) {
  markTerrainUserInteraction();
  const hoveredHex = extractHexIdentity(event?.target);
  if (!hoveredHex) {
    return;
  }
  const key = hoveredHex.canonicalKey || hoveredHex.points;
  selectedTerrainHexKey.value = key;

  // Clean editing path: map click always paints explicit overlay terrain.
  if (!useSurveyOverlayHexes.value) {
    useSurveyOverlayHexes.value = true;
  }
  applyOverlayPaintAtHex(key, hoveredHex.points);
  placeTectonicLines();
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
  padding: 1rem clamp(1.5rem, 4vw, 3.25rem);
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
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
}

.terrain-paint-palette {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.terrain-paint-btn {
  padding: 0.22rem 0.5rem;
  font-size: 0.78rem;
  border-width: 1px;
}

.terrain-paint-btn-active {
  background: #111;
  color: #fff;
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
  font-size: 0.85rem;
  color: #333;
}

.legend-preferences-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.legend-preferences-card {
  border: 2px solid #111;
  padding: 0.65rem;
  background: #fafafa;
}

.legend-preferences-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.55rem;
}

.legend-preferences-title {
  margin: 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.legend-total-assigned {
  font-size: 0.82rem;
  color: #444;
  font-weight: 600;
  white-space: nowrap;
}

.hex-legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem 0.65rem;
  max-height: 280px;
  overflow: auto;
}

.hex-legend-item {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.8rem;
}

.hex-legend-swatch {
  width: 12px;
  height: 12px;
  border: 1px solid #111;
}

.hex-legend-label {
  color: #222;
}

.hex-legend-count {
  color: #555;
  font-weight: 600;
}

.terrain-color-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem 0.75rem;
  margin-bottom: 0.6rem;
}

.terrain-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.terrain-color-row input[type="color"] {
  width: 34px;
  height: 22px;
  border: 1px solid #111;
  padding: 0;
  background: transparent;
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

  .legend-preferences-panel {
    grid-template-columns: 1fr;
  }

  .hex-legend-list,
  .terrain-color-grid {
    grid-template-columns: 1fr;
  }
}
</style>
