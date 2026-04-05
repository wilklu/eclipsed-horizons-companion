<template>
  <div class="history-generator">
    <SurveyNavigation
      currentClass="Procedural History Generator"
      :show-regenerate="!!history"
      :show-export="!!history"
      :back-route="{ name: 'GalaxySurvey' }"
      @regenerate="generateHistory"
      @export="exportHistory"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Civilization Name:</label>
          <div class="name-row">
            <input v-model="civName" placeholder="Enter civilization name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>History Length:</label>
          <select v-model="historyLength" class="select-input">
            <option value="short">Short (5 events)</option>
            <option value="medium">Medium (10 events)</option>
            <option value="long">Long (20 events)</option>
          </select>
        </div>
        <div class="control-group">
          <label>Era Start (years ago):</label>
          <input v-model.number="eraStart" type="number" min="100" max="100000" step="100" class="text-input" />
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateHistory">⚡ Generate History</button>
        </div>
      </div>

      <!-- History Timeline -->
      <div v-if="history" class="history-display">
        <div class="history-header">
          <h2>{{ history.civilizationName }}</h2>
          <div class="history-meta">
            <span class="meta-badge">{{ history.events.length }} recorded events</span>
            <span class="meta-badge">Span: {{ formatSpan(history.events) }}</span>
          </div>
        </div>

        <!-- Key Stats -->
        <div class="key-stats">
          <div class="kstat" v-for="(v, k) in history.overview" :key="k">
            <div class="kstat-label">{{ k }}</div>
            <div class="kstat-value">{{ v }}</div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div
            v-for="(event, i) in history.events"
            :key="i"
            class="timeline-event"
            :class="event.category.toLowerCase().replace(/\s+/g, '-')"
          >
            <div class="event-year">{{ formatYear(event.year) }}</div>
            <div class="event-connector">
              <div class="connector-dot"></div>
              <div class="connector-line"></div>
            </div>
            <div class="event-content">
              <div class="event-category">{{ event.category }}</div>
              <div class="event-title">{{ event.title }}</div>
              <div class="event-description">{{ event.description }}</div>
              <div v-if="event.consequence" class="event-consequence">➜ {{ event.consequence }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";

// ── Lookup tables ─────────────────────────────────────────────────────────────
const EVENT_CATEGORIES = [
  "Political",
  "Military",
  "Economic",
  "Technological",
  "Cultural",
  "Natural Disaster",
  "First Contact",
  "Exploration",
  "Religious",
  "Collapse",
];

const EVENT_TEMPLATES = {
  Political: [
    {
      title: "Formation of the {gov}",
      description: "A new {gov} was established, uniting the fractured {region} under a central authority.",
      consequence: "Population increased by 15% over the next century.",
    },
    {
      title: "The Great Schism",
      description: "The ruling council split into two factions following a dispute over {resource} rights.",
      consequence: "Two rival states emerged, shaping the political landscape for generations.",
    },
    {
      title: "Bloodless Revolution",
      description: "The ruling class was peacefully deposed following widespread civil unrest.",
      consequence: "A new democratic charter was ratified.",
    },
  ],
  Military: [
    {
      title: "The {war} War",
      description: "A prolonged conflict erupted over territorial disputes in the {region}.",
      consequence: "Borders were redrawn and a generation was lost.",
    },
    {
      title: "Invasion from the {region}",
      description: "Foreign forces crossed into home territory, triggering a decade-long war.",
      consequence: "Military doctrine was fundamentally reformed.",
    },
    {
      title: "The Battle of {location}",
      description: "A decisive engagement that turned the tide of the ongoing conflict.",
      consequence: "The defeated faction sought peace terms.",
    },
  ],
  Economic: [
    {
      title: "The {resource} Trade Collapse",
      description: "A sudden scarcity of {resource} caused economic disruption across the sector.",
      consequence: "New trade routes were established to compensate.",
    },
    {
      title: "First Interstellar Market",
      description: "Formal trade agreements were established with a neighbouring system.",
      consequence: "Technological exchange accelerated development.",
    },
    {
      title: "The Age of Prosperity",
      description: "A century of surplus and stable governance brought unprecedented wealth.",
      consequence: "Population and technology flourished.",
    },
  ],
  Technological: [
    {
      title: "Jump Drive Breakthrough",
      description: "Engineers achieved the first stable jump point, opening interstellar travel.",
      consequence: "Colonisation of nearby systems began within a decade.",
    },
    {
      title: "Fusion Power Era",
      description: "Widespread adoption of fusion reactors ended reliance on fossil fuels.",
      consequence: "Industrial output tripled within fifty years.",
    },
    {
      title: "Synthetic Intelligence Emergence",
      description: "The first true AI was brought online, accelerating research in all fields.",
      consequence: "Society debated the legal status of synthetic minds.",
    },
  ],
  Cultural: [
    {
      title: "The Renaissance of {art}",
      description: "A flowering of {art} spread across the civilisation, defining a new cultural identity.",
      consequence: "National pride and unity strengthened.",
    },
    {
      title: "The Great Migration",
      description: "Millions relocated to newly established colonies seeking opportunity.",
      consequence: "Cultural exchange enriched both origin and destination worlds.",
    },
    {
      title: "The Philosophical Age",
      description: "New schools of thought challenged long-held beliefs about existence and purpose.",
      consequence: "Educational institutions expanded dramatically.",
    },
  ],
  "Natural Disaster": [
    {
      title: "The Long Winter",
      description: "A catastrophic volcanic event blanketed skies for decades, causing widespread famine.",
      consequence: "Population dropped by a third before recovery began.",
    },
    {
      title: "Plague of the {region}",
      description: "A lethal disease swept across the population, killing millions.",
      consequence: "Medical science advanced rapidly in response.",
    },
    {
      title: "The Great Quake",
      description: "Tectonic upheaval destroyed major population centres.",
      consequence: "Reconstruction efforts reshaped urban planning for centuries.",
    },
  ],
  "First Contact": [
    {
      title: "Signals from the Dark",
      description: "Unexplained transmissions were detected from a distant system.",
      consequence: "An expedition was dispatched to investigate.",
    },
    {
      title: "The Arrival",
      description: "An alien vessel entered the system, initiating first contact protocols.",
      consequence: "Diplomatic relations were cautiously established.",
    },
    {
      title: "The Traders from Beyond",
      description: "Merchants from a distant civilisation arrived offering technology in exchange for resources.",
      consequence: "A rapid exchange of knowledge began.",
    },
  ],
  Exploration: [
    {
      title: "Charting the {region}",
      description: "Systematic surveys of the surrounding sectors revealed dozens of habitable worlds.",
      consequence: "Colonisation efforts were prioritised.",
    },
    {
      title: "The Lost Expedition Returns",
      description: "A survey fleet missing for thirty years returned with records of a rich stellar cluster.",
      consequence: "A new wave of exploration began.",
    },
    {
      title: "Discovery of the Ancient Ruins",
      description: "Explorers uncovered the remains of a pre-spacefaring civilisation on a nearby moon.",
      consequence: "Archaeological study became a major industry.",
    },
  ],
  Religious: [
    {
      title: "The Prophet of {region}",
      description: "A charismatic leader founded a new faith that spread across the civilisation.",
      consequence: "Political and religious institutions became intertwined.",
    },
    {
      title: "The Holy War",
      description: "Theological differences sparked armed conflict between major factions.",
      consequence: "The victorious sect gained political dominance.",
    },
    {
      title: "The Reformation",
      description: "A major religious institution was challenged and reformed.",
      consequence: "Secularism grew in influence.",
    },
  ],
  Collapse: [
    {
      title: "The Dark Age Begins",
      description: "Central authority collapsed, fragmenting the civilisation into isolated city-states.",
      consequence: "Technology regressed over generations.",
    },
    {
      title: "The Betrayal of {gov}",
      description: "The ruling faction was overthrown in a violent coup, destabilising the state.",
      consequence: "A period of civil war and chaos followed.",
    },
    {
      title: "Economic Implosion",
      description: "The currency failed and trade networks collapsed simultaneously.",
      consequence: "Barter economies emerged in the aftermath.",
    },
  ],
};

const REGIONS = ["Northern Reaches", "Iron Coast", "Sunken Lands", "High Plateau", "Deep Rift", "Outer Arc"];
const GOVS = ["Republic", "Empire", "Confederation", "Theocracy", "Consortium", "Directorate"];
const RESOURCES = ["rare metals", "antimatter fuel", "bio-compounds", "water ice", "dark matter", "jump crystals"];
const ARTS = ["sculpture", "literature", "music", "architecture", "digital art", "oral tradition"];
const LOCATIONS = ["Iron Gate", "Starfall", "The Narrows", "Ember Ridge", "Crystal Lake", "Red Plains"];
const WARS = ["Iron", "Star", "Silent", "Long", "Red Dawn", "Fractured Sky"];

const CIV_PREFIXES = ["Vel", "Kra", "Shal", "Dun", "Mrak", "Oth", "Ix", "Cor"];
const CIV_SUFFIXES = ["athi Empire", "an Compact", "ite Confederation", "ori League", "ak Dominion"];

// ── State ─────────────────────────────────────────────────────────────────────
const civName = ref("");
const historyLength = ref("medium");
const eraStart = ref(5000);
const history = ref(null);

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(str) {
  return str
    .replace(/{region}/g, pick(REGIONS))
    .replace(/{gov}/g, pick(GOVS))
    .replace(/{resource}/g, pick(RESOURCES))
    .replace(/{art}/g, pick(ARTS))
    .replace(/{location}/g, pick(LOCATIONS))
    .replace(/{war}/g, pick(WARS));
}

function buildEvent(year) {
  const cat = pick(EVENT_CATEGORIES);
  const templates = EVENT_TEMPLATES[cat] ?? EVENT_TEMPLATES["Political"];
  const tpl = pick(templates);
  return {
    year,
    category: cat,
    title: fillTemplate(tpl.title),
    description: fillTemplate(tpl.description),
    consequence: tpl.consequence ? fillTemplate(tpl.consequence) : null,
  };
}

function formatYear(year) {
  if (year < 0) return `${Math.abs(year)} years ago`;
  return `Year ${year}`;
}

function formatSpan(events) {
  if (!events.length) return "—";
  const years = events.map((e) => e.year);
  const span = Math.max(...years) - Math.min(...years);
  if (span > 1000) return `${(span / 1000).toFixed(1)}k years`;
  return `${span} years`;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function randomizeName() {
  civName.value = pick(CIV_PREFIXES) + pick(CIV_SUFFIXES);
}

function generateHistory() {
  const count = historyLength.value === "short" ? 5 : historyLength.value === "long" ? 20 : 10;
  const start = eraStart.value;
  const interval = Math.max(50, Math.floor(start / count));

  const events = [];
  let year = -start;
  for (let i = 0; i < count; i++) {
    events.push(buildEvent(year));
    year += interval + Math.floor(Math.random() * interval * 0.5);
  }

  history.value = {
    civilizationName: civName.value || pick(CIV_PREFIXES) + pick(CIV_SUFFIXES),
    overview: {
      Founded: `${start.toLocaleString()} years ago`,
      "Current Status": pick(["Thriving", "Declining", "Fragmented", "Ascendant", "Collapsed (historical)"]),
      "Dominant Culture": pick(["Militarist", "Mercantile", "Scientific", "Artistic", "Religious", "Expansionist"]),
      "Stellar Reach": pick(["Single System", "2–5 Systems", "Subsector", "Sector-wide", "Multi-sector"]),
      "Notable Achievement": pick([
        "First jump drive development",
        "Peaceful first contact with 3 species",
        "Largest known megastructure",
        "Oldest democracy in the sector",
        "Premier medical research",
        "Longest-standing interstellar trade network",
      ]),
    },
    events,
  };
}

function exportHistory() {
  if (!history.value) return;
  const blob = new Blob([JSON.stringify(history.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${history.value.civilizationName.replace(/\s+/g, "-")}-History.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.history-generator {
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

.history-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
}

.history-header h2 {
  color: #00d9ff;
  margin: 0;
}
.history-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.meta-badge {
  background: rgba(0, 217, 255, 0.12);
  color: #00ffff;
  padding: 0.3rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}

.key-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-event {
  display: grid;
  grid-template-columns: 110px 24px 1fr;
  gap: 0 1rem;
  align-items: start;
  min-height: 60px;
}

.event-year {
  text-align: right;
  padding-top: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
}

.event-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00d9ff;
  border: 2px solid #0a0a1a;
  flex-shrink: 0;
  margin-top: 5px;
}

.connector-line {
  flex: 1;
  width: 2px;
  background: #333;
  margin-top: 2px;
}

.timeline-event:last-child .connector-line {
  display: none;
}

.event-content {
  padding-bottom: 1.5rem;
}

.event-category {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-bottom: 0.2rem;
}

.event-title {
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 0.35rem;
}

.event-description {
  color: #bbb;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 0.4rem;
}

.event-consequence {
  color: #00d9ff;
  font-size: 0.8rem;
  font-style: italic;
}

/* Category accent colours on the dot */
.timeline-event.political .connector-dot {
  background: #9b59b6;
}
.timeline-event.military .connector-dot {
  background: #e74c3c;
}
.timeline-event.economic .connector-dot {
  background: #f1c40f;
}
.timeline-event.technological .connector-dot {
  background: #00d9ff;
}
.timeline-event.cultural .connector-dot {
  background: #1abc9c;
}
.timeline-event.natural-disaster .connector-dot {
  background: #e67e22;
}
.timeline-event.first-contact .connector-dot {
  background: #8e44ad;
}
.timeline-event.exploration .connector-dot {
  background: #2ecc71;
}
.timeline-event.religious .connector-dot {
  background: #d4ac0d;
}
.timeline-event.collapse .connector-dot {
  background: #7f8c8d;
}
</style>
