<template>
  <div class="survey-form">
    <!-- FORM HEADER - FOREST GREEN -->
    <div class="form-header">
      <div class="title-block">Planetary Survey</div>
      <div class="form-number">FORM 0421D-II.III</div>
    </div>

    <!-- LOCATION & DATES SECTION -->
    <div class="section-block">
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
          <label class="cell-label">Star Designation</label>
          <input
            v-model="surveyData.starDesignation"
            type="text"
            class="cell-input"
            placeholder="e.g., Sol, Proxima Centauri"
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">System Age (Gyr)</label>
          <input v-model.number="surveyData.systemAge" type="number" step="0.1" class="cell-input" placeholder="4.6" />
        </div>
      </div>
    </div>

    <!-- OBJECTS SUMMARY SECTION -->
    <div class="section-block">
      <div class="section-label">Objects</div>
      <div class="form-row">
        <div class="objects-cell">
          <label class="cell-label">Stellar</label>
          <input v-model.number="surveyData.stellar" type="number" class="cell-input objects-input" placeholder="0" />
        </div>
        <div class="objects-cell">
          <label class="cell-label">Gas Giants</label>
          <input v-model.number="surveyData.gasGiants" type="number" class="cell-input objects-input" placeholder="0" />
        </div>
        <div class="objects-cell">
          <label class="cell-label">Planetoid Belts</label>
          <input
            v-model.number="surveyData.planetoidBelts"
            type="number"
            class="cell-input objects-input"
            placeholder="0"
          />
        </div>
        <div class="objects-cell">
          <label class="cell-label">Terrestrials</label>
          <input
            v-model.number="surveyData.terrestrials"
            type="number"
            class="cell-input objects-input"
            placeholder="0"
          />
        </div>
        <div class="objects-cell">
          <label class="cell-label">Planetary Survey Status?</label>
          <select v-model="surveyData.classIIIStatus" class="cell-input objects-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>
    </div>

    <!-- STARS TABLE SECTION -->
    <div class="section-block">
      <div class="section-label">Stars</div>
      <div class="table-wrapper">
        <table class="stars-table">
          <thead>
            <tr>
              <th style="width: 65px">Component</th>
              <th style="width: 65px">Class</th>
              <th style="width: 55px">Mass</th>
              <th style="width: 55px">Temp (K)</th>
              <th style="width: 60px">Diameter</th>
              <th style="width: 65px">Luminosity</th>
              <th style="width: 50px">Orbit #</th>
              <th style="width: 55px">AU</th>
              <th style="width: 45px">Ecc</th>
              <th style="width: 70px">Period (yr)</th>
              <th style="width: 50px">MAO</th>
              <th style="width: 50px">HZCO</th>
              <th style="width: 40px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(star, index) in surveyData.stars" :key="index">
              <td>
                <input v-model="star.component" type="text" class="table-input" placeholder="Primary" />
              </td>
              <td>
                <input v-model="star.class" type="text" class="table-input" placeholder="A0" />
              </td>
              <td>
                <input v-model.number="star.mass" type="number" step="0.01" class="table-input" placeholder="1.0" />
              </td>
              <td>
                <input v-model.number="star.temperature" type="number" class="table-input" placeholder="5778" />
              </td>
              <td>
                <input v-model.number="star.diameter" type="number" step="0.01" class="table-input" placeholder="1.0" />
              </td>
              <td>
                <input
                  v-model.number="star.luminosity"
                  type="number"
                  step="0.01"
                  class="table-input"
                  placeholder="1.0"
                />
              </td>
              <td>
                <input v-model.number="star.orbitNumber" type="number" class="table-input" placeholder="1" />
              </td>
              <td>
                <input v-model.number="star.au" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input
                  v-model.number="star.eccentricity"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  class="table-input"
                  placeholder="0.0"
                />
              </td>
              <td>
                <input v-model.number="star.period" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input v-model.number="star.mao" type="number" step="0.01" class="table-input" placeholder="—" />
              </td>
              <td>
                <input v-model="star.hzco" type="text" class="table-input" placeholder="—" />
              </td>
              <td class="action-cell">
                <button
                  @click="removeStar(index)"
                  class="btn-remove"
                  v-if="surveyData.stars.length > 1"
                  title="Remove star"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ADD STAR BUTTON -->
      <div class="button-row">
        <button @click="addStar" class="btn btn-small btn-add">+ Add Star</button>
      </div>

      <!-- NOTES SECTION -->
      <div class="notes-section">
        <div class="notes-label">Notes:</div>
        <textarea
          v-model="surveyData.starsNotes"
          class="notes-textarea"
          placeholder="Star observations..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- OBJECTS (PLANETARY) TABLE SECTION -->
    <div class="section-block">
      <div class="section-label">Objects</div>
      <div class="table-wrapper">
        <table class="objects-table">
          <thead>
            <tr>
              <th style="width: 60px">Primary</th>
              <th style="width: 80px">Object</th>
              <th style="width: 50px">Orbit #</th>
              <th style="width: 55px">AU</th>
              <th style="width: 50px">Ecc</th>
              <th style="width: 75px">Period</th>
              <th style="width: 75px">SAH / UWP</th>
              <th style="width: 40px">Sub</th>
              <th style="flex: 1">Notes</th>
              <th style="width: 40px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(obj, index) in surveyData.objects" :key="index">
              <td>
                <input v-model="obj.primary" type="text" class="table-input" placeholder="Star" />
              </td>
              <td>
                <input v-model="obj.objectName" type="text" class="table-input" placeholder="Planet/Moon" />
              </td>
              <td>
                <input v-model.number="obj.orbitNumber" type="number" class="table-input" placeholder="1" />
              </td>
              <td>
                <input v-model.number="obj.au" type="number" step="0.01" class="table-input" placeholder="0.0" />
              </td>
              <td>
                <input
                  v-model.number="obj.eccentricity"
                  type="number"
                  step="0.01"
                  class="table-input"
                  placeholder="0.0"
                />
              </td>
              <td>
                <input v-model="obj.period" type="text" class="table-input" placeholder="0.0y" />
              </td>
              <td>
                <input v-model="obj.sahUwp" type="text" class="table-input" placeholder="X000000-0" />
              </td>
              <td>
                <input v-model="obj.sub" type="text" class="table-input" placeholder="—" />
              </td>
              <td>
                <input v-model="obj.notes" type="text" class="table-input" placeholder="Notes" />
              </td>
              <td class="action-cell">
                <button @click="removeObject(index)" class="btn-remove" title="Remove object">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ADD OBJECT BUTTON -->
      <div class="button-row">
        <button @click="addObject" class="btn btn-small btn-add">+ Add Object</button>
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

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Dominant Gas</label>
          <input
            v-model="surveyData.atmosphere.compositionDetailed.dominantGas"
            type="text"
            class="cell-input"
            placeholder="N₂, H₂, CO₂"
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">Gases (name + fraction)</label>
          <div>
            <div
              v-for="(g, gi) in surveyData.atmosphere.compositionDetailed.gases"
              :key="gi"
              style="display: flex; gap: 6px; align-items: center"
            >
              <input v-model="g.gas" type="text" class="cell-input" placeholder="Gas name" style="flex: 2" />
              <input
                v-model.number="g.fraction"
                type="number"
                step="0.001"
                min="0"
                max="1"
                class="cell-input"
                placeholder="fraction"
                style="width: 110px"
              />
              <button
                type="button"
                class="btn-remove"
                @click="removeAtmosphereGas(gi)"
                v-if="surveyData.atmosphere.compositionDetailed.gases.length > 1"
              >
                ✕
              </button>
            </div>
            <div style="margin-top: 6px">
              <button type="button" class="btn btn-small btn-add" @click="addAtmosphereGas">+ Add Gas</button>
            </div>
          </div>
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Structured Notes</label>
          <input
            v-model="surveyData.atmosphere.compositionDetailed.description"
            type="text"
            class="cell-input"
            placeholder="Optional description"
          />
        </div>
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
import { systemApi } from "../../api/systemApi";

// Form data
const surveyData = ref({
  sectorLocation: "",
  initialSurvey: new Date().toISOString().split("T")[0],
  lastUpdated: new Date().toISOString().split("T")[0],
  starDesignation: "",
  systemAge: null,

  // Objects summary
  stellar: 0,
  gasGiants: 0,
  planetoidBelts: 0,
  terrestrials: 0,
  classIIIStatus: "",

  // Stars table
  stars: [
    {
      component: "",
      class: "",
      mass: null,
      temperature: null,
      diameter: null,
      luminosity: null,
      orbitNumber: null,
      au: null,
      eccentricity: null,
      period: null,
      mao: null,
      hzco: "",
    },
  ],
  starsNotes: "",

  // Objects table (30 rows initially)
  objects: Array.from({ length: 30 }, () => ({
    primary: "",
    objectName: "",
    orbitNumber: null,
    au: null,
    eccentricity: null,
    period: "",
    sahUwp: "",
    sub: "",
    notes: "",
  })),

  atmosphere: {
    pressure: null,
    composition: "",
    o2Partial: null,
    taints: "",
    scaleHeight: null,
    notes: "",
    compositionDetailed: {
      code: null,
      description: "",
      dominantGas: "",
      gases: [
        { gas: "", fraction: null },
        { gas: "", fraction: null },
        { gas: "", fraction: null },
      ],
      taints: [],
      provenance: null,
    },
  },

  comments: "",
});

// Add new star
const addStar = () => {
  surveyData.value.stars.push({
    component: "",
    class: "",
    mass: null,
    temperature: null,
    diameter: null,
    luminosity: null,
    orbitNumber: null,
    au: null,
    eccentricity: null,
    period: null,
    mao: null,
    hzco: "",
  });
};

// Remove star
const removeStar = (index) => {
  if (surveyData.value.stars.length > 1) {
    surveyData.value.stars.splice(index, 1);
  } else {
    alert("You must keep at least one star");
  }
};

// Add new object
const addObject = () => {
  surveyData.value.objects.push({
    primary: "",
    objectName: "",
    orbitNumber: null,
    au: null,
    eccentricity: null,
    period: "",
    sahUwp: "",
    sub: "",
    notes: "",
  });
};

// Remove object
const removeObject = (index) => {
  surveyData.value.objects.splice(index, 1);
};

const addAtmosphereGas = () => {
  if (!surveyData.value.atmosphere) surveyData.value.atmosphere = {};
  if (!surveyData.value.atmosphere.compositionDetailed)
    surveyData.value.atmosphere.compositionDetailed = {
      code: null,
      description: "",
      dominantGas: "",
      gases: [],
      taints: [],
      provenance: null,
    };
  surveyData.value.atmosphere.compositionDetailed.gases.push({ gas: "", fraction: null });
};

const removeAtmosphereGas = (index) => {
  const g = surveyData.value.atmosphere?.compositionDetailed?.gases;
  if (Array.isArray(g) && g.length > 1) g.splice(index, 1);
};

// Save survey
const saveSurvey = async () => {
  if (!surveyData.value.starDesignation) {
    alert("Please enter a star designation");
    return;
  }

  if (!surveyData.value.stars.some((s) => s.class)) {
    alert("Please enter at least one star class");
    return;
  }

  try {
    const payload = {
      sectorLocation: surveyData.value.sectorLocation,
      starDesignation: surveyData.value.starDesignation,
      systemAge: surveyData.value.systemAge,
      initialSurvey: surveyData.value.initialSurvey,
      lastUpdated: surveyData.value.lastUpdated,
      objectCounts: {
        stellar: surveyData.value.stellar,
        gasGiants: surveyData.value.gasGiants,
        planetoidBelts: surveyData.value.planetoidBelts,
        terrestrials: surveyData.value.terrestrials,
      },
      classIIIStatus: surveyData.value.classIIIStatus,
      stars: surveyData.value.stars,
      starsNotes: surveyData.value.starsNotes,
      objects: surveyData.value.objects.filter((o) => o.objectName),
      atmosphere: surveyData.value.atmosphere,
      comments: surveyData.value.comments,
    };

    console.log("✓ Planetary Survey saved:", payload);
    alert("✓ Planetary Survey saved successfully!");
    resetForm();
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

// Reset form
const resetForm = () => {
  surveyData.value = {
    sectorLocation: "",
    initialSurvey: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().split("T")[0],
    starDesignation: "",
    systemAge: null,
    stellar: 0,
    gasGiants: 0,
    planetoidBelts: 0,
    terrestrials: 0,
    classIIIStatus: "",
    stars: [
      {
        component: "",
        class: "",
        mass: null,
        temperature: null,
        diameter: null,
        luminosity: null,
        orbitNumber: null,
        au: null,
        eccentricity: null,
        period: null,
        mao: null,
        hzco: "",
      },
    ],
    starsNotes: "",
    objects: Array.from({ length: 30 }, () => ({
      primary: "",
      objectName: "",
      orbitNumber: null,
      au: null,
      eccentricity: null,
      period: "",
      sahUwp: "",
      sub: "",
      notes: "",
    })),
    atmosphere: {
      pressure: null,
      composition: "",
      o2Partial: null,
      taints: "",
      scaleHeight: null,
      notes: "",
      compositionDetailed: {
        code: null,
        description: "",
        dominantGas: "",
        gases: [
          { gas: "", fraction: null },
          { gas: "", fraction: null },
          { gas: "", fraction: null },
        ],
        taints: [],
        provenance: null,
      },
    },
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
  border: 2px solid #000;
  margin: 0 auto;
  max-width: 1100px;
}

/* ── HEADER (FOREST GREEN) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #219a0e; /* Forest green header */
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
  background: #1a7c0a; /* Darker green */
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

.objects-cell {
  flex: 1;
  border-right: 1px solid #ccc;
  padding: 6px 4px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.objects-cell:last-child {
  border-right: none;
}

.cell-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
  text-align: center;
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
  border-color: #219a0e;
  box-shadow: 0 0 4px rgba(33, 154, 14, 0.3);
}

.objects-input {
  width: 100%;
  text-align: center;
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
}

/* ── STARS TABLE ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.stars-table,
.objects-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.stars-table th,
.objects-table th {
  background: #d4f0cc; /* Light green header */
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

.stars-table td,
.objects-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.stars-table tbody tr:nth-child(even) td,
.objects-table tbody tr:nth-child(even) td {
  background-color: #f7fef5; /* Very light green */
}

.table-input {
  width: 100%;
  border: none;
  padding: 2px 3px;
  font-size: 9px;
  font-family: Arial, monospace;
  background: transparent;
  text-align: center;
}

.table-input:focus {
  outline: none;
  background: #fff3cd;
  border-bottom: 1px solid #219a0e;
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
  background: #219a0e;
  color: #fff;
  border: none;
  padding: 4px 12px;
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #1a7c0a;
  box-shadow: 0 0 6px rgba(33, 154, 14, 0.4);
}

/* ── NOTES SECTION ── */
.notes-section {
  padding: 6px 8px;
  border-top: 1px solid #ddd;
}

.notes-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  margin-bottom: 4px;
}

.notes-textarea {
  width: 100%;
  border: 1px solid #999;
  border-radius: 3px;
  padding: 4px 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  resize: vertical;
}

.notes-textarea:focus {
  outline: none;
  border-color: #219a0e;
  box-shadow: 0 0 4px rgba(33, 154, 14, 0.3);
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
  border-color: #219a0e;
  box-shadow: 0 0 4px rgba(33, 154, 14, 0.3);
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
  background: #219a0e;
  color: #fff;
}

.btn-primary:hover {
  background: #1a7c0a;
  box-shadow: 0 0 8px rgba(33, 154, 14, 0.5);
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

  .stars-table th,
  .objects-table th {
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
