<template>
  <div :class="['survey-form', { wide: isWide }]">
    <!-- FORM HEADER - BURGUNDY -->
    <div class="form-header">
      <div class="title-block">System Survey</div>
      <div class="header-controls">
        <div class="form-number">FORM 041D-II.III</div>
        <button
          type="button"
          class="btn btn-secondary btn-toggle"
          @click="toggleWide"
          :aria-pressed="String(isWide)"
          aria-label="Toggle full width view"
          title="Toggle full width view"
        >
          <span v-if="!isWide">Expand ↔</span>
          <span v-else>Collapse ⇆</span>
        </button>
      </div>
    </div>

    <div class="survey-class-bar">Reconnaissance & Initial Survey — System Overview</div>

    <div class="survey-layout" :class="{ wide: isWide }">
      <nav class="section-nav" role="tablist" aria-label="System Survey Sections" aria-orientation="vertical">
        <ul>
          <li>
            <button
              id="tab-all"
              role="tab"
              type="button"
              class="nav-button"
              @click="expandedSection = 'all'"
              :class="{ active: expandedSection === 'all' }"
              aria-controls="panel-all"
              :aria-selected="expandedSection === 'all' ? 'true' : 'false'"
              :tabindex="expandedSection === 'all' ? 0 : -1"
            >
              Show All
            </button>
          </li>
          <li v-for="(s, index) in sections" :key="s.key">
            <button
              :id="'tab-' + s.key"
              role="tab"
              type="button"
              class="nav-button"
              @click="selectSection(s.key)"
              :class="{ active: expandedSection === s.key }"
              :aria-controls="'panel-' + s.key"
              :aria-selected="expandedSection === s.key ? 'true' : 'false'"
              :tabindex="expandedSection === s.key ? 0 : -1"
              @keydown="handleNavKeydown($event, index)"
            >
              {{ s.label }}
            </button>
          </li>
        </ul>
      </nav>

      <transition name="fade-slide" mode="out-in" appear>
        <div class="section-area" :key="expandedSection">
          <!-- SYSTEM IDENTIFICATION SECTION -->
          <div
            class="section-block"
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            :aria-hidden="!(expandedSection === 'overview' || expandedSection === 'all')"
            v-show="expandedSection === 'overview' || expandedSection === 'all'"
          >
            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">System / Star Designation</label>
                <input
                  v-model="surveyData.systemDesignation"
                  type="text"
                  class="cell-input"
                  placeholder="e.g., Alpha Centauri A"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Sector | Hex Location</label>
                <input v-model="surveyData.sectorHex" type="text" class="cell-input" placeholder="e.g., Orion 0101" />
              </div>
              <div class="form-cell">
                <label class="cell-label">Survey Date</label>
                <input v-model="surveyData.surveyDate" type="date" class="cell-input" />
              </div>
              <div class="form-cell">
                <label class="cell-label">Survey Class</label>
                <select v-model="surveyData.surveyClass" class="cell-input">
                  <option value="">—</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">System Age (Gyr)</label>
                <input
                  v-model.number="surveyData.systemAge"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="4.6"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Travel Zone</label>
                <select v-model="surveyData.travelZone" class="cell-input">
                  <option value="">Green</option>
                  <option value="amber">Amber</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div class="form-cell grow-3">
                <label class="cell-label">Surveying Vessel / Lead Scout</label>
                <input v-model="surveyData.surveyingVessel" type="text" class="cell-input" placeholder="Vessel name" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Previous Survey (date)</label>
                <input v-model="surveyData.previousSurveyDate" type="date" class="cell-input" />
              </div>
            </div>
          </div>

          <!-- STELLAR COMPONENTS SECTION -->
          <div
            class="section-block"
            id="panel-stellar"
            role="tabpanel"
            aria-labelledby="tab-stellar"
            :aria-hidden="!(expandedSection === 'stellar' || expandedSection === 'all')"
            v-show="expandedSection === 'stellar' || expandedSection === 'all'"
          >
            <div class="section-label">Stellar Components</div>
            <div class="table-wrapper">
              <table class="stellar-table">
                <thead>
                  <tr>
                    <th>Desig</th>
                    <th>Type / Subtype</th>
                    <th>Lum Class</th>
                    <th>Mass (M☉)</th>
                    <th>Lum (L☉)</th>
                    <th>Temp (K)</th>
                    <th>Diam (D☉)</th>
                    <th>Stellar Profile</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(star, index) in surveyData.stars" :key="index">
                    <td>
                      <input v-model="star.designation" type="text" class="table-input" placeholder="Primary" />
                    </td>
                    <td>
                      <input v-model="star.typeSubtype" type="text" class="table-input" placeholder="G2V" />
                    </td>
                    <td>
                      <input v-model="star.lumClass" type="text" class="table-input" placeholder="V" />
                    </td>
                    <td>
                      <input
                        v-model.number="star.mass"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="1.0"
                      />
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
                      <input v-model.number="star.temperature" type="number" class="table-input" placeholder="5778" />
                    </td>
                    <td>
                      <input
                        v-model.number="star.diameter"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="1.0"
                      />
                    </td>
                    <td>
                      <input v-model="star.stellarProfile" type="text" class="table-input" placeholder="—" />
                    </td>
                    <td>
                      <input v-model="star.notes" type="text" class="table-input" placeholder="Notes" />
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

            <!-- HABITABILITY ZONE DATA -->
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">HZ Centre (AU)</label>
                <input v-model.number="surveyData.hzCentre" type="number" step="0.01" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">HZ Inner (AU)</label>
                <input v-model.number="surveyData.hzInner" type="number" step="0.01" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">HZ Outer (AU)</label>
                <input v-model.number="surveyData.hzOuter" type="number" step="0.01" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Gas Giants</label>
                <input v-model.number="surveyData.gasGiants" type="number" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Planetoid Belts</label>
                <input v-model.number="surveyData.belts" type="number" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Terrestrials</label>
                <input v-model.number="surveyData.terrestrials" type="number" class="cell-input" />
              </div>
            </div>
          </div>

          <!-- WORLD SURVEY TABLE -->
          <div
            class="section-block"
            id="panel-worlds"
            role="tabpanel"
            aria-labelledby="tab-worlds"
            :aria-hidden="!(expandedSection === 'worlds' || expandedSection === 'all')"
            v-show="expandedSection === 'worlds' || expandedSection === 'all'"
          >
            <div class="section-label">World / Body Survey</div>

            <!-- Column Key -->
            <div class="column-key">
              <strong>Type:</strong>
              <span class="badge badge-mw">MW</span> Mainworld &nbsp;
              <span class="badge badge-ter">TER</span> Terrestrial &nbsp; <span class="badge badge-moon">MON</span> Moon
              &nbsp; <span class="badge badge-gg">GG</span> Gas Giant &nbsp;
              <span class="badge badge-belt">BLT</span> Belt &nbsp; | &nbsp; <strong>Life:</strong> MXDC profile
              (Biomass / Biocomplexity / Biodiversity / Compatibility) | <strong>Hab:</strong> Habitability Rating |
              <strong>Res:</strong> Resource Rating
            </div>

            <div class="table-wrapper">
              <table class="world-table">
                <thead>
                  <tr>
                    <th style="width: 28px">#</th>
                    <th>Designation</th>
                    <th>Type</th>
                    <th>O# / AU</th>
                    <th>SAH</th>
                    <th>Diam (km)</th>
                    <th>Mean T (K)</th>
                    <th>Atm</th>
                    <th>Hyd</th>
                    <th>Life MXDC</th>
                    <th>Hab</th>
                    <th>Res</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(world, index) in surveyData.worlds"
                    :key="index"
                    :class="{ mainworld: world.type === 'MW' }"
                  >
                    <td class="index-cell">{{ index + 1 }}</td>
                    <td>
                      <input v-model="world.designation" type="text" class="table-input" placeholder="Name" />
                    </td>
                    <td>
                      <select v-model="world.type" class="table-input">
                        <option value="">—</option>
                        <option value="MW">MW</option>
                        <option value="TER">TER</option>
                        <option value="MON">MON</option>
                        <option value="GG">GG</option>
                        <option value="BLT">BLT</option>
                      </select>
                    </td>
                    <td>
                      <input v-model="world.orbitAu" type="text" class="table-input" placeholder="1/0.5" />
                    </td>
                    <td>
                      <input v-model="world.sah" type="text" class="table-input" placeholder="—" />
                    </td>
                    <td>
                      <input v-model.number="world.diameter" type="number" class="table-input" placeholder="0" />
                    </td>
                    <td>
                      <input v-model.number="world.temperature" type="number" class="table-input" placeholder="0" />
                      <div class="conversion">
                        <small v-if="formatTemperatureFromKelvin(world.temperature) !== '—'">
                          ≈ {{ formatTemperatureFromKelvin(world.temperature) }}
                        </small>
                        <small v-else class="muted">—</small>
                        <div v-if="world.temperatureLow || world.temperatureHigh" style="margin-top: 4px">
                          <small v-if="formatTemperatureFromKelvin(world.temperatureLow) !== '—'"
                            >Low ≈ {{ formatTemperatureFromKelvin(world.temperatureLow) }}</small
                          >
                          <small
                            v-if="formatTemperatureFromKelvin(world.temperatureHigh) !== '—'"
                            style="margin-left: 8px"
                            >High ≈ {{ formatTemperatureFromKelvin(world.temperatureHigh) }}</small
                          >
                        </div>
                      </div>
                    </td>
                    <td>
                      <input v-model="world.atmosphere" type="text" class="table-input" placeholder="0" />
                    </td>
                    <td>
                      <input v-model="world.hydrosphere" type="text" class="table-input" placeholder="0" />
                    </td>
                    <td>
                      <input v-model="world.lifeMxdc" type="text" class="table-input" placeholder="—" />
                    </td>
                    <td>
                      <input v-model="world.habitability" type="text" class="table-input" placeholder="—" />
                    </td>
                    <td>
                      <input v-model="world.resources" type="text" class="table-input" placeholder="—" />
                    </td>
                    <td>
                      <input v-model="world.notes" type="text" class="table-input" placeholder="Notes" />
                    </td>
                    <td class="action-cell">
                      <button @click="removeWorld(index)" class="btn-remove" title="Remove world">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- ADD WORLD BUTTON & TOTALS -->
            <div class="button-row">
              <button @click="addWorld" class="btn btn-small btn-add">+ Add World</button>
            </div>

            <!-- TOTALS BAR -->
            <div class="totals-bar">
              <span><strong>Mainworld:</strong> {{ countWorldsByType("MW") }}</span>
              <span><strong>Terrestrials:</strong> {{ countWorldsByType("TER") }}</span>
              <span><strong>Moons:</strong> {{ countWorldsByType("MON") }}</span>
              <span><strong>Gas Giants:</strong> {{ countWorldsByType("GG") }}</span>
              <span><strong>Belts:</strong> {{ countWorldsByType("BLT") }}</span>
            </div>
          </div>

          <!-- COMPACT WORLD PROFILES -->
          <div
            class="section-block"
            id="panel-compact"
            role="tabpanel"
            aria-labelledby="tab-compact"
            :aria-hidden="!(expandedSection === 'compact' || expandedSection === 'all')"
            v-show="expandedSection === 'compact' || expandedSection === 'all'"
          >
            <div class="section-label">Compact World Profiles</div>
            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Mainworld Name</label>
                <input v-model="surveyData.mainworldName" type="text" class="cell-input" placeholder="Name" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Mainworld Type</label>
                <input v-model="surveyData.mainworldType" type="text" class="cell-input" placeholder="World or Moon" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Parent World</label>
                <input v-model="surveyData.mainworldParent" type="text" class="cell-input" placeholder="If moon" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Mainworld UWP</label>
                <input v-model="surveyData.mainworldUwp" type="text" class="cell-input" placeholder="X-XXXXXX-X" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Native Lifeform Profile</label>
                <input v-model="surveyData.nativeLifeform" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Habitability</label>
                <input v-model="surveyData.habitability" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Resource Rating</label>
                <input v-model="surveyData.resourceRating" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Trade Codes</label>
                <input v-model="surveyData.tradeCodes" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Stellar Profile</label>
                <input v-model="surveyData.stellarProfile" type="text" class="cell-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Mainworld Remarks</label>
                <input
                  v-model="surveyData.mainworldRemarks"
                  type="text"
                  class="cell-input"
                  placeholder="Moon, Mainworld, etc."
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Secondary World Profiles (UWP string)</label>
                <input v-model="surveyData.secondaryProfiles" type="text" class="cell-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Appeals</label>
                <input v-model="surveyData.appealProfile" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-3">
                <label class="cell-label">Private Law</label>
                <input v-model="surveyData.privateLawProfile" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-3">
                <label class="cell-label">Personal Rights</label>
                <input v-model="surveyData.personalRightsProfile" type="text" class="cell-input" />
              </div>
              <div class="form-cell grow-5">
                <label class="cell-label">Notes:</label>
                <input v-model="surveyData.profileNotes" type="text" class="cell-input" />
              </div>
            </div>
          </div>

          <!-- COMMENTS SECTION -->
          <div
            class="comments-block"
            id="panel-comments"
            role="tabpanel"
            aria-labelledby="tab-comments"
            :aria-hidden="!(expandedSection === 'comments' || expandedSection === 'all')"
            v-show="expandedSection === 'comments' || expandedSection === 'all'"
          >
            <label class="cell-label">Comments / Survey Notes</label>
            <textarea
              v-model="surveyData.comments"
              class="comments-textarea"
              placeholder="General survey notes and observations..."
              rows="3"
            ></textarea>
          </div>

          <!-- ACTION BUTTONS -->
          <div class="form-actions">
            <button @click="saveSurvey" class="btn btn-primary">💾 Save Survey</button>
            <button @click="resetForm" class="btn btn-secondary">🔄 Reset</button>
            <button @click="printForm" class="btn btn-secondary">🖨️ Print</button>
          </div>
        </div>
      </transition>
      <!-- .section-area -->
    </div>
    <!-- .survey-layout -->
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useSystemStore } from "../../stores/systemStore";
import { formatTemperatureFromKelvin } from "../../utils/temperatureFormatting.js";
import {
  buildSurveyDataFromSystem,
  createEmptyStarRow,
  createEmptySurveyData,
  createEmptyWorldRow,
  mergeSystemSurveyRecord,
} from "./systemSurveyFormModel.js";

const props = defineProps({
  systemRecord: {
    type: Object,
    default: null,
  },
  systemId: {
    type: String,
    default: "",
  },
  autofill: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();
const systemStore = useSystemStore();

const resolvedSystemRecord = computed(() => {
  if (props.systemRecord && typeof props.systemRecord === "object") {
    return props.systemRecord;
  }

  const requestedId = String(props.systemId || route.query.systemRecordId || systemStore.currentSystemId || "").trim();
  if (!requestedId) {
    return systemStore.getCurrentSystem;
  }

  return systemStore.systems.find((system) => String(system?.systemId) === requestedId) ?? systemStore.getCurrentSystem;
});

const sections = [
  { key: "overview", label: "Overview" },
  { key: "stellar", label: "Stellar Components" },
  { key: "worlds", label: "Worlds" },
  { key: "compact", label: "Compact Profiles" },
  { key: "comments", label: "Comments" },
];

const expandedSection = ref(sections[0].key);

function selectSection(key) {
  expandedSection.value = key;
}

const isWide = ref(false);
function toggleWide() {
  isWide.value = !isWide.value;
  if (isWide.value) {
    const cur = document.getElementById("tab-" + expandedSection.value);
    if (cur) cur.focus();
  }
}

function handleNavKeydown(event, index) {
  const key = event.key;
  if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
    event.preventDefault();
    let nextIndex;
    if (key === "Home") nextIndex = 0;
    else if (key === "End") nextIndex = sections.length - 1;
    else {
      const delta = key === "ArrowDown" ? 1 : -1;
      nextIndex = (index + delta + sections.length) % sections.length;
    }
    const nextKey = sections[nextIndex].key;
    const nextBtn = document.getElementById("tab-" + nextKey);
    if (nextBtn) nextBtn.focus();
  }
}

// Form data
const surveyData = ref(createEmptySurveyData());

watch(
  resolvedSystemRecord,
  (systemRecord) => {
    if (!props.autofill) {
      return;
    }
    surveyData.value = buildSurveyDataFromSystem(systemRecord);
  },
  { immediate: true },
);

// Add new star
const addStar = () => {
  surveyData.value.stars.push(createEmptyStarRow());
};

// Remove star
const removeStar = (index) => {
  if (surveyData.value.stars.length > 1) {
    surveyData.value.stars.splice(index, 1);
  } else {
    alert("You must keep at least one star");
  }
};

// Add new world
const addWorld = () => {
  surveyData.value.worlds.push(createEmptyWorldRow());
};

// Remove world
const removeWorld = (index) => {
  surveyData.value.worlds.splice(index, 1);
};

// Count worlds by type
const countWorldsByType = (type) => {
  return surveyData.value.worlds.filter((w) => w.type === type).length;
};

// Save survey
const saveSurvey = async () => {
  if (!surveyData.value.systemDesignation) {
    alert("Please enter a system designation");
    return;
  }

  if (!surveyData.value.stars.some((s) => s.typeSubtype)) {
    alert("Please enter at least one star");
    return;
  }

  try {
    const currentRecord =
      resolvedSystemRecord.value && typeof resolvedSystemRecord.value === "object" ? resolvedSystemRecord.value : null;

    if (currentRecord?.systemId) {
      const nextRecord = mergeSystemSurveyRecord(currentRecord, surveyData.value);

      await systemStore.updateSystem(currentRecord.systemId, nextRecord);
      systemStore.setCurrentSystem(currentRecord.systemId);
    } else {
      console.log("✓ System Survey saved:", surveyData.value);
    }

    alert("✓ System Survey saved successfully!");
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

// Reset form
const resetForm = () => {
  surveyData.value = createEmptySurveyData();
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

/* ── HEADER (BURGUNDY) ── */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #9a0e21; /* Burgundy header */
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

/* ── SURVEY CLASS BAR ── */
.survey-class-bar {
  background: #7a0a1a; /* Darker burgundy */
  color: #ffb3ba;
  font-size: 9px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 3px 10px;
  border-bottom: 1px solid #000;
}

/* ── SECTION LABEL ── */
.section-label {
  background: #8a0c1f; /* Medium burgundy */
  color: #ffffff;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 8px;
  border-bottom: 1px solid #000;
}

/* ── FORM ROWS & CELLS ── */
.form-row {
  display: flex;
  border-bottom: 1px solid #ccc;
  flex-wrap: wrap;
  gap: 8px;
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
  /* Allow flex children to shrink properly and avoid overflow */
  min-width: 0;
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
  border-color: #9a0e21;
  box-shadow: 0 0 4px rgba(154, 14, 33, 0.3);
}

/* ── SECTION BLOCK ── */
.section-block {
  border-bottom: 2px solid #000;
}

/* ── STELLAR TABLE ── */
.table-wrapper {
  padding: 6px;
  overflow-x: auto;
}

.stellar-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.stellar-table th {
  background: #ead9df; /* Light burgundy */
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

.stellar-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.stellar-table tbody tr:nth-child(even) td {
  background-color: #faf8f9; /* Very light burgundy */
}

/* ── WORLD TABLE ── */
.world-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8px;
}

.world-table th {
  background: #ead9df; /* Light burgundy */
  border: 1px solid #aaa;
  padding: 3px 2px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 7px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  color: #333;
}

.world-table td {
  border: 1px solid #ddd;
  padding: 2px 2px;
  vertical-align: middle;
  font-size: 8px;
}

.world-table tbody tr:nth-child(even) td {
  background-color: #faf8f9;
}

.world-table tr.mainworld td {
  background: #f0d5e0;
  font-weight: bold;
}

.index-cell {
  text-align: center;
  font-weight: bold;
}

.table-input {
  width: 100%;
  border: none;
  padding: 2px 3px;
  font-size: 8px;
  font-family: Arial, monospace;
  background: transparent;
  text-align: center;
}

.table-input:focus {
  outline: none;
  background: #fff3cd;
  border-bottom: 1px solid #9a0e21;
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

/* ── COLUMN KEY ── */
.column-key {
  padding: 4px 6px;
  font-size: 8px;
  color: #555;
  background: #f0f8f8;
  border-bottom: 1px solid #ccc;
}

.badge {
  display: inline-block;
  font-size: 7px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 2px;
  padding: 1px 3px;
  letter-spacing: 0.5px;
  margin: 0 2px;
}

.badge-mw {
  background: #8a0c1f;
  color: #fff;
}

.badge-moon {
  background: #888;
  color: #fff;
}

.badge-gg {
  background: #6a4a00;
  color: #fff;
}

.badge-ter {
  background: #4a5a2a;
  color: #fff;
}
.badge-belt {
  background: #444;
  color: #fff;
}

/* ── BUTTON ROW ── */
.button-row {
  padding: 6px 8px;
  text-align: right;
  border-top: 1px solid #ddd;
}

.btn-add {
  background: #9a0e21;
  color: #fff;
  border: none;
  padding: 4px 12px;
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #7a0a1a;
  box-shadow: 0 0 6px rgba(154, 14, 33, 0.4);
}

/* ── TOTALS BAR ── */
.totals-bar {
  display: flex;
  background: #f5e8eb;
  border-top: 1px solid #aaa;
  border-bottom: 2px solid #000;
  padding: 4px 8px;
  gap: 24px;
  font-size: 9px;
  flex-wrap: wrap;
}

.totals-bar span {
  color: #444;
}

.totals-bar strong {
  color: #000;
}

/* ── COMMENTS SECTION ── */
.comments-block {
  padding: 8px;
  border-top: 2px solid #000;
  background: #f9f9f9;
}

.comments-textarea {
  width: 100%;
  border: 1px solid #999;
  border-radius: 3px;
  padding: 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  resize: vertical;
  margin-top: 4px;
}

.comments-textarea:focus {
  outline: none;
  border-color: #9a0e21;
  box-shadow: 0 0 4px rgba(154, 14, 33, 0.3);
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
  background: #9a0e21;
  color: #fff;
}

.btn-primary:hover {
  background: #7a0a1a;
  box-shadow: 0 0 8px rgba(154, 14, 33, 0.5);
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
  .section-label,
  .survey-class-bar {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .stellar-table th,
  .world-table th {
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

/* when wide, slightly increase nav column so content breathes */
.survey-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  padding: 12px;
}

/* wide form removes the centered max-width and uses full available width */
.survey-form.wide {
  max-width: none;
  width: calc(100% - 32px);
  margin: 0 16px;
  transition:
    width 220ms ease,
    margin 220ms ease;
}

/* when wide, slightly increase nav column so content breathes */
.survey-form.wide .survey-layout {
  grid-template-columns: 260px 1fr;
}

.section-nav {
  border-right: 1px solid #ddd;
  padding: 8px;
  background: #fff;
  position: sticky;
  top: 12px;
  align-self: start;
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.section-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-nav li {
  margin-bottom: 6px;
}

.nav-button {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  font-size: 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
}

.nav-button:hover {
  background: #f3f3f3;
}

.nav-button.active {
  background: #9a410e;
  color: #fff;
  border-color: rgba(0, 0, 0, 0.05);
}

.section-area {
  padding: 8px 8px 20px 8px;
  min-width: 0;
}

/* ── TRANSITION FOR SECTION SWAPS ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.nav-button:focus {
  outline: 3px solid rgba(154, 65, 14, 0.2);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .survey-layout {
    grid-template-columns: 1fr;
  }
  .section-nav {
    display: none;
  }
}

/* ── PRINT STYLES TO PRESERVE OUTPUT ── */
@media print {
  .form-actions,
  .button-row,
  .btn,
  .btn-add,
  .btn-remove {
    display: none !important;
  }

  .form-header,
  .section-label,
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
    border: none;
    box-shadow: none;
  }

  .left-nav,
  .section-nav {
    display: none !important;
  }

  .section-block,
  .section-block *,
  .section-content,
  .collapsed,
  [aria-hidden="true"],
  .hidden {
    display: block !important;
    visibility: visible !important;
    height: auto !important;
    overflow: visible !important;
  }

  .section-block {
    page-break-inside: avoid;
  }

  input,
  textarea,
  select,
  .table-input {
    background: #fff !important;
    color: #000 !important;
    border: 1px solid #000 !important;
  }
}
</style>
