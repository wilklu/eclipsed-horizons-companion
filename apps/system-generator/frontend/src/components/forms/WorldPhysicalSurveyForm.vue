<template>
  <div class="survey-form">
    <!-- FORM HEADER - RUST ORANGE -->
    <div class="form-header">
      <div class="title-block">World Physical Survey</div>
      <div class="form-number">FORM 0407F-IV PART P</div>
    </div>

    <!-- WORLD / UWP / LOCATION / SURVEY DATES SECTION -->
    <div class="section-block">
      <div class="form-row">
        <div class="form-cell grow-4">
          <label class="cell-label">World Name</label>
          <input v-model="surveyData.worldName" type="text" class="cell-input" placeholder="e.g., Terra, Mars" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">SAH / UWP</label>
          <input v-model="surveyData.sah_uwp" type="text" class="cell-input" placeholder="X000000-0" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Sector | Location</label>
          <input
            v-model="surveyData.sectorLocation"
            type="text"
            class="cell-input"
            placeholder="e.g., Orion Spur / Alpha-1"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Initial Survey</label>
          <input v-model="surveyData.initialSurvey" type="date" class="cell-input" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Last Updated</label>
          <input v-model="surveyData.lastUpdated" type="date" class="cell-input" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Primary Object(s)</label>
          <input v-model="surveyData.primaryObjects" type="text" class="cell-input" placeholder="Star(s)" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">System Age (Gyr)</label>
          <input v-model.number="surveyData.systemAge" type="number" step="0.1" class="cell-input" placeholder="4.6" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Travel Zone</label>
          <select v-model="surveyData.travelZone" class="cell-input">
            <option value="">—</option>
            <option value="Green">Green (Safe)</option>
            <option value="Amber">Amber (Caution)</option>
            <option value="Red">Red (Dangerous)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ORBIT SECTION -->
    <div class="section-block">
      <div class="section-label">Orbit</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">O#</label>
          <input v-model.number="surveyData.orbit.number" type="number" class="cell-input" placeholder="1" />
        </div>
        <div class="form-cell">
          <label class="cell-label">AU</label>
          <input v-model.number="surveyData.orbit.au" type="number" step="0.01" class="cell-input" placeholder="1.0" />
        </div>
        <div class="form-cell">
          <label class="cell-label">Eccentricity</label>
          <input
            v-model.number="surveyData.orbit.eccentricity"
            type="number"
            step="0.01"
            min="0"
            max="1"
            class="cell-input"
            placeholder="0.0"
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Period</label>
          <input v-model="surveyData.orbit.period" type="text" class="cell-input" placeholder="1.0 years" />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.orbit.notes"
            class="notes-textarea"
            placeholder="Orbital characteristics..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- SIZE SECTION -->
    <div class="section-block">
      <div class="section-label">Size</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Diameter (km)</label>
          <input
            v-model.number="surveyData.size.diameter"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="12742"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Composition</label>
          <input v-model="surveyData.size.composition" type="text" class="cell-input" placeholder="Rocky, Iron, etc." />
        </div>
        <div class="form-cell">
          <label class="cell-label">Density</label>
          <input
            v-model.number="surveyData.size.density"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="5.5"
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">Gravity</label>
          <input
            v-model.number="surveyData.size.gravity"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="1.0"
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">Mass</label>
          <input v-model.number="surveyData.size.mass" type="number" step="0.01" class="cell-input" placeholder="1.0" />
        </div>
        <div class="form-cell">
          <label class="cell-label">Esc v (kps)</label>
          <input
            v-model.number="surveyData.size.escapeVelocity"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="11.2"
          />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.size.notes"
            class="notes-textarea"
            placeholder="Physical characteristics..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- ATMOSPHERE SECTION -->
    <div class="section-block">
      <div class="section-label">Atmosphere</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Pressure (bar)</label>
          <input
            v-model.number="surveyData.atmosphere.pressure"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="1.0"
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Composition</label>
          <input
            v-model="surveyData.atmosphere.composition"
            type="text"
            class="cell-input"
            placeholder="N₂/O₂, CO₂, etc."
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">O₂ (bar)</label>
          <input
            v-model.number="surveyData.atmosphere.o2Partial"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="0.21"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Taints</label>
          <input
            v-model="surveyData.atmosphere.taints"
            type="text"
            class="cell-input"
            placeholder="None, Pollutants, etc."
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">Scale Height</label>
          <input
            v-model.number="surveyData.atmosphere.scaleHeight"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="8.5"
          />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.atmosphere.notes"
            class="notes-textarea"
            placeholder="Atmospheric details..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- HYDROGRAPHICS SECTION -->
    <div class="section-block">
      <div class="section-label">Hydrographics</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Coverage (%)</label>
          <input
            v-model.number="surveyData.hydrographics.coverage"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="71"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Composition</label>
          <input
            v-model="surveyData.hydrographics.composition"
            type="text"
            class="cell-input"
            placeholder="Water, Ice, Magma, etc."
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Distribution</label>
          <input
            v-model="surveyData.hydrographics.distribution"
            type="text"
            class="cell-input"
            placeholder="Oceans, Seas, Polar caps, etc."
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Major Bodies</label>
          <input
            v-model="surveyData.hydrographics.majorBodies"
            type="text"
            class="cell-input"
            placeholder="Pacific, Atlantic, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Minor Bodies</label>
          <input
            v-model="surveyData.hydrographics.minorBodies"
            type="text"
            class="cell-input"
            placeholder="Lakes, Rivers, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Other</label>
          <input
            v-model="surveyData.hydrographics.other"
            type="text"
            class="cell-input"
            placeholder="Glaciers, Springs, etc."
          />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.hydrographics.notes"
            class="notes-textarea"
            placeholder="Hydrographic details..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- ROTATION SECTION -->
    <div class="section-block">
      <div class="section-label">Rotation</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Sidereal (hours)</label>
          <input
            v-model.number="surveyData.rotation.sidereal"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="23.93"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Solar (hours)</label>
          <input
            v-model.number="surveyData.rotation.solar"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="24.0"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Solar Days/Year</label>
          <input
            v-model.number="surveyData.rotation.solarDaysPerYear"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="365.25"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Axial Tilt (°)</label>
          <input
            v-model.number="surveyData.rotation.axialTilt"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="23.44"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Tidal Lock?</label>
          <select v-model="surveyData.rotation.tidalLock" class="cell-input">
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Tides</label>
          <input
            v-model="surveyData.rotation.tides"
            type="text"
            class="cell-input"
            placeholder="Minor, Moderate, etc."
          />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.rotation.notes"
            class="notes-textarea"
            placeholder="Rotational characteristics..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- TEMPERATURE SECTION -->
    <div class="section-block">
      <div class="section-label">Temperature</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">High (K)</label>
          <input v-model.number="surveyData.temperature.high" type="number" class="cell-input" placeholder="310" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Luminosity (L☉)</label>
          <input
            v-model.number="surveyData.temperature.luminosity"
            type="number"
            step="0.001"
            class="cell-input"
            placeholder="1.0"
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">Notes:</label>
          <input
            v-model="surveyData.temperature.notes"
            type="text"
            class="cell-input"
            placeholder="Temperature notes..."
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Mean (K)</label>
          <input v-model.number="surveyData.temperature.mean" type="number" class="cell-input" placeholder="288" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Albedo</label>
          <input
            v-model.number="surveyData.temperature.albedo"
            type="number"
            step="0.01"
            min="0"
            max="1"
            class="cell-input"
            placeholder="0.367"
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">&nbsp;</label>
          <input type="text" class="cell-input" placeholder=" " style="visibility: hidden" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Low (K)</label>
          <input v-model.number="surveyData.temperature.low" type="number" class="cell-input" placeholder="255" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Greenhouse</label>
          <input
            v-model="surveyData.temperature.greenhouse"
            type="text"
            class="cell-input"
            placeholder="No, Weak, etc."
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">&nbsp;</label>
          <input type="text" class="cell-input" placeholder=" " style="visibility: hidden" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Seismic Stress</label>
          <input
            v-model="surveyData.temperature.seismicStress"
            type="text"
            class="cell-input"
            placeholder="Low, Moderate, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Residual Stress</label>
          <input
            v-model="surveyData.temperature.residualStress"
            type="text"
            class="cell-input"
            placeholder="Low, Moderate, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Tidal Stress</label>
          <input
            v-model="surveyData.temperature.tidalStress"
            type="text"
            class="cell-input"
            placeholder="Low, High, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Tidal Heating</label>
          <input
            v-model="surveyData.temperature.tidalHeating"
            type="text"
            class="cell-input"
            placeholder="None, Significant, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Major Tectonic Plates</label>
          <input
            v-model.number="surveyData.temperature.majorTectonicPlates"
            type="number"
            class="cell-input"
            placeholder="7"
          />
        </div>
      </div>
    </div>

    <!-- LIFE SECTION -->
    <div class="section-block">
      <div class="section-label">Life</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Biomass</label>
          <input v-model="surveyData.life.biomass" type="text" class="cell-input" placeholder="High, Moderate, etc." />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Biocomplexity</label>
          <input v-model="surveyData.life.biocomplexity" type="text" class="cell-input" placeholder="High, Low, etc." />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Sophonts?</label>
          <select v-model="surveyData.life.sophonts" class="cell-input">
            <option value="none">None</option>
            <option value="native">Native</option>
            <option value="colonist">Colonist</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Biodiversity</label>
          <input v-model="surveyData.life.biodiversity" type="text" class="cell-input" placeholder="High, Low, etc." />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Compatibility</label>
          <input
            v-model="surveyData.life.compatibility"
            type="text"
            class="cell-input"
            placeholder="Compatible, etc."
          />
        </div>
      </div>

      <div class="notes-row">
        <div class="notes-cell">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.life.notes"
            class="notes-textarea"
            placeholder="Life characteristics..."
            rows="2"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- RESOURCES SECTION -->
    <div class="section-block">
      <div class="section-label">Resources</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Rating</label>
          <select v-model="surveyData.resources.rating" class="cell-input">
            <option value="">—</option>
            <option value="abundant">Abundant</option>
            <option value="good">Good</option>
            <option value="moderate">Moderate</option>
            <option value="sparse">Sparse</option>
            <option value="none">None</option>
          </select>
        </div>
        <div class="form-cell grow-6">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.resources.notes"
            class="cell-input"
            placeholder="Resource details..."
            rows="1"
            style="resize: vertical"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- HABITABILITY SECTION -->
    <div class="section-block">
      <div class="section-label">Habitability</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Rating</label>
          <select v-model="surveyData.habitability.rating" class="cell-input">
            <option value="">—</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="marginal">Marginal</option>
            <option value="poor">Poor</option>
            <option value="hostile">Hostile</option>
          </select>
        </div>
        <div class="form-cell grow-6">
          <label class="cell-label">Notes:</label>
          <textarea
            v-model="surveyData.habitability.notes"
            class="cell-input"
            placeholder="Habitability assessment..."
            rows="1"
            style="resize: vertical"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- SUBORDINATES SECTION -->
    <div class="section-block">
      <div class="section-label">Subordinates (Moons)</div>
      <div class="table-wrapper">
        <table class="sub-table">
          <thead>
            <tr>
              <th style="width: 80px">Name</th>
              <th style="width: 80px">SAH / UWP</th>
              <th style="width: 65px">Orbit (PD)</th>
              <th style="width: 75px">Orbit (km)</th>
              <th style="width: 50px">Ecc</th>
              <th style="width: 55px">Diameter</th>
              <th style="width: 55px">Density</th>
              <th style="width: 55px">Mass</th>
              <th style="width: 65px">Period (h)</th>
              <th style="width: 50px">Size (°)</th>
              <th style="width: 40px">Action</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(moon, index) in surveyData.subordinates" :key="index">
              <td><input v-model="moon.name" type="text" class="table-input" placeholder="Moon" /></td>
              <td><input v-model="moon.sah_uwp" type="text" class="table-input" placeholder="X000000-0" /></td>
              <td>
                <input v-model.number="moon.orbitPD" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input v-model.number="moon.orbitKm" type="number" step="0.1" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input
                  v-model.number="moon.eccentricity"
                  type="number"
                  step="0.01"
                  class="table-input"
                  placeholder="0.0"
                />
              </td>
              <td>
                <input v-model.number="moon.diameter" type="number" step="0.1" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input v-model.number="moon.density" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input v-model.number="moon.mass" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input
                  v-model.number="moon.periodHours"
                  type="number"
                  step="0.01"
                  class="table-input"
                  placeholder="0.0"
                />
              </td>
              <td>
                <input v-model.number="moon.sizeAngle" type="number" step="0.1" class="table-input" placeholder="0.0" />
              </td>
              <td class="action-cell">
                <button
                  @click="removeSubordinate(index)"
                  class="btn-remove"
                  v-if="surveyData.subordinates.length > 0"
                  title="Remove moon"
                >
                  ✕
                </button>
              </td>
              <td><input v-model="moon.notes" type="text" class="table-input" placeholder="Notes" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ADD SUBORDINATE BUTTON -->
      <div class="button-row">
        <button @click="addSubordinate" class="btn btn-small btn-add">+ Add Moon</button>
      </div>
    </div>

    <!-- COMMENTS SECTION -->
    <div class="comments-block">
      <label class="comments-label">Comments:</label>
      <textarea
        v-model="surveyData.comments"
        class="comments-textarea"
        placeholder="General survey notes and observations..."
        rows="4"
      ></textarea>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="form-actions">
      <button @click="saveSurvey" class="btn btn-primary">💾 Save Survey</button>
      <button @click="resetForm" class="btn btn-secondary">🔄 Reset</button>
      <button @click="printForm" class="btn btn-secondary">🖨️ Print</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useSystemStore } from "../../stores/systemStore.js";

const props = defineProps({
  systemRecord: {
    type: Object,
    default: null,
  },
  worldRecord: {
    type: Object,
    default: null,
  },
  systemId: {
    type: String,
    default: "",
  },
  worldIndex: {
    type: [String, Number],
    default: "",
  },
  autofill: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const systemStore = useSystemStore();

function createEmptySubordinateRow() {
  return {
    name: "",
    sah_uwp: "",
    orbitPD: null,
    orbitKm: null,
    eccentricity: null,
    diameter: null,
    density: null,
    mass: null,
    periodHours: null,
    sizeAngle: null,
    notes: "",
  };
}

function createEmptySurveyData() {
  const today = new Date().toISOString().split("T")[0];
  return {
    worldName: "",
    sah_uwp: "",
    sectorLocation: "",
    initialSurvey: today,
    lastUpdated: today,
    primaryObjects: "",
    systemAge: null,
    travelZone: "",
    orbit: {
      number: null,
      au: null,
      eccentricity: null,
      period: "",
      notes: "",
    },
    size: {
      diameter: null,
      composition: "",
      density: null,
      gravity: null,
      mass: null,
      escapeVelocity: null,
      notes: "",
    },
    atmosphere: {
      pressure: null,
      composition: "",
      o2Partial: null,
      taints: "",
      scaleHeight: null,
      notes: "",
    },
    hydrographics: {
      coverage: null,
      composition: "",
      distribution: "",
      majorBodies: "",
      minorBodies: "",
      other: "",
      notes: "",
    },
    rotation: {
      sidereal: null,
      solar: null,
      solarDaysPerYear: null,
      axialTilt: null,
      tidalLock: "no",
      tides: "",
      notes: "",
    },
    temperature: {
      high: null,
      mean: null,
      low: null,
      luminosity: null,
      albedo: null,
      greenhouse: "",
      seismicStress: "",
      residualStress: "",
      tidalStress: "",
      tidalHeating: "",
      majorTectonicPlates: null,
      notes: "",
    },
    life: {
      biomass: "",
      biocomplexity: "",
      sophonts: "none",
      biodiversity: "",
      compatibility: "",
      notes: "",
    },
    resources: {
      rating: "",
      notes: "",
    },
    habitability: {
      rating: "",
      notes: "",
    },
    subordinates: Array.from({ length: 5 }, () => createEmptySubordinateRow()),
    comments: "",
  };
}

function normalizeHexCoordinates(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
}

function parseNumericString(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatSectorLocation(systemRecord) {
  if (!systemRecord || typeof systemRecord !== "object") {
    return "";
  }
  if (String(systemRecord?.sectorHex || "").trim()) {
    return String(systemRecord.sectorHex).trim();
  }
  const x = String(systemRecord?.hexCoordinates?.x ?? "").padStart(2, "0");
  const y = String(systemRecord?.hexCoordinates?.y ?? "").padStart(2, "0");
  return [String(systemRecord?.sectorId || "").trim(), `${x}${y}`.trim()].filter(Boolean).join(" ");
}

function normalizeResourceRatingForSurvey(value) {
  switch (
    String(value || "")
      .trim()
      .toLowerCase()
  ) {
    case "abundant":
      return "abundant";
    case "good":
      return "good";
    case "moderate":
      return "moderate";
    case "sparse":
      return "sparse";
    case "none":
      return "none";
    default:
      return "";
  }
}

function normalizeHabitabilityForSurvey(value) {
  switch (
    String(value || "")
      .trim()
      .toLowerCase()
  ) {
    case "excellent":
      return "excellent";
    case "good":
      return "good";
    case "marginal":
      return "marginal";
    case "poor":
      return "poor";
    case "hostile":
      return "hostile";
    default:
      return "";
  }
}

function titleCase(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "";
}

function buildLifeSurvey(nativeLifeform, nativeSophontLife) {
  const digits = String(nativeLifeform || "").trim();
  return {
    biomass: digits.charAt(0) || "",
    biocomplexity: digits.charAt(1) || "",
    biodiversity: digits.charAt(2) || "",
    compatibility: digits.charAt(3) || "",
    sophonts: nativeSophontLife ? "native" : "none",
    notes: "",
  };
}

function buildSubordinates(worldRecord) {
  const moons = Array.isArray(worldRecord?.moonsData) ? worldRecord.moonsData : [];
  const significantMoons = moons.filter((moon) => moon?.type === "significant" && !moon?.ring);
  const rows = significantMoons.map((moon) => ({
    name: String(moon?.name || ""),
    sah_uwp: String(moon?.worldProfile?.uwp || ""),
    orbitPD: moon?.orbitalSlot ?? null,
    orbitKm: null,
    eccentricity: null,
    diameter: moon?.worldProfile?.diameterKm ?? null,
    density: moon?.worldProfile?.density ?? null,
    mass: moon?.worldProfile?.mass ?? null,
    periodHours: moon?.worldProfile?.dayLengthHours ?? null,
    sizeAngle: null,
    notes: String(moon?.description || ""),
  }));

  while (rows.length < 5) {
    rows.push(createEmptySubordinateRow());
  }

  return rows;
}

function buildSurveyDataFromWorld(systemRecord, worldRecord) {
  const base = createEmptySurveyData();
  if (!worldRecord || typeof worldRecord !== "object") {
    return base;
  }

  const physicalSurvey =
    worldRecord?.physicalSurvey && typeof worldRecord.physicalSurvey === "object" ? worldRecord.physicalSurvey : null;
  if (physicalSurvey) {
    return {
      ...base,
      ...physicalSurvey,
      orbit: { ...base.orbit, ...(physicalSurvey.orbit || {}) },
      size: { ...base.size, ...(physicalSurvey.size || {}) },
      atmosphere: { ...base.atmosphere, ...(physicalSurvey.atmosphere || {}) },
      hydrographics: { ...base.hydrographics, ...(physicalSurvey.hydrographics || {}) },
      rotation: { ...base.rotation, ...(physicalSurvey.rotation || {}) },
      temperature: { ...base.temperature, ...(physicalSurvey.temperature || {}) },
      life: { ...base.life, ...(physicalSurvey.life || {}) },
      resources: { ...base.resources, ...(physicalSurvey.resources || {}) },
      habitability: { ...base.habitability, ...(physicalSurvey.habitability || {}) },
      subordinates:
        Array.isArray(physicalSurvey.subordinates) && physicalSurvey.subordinates.length
          ? physicalSurvey.subordinates.map((row) => ({ ...createEmptySubordinateRow(), ...row }))
          : base.subordinates,
    };
  }

  const meanTemperatureK = Number.isFinite(Number(worldRecord?.avgTempC))
    ? Number(worldRecord.avgTempC) + 273.15
    : null;
  const orbitalPeriodDays = Number(worldRecord?.orbitalPeriodDays ?? 0) || null;
  const dayLengthHours = Number(worldRecord?.dayLengthHours ?? 0) || null;
  const solarDaysPerYear =
    orbitalPeriodDays && dayLengthHours ? Number((orbitalPeriodDays * 24) / dayLengthHours).toFixed(2) : null;
  const seismology =
    worldRecord?.seismology && typeof worldRecord.seismology === "object" ? worldRecord.seismology : {};
  const stars = Array.isArray(systemRecord?.stars) ? systemRecord.stars : [];

  return {
    ...base,
    worldName: String(worldRecord?.name || ""),
    sah_uwp: String(worldRecord?.uwp || worldRecord?.sah_uwp || ""),
    sectorLocation: formatSectorLocation(systemRecord),
    primaryObjects: stars
      .map((star) => String(star?.designation || star?.spectralClass || "").trim())
      .filter(Boolean)
      .join(", "),
    systemAge: Number(systemRecord?.stars?.[0]?.systemAge ?? systemRecord?.systemAge ?? 0) || null,
    travelZone: String(systemRecord?.travelZone || ""),
    orbit: {
      number: worldRecord?.orbitNumber ?? null,
      au: worldRecord?.orbitAU ?? worldRecord?.orbitAu ?? null,
      eccentricity: worldRecord?.eccentricity ?? null,
      period: orbitalPeriodDays ? `${orbitalPeriodDays} days` : "",
      notes: String(worldRecord?.orbitGroup || worldRecord?.zone || ""),
    },
    size: {
      diameter: worldRecord?.diameterKm ?? null,
      composition: String(worldRecord?.composition || ""),
      density: worldRecord?.density ?? null,
      gravity: worldRecord?.gravity ?? null,
      mass: worldRecord?.mass ?? null,
      escapeVelocity: Number(worldRecord?.escapeVelocityMps ?? 0) ? Number(worldRecord.escapeVelocityMps) / 1000 : null,
      notes: String(worldRecord?.sizeProfile || ""),
    },
    atmosphere: {
      pressure: null,
      composition: String(worldRecord?.atmosphereDesc || ""),
      o2Partial: null,
      taints: String(worldRecord?.atmosphereDesc || "").includes("Tainted") ? "Tainted" : "",
      scaleHeight: null,
      notes: `Code ${String(worldRecord?.atmosphereCode ?? "")}`.trim(),
    },
    hydrographics: {
      coverage: Number(worldRecord?.hydrographics ?? 0) * 10,
      composition: Number(worldRecord?.hydrographics ?? 0) > 0 ? "Water-based surface volatiles" : "Dry world",
      distribution:
        String(worldRecord?.hydrographics ?? 0) > 0
          ? "Survey-derived global distribution"
          : "Minimal free-standing liquids",
      majorBodies: "",
      minorBodies: "",
      other: "",
      notes: "",
    },
    rotation: {
      sidereal: dayLengthHours,
      solar: dayLengthHours,
      solarDaysPerYear,
      axialTilt: worldRecord?.axialTilt ?? null,
      tidalLock: Number(dayLengthHours) >= Number(orbitalPeriodDays) * 24 && orbitalPeriodDays ? "yes" : "no",
      tides: Number(seismology?.tidalStressFactor ?? 0) > 0 ? "Present" : "Minimal",
      notes: "",
    },
    temperature: {
      high: null,
      mean: meanTemperatureK ? Number(meanTemperatureK.toFixed(1)) : null,
      low: null,
      luminosity: stars.reduce((sum, star) => sum + Number(star?.luminosity || 0), 0) || null,
      albedo: null,
      greenhouse: "",
      seismicStress: String(seismology?.totalSeismicStress ?? ""),
      residualStress: String(seismology?.residualSeismicStress ?? ""),
      tidalStress: String(seismology?.tidalStressFactor ?? ""),
      tidalHeating: String(seismology?.tidalHeatingFactor ?? ""),
      majorTectonicPlates: worldRecord?.majorTectonicPlates ?? seismology?.majorTectonicPlates ?? null,
      notes: worldRecord?.tempCategory ? `${worldRecord.tempCategory} climate regime` : "",
    },
    life: buildLifeSurvey(worldRecord?.nativeLifeform, worldRecord?.nativeSophontLife),
    resources: {
      rating: normalizeResourceRatingForSurvey(worldRecord?.resourceRating),
      notes: "",
    },
    habitability: {
      rating: normalizeHabitabilityForSurvey(worldRecord?.habitability),
      notes: "",
    },
    subordinates: buildSubordinates(worldRecord),
    comments: Array.isArray(worldRecord?.remarks) ? worldRecord.remarks.join(", ") : "",
  };
}

const resolvedSystemRecord = computed(() => {
  if (props.systemRecord && typeof props.systemRecord === "object") {
    return props.systemRecord;
  }

  const requestedId = String(
    props.systemId || route.query.systemRecordId || route.query.systemId || systemStore.currentSystemId || "",
  ).trim();
  if (!requestedId) {
    return systemStore.getCurrentSystem;
  }

  return systemStore.systems.find((system) => String(system?.systemId) === requestedId) ?? systemStore.getCurrentSystem;
});

const resolvedWorldIndex = computed(() => {
  const explicitIndex = props.worldIndex ?? route.query.worldIndex;
  const parsed = Number.parseInt(String(explicitIndex ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
});

const resolvedWorldRecord = computed(() => {
  if (props.worldRecord && typeof props.worldRecord === "object") {
    return props.worldRecord;
  }

  const systemRecord = resolvedSystemRecord.value;
  if (!systemRecord || !Array.isArray(systemRecord?.planets)) {
    return null;
  }

  if (resolvedWorldIndex.value !== null) {
    return systemRecord.planets[resolvedWorldIndex.value] ?? null;
  }

  const routeWorldName = String(route.query.worldName || "").trim();
  if (!routeWorldName) {
    return null;
  }

  return systemRecord.planets.find((planet) => String(planet?.name || "").trim() === routeWorldName) ?? null;
});

const surveyData = ref(createEmptySurveyData());

watch(
  [resolvedSystemRecord, resolvedWorldRecord],
  ([systemRecord, worldRecord]) => {
    if (!props.autofill) {
      return;
    }
    surveyData.value = buildSurveyDataFromWorld(systemRecord, worldRecord);
  },
  { immediate: true },
);

const addSubordinate = () => {
  surveyData.value.subordinates.push(createEmptySubordinateRow());
};

const removeSubordinate = (index) => {
  surveyData.value.subordinates.splice(index, 1);
};

function updateMoonData(existingMoons = [], subordinates = []) {
  let subordinateIndex = 0;
  return (Array.isArray(existingMoons) ? existingMoons : []).map((moon) => {
    if (moon?.type !== "significant" || moon?.ring) {
      return moon;
    }

    const subordinate = subordinates[subordinateIndex] ?? null;
    subordinateIndex += 1;
    if (!subordinate) {
      return moon;
    }

    return {
      ...moon,
      name: String(subordinate.name || moon.name || "").trim() || moon.name,
      worldProfile:
        moon?.worldProfile && typeof moon.worldProfile === "object"
          ? {
              ...moon.worldProfile,
              ...(subordinate.sah_uwp ? { uwp: subordinate.sah_uwp } : {}),
              ...(subordinate.diameter !== null ? { diameterKm: subordinate.diameter } : {}),
              ...(subordinate.density !== null ? { density: subordinate.density } : {}),
              ...(subordinate.mass !== null ? { mass: subordinate.mass } : {}),
            }
          : moon?.worldProfile,
    };
  });
}

const saveSurvey = async () => {
  if (!surveyData.value.worldName) {
    alert("Please enter a world name");
    return;
  }

  try {
    const payload = {
      ...surveyData.value,
      subordinates: surveyData.value.subordinates.filter((moon) => String(moon?.name || "").trim()),
    };

    const currentSystem = resolvedSystemRecord.value;
    const worldIndex = resolvedWorldIndex.value;
    if (
      currentSystem?.systemId &&
      worldIndex !== null &&
      Array.isArray(currentSystem?.planets) &&
      currentSystem.planets[worldIndex]
    ) {
      const currentPlanet = currentSystem.planets[worldIndex];
      const nextPlanet = {
        ...currentPlanet,
        name: String(payload.worldName || currentPlanet.name || "").trim() || currentPlanet.name,
        uwp: String(payload.sah_uwp || currentPlanet.uwp || "").trim() || currentPlanet.uwp,
        diameterKm: payload.size.diameter ?? currentPlanet.diameterKm,
        composition: String(payload.size.composition || currentPlanet.composition || ""),
        density: payload.size.density ?? currentPlanet.density,
        gravity: payload.size.gravity ?? currentPlanet.gravity,
        mass: payload.size.mass ?? currentPlanet.mass,
        escapeVelocityMps:
          payload.size.escapeVelocity !== null && payload.size.escapeVelocity !== undefined
            ? Number(payload.size.escapeVelocity) * 1000
            : currentPlanet.escapeVelocityMps,
        orbitalPeriodDays: parseNumericString(payload.orbit.period) ?? currentPlanet.orbitalPeriodDays,
        dayLengthHours: payload.rotation.sidereal ?? currentPlanet.dayLengthHours,
        axialTilt: payload.rotation.axialTilt ?? currentPlanet.axialTilt,
        avgTempC:
          payload.temperature.mean !== null && payload.temperature.mean !== undefined
            ? Number(payload.temperature.mean) - 273.15
            : currentPlanet.avgTempC,
        majorTectonicPlates: payload.temperature.majorTectonicPlates ?? currentPlanet.majorTectonicPlates,
        resourceRating: titleCase(payload.resources.rating) || currentPlanet.resourceRating,
        habitability: titleCase(payload.habitability.rating) || currentPlanet.habitability,
        nativeSophontLife:
          payload.life.sophonts === "native" || payload.life.sophonts === "mixed"
            ? true
            : currentPlanet.nativeSophontLife,
        nativeLifeform:
          `${payload.life.biomass}${payload.life.biocomplexity}${payload.life.biodiversity}${payload.life.compatibility}`.replace(
            /\s+/g,
            "",
          ) || currentPlanet.nativeLifeform,
        seismology: {
          ...(currentPlanet?.seismology && typeof currentPlanet.seismology === "object"
            ? currentPlanet.seismology
            : {}),
          residualSeismicStress:
            parseNumericString(payload.temperature.residualStress) ?? currentPlanet?.seismology?.residualSeismicStress,
          tidalStressFactor:
            parseNumericString(payload.temperature.tidalStress) ?? currentPlanet?.seismology?.tidalStressFactor,
          tidalHeatingFactor:
            parseNumericString(payload.temperature.tidalHeating) ?? currentPlanet?.seismology?.tidalHeatingFactor,
          totalSeismicStress:
            parseNumericString(payload.temperature.seismicStress) ?? currentPlanet?.seismology?.totalSeismicStress,
          majorTectonicPlates:
            payload.temperature.majorTectonicPlates ?? currentPlanet?.seismology?.majorTectonicPlates,
        },
        moonsData: updateMoonData(currentPlanet?.moonsData, payload.subordinates),
        physicalSurvey: payload,
      };

      const nextPlanets = currentSystem.planets.map((planet, index) => (index === worldIndex ? nextPlanet : planet));
      const updatedSystem = await systemStore.updateSystem(currentSystem.systemId, {
        planets: nextPlanets,
        metadata: {
          ...(currentSystem?.metadata && typeof currentSystem.metadata === "object" ? currentSystem.metadata : {}),
          lastModified: new Date().toISOString(),
        },
      });

      if (updatedSystem?.systemId) {
        systemStore.setCurrentSystem(updatedSystem.systemId);
      }
    } else {
      console.log("✓ World Physical Survey saved:", payload);
    }

    alert("✓ World Physical Survey saved successfully!");
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

const resetForm = () => {
  if (props.autofill) {
    surveyData.value = buildSurveyDataFromWorld(resolvedSystemRecord.value, resolvedWorldRecord.value);
    return;
  }
  surveyData.value = createEmptySurveyData();
};

const printForm = () => {
  window.print();
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── FORM WRAPPER ── */
.survey-form {
  background: #ffffff;
  border: 2px solid #000;
  margin: 0 auto;
  max-width: 1000px;
}

/* ── HEADER (RUST ORANGE) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #9a410e; /* Rust orange header */
  color: #ffffff;
  padding: 8px 12px;
  border-bottom: 2px solid #000;
}

.form-header .title-block {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.form-header .form-number {
  font-size: 12px;
  text-align: right;
  letter-spacing: 1px;
}

/* ── SECTION LABEL ── */
.section-label {
  background: #7a3209; /* Darker rust orange */
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 8px;
  border-bottom: 1px solid #000;
  border-top: 1px solid #000;
}

/* ── FORM ROWS & CELLS ── */
.form-row {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.form-row:last-child {
  border-bottom: none;
}

.form-cell {
  flex: 1;
  border-right: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.form-cell:last-child {
  border-right: none;
}

.form-cell.grow-2 {
  flex: 2;
}
.form-cell.grow-3 {
  flex: 3;
}
.form-cell.grow-4 {
  flex: 4;
}
.form-cell.grow-5 {
  flex: 5;
}
.form-cell.grow-6 {
  flex: 6;
}

.cell-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}

.cell-input {
  border: 1px solid #999;
  border-radius: 2px;
  padding: 4px 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  color: #000;
  background: #fff;
}

.cell-input:focus {
  outline: none;
  border-color: #9a410e;
  box-shadow: 0 0 4px rgba(154, 65, 14, 0.3);
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
}

/* ── TABLE ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.sub-table th {
  background: #e8dcc8; /* Light rust orange */
  border: 1px solid #aaa;
  padding: 4px 2px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 8px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  color: #333;
}

.sub-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.sub-table tbody tr:nth-child(even) td {
  background-color: #faf8f5; /* Very light rust */
}

.table-input {
  width: 100%;
  border: none;
  padding: 2px 3px;
  font-size: 9px;
  font-family: Arial, monospace;
  background: transparent;
}

.table-input:focus {
  outline: none;
  background: #fff3cd;
  border-bottom: 1px solid #9a410e;
}

.action-cell {
  text-align: center;
  padding: 2px 1px;
}

.btn-remove {
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #dc2626;
}

/* ── BUTTON ROW ── */
.button-row {
  padding: 6px 8px;
  text-align: right;
  border-top: 1px solid #ddd;
}

.btn-add {
  background: #9a410e;
  color: #fff;
  border: none;
  padding: 4px 12px;
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #7a3209;
  box-shadow: 0 0 6px rgba(154, 65, 14, 0.4);
}

/* ── NOTES SECTION ── */
.notes-row {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.notes-cell {
  flex: 1;
  padding: 6px 8px;
  min-height: 22px;
}

.notes-textarea {
  width: 100%;
  border: 1px solid #999;
  border-radius: 2px;
  padding: 4px 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  resize: vertical;
  min-height: 40px;
}

.notes-textarea:focus {
  outline: none;
  border-color: #9a410e;
  box-shadow: 0 0 4px rgba(154, 65, 14, 0.3);
}

/* ── COMMENTS SECTION ── */
.comments-block {
  padding: 8px;
  border-top: 2px solid #000;
  background: #f9f9f9;
}

.comments-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  margin-bottom: 6px;
  display: block;
}

.comments-textarea {
  width: 100%;
  border: 1px solid #999;
  border-radius: 3px;
  padding: 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  resize: vertical;
}

.comments-textarea:focus {
  outline: none;
  border-color: #9a410e;
  box-shadow: 0 0 4px rgba(154, 65, 14, 0.3);
}

/* ── ACTION BUTTONS ── */
.form-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-top: 2px solid #000;
  justify-content: flex-start;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #9a410e;
  color: #fff;
}

.btn-primary:hover {
  background: #7a3209;
  box-shadow: 0 0 8px rgba(154, 65, 14, 0.5);
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
  border: 1px solid #999;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-small {
  padding: 4px 8px;
  font-size: 9px;
}

/* ── PRINT STYLES ── */
@media print {
  .form-actions,
  .button-row {
    display: none !important;
  }

  .form-header,
  .section-label {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .sub-table th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    background: white;
    padding: 0;
  }

  .survey-form {
    margin: 0;
    width: 100%;
  }
}
</style>
