<template>
  <div class="survey-form">
    <!-- FORM HEADER - TEAL/SEA GREEN -->
    <div class="form-header">
      <div class="title-block">Census Subunit Profile</div>
      <div class="form-number">FORM 0407F-IV CSPF</div>
    </div>

    <!-- SUBUNIT IDENTIFICATION -->
    <div class="section-block">
      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Subunit Name</label>
          <input
            v-model="surveyData.subunitName"
            type="text"
            class="cell-input"
            placeholder="Region/District/City name"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Classification</label>
          <select v-model="surveyData.classification" class="cell-input">
            <option value="">—</option>
            <option value="Metropolitan">Metropolitan</option>
            <option value="Urban">Urban</option>
            <option value="Rural">Rural</option>
            <option value="Frontier">Frontier</option>
            <option value="Wilderness">Wilderness</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">World</label>
          <input v-model="surveyData.worldName" type="text" class="cell-input" placeholder="Parent world name" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">UWP</label>
          <input v-model="surveyData.uwp" type="text" class="cell-input" placeholder="X000000-0" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Parent Region / Sector</label>
          <input
            v-model="surveyData.parentRegion"
            type="text"
            class="cell-input"
            placeholder="Parent administrative area"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Survey Date</label>
          <input v-model="surveyData.surveyDate" type="date" class="cell-input" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Area (km²)</label>
          <input v-model.number="surveyData.areaKm2" type="number" step="0.1" class="cell-input" placeholder="0" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">% of World</label>
          <input
            v-model.number="surveyData.percentOfWorld"
            type="number"
            step="0.01"
            min="0"
            max="100"
            class="cell-input"
            placeholder="0.0"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Terrain Type</label>
          <select v-model="surveyData.terrainType" class="cell-input">
            <option value="">—</option>
            <option value="Plain">Plain</option>
            <option value="Mountain">Mountain</option>
            <option value="Forest">Forest</option>
            <option value="Desert">Desert</option>
            <option value="Aquatic">Aquatic</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- DEMOGRAPHICS SECTION -->
    <div class="section-block">
      <div class="section-label">Demographics</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Population</label>
          <input v-model="surveyData.demographics.population" type="text" class="cell-input" placeholder="e.g., 500K" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">% of World</label>
          <input
            v-model.number="surveyData.demographics.percentOfWorld"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="0.0"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Density (per km²)</label>
          <input
            v-model.number="surveyData.demographics.density"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="0"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Growth Rate (%/year)</label>
          <input
            v-model.number="surveyData.demographics.growthRate"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="0.0"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Median Age (years)</label>
          <input
            v-model.number="surveyData.demographics.medianAge"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="30"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Primary Species %</label>
          <input
            v-model.number="surveyData.demographics.primarySpeciesPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="cell-input"
            placeholder="85"
          />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.demographics.notes"
          class="notes-textarea"
          placeholder="Demographic details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- ADMINISTRATION SECTION -->
    <div class="section-block">
      <div class="section-label">Administration</div>
      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Administrator / Mayor</label>
          <input
            v-model="surveyData.administration.administrator"
            type="text"
            class="cell-input"
            placeholder="Name/Title"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Status</label>
          <select v-model="surveyData.administration.status" class="cell-input">
            <option value="">—</option>
            <option value="Capital">Capital</option>
            <option value="Major">Major</option>
            <option value="Secondary">Secondary</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Government Type</label>
          <input v-model="surveyData.administration.governmentType" type="text" class="cell-input" placeholder="Type" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Authority Level</label>
          <select v-model="surveyData.administration.authorityLevel" class="cell-input">
            <option value="">—</option>
            <option value="Autonomous">Autonomous</option>
            <option value="Semi-Independent">Semi-Independent</option>
            <option value="Subordinate">Subordinate</option>
            <option value="Controlled">Controlled</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Stability</label>
          <select v-model="surveyData.administration.stability" class="cell-input">
            <option value="">—</option>
            <option value="Stable">Stable</option>
            <option value="Unrest">Unrest</option>
            <option value="Unstable">Unstable</option>
            <option value="Crisis">Crisis</option>
          </select>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.administration.notes"
          class="notes-textarea"
          placeholder="Administration details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- ECONOMY SECTION -->
    <div class="section-block">
      <div class="section-label">Economy</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Primary Industry</label>
          <input
            v-model="surveyData.economy.primaryIndustry"
            type="text"
            class="cell-input"
            placeholder="Agriculture, Manufacturing, etc."
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Secondary Industry</label>
          <input
            v-model="surveyData.economy.secondaryIndustry"
            type="text"
            class="cell-input"
            placeholder="Industry type"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Economic Status</label>
          <select v-model="surveyData.economy.economicStatus" class="cell-input">
            <option value="">—</option>
            <option value="Thriving">Thriving</option>
            <option value="Growing">Growing</option>
            <option value="Stable">Stable</option>
            <option value="Declining">Declining</option>
            <option value="Depressed">Depressed</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">GRP per Capita</label>
          <input
            v-model="surveyData.economy.grpPerCapita"
            type="text"
            class="cell-input"
            placeholder="Currency amount"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Unemployment Rate (%)</label>
          <input
            v-model.number="surveyData.economy.unemploymentRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            class="cell-input"
            placeholder="5.0"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Inequality Index</label>
          <input
            v-model.number="surveyData.economy.inequalityIndex"
            type="number"
            step="0.01"
            min="0"
            max="1"
            class="cell-input"
            placeholder="0.35"
          />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.economy.notes"
          class="notes-textarea"
          placeholder="Economic details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- INFRASTRUCTURE SECTION -->
    <div class="section-block">
      <div class="section-label">Infrastructure</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Power Grid</label>
          <select v-model="surveyData.infrastructure.powerGrid" class="cell-input">
            <option value="">—</option>
            <option value="Advanced">Advanced</option>
            <option value="Modern">Modern</option>
            <option value="Basic">Basic</option>
            <option value="Minimal">Minimal</option>
            <option value="None">None</option>
          </select>
        </div>
        <div class="form-cell">
          <label class="cell-label">Transportation</label>
          <input
            v-model="surveyData.infrastructure.transportation"
            type="text"
            class="cell-input"
            placeholder="Road, Rail, Air, etc."
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">Water/Sewage</label>
          <select v-model="surveyData.infrastructure.waterSewage" class="cell-input">
            <option value="">—</option>
            <option value="Advanced">Advanced</option>
            <option value="Modern">Modern</option>
            <option value="Basic">Basic</option>
            <option value="Minimal">Minimal</option>
          </select>
        </div>
        <div class="form-cell">
          <label class="cell-label">Communications</label>
          <input v-model="surveyData.infrastructure.communications" type="text" class="cell-input" placeholder="Type" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.infrastructure.notes"
          class="notes-textarea"
          placeholder="Infrastructure details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- SECURITY & LAW SECTION -->
    <div class="section-block">
      <div class="section-label">Security &amp; Law</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Law Level</label>
          <input v-model="surveyData.security.lawLevel" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Crime Rate</label>
          <select v-model="surveyData.security.crimeRate" class="cell-input">
            <option value="">—</option>
            <option value="Very Low">Very Low</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Very High">Very High</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Police Force Size</label>
          <input
            v-model="surveyData.security.policeForceSize"
            type="text"
            class="cell-input"
            placeholder="Count/ratio"
          />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.security.notes"
          class="notes-textarea"
          placeholder="Security & law details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- CULTURE & SOCIETY SECTION -->
    <div class="section-block">
      <div class="section-label">Culture &amp; Society</div>
      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Primary Culture</label>
          <input
            v-model="surveyData.culture.primaryCulture"
            type="text"
            class="cell-input"
            placeholder="Cultural description"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Cultural Diversity</label>
          <select v-model="surveyData.culture.diversity" class="cell-input">
            <option value="">—</option>
            <option value="Homogeneous">Homogeneous</option>
            <option value="Mixed">Mixed</option>
            <option value="Diverse">Diverse</option>
            <option value="Very Diverse">Very Diverse</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Primary Language</label>
          <input v-model="surveyData.culture.primaryLanguage" type="text" class="cell-input" placeholder="Language" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Religion / Ideology</label>
          <input v-model="surveyData.culture.religion" type="text" class="cell-input" placeholder="Dominant belief" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Literacy Rate (%)</label>
          <input
            v-model.number="surveyData.culture.literacyRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="cell-input"
            placeholder="85"
          />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.culture.notes"
          class="notes-textarea"
          placeholder="Cultural details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- EDUCATION & HEALTH SECTION -->
    <div class="section-block">
      <div class="section-label">Education &amp; Health</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">School Enrollment (%)</label>
          <input
            v-model.number="surveyData.education.schoolEnrollment"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="cell-input"
            placeholder="75"
          />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Universities Present?</label>
          <select v-model="surveyData.education.universitiesPresent" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Health Care Quality</label>
          <select v-model="surveyData.education.healthCareQuality" class="cell-input">
            <option value="">—</option>
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Life Expectancy (years)</label>
          <input
            v-model.number="surveyData.education.lifeExpectancy"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="70"
          />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Infant Mortality Rate (per 1000)</label>
          <input
            v-model.number="surveyData.education.infantMortalityRate"
            type="number"
            step="0.1"
            class="cell-input"
            placeholder="10"
          />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.education.notes"
          class="notes-textarea"
          placeholder="Education & health details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- NOTABLE LOCATIONS TABLE -->
    <div class="section-block">
      <div class="section-label">Notable Locations / Points of Interest</div>
      <div class="table-wrapper">
        <table class="locations-table">
          <thead>
            <tr>
              <th>Location Name</th>
              <th>Type</th>
              <th>Significance</th>
              <th>Notes</th>
              <th class="action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(location, index) in surveyData.locations" :key="index">
              <td><input v-model="location.name" type="text" class="table-input" placeholder="Location name" /></td>
              <td>
                <input
                  v-model="location.type"
                  type="text"
                  class="table-input"
                  placeholder="Fort, Temple, Factory, etc."
                />
              </td>
              <td>
                <input
                  v-model="location.significance"
                  type="text"
                  class="table-input"
                  placeholder="Economic, Religious, Military, etc."
                />
              </td>
              <td><input v-model="location.notes" type="text" class="table-input" placeholder="Details" /></td>
              <td class="action-cell">
                <button @click="removeLocation(index)" class="btn-remove" v-if="surveyData.locations.length > 0">
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="button-row">
        <button @click="addLocation" class="btn btn-small btn-add">+ Add Location</button>
      </div>
    </div>

    <!-- COMMENTS SECTION -->
    <div class="comments-block">
      <label class="comments-label">Comments:</label>
      <textarea
        v-model="surveyData.comments"
        class="comments-textarea"
        placeholder="General subunit profile notes and observations..."
        rows="4"
      ></textarea>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="form-actions">
      <button @click="saveSurvey" class="btn btn-primary">💾 Save Subunit Profile</button>
      <button @click="resetForm" class="btn btn-secondary">🔄 Reset</button>
      <button @click="printForm" class="btn btn-secondary">🖨️ Print</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const surveyData = ref({
  subunitName: "",
  classification: "",
  worldName: "",
  uwp: "",
  parentRegion: "",
  surveyDate: new Date().toISOString().split("T")[0],
  areaKm2: null,
  percentOfWorld: null,
  terrainType: "",

  demographics: {
    population: "",
    percentOfWorld: null,
    density: null,
    growthRate: null,
    medianAge: null,
    primarySpeciesPercent: null,
    notes: "",
  },

  administration: {
    administrator: "",
    status: "",
    governmentType: "",
    authorityLevel: "",
    stability: "",
    notes: "",
  },

  economy: {
    primaryIndustry: "",
    secondaryIndustry: "",
    economicStatus: "",
    grpPerCapita: "",
    unemploymentRate: null,
    inequalityIndex: null,
    notes: "",
  },

  infrastructure: {
    powerGrid: "",
    transportation: "",
    waterSewage: "",
    communications: "",
    notes: "",
  },

  security: {
    lawLevel: "",
    crimeRate: "",
    policeForceSize: "",
    notes: "",
  },

  culture: {
    primaryCulture: "",
    diversity: "",
    primaryLanguage: "",
    religion: "",
    literacyRate: null,
    notes: "",
  },

  education: {
    schoolEnrollment: null,
    universitiesPresent: "",
    healthCareQuality: "",
    lifeExpectancy: null,
    infantMortalityRate: null,
    notes: "",
  },

  locations: Array.from({ length: 3 }, () => ({
    name: "",
    type: "",
    significance: "",
    notes: "",
  })),

  comments: "",
});

// Add location
const addLocation = () => {
  surveyData.value.locations.push({
    name: "",
    type: "",
    significance: "",
    notes: "",
  });
};

// Remove location
const removeLocation = (index) => {
  surveyData.value.locations.splice(index, 1);
};

// Save survey
const saveSurvey = async () => {
  if (!surveyData.value.subunitName) {
    alert("Please enter a subunit name");
    return;
  }

  try {
    const payload = {
      ...surveyData.value,
      locations: surveyData.value.locations.filter((l) => l.name),
    };

    console.log("✓ Census Subunit Profile saved:", payload);
    alert("✓ Census Subunit Profile saved successfully!");
    resetForm();
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save subunit profile. Check console for details.");
  }
};

// Reset form
const resetForm = () => {
  surveyData.value = {
    subunitName: "",
    classification: "",
    worldName: "",
    uwp: "",
    parentRegion: "",
    surveyDate: new Date().toISOString().split("T")[0],
    areaKm2: null,
    percentOfWorld: null,
    terrainType: "",
    demographics: {
      population: "",
      percentOfWorld: null,
      density: null,
      growthRate: null,
      medianAge: null,
      primarySpeciesPercent: null,
      notes: "",
    },
    administration: {
      administrator: "",
      status: "",
      governmentType: "",
      authorityLevel: "",
      stability: "",
      notes: "",
    },
    economy: {
      primaryIndustry: "",
      secondaryIndustry: "",
      economicStatus: "",
      grpPerCapita: "",
      unemploymentRate: null,
      inequalityIndex: null,
      notes: "",
    },
    infrastructure: {
      powerGrid: "",
      transportation: "",
      waterSewage: "",
      communications: "",
      notes: "",
    },
    security: {
      lawLevel: "",
      crimeRate: "",
      policeForceSize: "",
      notes: "",
    },
    culture: {
      primaryCulture: "",
      diversity: "",
      primaryLanguage: "",
      religion: "",
      literacyRate: null,
      notes: "",
    },
    education: {
      schoolEnrollment: null,
      universitiesPresent: "",
      healthCareQuality: "",
      lifeExpectancy: null,
      infantMortalityRate: null,
      notes: "",
    },
    locations: Array.from({ length: 3 }, () => ({
      name: "",
      type: "",
      significance: "",
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
  border: 2px solid #000;
  margin: 0 auto;
  max-width: 1000px;
}

/* ── HEADER (TEAL/SEA GREEN) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0e9a87;
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

/* ── SECTION LABEL ── */
.section-label {
  background: #0a7a6f;
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 8px;
  border-bottom: 1px solid #000;
  border-top: 1px solid #000;
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
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
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
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
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
}

/* ── TABLES ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.locations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.locations-table th {
  background: #d4e8e5;
  border: 1px solid #aaa;
  padding: 4px 2px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 8px;
  letter-spacing: 0.5px;
  color: #333;
}

.locations-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.locations-table tbody tr:nth-child(even) td {
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
  border-bottom: 1px solid #0e9a87;
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
  background: #0e9a87;
  color: #fff;
  border: none;
  padding: 4px 12px;
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #0a7a6f;
  box-shadow: 0 0 6px rgba(14, 154, 135, 0.4);
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
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
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
  background: #0e9a87;
  color: #fff;
}

.btn-primary:hover {
  background: #0a7a6f;
  box-shadow: 0 0 8px rgba(14, 154, 135, 0.5);
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
