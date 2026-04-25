<template>
  <div :class="['survey-form', { wide: isWide }]" id="gas-giant-physical-survey">
    <!-- FORM HEADER - RUST ORANGE -->
    <div class="form-header">
      <div class="title-block">Gas Giant Physical Survey</div>
      <div class="header-controls">
        <div class="form-number">FORM 0407G-IV PART P.GG</div>
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
        <button
          type="button"
          class="btn btn-secondary btn-toggle"
          @click="populateFromCurrent"
          aria-label="Load current world data into form"
          title="Load current world data into form"
        >
          Load Current
        </button>
      </div>
    </div>

    <div class="survey-layout">
      <nav class="section-nav" role="tablist" aria-label="Survey Sections" aria-orientation="vertical">
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
          <!-- IDENTIFICATION -->
          <div
            class="section-block"
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            :aria-hidden="!(expandedSection === 'overview' || expandedSection === 'all')"
            v-show="expandedSection === 'overview' || expandedSection === 'all'"
          >
            <div class="form-row">
              <div class="form-cell grow-4">
                <label class="cell-label">World Name / Designation</label>
                <input v-model="surveyData.worldName" type="text" class="cell-input" placeholder="e.g., Jove Prime" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">GLE / SAH Code</label>
                <input v-model="surveyData.gleCode" type="text" class="cell-input" placeholder="GGS-H" />
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

            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Sector | Location</label>
                <input
                  v-model="surveyData.sectorLocation"
                  type="text"
                  class="cell-input"
                  placeholder="e.g., Spinward Marches / 0101"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Primary Star(s)</label>
                <input v-model="surveyData.primaryObjects" type="text" class="cell-input" placeholder="G2 V" />
              </div>
              <div class="form-cell grow-1">
                <label class="cell-label">System Age (Gyr)</label>
                <input
                  v-model.number="surveyData.systemAge"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="4.6"
                />
              </div>
              <div class="form-cell grow-1">
                <label class="cell-label">Initial Survey</label>
                <input v-model="surveyData.initialSurvey" type="date" class="cell-input" />
              </div>
              <div class="form-cell grow-1">
                <label class="cell-label">Last Updated</label>
                <input v-model="surveyData.lastUpdated" type="date" class="cell-input" />
              </div>
            </div>
          </div>

          <!-- ORBIT -->
          <div
            class="section-block"
            id="panel-orbit"
            role="tabpanel"
            aria-labelledby="tab-orbit"
            :aria-hidden="!(expandedSection === 'orbit' || expandedSection === 'all')"
            v-show="expandedSection === 'orbit' || expandedSection === 'all'"
          >
            <div class="section-label">Orbit</div>
            <div class="form-row">
              <div class="form-cell">
                <label class="cell-label">Orbit #</label>
                <input v-model.number="surveyData.orbit.number" type="number" class="cell-input" placeholder="5" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Semi-Major Axis (AU)</label>
                <input
                  v-model.number="surveyData.orbit.au"
                  type="number"
                  step="0.01"
                  class="cell-input"
                  placeholder="5.20"
                />
              </div>
              <div class="form-cell">
                <label class="cell-label">Eccentricity</label>
                <input
                  v-model.number="surveyData.orbit.eccentricity"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  class="cell-input"
                  placeholder="0.048"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Orbital Period</label>
                <input v-model="surveyData.orbit.period" type="text" class="cell-input" placeholder="11.86 years" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Orbital Zone</label>
                <select v-model="surveyData.orbit.zone" class="cell-input">
                  <option value="">—</option>
                  <option value="inner">Inner</option>
                  <option value="habitable">Habitable</option>
                  <option value="outer">Outer</option>
                  <option value="far-outer">Far Outer</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Hill Sphere (AU)</label>
                <input
                  v-model.number="surveyData.orbit.hillSphereAU"
                  type="number"
                  step="0.001"
                  class="cell-input"
                  placeholder="0.355"
                />
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.orbit.notes"
                class="notes-textarea"
                placeholder="Orbital resonances, perturbations, migration history..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- PHYSICAL CHARACTERISTICS -->
          <div
            class="section-block"
            id="panel-physical"
            role="tabpanel"
            aria-labelledby="tab-physical"
            :aria-hidden="!(expandedSection === 'physical' || expandedSection === 'all')"
            v-show="expandedSection === 'physical' || expandedSection === 'all'"
          >
            <div class="section-label">Physical Characteristics</div>
            <div class="form-row">
              <div class="form-cell">
                <label class="cell-label">Size Code</label>
                <input v-model="surveyData.size.code" type="text" class="cell-input" placeholder="H / S / L" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Diameter (km)</label>
                <input
                  v-model.number="surveyData.size.diameterKm"
                  type="number"
                  step="1"
                  class="cell-input"
                  placeholder="142984"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Diameter (R♃)</label>
                <input
                  v-model.number="surveyData.size.diameterJ"
                  type="number"
                  step="0.01"
                  class="cell-input"
                  placeholder="1.00"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Mass (M♃)</label>
                <input
                  v-model.number="surveyData.size.massJ"
                  type="number"
                  step="0.01"
                  class="cell-input"
                  placeholder="1.00"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Mass (M☉)</label>
                <input
                  v-model.number="surveyData.size.massSolar"
                  type="number"
                  step="0.00001"
                  class="cell-input"
                  placeholder="0.00095"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Bulk Density (g/cm³)</label>
                <input
                  v-model.number="surveyData.size.density"
                  type="number"
                  step="0.01"
                  class="cell-input"
                  placeholder="1.33"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Cloud-top Gravity (G)</label>
                <input
                  v-model.number="surveyData.size.gravity"
                  type="number"
                  step="0.01"
                  class="cell-input"
                  placeholder="2.53"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Escape Velocity (km/s)</label>
                <input
                  v-model.number="surveyData.size.escapeVelocity"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="59.5"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Rotation Period (h)</label>
                <input v-model="surveyData.size.rotationPeriod" type="text" class="cell-input" placeholder="9.9 h" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Axial Tilt (°)</label>
                <input
                  v-model.number="surveyData.size.axialTilt"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="3.1"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Oblateness</label>
                <input
                  v-model.number="surveyData.size.oblateness"
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  class="cell-input"
                  placeholder="0.065"
                />
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.size.notes"
                class="notes-textarea"
                placeholder="Sub-brown dwarf threshold, comparative notes..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- INTERIOR STRUCTURE -->
          <div
            class="section-block"
            id="panel-interior"
            role="tabpanel"
            aria-labelledby="tab-interior"
            :aria-hidden="!(expandedSection === 'interior' || expandedSection === 'all')"
            v-show="expandedSection === 'interior' || expandedSection === 'all'"
          >
            <div class="section-label">Interior Structure &amp; Composition</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Giant Class</label>
                <select v-model="surveyData.composition.type" class="cell-input">
                  <option value="">—</option>
                  <option value="Hot Jupiter">Hot Jupiter</option>
                  <option value="Warm Jupiter">Warm Jupiter</option>
                  <option value="Gas Giant">Gas Giant (Jovian)</option>
                  <option value="Ice Giant">Ice Giant (Neptunian)</option>
                  <option value="Sub-Jupiter">Sub-Jupiter</option>
                  <option value="Super-Jupiter">Super-Jupiter</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Core Type</label>
                <select v-model="surveyData.composition.coreType" class="cell-input">
                  <option value="">—</option>
                  <option value="Rocky">Rocky</option>
                  <option value="Iron-Rock">Iron-Rock</option>
                  <option value="Ice-Rock">Ice-Rock</option>
                  <option value="Diffuse/None">Diffuse / None</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Metallic H₂ Layer?</label>
                <select v-model="surveyData.composition.metallicHydrogen" class="cell-input">
                  <option value="">—</option>
                  <option value="yes">Yes</option>
                  <option value="no">No (Ice Giant)</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Internal Heat Source</label>
                <select v-model="surveyData.composition.internalHeat" class="cell-input">
                  <option value="">—</option>
                  <option value="Strong">Strong (L★ &gt; Solar)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Weak">Weak</option>
                  <option value="None">None</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div class="section-sublabel">Atmospheric Composition Estimate (%)</div>
            <div class="comp-grid-6">
              <div class="comp-cell">
                <label class="cell-label">H₂ + He</label>
                <input
                  v-model.number="surveyData.composition.hydrogenHelium"
                  type="number"
                  min="0"
                  max="100"
                  class="cell-input"
                  placeholder="89"
                />
              </div>
              <div class="comp-cell">
                <label class="cell-label">Methane (CH₄)</label>
                <input
                  v-model.number="surveyData.composition.methane"
                  type="number"
                  min="0"
                  max="100"
                  class="cell-input"
                  placeholder="0.3"
                />
              </div>
              <div class="comp-cell">
                <label class="cell-label">Ammonia (NH₃)</label>
                <input
                  v-model.number="surveyData.composition.ammonia"
                  type="number"
                  min="0"
                  max="100"
                  class="cell-input"
                  placeholder="0.03"
                />
              </div>
              <div class="comp-cell">
                <label class="cell-label">Water (H₂O)</label>
                <input
                  v-model.number="surveyData.composition.water"
                  type="number"
                  min="0"
                  max="100"
                  class="cell-input"
                  placeholder="0.1"
                />
              </div>
              <div class="comp-cell">
                <label class="cell-label">Phosphine / Other</label>
                <input
                  v-model.number="surveyData.composition.other"
                  type="number"
                  min="0"
                  max="100"
                  class="cell-input"
                  placeholder="trace"
                />
              </div>
              <div class="comp-cell">
                <label class="cell-label">Cloud-top Temp (K)</label>
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
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.composition.notes"
                class="notes-textarea"
                placeholder="Layered composition, exotic molecules, metallicity..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- ATMOSPHERE & CLOUD STRUCTURE -->
          <div
            class="section-block"
            id="panel-atmosphere"
            role="tabpanel"
            aria-labelledby="tab-atmosphere"
            :aria-hidden="!(expandedSection === 'atmosphere' || expandedSection === 'all')"
            v-show="expandedSection === 'atmosphere' || expandedSection === 'all'"
          >
            <div class="section-label">Atmosphere &amp; Cloud Structure</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Cloud Band Pattern</label>
                <select v-model="surveyData.atmosphere.cloudBands" class="cell-input">
                  <option value="">—</option>
                  <option value="Prominent">Prominent (belts/zones)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Faint">Faint</option>
                  <option value="Featureless">Featureless</option>
                  <option value="Chaotic">Chaotic</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Dominant Colour</label>
                <input
                  v-model="surveyData.atmosphere.colour"
                  type="text"
                  class="cell-input"
                  placeholder="Amber/Brown"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Peak Wind Speed</label>
                <input v-model="surveyData.atmosphere.windSpeed" type="text" class="cell-input" placeholder="600 m/s" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Lightning Activity</label>
                <select v-model="surveyData.atmosphere.lightning" class="cell-input">
                  <option value="">—</option>
                  <option value="None">None detected</option>
                  <option value="Rare">Rare</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Frequent">Frequent</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-cell grow-3">
                <label class="cell-label">Storm Systems / Vortices</label>
                <input
                  v-model="surveyData.atmosphere.stormSystems"
                  type="text"
                  class="cell-input"
                  placeholder="e.g., Great Dark Spot, polar hexagon"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Upper Cloud Layer Composition</label>
                <input
                  v-model="surveyData.atmosphere.upperCloudLayer"
                  type="text"
                  class="cell-input"
                  placeholder="Ammonia ice"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Lower Cloud Layer</label>
                <input
                  v-model="surveyData.atmosphere.lowerCloudLayer"
                  type="text"
                  class="cell-input"
                  placeholder="Ammonium hydrosulfide"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Deep Cloud Layer</label>
                <input
                  v-model="surveyData.atmosphere.deepCloudLayer"
                  type="text"
                  class="cell-input"
                  placeholder="Water ice / liquid"
                />
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.atmosphere.notes"
                class="notes-textarea"
                placeholder="Atmospheric dynamics, seasonal variation, anomalous features..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- THERMAL STRUCTURE -->
          <div
            class="section-block"
            id="panel-thermal"
            role="tabpanel"
            aria-labelledby="tab-thermal"
            :aria-hidden="!(expandedSection === 'thermal' || expandedSection === 'all')"
            v-show="expandedSection === 'thermal' || expandedSection === 'all'"
          >
            <div class="section-label">Thermal Structure</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Cloud-top Temp (K)</label>
                <input
                  v-model.number="surveyData.thermal.cloudTopK"
                  type="number"
                  class="cell-input"
                  placeholder="110"
                />
                <div class="conversion">
                  <small v-if="formatTemperatureFromKelvin(surveyData.thermal.cloudTopK) !== '—'">
                    ≈ {{ formatTemperatureFromKelvin(surveyData.thermal.cloudTopK) }}
                  </small>
                  <small v-else class="muted">—</small>
                </div>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Deep Atmosphere Temp (K)</label>
                <input
                  v-model.number="surveyData.thermal.deepAtmoK"
                  type="number"
                  class="cell-input"
                  placeholder="~10000"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Effective Temp (K)</label>
                <input
                  v-model.number="surveyData.thermal.effectiveK"
                  type="number"
                  class="cell-input"
                  placeholder="124"
                />
                <div class="conversion">
                  <small v-if="formatTemperatureFromKelvin(surveyData.thermal.effectiveK) !== '—'">
                    ≈ {{ formatTemperatureFromKelvin(surveyData.thermal.effectiveK) }}
                  </small>
                  <small v-else class="muted">—</small>
                </div>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Albedo (Bond)</label>
                <input
                  v-model.number="surveyData.thermal.albedo"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  class="cell-input"
                  placeholder="0.52"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Int. Heat Flux (W/m²)</label>
                <input
                  v-model.number="surveyData.thermal.internalHeatFlux"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="5.4"
                />
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.thermal.notes"
                class="notes-textarea"
                placeholder="Thermal gradient, pressure-temperature profile notes..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- MAGNETOSPHERE -->
          <div
            class="section-block"
            id="panel-magnetosphere"
            role="tabpanel"
            aria-labelledby="tab-magnetosphere"
            :aria-hidden="!(expandedSection === 'magnetosphere' || expandedSection === 'all')"
            v-show="expandedSection === 'magnetosphere' || expandedSection === 'all'"
          >
            <div class="section-label">Magnetosphere &amp; Radiation Environment</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Field Strength</label>
                <select v-model="surveyData.magnetosphere.strength" class="cell-input">
                  <option value="">—</option>
                  <option value="Extreme">Extreme (≥ 10× Jupiter)</option>
                  <option value="Strong">Strong (Jupiter-class)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Weak">Weak (Earth-class)</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Magnetopause Standoff (R♃)</label>
                <input
                  v-model.number="surveyData.magnetosphere.magnetopause"
                  type="number"
                  step="0.1"
                  class="cell-input"
                  placeholder="45"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Radiation Belt Hazard</label>
                <select v-model="surveyData.magnetosphere.radiationHazard" class="cell-input">
                  <option value="">—</option>
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High — shielding required</option>
                  <option value="Extreme">Extreme — lethal unshielded</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Plasma Torus?</label>
                <select v-model="surveyData.magnetosphere.plasmaTorus" class="cell-input">
                  <option value="">—</option>
                  <option value="yes">Yes (volcanically fed)</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Polarity</label>
                <select v-model="surveyData.magnetosphere.polarity" class="cell-input">
                  <option value="">—</option>
                  <option value="Normal">Normal</option>
                  <option value="Reversed">Reversed</option>
                  <option value="Tilted">Strongly tilted</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.magnetosphere.notes"
                class="notes-textarea"
                placeholder="Aurora activity, radio emissions, hazard zones for satellites..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- WILDERNESS REFUELING & RESOURCES -->
          <div
            class="section-block"
            id="panel-resources"
            role="tabpanel"
            aria-labelledby="tab-resources"
            :aria-hidden="!(expandedSection === 'resources' || expandedSection === 'all')"
            v-show="expandedSection === 'resources' || expandedSection === 'all'"
          >
            <div class="section-label">Wilderness Refueling &amp; Extractable Resources</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Fuel Skimming Feasibility</label>
                <select v-model="surveyData.resources.skimmingFeasibility" class="cell-input">
                  <option value="">—</option>
                  <option value="Easy">Easy — calm upper atmosphere</option>
                  <option value="Routine">Routine</option>
                  <option value="Difficult">Difficult — high winds</option>
                  <option value="Dangerous">Dangerous</option>
                  <option value="Impossible">Impossible</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Radiation Penalty (Skimming)</label>
                <select v-model="surveyData.resources.skimmingRadiation" class="cell-input">
                  <option value="">—</option>
                  <option value="None">None</option>
                  <option value="Minor">Minor</option>
                  <option value="Significant">Significant DM</option>
                  <option value="Severe">Severe — hardened ships only</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Harvestable Gases</label>
                <input
                  v-model="surveyData.resources.harvestableGases"
                  type="text"
                  class="cell-input"
                  placeholder="H₂, He-3, CH₄"
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Resource Rating</label>
                <select v-model="surveyData.resources.rating" class="cell-input">
                  <option value="">—</option>
                  <option value="Abundant">Abundant</option>
                  <option value="Common">Common</option>
                  <option value="Scarce">Scarce</option>
                  <option value="Rare">Rare</option>
                  <option value="None">None / Not viable</option>
                </select>
              </div>
            </div>
            <div class="notes-row">
              <label class="cell-label">Notes:</label>
              <textarea
                v-model="surveyData.resources.notes"
                class="notes-textarea"
                placeholder="Gas mining operations, He-3 deposits, industrial extraction notes..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- RING SYSTEM -->
          <div
            class="section-block"
            id="panel-rings"
            role="tabpanel"
            aria-labelledby="tab-rings"
            :aria-hidden="!(expandedSection === 'rings' || expandedSection === 'all')"
            v-show="expandedSection === 'rings' || expandedSection === 'all'"
          >
            <div class="section-label">Ring System</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Rings Present?</label>
                <select v-model="surveyData.rings.present" class="cell-input">
                  <option value="">—</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Ring Prominence</label>
                <select v-model="surveyData.rings.prominence" class="cell-input">
                  <option value="">—</option>
                  <option value="Major">Major (Saturn-class)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Faint">Faint / Tenuous</option>
                  <option value="Dust-only">Dust rings only</option>
                </select>
              </div>
              <div class="form-cell grow-4">
                <label class="cell-label">General Description</label>
                <input
                  v-model="surveyData.rings.description"
                  type="text"
                  class="cell-input"
                  placeholder="Icy outer rings, rocky shepherd moons, dusty equatorial band..."
                />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Roche Limit (km)</label>
                <input
                  v-model.number="surveyData.rings.rocheLimit"
                  type="number"
                  step="1"
                  class="cell-input"
                  placeholder="175000"
                />
              </div>
            </div>

            <div class="table-wrapper">
              <table class="ring-table">
                <thead>
                  <tr>
                    <th>Ring / Zone</th>
                    <th>Inner (km)</th>
                    <th>Outer (km)</th>
                    <th>Inner (R♃)</th>
                    <th>Outer (R♃)</th>
                    <th>Width (km)</th>
                    <th>Opacity</th>
                    <th>Composition / Notes</th>
                    <th class="action-col">Del</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ring, index) in surveyData.rings.rings" :key="index">
                    <td><input v-model="ring.name" type="text" class="table-input" placeholder="Ring A" /></td>
                    <td>
                      <input
                        v-model.number="ring.innerLimitKm"
                        type="number"
                        step="1"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="ring.outerLimitKm"
                        type="number"
                        step="1"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="ring.innerPD"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="ring.outerPD"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input v-model.number="ring.widthKm" type="number" step="1" class="table-input" placeholder="0" />
                    </td>
                    <td><input v-model="ring.opacity" type="text" class="table-input" placeholder="Opaque" /></td>
                    <td>
                      <input v-model="ring.composition" type="text" class="table-input" placeholder="Ice, rock, dust" />
                    </td>
                    <td class="action-cell">
                      <button @click="removeRing(index)" class="btn-remove" title="Remove ring">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="button-row">
              <button @click="addRing" class="btn btn-small btn-add">+ Add Ring</button>
            </div>
          </div>

          <!-- SATELLITES / MOONS -->
          <div
            class="section-block"
            id="panel-satellites"
            role="tabpanel"
            aria-labelledby="tab-satellites"
            :aria-hidden="!(expandedSection === 'satellites' || expandedSection === 'all')"
            v-show="expandedSection === 'satellites' || expandedSection === 'all'"
          >
            <div class="section-label">Natural Satellites</div>
            <div class="form-row">
              <div class="form-cell grow-2">
                <label class="cell-label">Total Moon Count</label>
                <input v-model.number="surveyData.moonCount" type="number" min="0" class="cell-input" placeholder="0" />
              </div>
              <div class="form-cell grow-2">
                <label class="cell-label">Major Moons (≥ 200 km dia.)</label>
                <input
                  v-model.number="surveyData.majorMoonCount"
                  type="number"
                  min="0"
                  class="cell-input"
                  placeholder="0"
                />
              </div>
              <div class="form-cell grow-4">
                <label class="cell-label">Notable Moon Systems</label>
                <input
                  v-model="surveyData.notableMoonSystems"
                  type="text"
                  class="cell-input"
                  placeholder="Galilean-analog set, Trojan co-orbitals..."
                />
              </div>
            </div>
            <div class="table-wrapper">
              <table class="sat-table">
                <thead>
                  <tr>
                    <th>Name / ID</th>
                    <th>SAH / UWP</th>
                    <th>Orbit (R♃)</th>
                    <th>Orbit (km)</th>
                    <th>Ecc</th>
                    <th>Period (h)</th>
                    <th>Dia. (km)</th>
                    <th>Density</th>
                    <th>Mass (⊕)</th>
                    <th>Angular Size (°)</th>
                    <th>Notes</th>
                    <th class="action-col">Del</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(sat, index) in surveyData.satellites" :key="index">
                    <td><input v-model="sat.name" type="text" class="table-input" placeholder="Moon I" /></td>
                    <td><input v-model="sat.sah_uwp" type="text" class="table-input" placeholder="X000000-0" /></td>
                    <td>
                      <input
                        v-model.number="sat.orbitPD"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        v-model.number="sat.orbitKm"
                        type="number"
                        step="100"
                        class="table-input"
                        placeholder="0"
                      />
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
                      <input
                        v-model.number="sat.periodHours"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td><input v-model="sat.diameter" type="text" class="table-input" placeholder="km" /></td>
                    <td>
                      <input
                        v-model.number="sat.density"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input v-model.number="sat.mass" type="number" step="0.001" class="table-input" placeholder="0" />
                    </td>
                    <td>
                      <input
                        v-model.number="sat.sizeAngle"
                        type="number"
                        step="0.01"
                        class="table-input"
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        v-model="sat.notes"
                        type="text"
                        class="table-input"
                        placeholder="Volcanic, icy, habitable..."
                      />
                    </td>
                    <td class="action-cell">
                      <button @click="removeSatellite(index)" class="btn-remove" title="Remove satellite">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="button-row">
              <button @click="addSatellite" class="btn btn-small btn-add">+ Add Satellite</button>
            </div>
          </div>

          <!-- COMMENTS -->
          <div
            class="section-block"
            id="panel-comments"
            role="tabpanel"
            aria-labelledby="tab-comments"
            :aria-hidden="!(expandedSection === 'comments' || expandedSection === 'all')"
            v-show="expandedSection === 'comments' || expandedSection === 'all'"
          >
            <label class="comments-label">Survey Comments &amp; Anomalies:</label>
            <textarea
              v-model="surveyData.comments"
              class="comments-textarea"
              placeholder="Mission notes, anomalies, research priorities, hazard advisories..."
              rows="4"
            ></textarea>
          </div>
        </div>
      </transition>
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
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSystemStore } from "../../stores/systemStore.js";
import { formatTemperatureFromKelvin } from "../../utils/temperatureFormatting.js";

const props = defineProps({
  systemRecord: { type: Object, default: null },
  worldRecord: { type: Object, default: null },
  systemId: { type: String, default: "" },
  worldIndex: { type: [String, Number], default: "" },
  autofill: { type: Boolean, default: true },
});

const route = useRoute();
const systemStore = useSystemStore();

function prepareSystemRecord(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const prepared = { ...raw };

  const existingName = String(
    prepared?.sectorName || prepared?.sector?.name || prepared?.metadata?.sectorName || "",
  ).trim();
  if (existingName) {
    prepared.sectorName = existingName;
    return prepared;
  }

  const routeSectorName = String(route.query.sectorName || "").trim();
  if (routeSectorName) {
    prepared.sectorName = routeSectorName;
    return prepared;
  }

  return prepared;
}

const resolvedSystemRecord = computed(() => {
  if (props.systemRecord && typeof props.systemRecord === "object") return props.systemRecord;

  const requestedId = String(
    props.systemId || route.query.systemRecordId || route.query.systemId || systemStore.currentSystemId || "",
  ).trim();
  if (!requestedId) return systemStore.getCurrentSystem;

  return systemStore.systems.find((s) => String(s?.systemId) === requestedId) ?? systemStore.getCurrentSystem;
});

const resolvedWorldIndex = computed(() => {
  const explicitIndex = props.worldIndex ?? route.query.worldIndex;
  const parsed = Number.parseInt(String(explicitIndex ?? ""), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
});

const resolvedWorldRecord = computed(() => {
  if (props.worldRecord && typeof props.worldRecord === "object") return props.worldRecord;
  const sr = resolvedSystemRecord.value;
  if (!sr || !Array.isArray(sr?.planets)) return null;
  if (resolvedWorldIndex.value !== null) return sr.planets[resolvedWorldIndex.value] ?? null;
  const routeWorldName = String(route.query.worldName || "").trim();
  if (!routeWorldName) return null;
  return sr.planets.find((p) => String(p?.name || "").trim() === routeWorldName) ?? null;
});

// Create an empty survey shape
function createEmptySurveyData() {
  const today = new Date().toISOString().split("T")[0];
  return {
    worldName: "",
    gleCode: "",
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
      zone: "",
      hillSphereAU: null,
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
      axialTilt: null,
      oblateness: null,
      notes: "",
    },

    composition: {
      type: "",
      hydrogenHelium: null,
      methane: null,
      ammonia: null,
      water: null,
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
      lightning: "",
      upperCloudLayer: "",
      lowerCloudLayer: "",
      deepCloudLayer: "",
      notes: "",
    },

    thermal: {
      cloudTopK: null,
      deepAtmoK: null,
      effectiveK: null,
      albedo: null,
      internalHeatFlux: null,
      notes: "",
    },

    magnetosphere: {
      strength: "",
      magnetopause: null,
      radiationHazard: "",
      plasmaTorus: "",
      polarity: "",
      notes: "",
    },

    resources: {
      skimmingFeasibility: "",
      skimmingRadiation: "",
      harvestableGases: "",
      rating: "",
      notes: "",
    },

    rings: {
      present: "",
      description: "",
      prominence: "",
      rocheLimit: null,
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

    moonCount: null,
    majorMoonCount: null,
    notableMoonSystems: "",

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
}

function buildSurveyDataFromGasGiant(systemRecord, worldRecord) {
  const base = createEmptySurveyData();
  if (!worldRecord || typeof worldRecord !== "object") return base;

  base.worldName = String(worldRecord?.name || "");
  base.gleCode = String(worldRecord?.gleCode || worldRecord?.uwp || "");
  base.sectorLocation = String(systemRecord?.sectorName || systemRecord?.sector?.name || "");
  base.initialSurvey = base.initialSurvey;
  base.lastUpdated = base.lastUpdated;

  base.orbit.number = worldRecord?.orbitNumber ?? null;
  base.orbit.au = worldRecord?.orbitAU ?? worldRecord?.orbitAu ?? null;
  base.orbit.eccentricity = worldRecord?.eccentricity ?? null;
  base.orbit.period = worldRecord?.orbitalPeriodDays ? `${worldRecord.orbitalPeriodDays} days` : "";
  base.orbit.zone = String(worldRecord?.zone || worldRecord?.orbitGroup || "");
  base.orbit.hillSphereAU = worldRecord?.hillSphereAU ?? null;

  base.size.code = String(worldRecord?.sizeCode || worldRecord?.typeCode || "");
  base.size.diameterKm = worldRecord?.diameterKm ?? null;
  base.size.diameterJ = worldRecord?.diameterJ ?? null;
  base.size.massJ = worldRecord?.mass ?? worldRecord?.massJ ?? null;
  base.size.massSolar = worldRecord?.massSolar ?? null;
  base.size.density = worldRecord?.density ?? null;
  base.size.gravity = worldRecord?.gravity ?? null;
  base.size.escapeVelocity = worldRecord?.escapeVelocityMps ? Number(worldRecord.escapeVelocityMps) / 1000 : null;
  base.size.rotationPeriod = worldRecord?.dayLengthHours ?? null;
  base.size.axialTilt = worldRecord?.axialTilt ?? null;
  base.size.oblateness = worldRecord?.oblateness ?? null;

  base.composition.type = worldRecord?.composition ?? "";
  base.composition.hydrogenHelium = worldRecord?.compositionBreakdown?.hydrogenHelium ?? null;
  base.composition.methane = worldRecord?.compositionBreakdown?.methane ?? null;
  base.composition.ammonia = worldRecord?.compositionBreakdown?.ammonia ?? null;
  base.composition.water = worldRecord?.compositionBreakdown?.water ?? null;
  base.composition.other = worldRecord?.compositionBreakdown?.other ?? null;
  base.composition.temperature = worldRecord?.cloudTopTempK ?? null;

  base.atmosphere.cloudBands = worldRecord?.cloudBands ?? "";
  base.atmosphere.stormSystems = worldRecord?.stormSystems ?? "";
  base.atmosphere.windSpeed = worldRecord?.maxWindSpeed ?? "";
  base.atmosphere.colour = worldRecord?.appearance ?? "";
  base.atmosphere.lightning = worldRecord?.lightning ?? "";
  base.atmosphere.upperCloudLayer = worldRecord?.upperCloudLayer ?? "";
  base.atmosphere.lowerCloudLayer = worldRecord?.lowerCloudLayer ?? "";
  base.atmosphere.deepCloudLayer = worldRecord?.deepCloudLayer ?? "";

  base.thermal.cloudTopK = worldRecord?.cloudTopTempK ?? null;
  base.thermal.deepAtmoK = worldRecord?.deepAtmoTempK ?? null;
  base.thermal.effectiveK = worldRecord?.effectiveTempK ?? null;
  base.thermal.albedo = worldRecord?.albedo ?? null;
  base.thermal.internalHeatFlux = worldRecord?.internalHeatFlux ?? null;

  base.magnetosphere.strength = worldRecord?.magnetosphere?.strength ?? "";
  base.magnetosphere.magnetopause = worldRecord?.magnetosphere?.magnetopauseKm ?? null;
  base.magnetosphere.radiationHazard = worldRecord?.magnetosphere?.radiationHazard ?? "";
  base.magnetosphere.plasmaTorus = worldRecord?.magnetosphere?.plasmaTorus ?? "";
  base.magnetosphere.polarity = worldRecord?.magnetosphere?.polarity ?? "";

  base.resources.harvestableGases = worldRecord?.harvestableGases ?? "";
  base.resources.skimmingFeasibility = worldRecord?.skimmingFeasibility ?? "";
  base.resources.skimmingRadiation = worldRecord?.skimmingRadiation ?? "";

  base.moonCount =
    worldRecord?.moonCount ?? (Array.isArray(worldRecord?.moonsData) ? worldRecord.moonsData.length : null);
  base.majorMoonCount = worldRecord?.majorMoonCount ?? null;
  base.notableMoonSystems = worldRecord?.notableMoonSystems ?? "";

  base.rings.present = Array.isArray(worldRecord?.rings) && worldRecord.rings.length ? "yes" : "no";
  base.rings.description = String(worldRecord?.rings?.description || "");
  base.rings.rings =
    Array.isArray(worldRecord?.rings) && worldRecord.rings.length
      ? worldRecord.rings.map((r) => ({ ...r }))
      : base.rings.rings;

  base.satellites = Array.isArray(worldRecord?.moonsData)
    ? worldRecord.moonsData.map((moon) => ({
        name: moon?.name || "",
        sah_uwp: moon?.worldProfile?.uwp || "",
        orbitPD: moon?.orbitalSlot ?? null,
        orbitKm: null,
        eccentricity: moon?.eccentricity ?? null,
        periodHours: moon?.worldProfile?.dayLengthHours ?? null,
        diameter: moon?.worldProfile?.diameterKm ?? null,
        density: moon?.worldProfile?.density ?? null,
        mass: moon?.worldProfile?.mass ?? null,
        sizeAngle: null,
        notes: moon?.description || "",
      }))
    : base.satellites;

  base.comments = Array.isArray(worldRecord?.remarks) ? worldRecord.remarks.join(", ") : "";

  return base;
}

const surveyData = ref(createEmptySurveyData());

const sections = [
  { key: "overview", label: "Overview" },
  { key: "orbit", label: "Orbit" },
  { key: "physical", label: "Physical" },
  { key: "interior", label: "Interior" },
  { key: "atmosphere", label: "Atmosphere" },
  { key: "thermal", label: "Thermal" },
  { key: "magnetosphere", label: "Magnetosphere" },
  { key: "resources", label: "Resources" },
  { key: "rings", label: "Rings" },
  { key: "satellites", label: "Satellites" },
  { key: "comments", label: "Comments" },
];

const expandedSection = ref("overview");
const isWide = ref(false);

function selectSection(key) {
  expandedSection.value = key;
}

function toggleWide() {
  isWide.value = !isWide.value;
  if (isWide.value) {
    const curButton = document.getElementById("tab-" + expandedSection.value);
    if (curButton) curButton.focus();
  }
}

function handleNavKeydown(event, index) {
  const key = event.key;
  const len = sections.length;
  if (key === "ArrowUp") {
    event.preventDefault();
    if (index > 0) selectSection(sections[index - 1].key);
  } else if (key === "ArrowDown") {
    event.preventDefault();
    if (index < len - 1) selectSection(sections[index + 1].key);
  } else if (key === "Home") {
    event.preventDefault();
    selectSection(sections[0].key);
  } else if (key === "End") {
    event.preventDefault();
    selectSection(sections[len - 1].key);
  }
}

function populateFromCurrent() {
  const prepared = prepareSystemRecord(resolvedSystemRecord.value);
  surveyData.value = buildSurveyDataFromGasGiant(prepared, resolvedWorldRecord.value);
}

onMounted(() => {
  if (props.autofill) populateFromCurrent();
});

watch(
  () => route.query,
  (q) => {
    if (!props.autofill) return;
    if (q && (q.worldIndex || q.systemId || q.worldName)) populateFromCurrent();
  },
);

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

const removeRing = (index) => {
  surveyData.value.rings.rings.splice(index, 1);
};

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

const removeSatellite = (index) => {
  surveyData.value.satellites.splice(index, 1);
};

function updateMoonData(existingMoons = [], subordinates = []) {
  let subordinateIndex = 0;
  return (Array.isArray(existingMoons) ? existingMoons : []).map((moon) => {
    if (!moon || moon?.type === "ring") return moon;
    const subordinate = subordinates[subordinateIndex] ?? null;
    subordinateIndex += 1;
    if (!subordinate) return moon;
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
      rings: surveyData.value.rings.rings.filter((r) => String(r?.name || "").trim()),
      satellites: surveyData.value.satellites.filter((s) => String(s?.name || "").trim()),
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
        diameterKm: payload?.size?.diameterKm ?? currentPlanet.diameterKm,
        composition: String(payload?.composition?.type || currentPlanet.composition || ""),
        density: payload?.size?.density ?? currentPlanet.density,
        mass: payload?.size?.massJ ?? currentPlanet.mass,
        escapeVelocityMps:
          payload?.size?.escapeVelocity !== null && payload?.size?.escapeVelocity !== undefined
            ? Number(payload.size.escapeVelocity) * 1000
            : currentPlanet.escapeVelocityMps,
        orbitalPeriodDays: payload?.orbit?.period
          ? parseFloat(String(payload.orbit.period).replace(/[^0-9.+-]/g, "")) || currentPlanet.orbitalPeriodDays
          : currentPlanet.orbitalPeriodDays,
        dayLengthHours: payload?.size?.rotationPeriod ?? currentPlanet.dayLengthHours,
        rings: payload.rings && payload.rings.length ? payload.rings : currentPlanet.rings,
        moonsData: updateMoonData(currentPlanet?.moonsData ?? [], payload.subordinates ?? payload.satellites ?? []),
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
      console.log("✓ Gas Giant Survey saved:", payload);
    }

    alert("✓ Gas Giant Survey saved successfully!");
  } catch (error) {
    console.error("✗ Save failed:", error);
    alert("✗ Failed to save survey. Check console for details.");
  }
};

const resetForm = () => {
  if (props.autofill) {
    populateFromCurrent();
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

/* ── HEADER CONTROLS ── */
.header-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}

.btn-toggle {
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
}

/* ── SURVEY LAYOUT (TABBED SIDEBAR) ── */
.survey-layout {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0;
  min-height: 500px;
}

.survey-form.wide .survey-layout {
  grid-template-columns: 160px 1fr;
}

/* ── SECTION NAVIGATION (SIDEBAR) ── */
.section-nav {
  background: #f5f0ea;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  max-height: 60vh;
  padding: 0;
}

.section-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-nav li {
  border-bottom: 1px solid #ddd;
}

.section-nav .nav-button {
  display: block;
  width: 100%;
  padding: 10px 8px;
  text-align: left;
  background: transparent;
  border: none;
  color: #333;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.section-nav .nav-button:hover {
  background: #e8ddd0;
}

.section-nav .nav-button.active {
  background: #e0c9b0;
  border-left-color: #9a410e;
  font-weight: bold;
  color: #5a2608;
}

/* ── SECTION AREA ── */
.section-area {
  background: #ffffff;
  padding: 12px;
  overflow-y: auto;
  max-height: 60vh;
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

/* ── SECTION SUBLABEL ── */
.section-sublabel {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #7a3209;
  padding: 4px 8px 2px;
  border-top: 1px solid #e0c9b0;
  border-bottom: 1px solid #e0c9b0;
  background: #fdf6ee;
}

/* ── COMPOSITION GRID (5-col) ── */
.comp-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-bottom: 1px solid #ccc;
}

/* ── COMPOSITION GRID (6-col for interior section) ── */
.comp-grid-6 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  border-bottom: 1px solid #ccc;
}

.comp-grid-6 .comp-cell:nth-child(6n) {
  border-right: none;
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

/* ── TRANSITIONS ── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
