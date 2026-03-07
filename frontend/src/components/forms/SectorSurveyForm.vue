<template>
  <div class="sector-survey-container">
    <button class="print-btn" @click="printForm">🖨️ Print / Save PDF</button>

    <div class="form-wrapper">
      <!-- Header -->
      <div class="form-header">
        <div class="title-block">Class 0 Sector Survey</div>
        <div class="form-number">FORM 0398D-0</div>
      </div>

      <!-- Sector Information Section -->
      <div class="section-block">
        <div class="form-row">
          <div class="form-cell grow-3">
            <div class="cell-label">Sector | Grid</div>
            <input v-model="surveyData.sectorName" class="cell-value" placeholder="e.g., Orion Spur (1, 1)" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-cell grow-3">
            <div class="cell-label">Initial Survey</div>
            <input v-model="surveyData.initialSurvey" type="date" class="cell-value" />
          </div>
          <div class="form-cell grow-3">
            <div class="cell-label">Last Updated</div>
            <input v-model="surveyData.lastUpdated" type="date" class="cell-value" />
          </div>
        </div>
      </div>

      <!-- Systems by Subsector -->
      <div class="section-block">
        <div class="section-label">Systems</div>

        <!-- Subsector Tabs -->
        <div class="subsector-tabs">
          <button
            v-for="subsector in subsectors"
            :key="subsector"
            :class="['subsector-tab', { active: activeSubsector === subsector }]"
            @click="activeSubsector = subsector"
          >
            {{ subsector }}
          </button>
        </div>

        <!-- Systems Table for Active Subsector -->
        <div style="padding: 4px 6px">
          <div class="subsector-label">Subsector {{ activeSubsector }}</div>

          <table class="sector-table">
            <thead>
              <tr>
                <th style="width: 100px">Location</th>
                <th style="width: 100px">Primary Star</th>
                <th style="width: 80px">+ Close</th>
                <th style="width: 80px">+ Near</th>
                <th style="width: 80px">+ Far</th>
                <th style="flex: 1">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(system, index) in getSubsectorSystems(activeSubsector)"
                :key="`${activeSubsector}-${index}`"
                @click="selectSystem(activeSubsector, index)"
                :class="{ 'row-selected': isSystemSelected(activeSubsector, index) }"
              >
                <td>
                  <input v-model="system.location" class="table-input" placeholder="e.g., 0101" />
                </td>
                <td>
                  <input v-model="system.primary" class="table-input" placeholder="Star class" />
                </td>
                <td>
                  <input v-model="system.close" class="table-input" placeholder="M0V" />
                </td>
                <td>
                  <input v-model="system.near" class="table-input" placeholder="M5D" />
                </td>
                <td>
                  <input v-model="system.far" class="table-input" placeholder="K2V" />
                </td>
                <td>
                  <input v-model="system.notes" class="table-input" placeholder="Any notes..." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Comments Block -->
        <div class="comments-block">
          <div class="comments-label">Comments for Subsector {{ activeSubsector }}</div>
          <textarea
            v-model="surveyData.comments[activeSubsector]"
            class="comments-textarea"
            rows="3"
            placeholder="Add observations about this subsector..."
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="saveSurvey" class="btn btn-primary">💾 Save Survey</button>
        <button @click="resetForm" class="btn btn-secondary">🔄 Reset</button>
        <button @click="exportJSON" class="btn btn-secondary">📥 Export JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";

// Subsectors A-P
const subsectors = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
const activeSubsector = ref("A");

// Survey data structure
const surveyData = reactive({
  sectorName: "",
  initialSurvey: new Date().toISOString().split("T")[0],
  lastUpdated: new Date().toISOString().split("T")[0],
  comments: {},
  subsectors: {},
});

// Initialize subsectors and comments
subsectors.forEach((subsector) => {
  surveyData.subsectors[subsector] = [];
  surveyData.comments[subsector] = "";

  // Create 8 rows per subsector
  for (let i = 0; i < 8; i++) {
    surveyData.subsectors[subsector].push({
      location: "",
      primary: "",
      close: "",
      near: "",
      far: "",
      notes: "",
    });
  }
});

const selectedSystem = ref(null);

// Get systems for active subsector
const getSubsectorSystems = (subsector) => {
  return surveyData.subsectors[subsector] || [];
};

// Check if system is selected
const isSystemSelected = (subsector, index) => {
  return selectedSystem.value?.subsector === subsector && selectedSystem.value?.index === index;
};

// Select a system
const selectSystem = (subsector, index) => {
  selectedSystem.value = { subsector, index };
};

// Save survey
const saveSurvey = async () => {
  const payload = {
    sectorName: surveyData.sectorName,
    initialSurvey: surveyData.initialSurvey,
    lastUpdated: surveyData.lastUpdated,
    subsectors: surveyData.subsectors,
    comments: surveyData.comments,
  };

  try {
    const response = await systemApi.post("/systems/survey", payload);
    console.log("✓ Survey saved:", response);
    alert("✓ Survey saved successfully!");
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

// Reset form
const resetForm = () => {
  if (confirm("Clear all data?")) {
    surveyData.sectorName = "";
    surveyData.initialSurvey = new Date().toISOString().split("T")[0];
    surveyData.lastUpdated = new Date().toISOString().split("T")[0];

    subsectors.forEach((subsector) => {
      surveyData.subsectors[subsector] = [];
      surveyData.comments[subsector] = "";

      for (let i = 0; i < 8; i++) {
        surveyData.subsectors[subsector].push({
          location: "",
          primary: "",
          close: "",
          near: "",
          far: "",
          notes: "",
        });
      }
    });

    selectedSystem.value = null;
  }
};

// Export as JSON
const exportJSON = () => {
  const data = {
    sectorName: surveyData.sectorName,
    initialSurvey: surveyData.initialSurvey,
    lastUpdated: surveyData.lastUpdated,
    subsectors: surveyData.subsectors,
    comments: surveyData.comments,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sector-survey-${surveyData.sectorName || "export"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

.sector-survey-container {
  background: #f0f0f0;
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.print-btn {
  font-size: 10px;
  color: #000000;
  background: #fff;
  border: 1px solid #999;
  border-radius: 2px;
  padding: 6px 12px;
  cursor: pointer;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.print-btn:hover {
  background: #eee;
}

/* ── FORM WRAPPER ── */
.form-wrapper {
  background: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
  border: 2px solid #000;
}

/* ── HEADER (NAVY) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0e219a; /* Navy header */
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
  font-size: 11px;
  text-align: right;
  letter-spacing: 1px;
}

/* ── SECTION LABEL (NAVY) ── */
.section-label {
  background: #0c1f8a; /* Medium navy */
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 5px 10px;
  border-bottom: 1px solid #000;
  border-top: 1px solid #000;
}

/* ── FORM ROW / CELL ── */
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
  min-height: 28px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.form-cell:last-child {
  border-right: none;
}

.form-cell.grow-3 {
  flex: 3;
}

.cell-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.cell-value {
  border: 1px solid #999;
  border-radius: 2px;
  padding: 4px 6px;
  font-size: 11px;
  color: #000;
  font-family: Arial, sans-serif;
  background: #fff;
}

.cell-value:focus {
  outline: none;
  border-color: #0e219a;
  box-shadow: 0 0 4px rgba(14, 33, 154, 0.3);
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
}

/* ── SUBSECTOR TABS ── */
.subsector-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 6px;
  background: #f5f5f5;
  border-bottom: 1px solid #ccc;
}

.subsector-tab {
  width: 40px;
  height: 32px;
  border: 1px solid #999;
  background: #e8e8e8;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  font-size: 10px;
  border-radius: 3px;
  transition: all 0.2s;
}

.subsector-tab:hover {
  background: #d0d0d0;
}

.subsector-tab.active {
  background: #0e219a; /* Navy blue for active */
  color: #ffffff;
  border-color: #0e219a;
  box-shadow: 0 0 8px rgba(14, 33, 154, 0.5);
}

.subsector-label {
  font-size: 10px;
  font-weight: bold;
  color: #444;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ── SECTOR TABLE ── */
.sector-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.sector-table th {
  background: #d9dff0; /* Light navy tint */
  border: 1px solid #aaa;
  padding: 6px 4px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 8px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  color: #000;
}

.sector-table td {
  border: 1px solid #ddd;
  padding: 2px 4px;
  min-height: 22px;
  vertical-align: middle;
  font-size: 9px;
  background: #fff;
}

.sector-table tbody tr:nth-child(even) td {
  background-color: #f9f9f9;
}

.sector-table tbody tr:hover td {
  background-color: rgba(14, 33, 154, 0.08);
}

.sector-table tbody tr.row-selected td {
  background-color: rgba(14, 33, 154, 0.15);
  border: 1px solid #0e219a;
}

.table-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 9px;
  font-family: Arial, sans-serif;
  padding: 2px 0;
}

.table-input:focus {
  outline: none;
  background: rgba(14, 33, 154, 0.08);
  border-bottom: 1px solid #0e219a;
}

/* ── COMMENTS BLOCK ── */
.comments-block {
  padding: 8px 10px;
  border-top: 1px solid #ccc;
  background: #fff;
}

.comments-label {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  color: #444;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.comments-textarea {
  width: 100%;
  border: 1px solid #999;
  padding: 4px 6px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  resize: vertical;
  border-radius: 2px;
  background: #fff;
}

.comments-textarea:focus {
  outline: none;
  border-color: #0e219a;
  box-shadow: 0 0 6px rgba(14, 33, 154, 0.3);
}

/* ── ACTION BUTTONS ── */
.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-top: 1px solid #ccc;
}

.btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #999;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 10px;
}

.btn-primary {
  background-color: #0e219a;
  color: #ffffff;
  border-color: #0e219a;
}

.btn-primary:hover {
  background-color: #0a1a7a;
  box-shadow: 0 0 12px rgba(14, 33, 154, 0.5);
}

.btn-secondary {
  background-color: #e8e8e8;
  color: #000;
  border: 1px solid #999;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

/* ── PRINT STYLES ── */
@media print {
  .print-btn,
  .subsector-tabs,
  .action-buttons {
    display: none !important;
  }

  .sector-survey-container {
    padding: 0;
    background: white;
  }

  .form-wrapper {
    border: none;
    width: 100%;
    margin: 0;
  }

  .form-header,
  .section-label {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .sector-table th {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    background: white;
  }
}
</style>
