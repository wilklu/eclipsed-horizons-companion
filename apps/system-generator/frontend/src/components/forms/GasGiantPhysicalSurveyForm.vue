<template>
  <div class="survey-form">
    <!-- FORM HEADER - NAVY -->
    <div class="form-header">
      <div class="title-block">Gas Giant Physical Survey</div>
      <div class="form-number">FORM 0407G-IV PART P.GG | METHOD 1: STANDARD</div>
    </div>

    <!-- GAS GIANT IDENTIFICATION -->
    <div class="section-block">
      <div class="form-row">
        <div class="form-cell grow-4">
          <label class="cell-label">World Name</label>
          <input v-model="surveyData.worldName" type="text" class="cell-input" placeholder="e.g., Jupiter" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">GLE / SAH Code</label>
          <input v-model="surveyData.gleCode" type="text" class="cell-input" placeholder="Code" />
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
        <div class="form-cell grow-2">
          <label class="cell-label">AU</label>
          <input v-model.number="surveyData.orbit.au" type="number" step="0.01" class="cell-input" placeholder="5.2" />
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
            placeholder="0.048"
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Period</label>
          <input v-model="surveyData.orbit.period" type="text" class="cell-input" placeholder="11.86 years" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.orbit.notes"
          class="notes-textarea"
          placeholder="Orbital characteristics..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- SIZE & MASS SECTION -->
    <div class="section-block">
      <div class="section-label">Size &amp; Mass</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Size Code</label>
          <input v-model="surveyData.size.code" type="text" class="cell-input" placeholder="H" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Diameter (km)</label>
          <input
            v-model.number="surveyData.size.diameterKm"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="142984"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Diameter (J = 1)</label>
          <input
            v-model.number="surveyData.size.diameterJ"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="11.21"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Mass (J = 1)</label>
          <input
            v-model.number="surveyData.size.massJ"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="317.8"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Mass (☉)</label>
          <input
            v-model.number="surveyData.size.massSolar"
            type="number"
            step="0.00001"
            class="cell-input"
            placeholder="0.001"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Density (g/cm³)</label>
          <input
            v-model.number="surveyData.size.density"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="1.326"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Gravity (G)</label>
          <input
            v-model.number="surveyData.size.gravity"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="2.5"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Esc v (kps)</label>
          <input
            v-model.number="surveyData.size.escapeVelocity"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="61.4"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Rotation Period</label>
          <input v-model="surveyData.size.rotationPeriod" type="text" class="cell-input" placeholder="9.9 hours" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.size.notes"
          class="notes-textarea"
          placeholder="Physical characteristics..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- COMPOSITION SECTION -->
    <div class="section-block">
      <div class="section-label">Composition</div>
      <div class="comp-grid">
        <div class="comp-cell">
          <label class="cell-label">Type</label>
          <select v-model="surveyData.composition.type" class="cell-input">
            <option value="">—</option>
            <option value="Hydrogen/Helium">H₂/He</option>
            <option value="Ice Giant">Ice Giant</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
        <div class="comp-cell">
          <label class="cell-label">H₂ / He (%)</label>
          <input
            v-model.number="surveyData.composition.hydrogenHelium"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="75"
          />
        </div>
        <div class="comp-cell">
          <label class="cell-label">Methane (%)</label>
          <input
            v-model.number="surveyData.composition.methane"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="3"
          />
        </div>
        <div class="comp-cell">
          <label class="cell-label">Ammonia (%)</label>
          <input
            v-model.number="surveyData.composition.ammonia"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="2"
          />
        </div>
        <div class="comp-cell">
          <label class="cell-label">Other (%)</label>
          <input
            v-model.number="surveyData.composition.other"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="20"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Core Type</label>
          <input
            v-model="surveyData.composition.coreType"
            type="text"
            class="cell-input"
            placeholder="Rocky, Iron, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Metallic Hydrogen Layer?</label>
          <select v-model="surveyData.composition.metallicHydrogen" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Temperature (Cloud Top K)</label>
          <input
            v-model.number="surveyData.composition.temperature"
            type="number"
            class="cell-input"
            placeholder="110"
          />
          <div class="conversion">
            <small v-if="formatTemperatureFromKelvin(surveyData.composition.temperature) !== '—'">
              ≈ {{ formatTemperatureFromKelvin(surveyData.composition.temperature) }}
            </small>
            <small v-else class="muted">—</small>
          </div>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Internal Heat?</label>
          <select v-model="surveyData.composition.internalHeat" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.composition.notes"
          class="notes-textarea"
          placeholder="Composition details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- ATMOSPHERE & WEATHER SECTION -->
    <div class="section-block">
      <div class="section-label">Atmosphere &amp; Weather</div>
      <div class="atmo-grid">
        <div class="atmo-cell">
          <label class="cell-label">Cloud Bands</label>
          <input v-model="surveyData.atmosphere.cloudBands" type="text" class="cell-input" placeholder="Prominent" />
        </div>
        <div class="atmo-cell">
          <label class="cell-label">Storm Systems</label>
          <input
            v-model="surveyData.atmosphere.stormSystems"
            type="text"
            class="cell-input"
            placeholder="Great Red Spot"
          />
        </div>
        <div class="atmo-cell">
          <label class="cell-label">Wind Speed</label>
          <input v-model="surveyData.atmosphere.windSpeed" type="text" class="cell-input" placeholder="600 m/s" />
        </div>
        <div class="atmo-cell">
          <label class="cell-label">Colour / Appearance</label>
          <input v-model="surveyData.atmosphere.colour" type="text" class="cell-input" placeholder="Orange/Brown" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.atmosphere.notes"
          class="notes-textarea"
          placeholder="Atmospheric details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- MAGNETOSPHERE SECTION -->
    <div class="section-block">
      <div class="section-label">Magnetosphere</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Strength</label>
          <input v-model="surveyData.magnetosphere.strength" type="text" class="cell-input" placeholder="Strong" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Magnetopause (km)</label>
          <input
            v-model.number="surveyData.magnetosphere.magnetopause"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="7000000"
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Radiation Belt Hazard</label>
          <select v-model="surveyData.magnetosphere.radiationHazard" class="cell-input">
            <option value="">—</option>
            <option value="None">None</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Extreme">Extreme</option>
          </select>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.magnetosphere.notes"
          class="notes-textarea"
          placeholder="Magnetosphere details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- RESOURCES SECTION -->
    <div class="section-block">
      <div class="section-label">Resources</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Rating</label>
          <select v-model="surveyData.resources.rating" class="cell-input">
            <option value="">—</option>
            <option value="Abundant">Abundant</option>
            <option value="Common">Common</option>
            <option value="Scarce">Scarce</option>
            <option value="Rare">Rare</option>
            <option value="None">None</option>
          </select>
        </div>
        <div class="form-cell grow-5">
          <label class="cell-label">Notes</label>
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

    <!-- RING SYSTEM SECTION -->
    <div class="section-block">
      <div class="section-label">Ring System</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Rings Present?</label>
          <select v-model="surveyData.rings.present" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="form-cell grow-5">
          <label class="cell-label">General Description</label>
          <input
            v-model="surveyData.rings.description"
            type="text"
            class="cell-input"
            placeholder="Ring characteristics..."
          />
        </div>
      </div>

      <!-- RINGS TABLE -->
      <div class="table-wrapper">
        <table class="ring-table">
          <thead>
            <tr>
              <th>Ring</th>
              <th>Inner Limit (km)</th>
              <th>Outer Limit (km)</th>
              <th>Inner (PD)</th>
              <th>Outer (PD)</th>
              <th>Width (km)</th>
              <th>Opacity</th>
              <th>Composition / Notes</th>
              <th class="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ring, index) in surveyData.rings.rings" :key="index">
              <td><input v-model="ring.name" type="text" class="table-input" placeholder="Ring A" /></td>
              <td>
                <input
                  v-model.number="ring.innerLimitKm"
                  type="number"
                  step="0.1"
                  class="table-input"
                  placeholder="0"
                />
              </td>
              <td>
                <input
                  v-model.number="ring.outerLimitKm"
                  type="number"
                  step="0.1"
                  class="table-input"
                  placeholder="0"
                />
              </td>
              <td>
                <input v-model.number="ring.innerPD" type="number" step="0.01" class="table-input" placeholder="0" />
              </td>
              <td>
                <input v-model.number="ring.outerPD" type="number" step="0.01" class="table-input" placeholder="0" />
              </td>
              <td>
                <input v-model.number="ring.widthKm" type="number" step="0.1" class="table-input" placeholder="0" />
              </td>
              <td><input v-model="ring.opacity" type="text" class="table-input" placeholder="Opaque" /></td>
              <td><input v-model="ring.composition" type="text" class="table-input" placeholder="Ice, rock" /></td>
              <td class="action-cell">
                <button @click="removeRing(index)" class="btn-remove" v-if="surveyData.rings.rings.length > 0">
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="button-row">
        <button @click="addRing" class="btn btn-small btn-add">+ Add Ring</button>
      </div>
    </div>

    <!-- SATELLITES SECTION -->
    <div class="section-block">
      <div class="section-label">Satellites</div>
      <div class="table-wrapper">
        <table class="sat-table">
          <thead>
            <tr>
              <th>Name / ID</th>
              <th>SAH / UWP</th>
              <th>Orbit (PD)</th>
              <th>Orbit (km)</th>
              <th>Ecc</th>
              <th>Period (h)</th>
              <th>Diameter</th>
              <th>Density</th>
              <th>Mass (⊕)</th>
              <th>Size (°)</th>
              <th>Notes</th>
              <th class="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sat, index) in surveyData.satellites" :key="index">
              <td><input v-model="sat.name" type="text" class="table-input" placeholder="Io" /></td>
              <td><input v-model="sat.sah_uwp" type="text" class="table-input" placeholder="X000000-0" /></td>
              <td>
                <input v-model.number="sat.orbitPD" type="number" step="0.01" class="table-input" placeholder="0" />
              </td>
              <td>
                <input v-model.number="sat.orbitKm" type="number" step="0.1" class="table-input" placeholder="0" />
              </td>
              <td>
                <input
                  v-model.number="sat.eccentricity"
                  type="number"
                  step="0.001"
                  class="table-input"
                  placeholder="0"
                />
              </td>
              <td>
                <input v-model.number="sat.periodHours" type="number" step="0.01" class="table-input" placeholder="0" />
              </td>
              <td><input v-model="sat.diameter" type="text" class="table-input" placeholder="km" /></td>
              <td>
                <input v-model.number="sat.density" type="number" step="0.01" class="table-input" placeholder="0" />
              </td>
              <td>
                <input v-model.number="sat.mass" type="number" step="0.001" class="table-input" placeholder="0" />
              </td>
              <td>
                <input v-model.number="sat.sizeAngle" type="number" step="0.1" class="table-input" placeholder="0" />
              </td>
              <td><input v-model="sat.notes" type="text" class="table-input" placeholder="Notes" /></td>
              <td class="action-cell">
                <button @click="removeSatellite(index)" class="btn-remove" v-if="surveyData.satellites.length > 0">
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="button-row">
        <button @click="addSatellite" class="btn btn-small btn-add">+ Add Satellite</button>
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
import { ref } from "vue";
import { formatTemperatureFromKelvin } from "../../utils/temperatureFormatting.js";

// Form data
const surveyData = ref({
  worldName: "",
  gleCode: "",
  sectorLocation: "",
  initialSurvey: new Date().toISOString().split("T")[0],
  lastUpdated: new Date().toISOString().split("T")[0],
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
    code: "",
    diameterKm: null,
    diameterJ: null,
    massJ: null,
    massSolar: null,
    density: null,
    gravity: null,
    escapeVelocity: null,
    rotationPeriod: "",
    notes: "",
  },

  composition: {
    type: "",
    hydrogenHelium: null,
    methane: null,
    ammonia: null,
    other: null,
    coreType: "",
    metallicHydrogen: "",
    temperature: null,
    internalHeat: "",
    notes: "",
  },

  atmosphere: {
    cloudBands: "",
    stormSystems: "",
    windSpeed: "",
    colour: "",
    notes: "",
  },

  magnetosphere: {
    strength: "",
    magnetopause: null,
    radiationHazard: "",
    notes: "",
  },

  resources: {
    rating: "",
    notes: "",
  },

  rings: {
    present: "",
    description: "",
    rings: Array.from({ length: 3 }, () => ({
      name: "",
      innerLimitKm: null,
      outerLimitKm: null,
      innerPD: null,
      outerPD: null,
      widthKm: null,
      opacity: "",
      composition: "",
    })),
  },

  satellites: Array.from({ length: 8 }, () => ({
    name: "",
    sah_uwp: "",
    orbitPD: null,
    orbitKm: null,
    eccentricity: null,
    periodHours: null,
    diameter: "",
    density: null,
    mass: null,
    sizeAngle: null,
    notes: "",
  })),

  comments: "",
});

// Add ring
const addRing = () => {
  surveyData.value.rings.rings.push({
    name: "",
    innerLimitKm: null,
    outerLimitKm: null,
    innerPD: null,
    outerPD: null,
    widthKm: null,
    opacity: "",
    composition: "",
  });
};

// Remove ring
const removeRing = (index) => {
  surveyData.value.rings.rings.splice(index, 1);
};

// Add satellite
const addSatellite = () => {
  surveyData.value.satellites.push({
    name: "",
    sah_uwp: "",
    orbitPD: null,
    orbitKm: null,
    eccentricity: null,
    periodHours: null,
    diameter: "",
    density: null,
    mass: null,
    sizeAngle: null,
    notes: "",
  });
};

// Remove satellite
const removeSatellite = (index) => {
  surveyData.value.satellites.splice(index, 1);
};

// Save survey
const saveSurvey = async () => {
  if (!surveyData.value.worldName) {
    alert("Please enter a world name");
    return;
  }

  try {
    const payload = {
      ...surveyData.value,
      rings: surveyData.value.rings.rings.filter((r) => r.name),
      satellites: surveyData.value.satellites.filter((s) => s.name),
    };

    console.log("✓ Gas Giant Survey saved:", payload);
    alert("✓ Gas Giant Survey saved successfully!");
    resetForm();
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

// Reset form
const resetForm = () => {
  surveyData.value = {
    worldName: "",
    gleCode: "",
    sectorLocation: "",
    initialSurvey: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().split("T")[0],
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
      code: "",
      diameterKm: null,
      diameterJ: null,
      massJ: null,
      massSolar: null,
      density: null,
      gravity: null,
      escapeVelocity: null,
      rotationPeriod: "",
      notes: "",
    },
    composition: {
      type: "",
      hydrogenHelium: null,
      methane: null,
      ammonia: null,
      other: null,
      coreType: "",
      metallicHydrogen: "",
      temperature: null,
      internalHeat: "",
      notes: "",
    },
    atmosphere: {
      cloudBands: "",
      stormSystems: "",
      windSpeed: "",
      colour: "",
      notes: "",
    },
    magnetosphere: {
      strength: "",
      magnetopause: null,
      radiationHazard: "",
      notes: "",
    },
    resources: {
      rating: "",
      notes: "",
    },
    rings: {
      present: "",
      description: "",
      rings: Array.from({ length: 3 }, () => ({
        name: "",
        innerLimitKm: null,
        outerLimitKm: null,
        innerPD: null,
        outerPD: null,
        widthKm: null,
        opacity: "",
        composition: "",
      })),
    },
    satellites: Array.from({ length: 8 }, () => ({
      name: "",
      sah_uwp: "",
      orbitPD: null,
      orbitKm: null,
      eccentricity: null,
      periodHours: null,
      diameter: "",
      density: null,
      mass: null,
      sizeAngle: null,
      notes: "",
    })),
    comments: "",
  };
};

// Print form
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
  border: 2px solid #542308;
  margin: 0 auto;
  max-width: 1000px;
}

/* ── HEADER (RUST ORANGE) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #9a410e;
  color: #ffffff;
  padding: 8px 12px;
  border-bottom: 2px solid #542308;
}

.form-header .title-block {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.form-header .form-number {
  font-size: 11px;
  text-align: right;
  letter-spacing: 1px;
}

/* ── SECTION LABEL ── */
.section-label {
  background: #7a3209; /* Darker rust orange to match */
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 8px;
  border-bottom: 1px solid #542308;
  border-top: 1px solid #542308;
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
  border-bottom: 2px solid #9a410e;
}

/* ── COMPOSITION GRID (5-col) ── */
.comp-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-bottom: 1px solid #ccc;
}

.comp-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.comp-cell:nth-child(5n) {
  border-right: none;
}

/* ── ATMOSPHERE GRID (4-col) ── */
.atmo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #ccc;
}

.atmo-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.atmo-cell:nth-child(4n) {
  border-right: none;
}

/* ── NOTES SECTION ── */
.notes-row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
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

/* ── TABLE ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.ring-table,
.sat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.ring-table th,
.sat-table th {
  background: #e8dcc8;
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

.ring-table td,
.sat-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.ring-table tbody tr:nth-child(even) td,
.sat-table tbody tr:nth-child(even) td {
  background-color: #faf8f5;
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
  min-width: 40px;
}

.action-col {
  min-width: 40px;
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
  background: #9a410e;
  box-shadow: 0 0 6px rgba(154, 65, 14, 0.4);
}

/* ── COMMENTS SECTION ── */
.comments-block {
  padding: 8px;
  border-top: 2px solid #9a410e;
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
  border-top: 2px solid #542308;
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
  background: #9a410e;
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
