<template>
  <div class="survey-form">
    <!-- FORM HEADER -->
    <div class="form-header">
      <div class="title-block">Stellar Survey</div>
      <div class="form-number">FORM 0421B-0I</div>
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
          <input
            v-model.number="surveyData.systemAge"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="e.g., 4.6"
          />
        </div>
      </div>
    </div>

    <!-- OBJECTS SECTION -->
    <div class="section-block">
      <div class="section-label">Objects</div>
      <div class="objects-block">
        <div class="objects-cell">
          <label class="cell-label">Stellar</label>
          <input v-model="surveyData.stellar" type="text" class="cell-input objects-input" placeholder="Count" />
        </div>
        <div class="objects-cell">
          <label class="cell-label">Planetary Detections?</label>
          <select v-model="surveyData.planetaryDetections" class="cell-input objects-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="objects-cell">
          <label class="cell-label">Class I Status?</label>
          <select v-model="surveyData.classIStatus" class="cell-input objects-input">
            <option value="">—</option>
            <option value="confirmed">Confirmed</option>
            <option value="potential">Potential</option>
            <option value="unlikely">Unlikely</option>
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
              <th style="width: 70px">Component</th>
              <th style="width: 70px">Class</th>
              <th style="width: 55px">Mass</th>
              <th style="width: 55px">Temp (K)</th>
              <th style="width: 55px">Diameter</th>
              <th style="width: 65px">Luminosity</th>
              <th style="width: 55px">Orbit</th>
              <th style="width: 55px">AU</th>
              <th style="width: 45px">Ecc</th>
              <th style="width: 70px">Period (yr)</th>
              <th style="width: 55px">HZCO</th>
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
                <input v-model.number="star.orbit" type="number" class="table-input" placeholder="1" />
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
                <input v-model="star.hzco" type="text" class="table-input" placeholder="—" />
              </td>
              <td class="action-cell">
                <button @click="removeStar(index)" class="btn-remove" title="Remove star">✕</button>
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
          v-model="surveyData.notes"
          class="notes-textarea"
          placeholder="Additional observations..."
          rows="3"
        ></textarea>
      </div>
    </div>

    <!-- COMMENTS SECTION -->
    <div class="comments-section">
      <div class="comments-label">Comments</div>
      <textarea
        v-model="surveyData.comments"
        class="comments-textarea"
        placeholder="General comments about this stellar survey..."
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
  stellar: "",
  planetaryDetections: "",
  classIStatus: "",
  stars: [
    {
      component: "",
      class: "",
      mass: null,
      temperature: null,
      diameter: null,
      luminosity: null,
      orbit: null,
      au: null,
      eccentricity: null,
      period: null,
      hzco: "",
    },
  ],
  notes: "",
  comments: "",
});

// Add new star row
const addStar = () => {
  surveyData.value.stars.push({
    component: "",
    class: "",
    mass: null,
    temperature: null,
    diameter: null,
    luminosity: null,
    orbit: null,
    au: null,
    eccentricity: null,
    period: null,
    hzco: "",
  });
};

// Remove star row
const removeStar = (index) => {
  if (surveyData.value.stars.length > 1) {
    surveyData.value.stars.splice(index, 1);
  } else {
    alert("You must keep at least one star");
  }
};

// Save survey to database
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
      stellar: surveyData.value.stellar,
      planetaryDetections: surveyData.value.planetaryDetections,
      classIStatus: surveyData.value.classIStatus,
      stars: surveyData.value.stars,
      notes: surveyData.value.notes,
      comments: surveyData.value.comments,
    };

    // TODO: Connect to API in the component
    await systemApi.post("/systems/survey", payload);

    console.log("✓ Stellar Survey saved:", payload);
    alert("✓ Stellar Survey saved successfully!");
    resetForm();
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

// Reset form to defaults
const resetForm = () => {
  surveyData.value = {
    sectorLocation: "",
    initialSurvey: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().split("T")[0],
    starDesignation: "",
    systemAge: null,
    stellar: "",
    planetaryDetections: "",
    classIStatus: "",
    stars: [
      {
        component: "",
        class: "",
        mass: null,
        temperature: null,
        diameter: null,
        luminosity: null,
        orbit: null,
        au: null,
        eccentricity: null,
        period: null,
        hzco: "",
      },
    ],
    notes: "",
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
  max-width: 1000px;
}

/* ── HEADER (PURPLE FOR DIFFERENTIATION) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #7c3aed; /* Purple header */
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
  background: #6d28d9; /* Darker purple */
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
  border-color: #7c3aed;
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.3);
}

/* ── OBJECTS SECTION ── */
.objects-block {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.objects-cell {
  flex: 1;
  border-right: 1px solid #ccc;
  padding: 6px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.objects-cell:last-child {
  border-right: none;
}

.objects-cell .cell-label {
  text-align: center;
  margin-bottom: 3px;
}

.objects-input {
  width: 100%;
  text-align: center;
}

/* ── STARS TABLE ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.stars-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.stars-table th {
  background: #e8d5f2; /* Light purple header */
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

.stars-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.stars-table tbody tr:nth-child(even) td {
  background-color: #f9f7fc; /* Very light purple */
}

.stars-table tbody tr:nth-child(odd) td {
  background-color: #fff;
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
  border-bottom: 1px solid #7c3aed;
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
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 4px 12px;
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #6d28d9;
  box-shadow: 0 0 6px rgba(124, 58, 237, 0.4);
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
  border-color: #7c3aed;
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.3);
}

/* ── COMMENTS SECTION ── */
.comments-section {
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
  border-color: #7c3aed;
  box-shadow: 0 0 4px rgba(124, 58, 237, 0.3);
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
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
  background: #410e9a;
  color: #fff;
}

.btn-primary:hover {
  background: #410e9a;
  box-shadow: 0 0 8px rgba(65, 14, 154, 0.5);
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
  border: 1px solid #999;
}

.btn-secondary:hover {
  background: #d1d5db;
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

  .stars-table th {
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
