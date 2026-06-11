<template>
  <div class="world-map-form">
    <!-- FORM HEADER -->
    <div class="form-header">
      <div class="title">World Builder's Handbook — World Map</div>
      <div class="method-tag">
        METHOD 2: STANDARD SCALE, VARIABLE HEX NUMBER<br />
        <span class="form-number">Form 0407F-IV Part W.M2 • Hex Scale: 1,000 km • Hexes / Edge = World Size</span>
      </div>
    </div>

    <!-- IDENTITY ROW -->
    <div class="identity-row">
      <div class="id-cell grow-3">
        <label class="id-label">World</label>
        <input v-model="mapData.worldName" type="text" class="id-input" placeholder="World name" />
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">UWP</label>
        <input v-model="mapData.uwp" type="text" class="id-input" placeholder="X000000-0" />
      </div>
      <div class="id-cell grow-3">
        <label class="id-label">System</label>
        <input v-model="mapData.system" type="text" class="id-input" placeholder="System name" />
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">Direction of World Rotation</label>
        <select v-model="mapData.rotation" class="id-input">
          <option value="">—</option>
          <option value="ccw">Counter-clockwise (North View)</option>
          <option value="cw">Clockwise (North View)</option>
        </select>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">Hex Scale (km)</label>
        <div class="id-static">1,000</div>
      </div>
      <div class="id-cell grow-2">
        <label class="id-label">World Size</label>
        <input
          v-model.number="mapData.worldSize"
          type="number"
          min="1"
          max="10"
          class="id-input"
          @input="recalculateMap"
          placeholder="1-10 (or A for 10)"
        />
      </div>
    </div>

    <!-- METHOD DESCRIPTION -->
    <div class="method-desc">
      <strong>METHOD 2 — Standard Scale, Variable Hex Number:</strong>
      Each hex is a constant <strong>1,000 km</strong> across regardless of world size. The number of hexes along each
      triangle edge equals the world's <strong>Size code</strong>. A Size 5 world has 5 hexes per triangle edge. Each
      triangle represents <strong>5%</strong> of the world's surface area (20 triangles total). Sub-hexes of 100 km, 10
      km and 1 km apply within each hex using the standard TMS hierarchy.
    </div>

    <!-- SCALE BAR -->
    <div class="scale-bar-row">
      <span class="scale-label">Hex Scale:</span>
      <div class="scale-bar">
        <div class="scale-seg dark">0</div>
        <div class="scale-seg light">1,000</div>
        <div class="scale-seg dark">2,000</div>
        <div class="scale-seg light">3,000</div>
        <div class="scale-seg dark">4,000</div>
        <div class="scale-seg light">5,000</div>
      </div>
      <span class="scale-unit">km</span>
      <span class="scale-info">
        | Each hex = 1,000 km | 1 Triangle edge = {{ mapData.worldSize }} × 1,000 km | 20 Triangles total | Total hexes
        ≈ {{ calculateTotalHexes() }}
      </span>
    </div>

    <!-- SVG MAP CONTAINER -->
    <div class="map-container">
      <svg
        :key="svgKey"
        class="world-map"
        :width="mapDimensions.width"
        :height="mapDimensions.height"
        :viewBox="`0 0 ${mapDimensions.width} ${mapDimensions.height}`"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background -->
        <rect :width="mapDimensions.width" :height="mapDimensions.height" fill="#d8e8f0" rx="3" />

        <!-- Icosahedron triangles with hex grids -->
        <g v-for="(triangle, idx) in triangles" :key="`tri-${idx}`" :class="`triangle ${triangle.class}`">
          <!-- Triangle outline -->
          <polygon :points="triangle.points" :class="`tri-${triangle.orientation}`" />

          <!-- Triangle label -->
          <text :x="triangle.labelX" :y="triangle.labelY" class="tri-num" text-anchor="middle">
            {{ triangle.label }}
          </text>

          <!-- Hex grid lines within triangle -->
          <g v-for="(line, lineIdx) in triangle.hexLines" :key="`hex-${idx}-${lineIdx}`" class="hex-line-group">
            <line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" class="hex-line" />
          </g>

          <!-- Hex centers (clickable hexes) -->
          <g v-for="(hex, hexIdx) in triangle.hexCells" :key="`hex-cell-${idx}-${hexIdx}`">
            <circle :cx="hex.cx" :cy="hex.cy" r="3" class="hex-center" @click="selectHex(triangle.label, hexIdx)" />
          </g>
        </g>

        <!-- Pole dots and labels -->
        <g id="north-pole">
          <circle v-for="(x, idx) in poleDots.north" :key="`npole-${idx}`" :cx="x" cy="10" r="4" class="pole-dot" />
          <text x="50%" y="8" class="pole-label" text-anchor="middle" font-size="9">◀ NORTH POLE (wraps) ▶</text>
        </g>

        <g id="south-pole">
          <circle
            v-for="(x, idx) in poleDots.south"
            :key="`spole-${idx}`"
            :cx="x"
            :cy="mapDimensions.height - 10"
            r="4"
            class="pole-dot"
          />
          <text x="50%" :y="mapDimensions.height - 2" class="pole-label" text-anchor="middle" font-size="9">
            ◀ SOUTH POLE (wraps) ▶
          </text>
        </g>

        <!-- Equator line -->
        <line
          x1="30"
          :y1="mapDimensions.equatorY"
          :x2="mapDimensions.width - 30"
          :y2="mapDimensions.equatorY"
          class="equator-line"
        />
        <text :x="mapDimensions.width - 10" :y="mapDimensions.equatorY - 8" class="equator-label">Equator</text>

        <!-- Outer border -->
        <rect
          x="30"
          y="10"
          :width="mapDimensions.width - 60"
          :height="mapDimensions.height - 20"
          fill="none"
          stroke="#334466"
          stroke-width="1.5"
        />

        <!-- Wrap reminders -->
        <text
          x="15"
          :y="mapDimensions.height / 2"
          font-size="8"
          fill="#226622"
          text-anchor="middle"
          transform-origin="15 200"
          style="writing-mode: vertical-rl; transform: rotate(180deg)"
        >
          WEST WRAPS TO EAST
        </text>
        <text
          :x="mapDimensions.width - 15"
          :y="mapDimensions.height / 2"
          font-size="8"
          fill="#226622"
          text-anchor="middle"
          style="writing-mode: vertical-rl"
        >
          EAST WRAPS TO WEST
        </text>
      </svg>
    </div>

    <!-- ROTATION DIRECTION KEY -->
    <div class="rotation-key">
      <span class="rot-key-label">Direction of World Rotation:</span>
      <span>
        ⟲ Counter-clockwise when viewed from North Pole | The North Pole is the axis of counter-clockwise rotation. |
        The South Pole is the axis of clockwise rotation.
      </span>
      <span class="rotation-note">Mark rotation direction on the map with an arrow on the equator row.</span>
    </div>

    <!-- NOTES BAND -->
    <div class="notes-band">
      <div class="notes-cell">
        <label class="notes-label">Surface Notes / Terrain Key</label>
        <textarea v-model="mapData.terrainNotes" class="notes-textarea" rows="3"></textarea>
      </div>
      <div class="notes-cell">
        <label class="notes-label">Hydrographics (%)</label>
        <textarea v-model="mapData.hydrographicsNotes" class="notes-textarea" rows="3"></textarea>
      </div>
      <div class="notes-cell">
        <label class="notes-label">Major Continents / Oceans</label>
        <textarea v-model="mapData.continentNotes" class="notes-textarea" rows="3"></textarea>
      </div>
      <div class="notes-cell">
        <label class="notes-label">Seismic Stress / Volcanism</label>
        <textarea v-model="mapData.seismicNotes" class="notes-textarea" rows="3"></textarea>
      </div>
    </div>

    <!-- SIZE REFERENCE TABLE -->
    <div class="size-table-wrapper">
      <div class="size-table-title">
        Method 2 — Size Reference: Hexes per Triangle Edge = World Size | Hex Scale always 1,000 km | Each triangle = 5%
        surface
      </div>
      <table class="size-ref">
        <thead>
          <tr>
            <th>Size</th>
            <th>Hexes / Edge</th>
            <th>Total Hexes</th>
            <th>Diameter (km)</th>
            <th>Hex Scale</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="size in sizeReferenceTable"
            :key="size.size"
            :class="{ highlight: size.size === mapData.worldSize }"
          >
            <td>
              <strong>{{ size.size }}</strong>
            </td>
            <td>{{ size.hexesPerEdge }}</td>
            <td>{{ size.totalHexes }}</td>
            <td>{{ size.diameter }}</td>
            <td>1,000</td>
            <td style="text-align: left">{{ size.notes }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FOOTER -->
    <div class="form-footer">
      Form 0407F-IV Part W.M2 · Method 2: Standard Scale, Variable Hex Number · Hex = 1,000 km · 20 Triangles · Each
      Triangle = 5% Surface Area · Sub-hexes: 100 km / 10 km / 1 km
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";

// State
const svgKey = ref(0);

const mapData = reactive({
  worldName: "",
  uwp: "",
  system: "",
  rotation: "ccw",
  worldSize: 5,
  terrainNotes: "",
  hydrographicsNotes: "",
  continentNotes: "",
  seismicNotes: "",
  selectedHex: null,
});

// Constants
const ICOSAHEDRON_TRIANGLES = 20; // 5 north + 10 middle + 5 south
const TRIANGLE_POINTS = {
  north: [
    { id: "N1", pts: [110, 10, 30, 148, 190, 148], orient: "up" },
    { id: "N2", pts: [270, 10, 190, 148, 350, 148], orient: "up" },
    { id: "N3", pts: [430, 10, 350, 148, 510, 148], orient: "up" },
    { id: "N4", pts: [590, 10, 510, 148, 670, 148], orient: "up" },
    { id: "N5", pts: [750, 10, 670, 148, 830, 148], orient: "up" },
  ],
  middle: [
    { id: "M1↓", pts: [30, 148, 190, 148, 110, 286], orient: "down" },
    { id: "M2↑", pts: [110, 286, 190, 148, 270, 286], orient: "up" },
    { id: "M3↓", pts: [190, 148, 350, 148, 270, 286], orient: "down" },
    { id: "M4↑", pts: [270, 286, 350, 148, 430, 286], orient: "up" },
    { id: "M5↓", pts: [350, 148, 510, 148, 430, 286], orient: "down" },
    { id: "M6↑", pts: [430, 286, 510, 148, 590, 286], orient: "up" },
    { id: "M7↓", pts: [510, 148, 670, 148, 590, 286], orient: "down" },
    { id: "M8↑", pts: [590, 286, 670, 148, 750, 286], orient: "up" },
    { id: "M9↓", pts: [670, 148, 830, 148, 750, 286], orient: "down" },
    { id: "M10", pts: [750, 286, 830, 148, 830, 286], orient: "up" },
  ],
  south: [
    { id: "S1", pts: [110, 286, 30, 410, 190, 410], orient: "down" },
    { id: "S2", pts: [270, 286, 190, 410, 350, 410], orient: "down" },
    { id: "S3", pts: [430, 286, 350, 410, 510, 410], orient: "down" },
    { id: "S4", pts: [590, 286, 510, 410, 670, 410], orient: "down" },
    { id: "S5", pts: [750, 286, 670, 410, 830, 410], orient: "down" },
  ],
};

// Size reference table
const sizeReferenceTable = [
  { size: 1, hexesPerEdge: 1, totalHexes: 12, diameter: 1600, notes: "Very small — 1 hex per triangle" },
  { size: 2, hexesPerEdge: 2, totalHexes: 42, diameter: 3200, notes: "Luna-scale" },
  { size: 3, hexesPerEdge: 3, totalHexes: 92, diameter: 4800, notes: "Mercury / Ganymede-scale" },
  { size: 4, hexesPerEdge: 4, totalHexes: 162, diameter: 6400, notes: "Mars-scale" },
  { size: 5, hexesPerEdge: 5, totalHexes: 252, diameter: 8000, notes: "Default example" },
  { size: 6, hexesPerEdge: 6, totalHexes: 362, diameter: 9600, notes: "" },
  { size: 7, hexesPerEdge: 7, totalHexes: 492, diameter: 11200, notes: "Matches Method 1 standard template" },
  { size: 8, hexesPerEdge: 8, totalHexes: 642, diameter: 12800, notes: "Venus / Terra-scale" },
  { size: 9, hexesPerEdge: 9, totalHexes: 812, diameter: 14400, notes: "Super-Earth" },
  { size: 10, hexesPerEdge: 10, totalHexes: 1002, diameter: 16000, notes: "Large Super-Earth" },
];

// Map dimensions (base)
const mapDimensions = computed(() => {
  const baseWidth = 860;
  const baseHeight = 420;
  return {
    width: baseWidth,
    height: baseHeight,
    equatorY: baseHeight / 2.83, // approximate equator position
  };
});

// Pole dots
const poleDots = computed(() => {
  const northX = [110, 270, 430, 590, 750];
  const southX = [110, 270, 430, 590, 750];
  return { north: northX, south: southX };
});

// Calculate total hexes
const calculateTotalHexes = () => {
  const size = mapData.worldSize;
  return 2 + 10 * size * size;
};

// Generate hexagonal grid within a triangle
function generateHexGridForTriangle(triangleData, size) {
  const hexLines = [];
  const hexCells = [];

  // For each size N, generate N rows of hexagons
  // Hex spacing = triangle_width / size

  // This is the complex part: proper hexagonal tessellation within equilateral triangle
  // For now, simplified version that shows the concept

  return { hexLines, hexCells };
}

// Build all triangles with hex grids
const triangles = computed(() => {
  const allTriangles = [...TRIANGLE_POINTS.north, ...TRIANGLE_POINTS.middle, ...TRIANGLE_POINTS.south];

  return allTriangles.map((tri, idx) => {
    const [x1, y1, x2, y2, x3, y3] = tri.pts;
    const labelX = (x1 + x2 + x3) / 3;
    const labelY = (y1 + y2 + y3) / 3;

    // Generate hex grid
    const { hexLines, hexCells } = generateHexGridForTriangle(tri, mapData.worldSize);

    return {
      ...tri,
      points: `${x1},${y1} ${x2},${y2} ${x3},${y3}`,
      labelX,
      labelY,
      orientation: tri.orient,
      hexLines,
      hexCells,
      class: `triangle-${idx}`,
    };
  });
});

// Methods
function recalculateMap() {
  svgKey.value++;
}

function selectHex(triangleLabel, hexIndex) {
  mapData.selectedHex = `${triangleLabel}-${hexIndex}`;
  console.log("Selected hex:", mapData.selectedHex);
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── FORM HEADER ── */
.form-header {
  background: #1a1a2e;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 2px solid #000;
}

.form-header .title {
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.form-header .method-tag {
  font-size: 10px;
  text-align: right;
  line-height: 1.4;
}

.form-number {
  font-size: 9px;
  letter-spacing: 0.5px;
}

/* ── IDENTITY ROW ── */
.identity-row {
  display: flex;
  border-bottom: 1px solid #888;
  flex-wrap: wrap;
}

.id-cell {
  flex: 1;
  border-right: 1px solid #888;
  padding: 6px 8px;
  min-height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.id-cell:last-child {
  border-right: none;
}

.id-cell.grow-2 {
  flex: 2;
}
.id-cell.grow-3 {
  flex: 3;
}

.id-label {
  font-size: 7.5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 4px;
}

.id-input {
  border: 1px solid #999;
  padding: 4px 6px;
  font-size: 10px;
  border-radius: 2px;
}

.id-input:focus {
  outline: none;
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
}

.id-static {
  font-size: 10px;
  padding: 2px 0;
}

/* ── METHOD DESCRIPTION ── */
.method-desc {
  background: #f0f0f8;
  border: 1px solid #aaa;
  padding: 6px 10px;
  font-size: 9px;
  color: #333;
  line-height: 1.5;
}

/* ── SCALE BAR ── */
.scale-bar-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #ccc;
  gap: 8px;
  font-size: 9px;
}

.scale-label {
  font-weight: bold;
  font-size: 8px;
  text-transform: uppercase;
}

.scale-bar {
  display: flex;
  gap: 0;
}

.scale-seg {
  width: 44px;
  height: 12px;
  border: 1px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  font-weight: bold;
}

.scale-seg.dark {
  background: #555;
  color: #fff;
}

.scale-seg.light {
  background: #fff;
  color: #333;
}

.scale-unit {
  margin-left: 4px;
  font-weight: bold;
}

.scale-info {
  color: #888;
  font-size: 8px;
  margin-left: 12px;
}

/* ── MAP CONTAINER ── */
.map-container {
  padding: 12px;
  background: #fafafa;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ccc;
  overflow-x: auto;
}

.world-map {
  display: block;
}

/* Triangle styling */
.tri-up {
  fill: #e8f0f8;
  stroke: #2244aa;
  stroke-width: 1.2;
}

.tri-down {
  fill: #ddeef8;
  stroke: #2244aa;
  stroke-width: 1.2;
}

/* Hex lines */
.hex-line {
  stroke: #7799cc;
  stroke-width: 0.6;
  opacity: 0.7;
}

.hex-center {
  fill: rgba(34, 68, 170, 0.1);
  cursor: pointer;
}

.hex-center:hover {
  fill: rgba(34, 68, 170, 0.4);
}

/* Pole dots and labels */
.pole-dot {
  fill: #cc3333;
}

.pole-label {
  font-size: 8px;
  fill: #cc3333;
  font-weight: bold;
}

/* Triangle numbers -->
.tri-num {
  font-size: 7px;
  fill: #446;
  opacity: 0.7;
}

/* Equator -->
.equator-line {
  stroke: #aa4400;
  stroke-width: 1.5;
  stroke-dasharray: 8,4;
  opacity: 0.6;
}

.equator-label {
  font-size: 8px;
  fill: #aa4400;
  font-style: italic;
}

/* ── ROTATION KEY ── */
.rotation-key {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #ccc;
  gap: 12px;
  font-size: 9px;
}

.rot-key-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
}

.rotation-note {
  margin-left: auto;
  font-weight: bold;
}

/* ── NOTES BAND ── */
.notes-band {
  display: flex;
  border-bottom: 1px solid #999;
}

.notes-cell {
  flex: 1;
  padding: 8px;
  border-right: 1px solid #ccc;
}

.notes-cell:last-child {
  border-right: none;
}

.notes-label {
  font-size: 7.5px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.notes-textarea {
  width: 100%;
  border: 1px solid #bbb;
  padding: 4px;
  font-size: 8px;
  resize: vertical;
}

/* ── SIZE TABLE ── */
.size-table-wrapper {
  padding: 8px 10px;
  border-bottom: 1px solid #ccc;
}

.size-table-title {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 6px;
}

table.size-ref {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
}

table.size-ref th {
  background: #2c2c54;
  color: #fff;
  padding: 4px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #555;
}

table.size-ref td {
  border: 1px solid #ccc;
  padding: 2px 4px;
  text-align: center;
}

table.size-ref tbody tr:nth-child(odd) td {
  background: #f5f5fa;
}

table.size-ref tr.highlight td {
  background: #fff3c0;
  font-weight: bold;
}

/* ── FOOTER ── */
.form-footer {
  background: #1a1a2e;
  color: #aaa;
  font-size: 8px;
  padding: 6px 10px;
  text-align: right;
}

/* ── PRINT ── */
@media print {
  .world-map-form {
    width: 100%;
  }
  .form-header {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
