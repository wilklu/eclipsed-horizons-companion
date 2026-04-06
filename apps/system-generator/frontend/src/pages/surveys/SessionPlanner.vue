<template>
  <div class="session-planner">
    <LoadingSpinner v-bind="sessionExportOverlayProps" />
    <SurveyNavigation
      currentClass="Session Planner"
      :show-regenerate="!!session"
      :show-export="!!session"
      :back-route="{ name: 'GalaxySurvey' }"
      @regenerate="generateSession"
      @export="exportSession"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Session Title:</label>
          <div class="name-row">
            <input v-model="sessionTitle" placeholder="Enter session title…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeTitle">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>Mission Type:</label>
          <select v-model="missionType" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="t in MISSION_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Setting:</label>
          <select v-model="setting" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="s in SETTINGS" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Threat Level:</label>
          <select v-model="threatLevel" class="select-input">
            <option value="low">Low — Routine</option>
            <option value="medium">Medium — Dangerous</option>
            <option value="high">High — Lethal</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateSession">⚡ Plan Session</button>
        </div>
      </div>

      <!-- Session Plan Display -->
      <div v-if="session" class="session-display">
        <!-- Header -->
        <div class="session-header">
          <div>
            <h2>{{ session.title }}</h2>
            <p class="session-tagline">{{ session.missionType }} · {{ session.setting }}</p>
          </div>
          <div class="threat-badge" :class="session.threatLevel">{{ session.threatLevel.toUpperCase() }} THREAT</div>
        </div>

        <!-- Overview stats -->
        <div class="key-stats">
          <div class="kstat" v-for="(v, k) in session.overview" :key="k">
            <div class="kstat-label">{{ k }}</div>
            <div class="kstat-value">{{ v }}</div>
          </div>
        </div>

        <div class="session-grid">
          <!-- Adventure Hooks -->
          <section class="session-section">
            <h3>🎣 Adventure Hooks</h3>
            <ul class="hook-list">
              <li v-for="(hook, i) in session.hooks" :key="i" class="hook-item">{{ hook }}</li>
            </ul>
          </section>

          <!-- Key NPCs -->
          <section class="session-section">
            <h3>🧑‍🚀 Key NPCs</h3>
            <div class="npc-list">
              <div v-for="(npc, i) in session.npcs" :key="i" class="npc-card">
                <div class="npc-name">{{ npc.name }}</div>
                <div class="npc-role">{{ npc.role }}</div>
                <div class="npc-motive">Motive: {{ npc.motive }}</div>
              </div>
            </div>
          </section>

          <!-- Locations -->
          <section class="session-section">
            <h3>📍 Locations</h3>
            <div class="location-list">
              <div v-for="(loc, i) in session.locations" :key="i" class="location-card">
                <div class="location-name">{{ loc.name }}</div>
                <div class="location-desc">{{ loc.description }}</div>
              </div>
            </div>
          </section>

          <!-- Complications -->
          <section class="session-section">
            <h3>⚠️ Complications</h3>
            <ul class="complication-list">
              <li v-for="(c, i) in session.complications" :key="i" class="complication-item">{{ c }}</li>
            </ul>
          </section>

          <!-- Potential Encounters -->
          <section class="session-section full-width">
            <h3>⚔️ Potential Encounters</h3>
            <div class="encounter-list">
              <div v-for="(enc, i) in session.encounters" :key="i" class="encounter-card">
                <div class="encounter-header">
                  <span class="encounter-type">{{ enc.type }}</span>
                  <span class="encounter-difficulty" :class="enc.difficulty.toLowerCase()">{{ enc.difficulty }}</span>
                </div>
                <div class="encounter-desc">{{ enc.description }}</div>
              </div>
            </div>
          </section>

          <!-- GM Notes -->
          <section class="session-section full-width">
            <h3>📝 GM Notes</h3>
            <ul class="gm-notes">
              <li v-for="(note, i) in session.gmNotes" :key="i">{{ note }}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";

const { overlayProps: sessionExportOverlayProps, exportJson: exportSessionArchive } = useArchiveTransfer({
  noun: "Session",
  title: "Session Export In Progress",
  barLabel: "Packaging session archive for transfer",
  statusPrefix: "SESS",
  targetLabel: () => session.value?.title || "Archive target pending",
});

// ── Lookup tables ─────────────────────────────────────────────────────────────
const MISSION_TYPES = [
  "Rescue Operation",
  "Smuggling Run",
  "Corporate Espionage",
  "Exploration Survey",
  "Assassination Contract",
  "Diplomatic Escort",
  "Salvage Mission",
  "Bounty Hunt",
  "Courier Run",
  "Military Raid",
  "Scientific Expedition",
  "Prison Break",
];

const SETTINGS = [
  "Space Station",
  "Megacity Underbelly",
  "Frontier Colony",
  "Derelict Starship",
  "Alien Ruin",
  "Orbital Platform",
  "Desert Outpost",
  "Underwater Habitat",
  "Jungle World",
  "Ice Moon",
  "Corporate Arcology",
  "Asteroid Mining Camp",
];

const TITLE_PREFIXES = [
  "Operation",
  "The",
  "Project",
  "Mission",
  "Incident at",
  "Flight of the",
  "Shadow of",
  "Echoes from",
  "The Last",
  "Blood in",
];

const TITLE_NOUNS = [
  "Iron Veil",
  "Shattered Sun",
  "Dying Star",
  "Pale Frontier",
  "Red Meridian",
  "Silent Orbit",
  "Broken Gate",
  "Ember Station",
  "Cold Margin",
  "Fractured Void",
  "Dark Meridian",
  "Hollow Star",
];

const NPC_FIRST_NAMES = [
  "Kael",
  "Voss",
  "Mira",
  "Taryn",
  "Dex",
  "Sable",
  "Oran",
  "Lyss",
  "Harken",
  "Zena",
  "Corvin",
  "Petra",
  "Yael",
  "Strix",
  "Bren",
];

const NPC_LAST_NAMES = [
  "Ashford",
  "Morrow",
  "Vance",
  "Drex",
  "Colton",
  "Ilde",
  "Ferris",
  "Quell",
  "Strand",
  "Orvyn",
  "Kade",
  "Renn",
  "Solari",
  "Vex",
];

const NPC_ROLES = [
  "Mission Contact",
  "Antagonist",
  "Rival Operative",
  "Local Fixer",
  "Informant",
  "Corporate Handler",
  "Corrupt Official",
  "Ally in Distress",
  "Undercover Agent",
  "Weapons Dealer",
];

const NPC_MOTIVES = [
  "Profit above all else",
  "Revenge against a former partner",
  "Protecting their family",
  "Ideological conviction",
  "Coerced by a third party",
  "Pure survival instinct",
  "Ambition for power",
  "Misguided loyalty",
  "Redemption for past crimes",
  "Fear of exposure",
];

const LOCATION_TEMPLATES = [
  {
    name: "The Rust Quarter",
    description: "A derelict industrial district riddled with abandoned machinery and desperate locals.",
  },
  {
    name: "Highport Concourse",
    description: "A busy transit hub where every faction has eyes and deals are struck in plain sight.",
  },
  {
    name: "Sector Zero Vault",
    description: "A heavily secured data facility buried beneath the station's oldest section.",
  },
  { name: "The Sunken Yards", description: "Flooded shipyards where smugglers hide cargo among half-submerged hulls." },
  {
    name: "Executive Level 9",
    description: "Gleaming corporate offices with armed security and plenty of secrets on the servers.",
  },
  {
    name: "The Warrens",
    description: "A maze of shanties and tunnels housing thousands who never appear on any census.",
  },
  { name: "Outer Ring Docks", description: "Rough docking bays used by independent freighters and pirates alike." },
  { name: "Archive Node Delta", description: "An ancient data archive maintained by a secretive order of librarians." },
  { name: "The Cracked Dome", description: "A failed habitat dome, now a lawless settlement on the frontier." },
  {
    name: "Reactor Core Sublevel",
    description: "The boiling heart of the station — only the desperate or foolish come here.",
  },
];

const HOOK_TEMPLATES = [
  "A distress beacon transmits from a ship that was declared lost three years ago.",
  "A trusted contact goes silent hours before a scheduled handoff.",
  "The client's identity turns out to be a known alias of a wanted criminal.",
  "Local authorities are paid to look the other way — until someone pays more.",
  "A rival crew is already on-site when the players arrive.",
  "The target object is not what the briefing described.",
  "An innocent bystander witnesses something they shouldn't have.",
  "The escape route is compromised before the mission even begins.",
  "A faction the players worked against before has a presence here.",
  "The payout is in a currency that may not be legitimate.",
  "Communications are being jammed in the primary operation zone.",
  "A crew member receives an anonymous warning to abandon the mission.",
];

const COMPLICATION_TEMPLATES = [
  "Power failure blacks out a key section mid-operation.",
  "A civilian hostage situation unfolds unexpectedly.",
  "The opposition is three times better equipped than the briefing suggested.",
  "Environmental hazard (toxic atmosphere, zero-g, flooding) limits movement.",
  "A secondary party arrives with overlapping objectives.",
  "A crew member's past connection to an NPC threatens to derail the plan.",
  "The primary objective turns out to be booby-trapped.",
  "The window for extraction closes early due to a patrol schedule change.",
  "Key intelligence turns out to have been deliberately falsified.",
  "Local authorities launch a sweep operation for unrelated reasons.",
];

const ENCOUNTER_TEMPLATES = [
  { type: "Combat", description: "A security squad closes in after an alarm is triggered.", difficulty: "Medium" },
  { type: "Social", description: "A suspicious customs official demands to inspect cargo.", difficulty: "Low" },
  { type: "Combat", description: "Rival operatives ambush the group at a bottleneck.", difficulty: "High" },
  {
    type: "Exploration",
    description: "A sealed compartment hides an unexpected survivor — or threat.",
    difficulty: "Low",
  },
  { type: "Chase", description: "Pursuit through crowded corridors after a blown cover.", difficulty: "Medium" },
  { type: "Social", description: "A local gang boss wants a cut before granting passage.", difficulty: "Medium" },
  { type: "Hazard", description: "A failing airlock threatens to decompress the compartment.", difficulty: "High" },
  {
    type: "Combat",
    description: "Automated defence turrets activate on an unexpected frequency.",
    difficulty: "Medium",
  },
  { type: "Social", description: "An NPC recognises a crew member and demands answers.", difficulty: "Low" },
  {
    type: "Exploration",
    description: "Evidence of a prior crew who met a grim fate is discovered.",
    difficulty: "Low",
  },
  { type: "Chase", description: "A patrol ship locks on and begins an intercept course.", difficulty: "High" },
  {
    type: "Hazard",
    description: "Structural collapse traps part of the team on the wrong side.",
    difficulty: "Medium",
  },
];

const GM_NOTE_TEMPLATES = [
  "Leave one complication unresolved as a thread for the next session.",
  "The primary antagonist should have a sympathetic reason for their actions.",
  "Plant a clue that points toward a larger conspiracy without spelling it out.",
  "Reward creative problem-solving over brute-force approaches.",
  "Give each NPC at least one moment that reveals their personality.",
  "Track resource expenditure — fuel, ammo, and credits should matter.",
  "Introduce a moral grey area where there is no clearly 'good' option.",
  "Allow for multiple valid approaches: stealth, negotiation, or direct action.",
  "End on a moment of tension or revelation to drive momentum forward.",
  "Consider how faction relationships shift based on player choices.",
];

// ── State ─────────────────────────────────────────────────────────────────────
const sessionTitle = ref("");
const missionType = ref("random");
const setting = ref("random");
const threatLevel = ref("medium");
const session = ref(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeTitle() {
  sessionTitle.value = pick(TITLE_PREFIXES) + " " + pick(TITLE_NOUNS);
}

function buildNPC() {
  return {
    name: pick(NPC_FIRST_NAMES) + " " + pick(NPC_LAST_NAMES),
    role: pick(NPC_ROLES),
    motive: pick(NPC_MOTIVES),
  };
}

function generateSession() {
  const resolvedMission = missionType.value === "random" ? pick(MISSION_TYPES) : missionType.value;
  const resolvedSetting = setting.value === "random" ? pick(SETTINGS) : setting.value;
  const resolvedThreat = threatLevel.value;

  const npcCount = resolvedThreat === "high" ? 4 : resolvedThreat === "medium" ? 3 : 2;
  const encounterCount = resolvedThreat === "high" ? 5 : resolvedThreat === "medium" ? 4 : 3;

  session.value = {
    title: sessionTitle.value || pick(TITLE_PREFIXES) + " " + pick(TITLE_NOUNS),
    missionType: resolvedMission,
    setting: resolvedSetting,
    threatLevel: resolvedThreat,
    overview: {
      "Mission Type": resolvedMission,
      Setting: resolvedSetting,
      "Threat Level": resolvedThreat.charAt(0).toUpperCase() + resolvedThreat.slice(1),
      "Est. Duration": pick(["1 session", "2 sessions", "3 sessions"]),
      "Primary Objective": pick([
        "Extract a target",
        "Retrieve a data package",
        "Eliminate a key figure",
        "Deliver cargo undetected",
        "Secure a location",
        "Gather intelligence",
      ]),
      "Secondary Objective": pick([
        "Leave no witnesses",
        "Avoid diplomatic incident",
        "Recover additional intel",
        "Protect a bystander",
        "Frame a rival faction",
        "None — clean op",
      ]),
    },
    hooks: pickN(HOOK_TEMPLATES, 3),
    npcs: Array.from({ length: npcCount }, buildNPC),
    locations: pickN(LOCATION_TEMPLATES, 3),
    complications: pickN(COMPLICATION_TEMPLATES, resolvedThreat === "high" ? 4 : 3),
    encounters: pickN(ENCOUNTER_TEMPLATES, encounterCount),
    gmNotes: pickN(GM_NOTE_TEMPLATES, 4),
  };
}

async function exportSession() {
  if (!session.value) return;
  await exportSessionArchive({
    data: session,
    filename: (sessionRecord) => `${sessionRecord.title.replace(/\s+/g, "-")}-Session.json`,
    serializeMessage: "Serializing session dossier...",
    encodeMessage: "Encoding session archive for transfer...",
    readyMessage: "Session archive staged for local transfer.",
  });
}
</script>

<style scoped>
.session-planner {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
}

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.15rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}
.control-group label {
  color: #00ffff;
  font-weight: bold;
  font-size: 0.9rem;
}
.control-action {
  justify-content: flex-end;
}
.name-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.name-row .text-input {
  flex: 1;
}

.select-input,
.text-input {
  min-height: 2.5rem;
  padding: 0.6rem 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.btn {
  min-height: 2.5rem;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  line-height: 1.2;
  transition: all 0.2s;
}
.btn-primary {
  background: #00d9ff;
  color: #000;
}
.btn-primary:hover {
  background: #00ffff;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.4);
}
.btn-secondary {
  background: #444;
  color: #e0e0e0;
}
.btn-secondary:hover {
  background: #555;
}

/* Session display */
.session-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.session-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
}

.session-header h2 {
  color: #00d9ff;
  margin: 0 0 0.3rem;
}
.session-tagline {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

.threat-badge {
  padding: 0.4rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.threat-badge.low {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  border: 1px solid #2ecc71;
}
.threat-badge.medium {
  background: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
  border: 1px solid #f1c40f;
}
.threat-badge.high {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kstat {
  background: #12122e;
  border-radius: 0.4rem;
  padding: 0.75rem 1rem;
}
.kstat-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}
.kstat-value {
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: bold;
}

.session-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.session-section {
  background: #12122e;
  border-radius: 0.4rem;
  padding: 1rem 1.25rem;
}

.session-section.full-width {
  grid-column: 1 / -1;
}

.session-section h3 {
  color: #00d9ff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333;
}

/* Hooks */
.hook-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.hook-item {
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.5;
  padding-left: 1rem;
  position: relative;
}
.hook-item::before {
  content: "›";
  position: absolute;
  left: 0;
  color: #00d9ff;
}

/* NPCs */
.npc-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.npc-card {
  background: #1a1a3e;
  border-radius: 0.3rem;
  padding: 0.6rem 0.75rem;
}
.npc-name {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
}
.npc-role {
  color: #00d9ff;
  font-size: 0.8rem;
  margin: 0.15rem 0;
}
.npc-motive {
  color: #888;
  font-size: 0.8rem;
  font-style: italic;
}

/* Locations */
.location-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.location-card {
  background: #1a1a3e;
  border-radius: 0.3rem;
  padding: 0.6rem 0.75rem;
}
.location-name {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}
.location-desc {
  color: #bbb;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* Complications */
.complication-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.complication-item {
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.5;
  padding-left: 1rem;
  position: relative;
}
.complication-item::before {
  content: "!";
  position: absolute;
  left: 0;
  color: #e74c3c;
  font-weight: bold;
}

/* Encounters */
.encounter-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}
.encounter-card {
  background: #1a1a3e;
  border-radius: 0.3rem;
  padding: 0.6rem 0.75rem;
}
.encounter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}
.encounter-type {
  color: #00d9ff;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}
.encounter-difficulty {
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.15rem 0.5rem;
  border-radius: 0.2rem;
}
.encounter-difficulty.low {
  color: #2ecc71;
  background: rgba(46, 204, 113, 0.15);
}
.encounter-difficulty.medium {
  color: #f1c40f;
  background: rgba(241, 196, 15, 0.15);
}
.encounter-difficulty.high {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.15);
}
.encounter-desc {
  color: #bbb;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* GM Notes */
.gm-notes {
  padding-left: 1.25rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gm-notes li {
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.5;
}

@media (max-width: 700px) {
  .session-grid {
    grid-template-columns: 1fr;
  }
  .session-section.full-width {
    grid-column: 1;
  }
}
</style>
