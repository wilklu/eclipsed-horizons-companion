<template>
  <div class="survey-form">
    <!-- FORM HEADER - TEAL/SEA GREEN -->
    <div class="form-header">
      <div class="title-block">World Census Survey</div>
      <div class="form-number">FORM 0407F-IV PART C</div>
    </div>

    <!-- WORLD IDENTIFICATION -->
    <div class="section-block">
      <div class="form-row">
        <div class="form-cell grow-4">
          <label class="cell-label">World Name</label>
          <input v-model="surveyData.worldName" type="text" class="cell-input" placeholder="World name" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">UWP</label>
          <input v-model="surveyData.uwp" type="text" class="cell-input" placeholder="X000000-0" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Sector | Location</label>
          <input v-model="surveyData.sectorLocation" type="text" class="cell-input" placeholder="Sector / Hex" />
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
            <option value="Green">Green</option>
            <option value="Amber">Amber</option>
            <option value="Red">Red</option>
          </select>
        </div>
      </div>
    </div>

    <!-- POPULATION SECTION -->
    <div class="section-block">
      <div class="section-label">Population</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Total</label>
          <input v-model="surveyData.population.total" type="text" class="cell-input" placeholder="8.2B" />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">Demographics</label>
          <input
            v-model="surveyData.population.demographics"
            type="text"
            class="cell-input"
            placeholder="Age/Gender distribution"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">PCR</label>
          <input v-model="surveyData.population.pcr" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="form-cell">
          <label class="cell-label">Urbanisation %</label>
          <input
            v-model.number="surveyData.population.urbanisation"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="75"
          />
        </div>
        <div class="form-cell">
          <label class="cell-label">Major Cities</label>
          <input v-model.number="surveyData.population.majorCities" type="number" class="cell-input" placeholder="5" />
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Capital / Port</label>
          <input v-model="surveyData.population.capitalPort" type="text" class="cell-input" placeholder="Name" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-6">
          <label class="cell-label">Major Cities List</label>
          <textarea
            v-model="surveyData.population.citiesList"
            class="cell-textarea"
            placeholder="City names and populations"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.population.notes"
          class="notes-textarea"
          placeholder="Population details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- GOVERNMENT SECTION -->
    <div class="section-block">
      <div class="section-label">Government</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Type</label>
          <input v-model="surveyData.government.type" type="text" class="cell-input" placeholder="Democratic, etc." />
        </div>
        <div class="form-cell">
          <label class="cell-label">Centralisation</label>
          <select v-model="surveyData.government.centralisation" class="cell-input">
            <option value="">—</option>
            <option value="Centralized">Centralized</option>
            <option value="Federated">Federated</option>
            <option value="Decentralized">Decentralized</option>
          </select>
        </div>
        <div class="form-cell">
          <label class="cell-label">Authority</label>
          <select v-model="surveyData.government.authority" class="cell-input">
            <option value="">—</option>
            <option value="Strong">Strong</option>
            <option value="Moderate">Moderate</option>
            <option value="Weak">Weak</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Profile</label>
          <input v-model="surveyData.government.profile" type="text" class="cell-input" placeholder="Code" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.government.notes"
          class="notes-textarea"
          placeholder="Government details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- FACTIONS SECTION -->
    <div class="section-block">
      <div class="section-label">Factions</div>
      <div class="form-row">
        <div class="form-cell grow-3">
          <label class="cell-label">Types and Designations</label>
          <textarea
            v-model="surveyData.factions.types"
            class="cell-textarea"
            placeholder="Faction descriptions"
            rows="2"
          ></textarea>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Profiles</label>
          <textarea
            v-model="surveyData.factions.profiles"
            class="cell-textarea"
            placeholder="Codes"
            rows="2"
          ></textarea>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Relationships</label>
          <textarea
            v-model="surveyData.factions.relationships"
            class="cell-textarea"
            placeholder="Alliances/Hostilities"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Faction Notes:</label>
        <textarea
          v-model="surveyData.factions.notes"
          class="notes-textarea"
          placeholder="Faction details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- LAW LEVEL SECTION -->
    <div class="section-block">
      <div class="section-label">Law Level</div>
      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Primary</label>
          <input v-model="surveyData.lawLevel.primary" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="form-cell">
          <label class="cell-label">Secondary</label>
          <input v-model="surveyData.lawLevel.secondary" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="form-cell">
          <label class="cell-label">Uniformity</label>
          <select v-model="surveyData.lawLevel.uniformity" class="cell-input">
            <option value="">—</option>
            <option value="Uniform">Uniform</option>
            <option value="Variable">Variable</option>
            <option value="Chaotic">Chaotic</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Presumption of Innocence?</label>
          <select v-model="surveyData.lawLevel.presumption" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Death Penalty?</label>
          <select v-model="surveyData.lawLevel.deathPenalty" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell grow-6">
          <label class="cell-label">Legal System:</label>
          <input v-model="surveyData.lawLevel.legalSystem" type="text" class="cell-input" placeholder="Description" />
        </div>
      </div>

      <!-- Law Profile Table -->
      <div class="table-wrapper">
        <table class="law-table">
          <thead>
            <tr>
              <th>Categories</th>
              <th>Overall</th>
              <th>Weapons</th>
              <th>Economics</th>
              <th>Criminal</th>
              <th>Private</th>
              <th>Personal Rights</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: left; font-weight: bold">Profile:</td>
              <td><input v-model="surveyData.lawLevel.profile.overall" type="text" class="table-input" /></td>
              <td><input v-model="surveyData.lawLevel.profile.weapons" type="text" class="table-input" /></td>
              <td><input v-model="surveyData.lawLevel.profile.economics" type="text" class="table-input" /></td>
              <td><input v-model="surveyData.lawLevel.profile.criminal" type="text" class="table-input" /></td>
              <td><input v-model="surveyData.lawLevel.profile.private" type="text" class="table-input" /></td>
              <td><input v-model="surveyData.lawLevel.profile.personalRights" type="text" class="table-input" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.lawLevel.notes"
          class="notes-textarea"
          placeholder="Law level details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- TECHNOLOGY SECTION -->
    <div class="section-block">
      <div class="section-label">Technology</div>
      <div class="tech-grid">
        <div class="tech-cell">
          <label class="cell-label">Common High</label>
          <input v-model="surveyData.technology.commonHigh" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Energy</label>
          <input v-model="surveyData.technology.energy" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Land</label>
          <input v-model="surveyData.technology.land" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Personal Military</label>
          <input v-model="surveyData.technology.personalMilitary" type="text" class="cell-input" placeholder="TL" />
        </div>

        <div class="tech-cell">
          <label class="cell-label">Common Low</label>
          <input v-model="surveyData.technology.commonLow" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Electronics</label>
          <input v-model="surveyData.technology.electronics" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Water</label>
          <input v-model="surveyData.technology.water" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Heavy Military</label>
          <input v-model="surveyData.technology.heavyMilitary" type="text" class="cell-input" placeholder="TL" />
        </div>

        <div class="tech-cell">
          <label class="cell-label">Manufacturing</label>
          <input v-model="surveyData.technology.manufacturing" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Air</label>
          <input v-model="surveyData.technology.air" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Novelty</label>
          <input v-model="surveyData.technology.novelty" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Medical</label>
          <input v-model="surveyData.technology.medical" type="text" class="cell-input" placeholder="TL" />
        </div>

        <div class="tech-cell">
          <label class="cell-label">Space</label>
          <input v-model="surveyData.technology.space" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell">
          <label class="cell-label">Environmental</label>
          <input v-model="surveyData.technology.environmental" type="text" class="cell-input" placeholder="TL" />
        </div>
        <div class="tech-cell" style="grid-column: span 2">
          <label class="cell-label">Notes:</label>
          <input v-model="surveyData.technology.notes" type="text" class="cell-input" placeholder="Tech notes" />
        </div>
      </div>
    </div>

    <!-- CULTURE SECTION -->
    <div class="section-block">
      <div class="section-label">Culture</div>
      <div class="culture-grid">
        <div class="culture-cell">
          <label class="cell-label">Diversity</label>
          <select v-model="surveyData.culture.diversity" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Xenophilia</label>
          <select v-model="surveyData.culture.xenophilia" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Uniqueness</label>
          <select v-model="surveyData.culture.uniqueness" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Symbology</label>
          <input v-model="surveyData.culture.symbology" type="text" class="cell-input" placeholder="Symbols" />
        </div>

        <div class="culture-cell">
          <label class="cell-label">Cohesion</label>
          <select v-model="surveyData.culture.cohesion" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Progressiveness</label>
          <select v-model="surveyData.culture.progressiveness" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Expansionism</label>
          <select v-model="surveyData.culture.expansionism" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div class="culture-cell">
          <label class="cell-label">Militancy</label>
          <select v-model="surveyData.culture.militancy" class="cell-input">
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.culture.notes"
          class="notes-textarea"
          placeholder="Culture details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- ECONOMICS SECTION -->
    <div class="section-block">
      <div class="section-label">Economics</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Trade Codes</label>
          <input v-model="surveyData.economics.tradeCodes" type="text" class="cell-input" placeholder="Ag, In, etc." />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Importance</label>
          <input v-model="surveyData.economics.importance" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="form-cell grow-2">
          <label class="cell-label">Tariffs</label>
          <input v-model="surveyData.economics.tariffs" type="text" class="cell-input" placeholder="%" />
        </div>
      </div>

      <div class="econ-grid">
        <div class="econ-cell">
          <label class="cell-label">Resources</label>
          <input v-model="surveyData.economics.resources" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">Labour</label>
          <input v-model="surveyData.economics.labour" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">Infrastructure</label>
          <input v-model="surveyData.economics.infrastructure" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">Efficiency</label>
          <input v-model="surveyData.economics.efficiency" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">RU</label>
          <input v-model="surveyData.economics.ru" type="text" class="cell-input" placeholder="Amount" />
        </div>

        <div class="econ-cell">
          <label class="cell-label">GWP per Capita</label>
          <input v-model="surveyData.economics.gwpPerCapita" type="text" class="cell-input" placeholder="MCr" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">WTN</label>
          <input v-model="surveyData.economics.wtn" type="text" class="cell-input" placeholder="Code" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">Inequality Rating</label>
          <input
            v-model.number="surveyData.economics.inequality"
            type="number"
            step="0.01"
            class="cell-input"
            placeholder="0.0-1.0"
          />
        </div>
        <div class="econ-cell">
          <label class="cell-label">Development Score</label>
          <input v-model="surveyData.economics.devScore" type="text" class="cell-input" placeholder="Score" />
        </div>
        <div class="econ-cell">
          <label class="cell-label">GWP (MCr)</label>
          <input v-model="surveyData.economics.gwp" type="text" class="cell-input" placeholder="Amount" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.economics.notes"
          class="notes-textarea"
          placeholder="Economic details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- STARPORT SECTION -->
    <div class="section-block">
      <div class="section-label">Starport</div>
      <div class="starport-grid">
        <div class="starport-cell">
          <label class="cell-label">Class</label>
          <select v-model="surveyData.starport.class" class="cell-input">
            <option value="">—</option>
            <option value="A">A (Excellent)</option>
            <option value="B">B (Good)</option>
            <option value="C">C (Routine)</option>
            <option value="D">D (Poor)</option>
            <option value="E">E (Frontier)</option>
          </select>
        </div>
        <div class="starport-cell">
          <label class="cell-label">Highport?</label>
          <select v-model="surveyData.starport.highport" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="starport-cell">
          <label class="cell-label">Weekly Traffic</label>
          <input
            v-model.number="surveyData.starport.weeklyTraffic"
            type="number"
            class="cell-input"
            placeholder="Ships/week"
          />
        </div>
        <div class="starport-cell">
          <label class="cell-label">Berthing Fees</label>
          <input v-model="surveyData.starport.berthingFees" type="text" class="cell-input" placeholder="MCr" />
        </div>

        <div class="starport-cell" style="grid-column: span 2">
          <label class="cell-label">Capacity — Docking</label>
          <input v-model="surveyData.starport.dockingCapacity" type="text" class="cell-input" placeholder="Capacity" />
        </div>
        <div class="starport-cell">
          <label class="cell-label">Shipyard</label>
          <select v-model="surveyData.starport.shipyard" class="cell-input">
            <option value="">—</option>
            <option value="Construct">Construct</option>
            <option value="Overhaul">Overhaul</option>
            <option value="None">None</option>
          </select>
        </div>
        <div class="starport-cell">
          <label class="cell-label">Annual Output</label>
          <input v-model="surveyData.starport.annualOutput" type="text" class="cell-input" placeholder="Ships/year" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-cell">
          <label class="cell-label">Navy</label>
          <select v-model="surveyData.starport.navy" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-cell">
          <label class="cell-label">Scout</label>
          <select v-model="surveyData.starport.scout" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-cell">
          <label class="cell-label">Military</label>
          <select v-model="surveyData.starport.military" class="cell-input">
            <option value="">—</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-cell grow-3">
          <label class="cell-label">Other</label>
          <input v-model="surveyData.starport.other" type="text" class="cell-input" placeholder="Other bases" />
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.starport.notes"
          class="notes-textarea"
          placeholder="Starport details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- MILITARY SECTION -->
    <div class="section-block">
      <div class="section-label">Military</div>
      <div class="form-row">
        <div class="form-cell grow-2">
          <label class="cell-label">Effective Budget %</label>
          <input
            v-model.number="surveyData.military.budgetPercent"
            type="number"
            min="0"
            max="100"
            class="cell-input"
            placeholder="5"
          />
        </div>
        <div class="form-cell grow-4">
          <label class="cell-label">Structure</label>
          <input
            v-model="surveyData.military.structure"
            type="text"
            class="cell-input"
            placeholder="Military organization"
          />
        </div>
      </div>

      <div style="padding: 2px 6px 4px 6px">
        <label class="cell-label" style="padding: 3px 0 2px 0">Branches</label>
        <div class="mil-grid">
          <div class="mil-cell">
            <label class="cell-label">Enforcement</label>
            <input v-model="surveyData.military.enforcement" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Militia</label>
            <input v-model="surveyData.military.militia" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Army</label>
            <input v-model="surveyData.military.army" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Wet Navy</label>
            <input v-model="surveyData.military.wetNavy" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Air Force</label>
            <input v-model="surveyData.military.airForce" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">System Defence</label>
            <input v-model="surveyData.military.systemDefence" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Navy</label>
            <input v-model="surveyData.military.navy" type="text" class="cell-input" placeholder="Count" />
          </div>
          <div class="mil-cell">
            <label class="cell-label">Marines</label>
            <input v-model="surveyData.military.marines" type="text" class="cell-input" placeholder="Count" />
          </div>
        </div>
      </div>

      <div class="notes-row">
        <label class="cell-label">Notes:</label>
        <textarea
          v-model="surveyData.military.notes"
          class="notes-textarea"
          placeholder="Military details..."
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- COMMENTS SECTION -->
    <div class="comments-block">
      <label class="comments-label">Comments:</label>
      <textarea
        v-model="surveyData.comments"
        class="comments-textarea"
        placeholder="General census notes and observations..."
        rows="4"
      ></textarea>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="form-actions">
      <button @click="saveSurvey" class="btn btn-primary">💾 Save Census</button>
      <button @click="resetForm" class="btn btn-secondary">🔄 Reset</button>
      <button @click="printForm" class="btn btn-secondary">🖨️ Print</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const surveyData = ref({
  worldName: "",
  uwp: "",
  sectorLocation: "",
  initialSurvey: new Date().toISOString().split("T")[0],
  lastUpdated: new Date().toISOString().split("T")[0],
  primaryObjects: "",
  systemAge: null,
  travelZone: "",

  population: {
    total: "",
    demographics: "",
    pcr: "",
    urbanisation: null,
    majorCities: null,
    capitalPort: "",
    citiesList: "",
    notes: "",
  },

  government: {
    type: "",
    centralisation: "",
    authority: "",
    profile: "",
    notes: "",
  },

  factions: {
    types: "",
    profiles: "",
    relationships: "",
    notes: "",
  },

  lawLevel: {
    primary: "",
    secondary: "",
    uniformity: "",
    presumption: "",
    deathPenalty: "",
    legalSystem: "",
    profile: {
      overall: "",
      weapons: "",
      economics: "",
      criminal: "",
      private: "",
      personalRights: "",
    },
    notes: "",
  },

  technology: {
    commonHigh: "",
    energy: "",
    land: "",
    personalMilitary: "",
    commonLow: "",
    electronics: "",
    water: "",
    heavyMilitary: "",
    manufacturing: "",
    air: "",
    novelty: "",
    medical: "",
    space: "",
    environmental: "",
    notes: "",
  },

  culture: {
    diversity: "",
    xenophilia: "",
    uniqueness: "",
    symbology: "",
    cohesion: "",
    progressiveness: "",
    expansionism: "",
    militancy: "",
    notes: "",
  },

  economics: {
    tradeCodes: "",
    importance: "",
    tariffs: "",
    resources: "",
    labour: "",
    infrastructure: "",
    efficiency: "",
    ru: "",
    gwpPerCapita: "",
    wtn: "",
    inequality: null,
    devScore: "",
    gwp: "",
    notes: "",
  },

  starport: {
    class: "",
    highport: "",
    weeklyTraffic: null,
    berthingFees: "",
    dockingCapacity: "",
    shipyard: "",
    annualOutput: "",
    navy: "",
    scout: "",
    military: "",
    other: "",
    notes: "",
  },

  military: {
    budgetPercent: null,
    structure: "",
    enforcement: "",
    militia: "",
    army: "",
    wetNavy: "",
    airForce: "",
    systemDefence: "",
    navy: "",
    marines: "",
    notes: "",
  },

  comments: "",
});

// Save survey
const saveSurvey = async () => {
  if (!surveyData.value.worldName) {
    alert("Please enter a world name");
    return;
  }

  try {
    console.log("✓ World Census Survey saved:", surveyData.value);
    alert("✓ World Census Survey saved successfully!");
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
    uwp: "",
    sectorLocation: "",
    initialSurvey: new Date().toISOString().split("T")[0],
    lastUpdated: new Date().toISOString().split("T")[0],
    primaryObjects: "",
    systemAge: null,
    travelZone: "",
    population: {
      total: "",
      demographics: "",
      pcr: "",
      urbanisation: null,
      majorCities: null,
      capitalPort: "",
      citiesList: "",
      notes: "",
    },
    government: {
      type: "",
      centralisation: "",
      authority: "",
      profile: "",
      notes: "",
    },
    factions: {
      types: "",
      profiles: "",
      relationships: "",
      notes: "",
    },
    lawLevel: {
      primary: "",
      secondary: "",
      uniformity: "",
      presumption: "",
      deathPenalty: "",
      legalSystem: "",
      profile: {
        overall: "",
        weapons: "",
        economics: "",
        criminal: "",
        private: "",
        personalRights: "",
      },
      notes: "",
    },
    technology: {
      commonHigh: "",
      energy: "",
      land: "",
      personalMilitary: "",
      commonLow: "",
      electronics: "",
      water: "",
      heavyMilitary: "",
      manufacturing: "",
      air: "",
      novelty: "",
      medical: "",
      space: "",
      environmental: "",
      notes: "",
    },
    culture: {
      diversity: "",
      xenophilia: "",
      uniqueness: "",
      symbology: "",
      cohesion: "",
      progressiveness: "",
      expansionism: "",
      militancy: "",
      notes: "",
    },
    economics: {
      tradeCodes: "",
      importance: "",
      tariffs: "",
      resources: "",
      labour: "",
      infrastructure: "",
      efficiency: "",
      ru: "",
      gwpPerCapita: "",
      wtn: "",
      inequality: null,
      devScore: "",
      gwp: "",
      notes: "",
    },
    starport: {
      class: "",
      highport: "",
      weeklyTraffic: null,
      berthingFees: "",
      dockingCapacity: "",
      shipyard: "",
      annualOutput: "",
      navy: "",
      scout: "",
      military: "",
      other: "",
      notes: "",
    },
    military: {
      budgetPercent: null,
      structure: "",
      enforcement: "",
      militia: "",
      army: "",
      wetNavy: "",
      airForce: "",
      systemDefence: "",
      navy: "",
      marines: "",
      notes: "",
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
  border-color: #0e9a87;
  box-shadow: 0 0 4px rgba(14, 154, 135, 0.3);
}

.cell-textarea {
  width: 100%;
  border: 1px solid #999;
  border-radius: 2px;
  padding: 4px 6px;
  font-size: 10px;
  font-family: Arial, sans-serif;
  resize: vertical;
  min-height: 40px;
}

.cell-textarea:focus {
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

.law-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.law-table th {
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

.law-table td {
  border: 1px solid #ddd;
  padding: 3px 2px;
  vertical-align: middle;
  font-size: 9px;
}

.law-table tbody tr:nth-child(even) td {
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

/* ── TECH GRID (4-col) ── */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #ccc;
}

.tech-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.tech-cell:nth-child(4n) {
  border-right: none;
}

/* ── CULTURE GRID (4-col) ── */
.culture-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #ccc;
}

.culture-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.culture-cell:nth-child(4n) {
  border-right: none;
}

/* ── ECONOMICS GRID (5-col) ── */
.econ-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-top: 1px solid #ccc;
}

.econ-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.econ-cell:nth-child(5n) {
  border-right: none;
}

/* ── STARPORT GRID (4-col) ── */
.starport-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid #ccc;
}

.starport-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.starport-cell:nth-child(4n) {
  border-right: none;
}

/* ── MILITARY GRID (4-col) ── */
.mil-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid #ccc;
}

.mil-cell {
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 6px 8px;
  min-height: 32px;
  display: flex;
  flex-direction: column;
}

.mil-cell:nth-child(4n) {
  border-right: none;
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

/* ── PRINT STYLES ── */
@media print {
  .form-actions {
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
