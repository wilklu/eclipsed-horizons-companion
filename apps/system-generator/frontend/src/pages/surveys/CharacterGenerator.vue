<template>
  <div class="character-generator">
    <LoadingSpinner v-bind="characterExportOverlayProps" />
    <SurveyNavigation
      currentClass="Character Generator"
      :show-regenerate="!!character"
      :show-export="!!character"
      :back-route="{ name: 'GalaxySurvey' }"
      @regenerate="generateCharacter"
      @export="exportCharacter"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Character Name:</label>
          <div class="name-row">
            <input v-model="charName" placeholder="Enter name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>Species:</label>
          <select v-model="selectedSpecies" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="s in SPECIES_LIST" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Career Path:</label>
          <select v-model="selectedCareer" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="c in Object.keys(CAREERS)" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateCharacter">⚡ Generate Character</button>
        </div>
      </div>

      <!-- Character Sheet -->
      <div v-if="character" class="char-display">
        <!-- Header -->
        <div class="char-header">
          <div class="char-header-info">
            <h2>{{ character.name }}</h2>
            <p class="char-tagline">{{ character.species }} · {{ character.career }} · Age {{ character.age }}</p>
          </div>
          <div class="upp-block">
            <span class="upp-label">UPP</span>
            <span class="upp-value">{{ character.upp }}</span>
          </div>
        </div>

        <div class="char-grid">
          <!-- Characteristics -->
          <section class="char-section">
            <h3>📊 Characteristics</h3>
            <div class="chars-grid">
              <div v-for="(val, attr) in character.attributes" :key="attr" class="char-item">
                <div class="char-name">{{ attr }}</div>
                <div class="char-val">{{ val }}</div>
                <div class="char-dm" :class="dm(val) > 0 ? 'pos' : dm(val) < 0 ? 'neg' : 'zero'">
                  {{ dm(val) >= 0 ? "+" : "" }}{{ dm(val) }}
                </div>
              </div>
            </div>
          </section>

          <!-- Skills -->
          <section class="char-section">
            <h3>🎯 Skills</h3>
            <div class="skill-list">
              <div v-for="(level, skill) in character.skills" :key="skill" class="skill-row">
                <span class="skill-name">{{ skill }}</span>
                <span class="skill-level">{{ level }}</span>
              </div>
            </div>
          </section>

          <!-- Career History -->
          <section class="char-section">
            <h3>📋 Career History</h3>
            <div class="career-history">
              <div v-for="(entry, i) in character.careerHistory" :key="i" class="career-entry">
                <div class="career-header">
                  <span class="career-name">{{ entry.career }}</span>
                  <span class="career-rank">{{ entry.rank }}</span>
                  <span class="career-terms">{{ entry.terms }} term{{ entry.terms !== 1 ? "s" : "" }}</span>
                </div>
                <ul class="career-events">
                  <li v-for="ev in entry.events" :key="ev">{{ ev }}</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Equipment & Finances -->
          <section class="char-section">
            <h3>💰 Finances & Equipment</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Credits:</span>
                <span class="prop-value">Cr{{ character.credits.toLocaleString() }}</span>
              </div>
            </div>
            <div v-if="character.equipment.length" class="equip-list">
              <div v-for="item in character.equipment" :key="item" class="equip-item">
                {{ item }}
              </div>
            </div>
            <div v-else class="empty-state">No notable equipment.</div>
          </section>

          <!-- Connections -->
          <section
            v-if="character.allies.length || character.contacts.length || character.enemies.length"
            class="char-section"
          >
            <h3>🤝 Connections</h3>
            <div class="prop-list">
              <div v-if="character.allies.length" class="prop-row">
                <span class="prop-label">Allies:</span>
                <span class="prop-value">{{ character.allies.join(", ") }}</span>
              </div>
              <div v-if="character.contacts.length" class="prop-row">
                <span class="prop-label">Contacts:</span>
                <span class="prop-value">{{ character.contacts.join(", ") }}</span>
              </div>
              <div v-if="character.enemies.length" class="prop-row">
                <span class="prop-label">Enemies:</span>
                <span class="prop-value">{{ character.enemies.join(", ") }}</span>
              </div>
            </div>
          </section>

          <!-- Background -->
          <section class="char-section char-section--wide">
            <h3>📜 Background</h3>
            <p class="background-text">{{ character.background }}</p>
          </section>
        </div>
      </div>

      <div v-else class="empty-state-hero">
        <div class="empty-icon">👤</div>
        <p>Configure options above and click <strong>Generate Character</strong> to begin.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoadingSpinner from "../../components/common/LoadingSpinner.vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { useArchiveTransfer } from "../../composables/useArchiveTransfer.js";

const { overlayProps: characterExportOverlayProps, exportJson: exportCharacterArchive } = useArchiveTransfer({
  noun: "Character",
  title: "Character Export In Progress",
  barLabel: "Packaging character archive for transfer",
  statusPrefix: "CHAR",
  targetLabel: () => character.value?.name || "Archive target pending",
});

// ── Constants ──────────────────────────────────────────────────────────────────
const SPECIES_LIST = [
  "Human (Solomani)",
  "Human (Vilani)",
  "Human (Zhodani)",
  "Human (Mixed Heritage)",
  "Aslan",
  "Vargr",
  "Custom Sophont",
];

const CAREERS = {
  Navy: {
    ranks: [
      "Recruit",
      "Able Spacehand",
      "Petty Officer 3rd",
      "Petty Officer 2nd",
      "Chief Petty Officer",
      "Warrant Officer",
    ],
    skills: ["Pilot", "Gunner", "Engineer", "Vacc Suit", "Tactics", "Electronics", "Astrogation"],
    events: [
      "Participated in a major fleet engagement",
      "Served on a deep-space patrol",
      "Cross-trained with allied forces",
      "Commended for exceptional bravery",
      "Survived a catastrophic ship disaster",
      "Led a section through a hostile boarding action",
    ],
  },
  Marines: {
    ranks: ["Marine", "Lance Corporal", "Corporal", "Lance Sergeant", "Sergeant", "Gunnery Sergeant"],
    skills: ["Gun Combat", "Melee", "Athletics", "Recon", "Stealth", "Heavy Weapons", "Explosives"],
    events: [
      "Assaulted an enemy fortification under fire",
      "Survived a contested planetary insertion",
      "Trained a local planetary militia",
      "Served on a boarder-piracy interdiction",
      "Rescued hostages from a hostile faction",
      "Participated in a contested peacekeeping operation",
    ],
  },
  Army: {
    ranks: ["Private", "Lance Corporal", "Corporal", "Lance Sergeant", "Sergeant", "Staff Sergeant"],
    skills: ["Gun Combat", "Melee", "Recon", "Athletics", "Drive", "Heavy Weapons", "Leadership"],
    events: [
      "Fought in a prolonged planetary campaign",
      "Served in a difficult counterinsurgency",
      "Completed advanced jungle-survival training",
      "Led an intelligence-gathering scouting mission",
      "Participated in sensitive peacekeeping duties",
      "Witnessed a significant political event firsthand",
    ],
  },
  Scout: {
    ranks: ["Messenger", "Scout", "Senior Scout", "Scout Specialist", "Master Scout", "Chief Scout"],
    skills: ["Pilot", "Astrogation", "Survival", "Recon", "Mechanic", "Jack-of-all-Trades", "Navigation"],
    events: [
      "Charted an unregistered star system",
      "Made first contact with an isolated pre-spaceflight culture",
      "Discovered a dangerous spatial anomaly",
      "Briefly lost in jumpspace — returned with a strange report",
      "Served as courier on a politically sensitive mission",
      "Mapped a profitable new trade route",
    ],
  },
  Merchant: {
    ranks: ["Trainee", "Cargo Master", "Third Officer", "Second Officer", "First Officer", "Ship Captain"],
    skills: ["Broker", "Persuade", "Pilot", "Steward", "Admin", "Streetwise", "Trade"],
    events: [
      "Negotiated a lucrative speculative trade deal",
      "Survived a pirate ambush with cargo intact",
      "Smuggled restricted goods past a customs inspection",
      "Established a profitable new trade route",
      "Lost a cargo to insolvency — learned a hard lesson",
      "Built a lasting alliance with an influential noble",
    ],
  },
  Rogue: {
    ranks: ["Associate", "Thief", "Enforcer", "Cutpurse", "Operator", "Fixer"],
    skills: ["Streetwise", "Deception", "Stealth", "Recon", "Gun Combat", "Melee", "Persuade"],
    events: [
      "Pulled off a daring high-value heist",
      "Narrowly escaped law enforcement pursuit",
      "Was betrayed by a trusted contact",
      "Served a term in a planetary correctional facility",
      "Formed an alliance with a powerful criminal organisation",
      "Came under the protection of an unusual patron",
    ],
  },
  Scholar: {
    ranks: ["Student", "Researcher", "Fellow", "Senior Researcher", "Lab Director", "Chief Scientist"],
    skills: ["Science", "Medic", "Electronics", "Admin", "Investigate", "Computers", "Language"],
    events: [
      "Published a paper that shifted academic consensus",
      "Made an unexpected groundbreaking discovery",
      "Worked on a classified government research project",
      "Engaged in a productive collaboration with a professional rival",
      "Encountered the aftermath of a dangerous failed experiment",
      "Was awarded a prestigious academic honour",
    ],
  },
  Drifter: {
    ranks: ["Wanderer", "Vagabond", "Traveller", "Wayfarer", "Journeyman", "Road Veteran"],
    skills: ["Survival", "Streetwise", "Melee", "Recon", "Athletics", "Stealth", "Drive"],
    events: [
      "Survived several months on a harsh frontier world",
      "Fell in temporarily with a dangerous criminal gang",
      "Worked passage aboard a tramp freighter",
      "Witnessed a major political upheaval first-hand",
      "Lost everything in a natural or artificial disaster",
      "Stumbled upon an unusual and potentially valuable artefact",
    ],
  },
};

const BACKGROUND_SKILLS = [
  "Admin",
  "Animals",
  "Art",
  "Athletics",
  "Carouse",
  "Drive",
  "Science",
  "Streetwise",
  "Trade",
  "Vacc Suit",
];

const FIRST_NAMES = [
  "Alex",
  "Mira",
  "Tobias",
  "Seren",
  "Cael",
  "Vesper",
  "Rova",
  "Jhen",
  "Marek",
  "Olix",
  "Tavin",
  "Celwyn",
  "Drex",
  "Noli",
  "Quanta",
  "Essa",
  "Kiran",
  "Lev",
  "Asha",
  "Bran",
];
const LAST_NAMES = [
  "Vance",
  "Orin",
  "Tesk",
  "Calloway",
  "Drevin",
  "Holt",
  "Mercer",
  "Stavros",
  "Yuen",
  "Achebe",
  "Narayan",
  "Kowalski",
  "Santos",
  "Diaz",
  "Wren",
  "Okoro",
  "Petrov",
  "Nakamura",
  "Chen",
  "Reyes",
];

const HOMEWORLD_DESCRIPTORS = [
  "a frontier colony world",
  "a bustling starport hub",
  "a remote agricultural planet",
  "a high-tech core world",
  "a war-torn world still in recovery",
  "an isolated asteroid mining colony",
  "a water world with floating platform cities",
];

// ── State ──────────────────────────────────────────────────────────────────────
const charName = ref("");
const selectedSpecies = ref("random");
const selectedCareer = ref("random");
const character = ref(null);

// ── Helpers ────────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function d6(n = 1) {
  let t = 0;
  for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * 6);
  return t;
}

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dm(val) {
  return Math.floor((val - 7) / 3);
}

function toHex(n) {
  if (n < 10) return String(n);
  return String.fromCharCode(55 + n); // A=10, B=11…
}

function randomizeName() {
  charName.value = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

// ── Character Generation ───────────────────────────────────────────────────────
function generateCharacter() {
  // Roll 2D6 for each characteristic
  const attrs = {
    Strength: d6(2),
    Dexterity: d6(2),
    Endurance: d6(2),
    Intelligence: d6(2),
    Education: d6(2),
    "Social Standing": d6(2),
  };

  // Background skills (3 at level 0)
  const skills = {};
  const bgSkills = shuffle(BACKGROUND_SKILLS).slice(0, 3);
  bgSkills.forEach((s) => {
    skills[s] = 0;
  });

  // Pick career
  const careerNames = Object.keys(CAREERS);
  const careerName = selectedCareer.value === "random" ? pick(careerNames) : selectedCareer.value;
  const career = CAREERS[careerName] ?? CAREERS[pick(careerNames)];

  // Serve 1–3 terms
  const terms = 1 + Math.floor(Math.random() * 3);
  const events = [];

  for (let t = 0; t < terms; t++) {
    // Gain 1–2 skills per term
    const gainCount = Math.random() < 0.6 ? 1 : 2;
    shuffle(career.skills)
      .slice(0, gainCount)
      .forEach((s) => {
        skills[s] = (skills[s] ?? -1) + 1;
      });
    events.push(pick(career.events));
  }

  // Aging (after 3 terms)
  const ageRolls = Math.max(0, terms - 3);
  for (let i = 0; i < ageRolls; i++) {
    if (d6(2) - i <= 5) {
      const stat = pick(["Strength", "Dexterity", "Endurance"]);
      attrs[stat] = Math.max(1, attrs[stat] - 1);
    }
  }

  const rankIndex = Math.min(terms, career.ranks.length - 1);

  // Muster-out credits
  const credits = d6(2) * 1000 * Math.max(1, terms - 1);

  // Equipment
  const equipPool = [
    "Laser Pistol",
    "Blade",
    "Cloth Armour",
    "Vacc Suit (TL 10)",
    "Medikit",
    "Comms",
    "Binoculars",
    "Multi-tool",
    "Handgun",
    "Combat Armour",
  ];
  const equipCount = Math.max(0, d6() - 3);
  const equipment = shuffle(equipPool).slice(0, equipCount);

  // Connections
  const contactPool = [
    "a retired Navy captain",
    "a shady merchant broker",
    "a Scout Service contact",
    "a local crime boss",
    "an academic researcher",
    "a planetary noble",
    "a fellow veteran",
    "a black-market armourer",
  ];
  const contacts = shuffle(contactPool).slice(0, Math.max(0, d6() - 3));
  const allies =
    Math.random() < 0.3 ? [pick(["a loyal crewmate", "a powerful patron", "an old friend in high places"])] : [];
  const enemies =
    Math.random() < 0.25 ? [pick(["a vengeful crime lord", "a dishonoured officer", "a rival merchant"])] : [];

  // UPP
  const attrVals = Object.values(attrs);
  const upp = attrVals.map(toHex).join("");

  // Species
  const species = selectedSpecies.value === "random" ? pick(SPECIES_LIST) : selectedSpecies.value;

  const name = charName.value || `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const age = 18 + terms * 4;
  const homeworld = pick(HOMEWORLD_DESCRIPTORS);

  const background = `${name} was born on ${homeworld} and entered service as a ${career.ranks[0]} in the ${careerName}. After ${terms} term${terms !== 1 ? "s" : ""} they mustered out as ${career.ranks[rankIndex]}.`;

  character.value = {
    name,
    species,
    age,
    career: careerName,
    attributes: attrs,
    upp,
    skills,
    careerHistory: [{ career: careerName, rank: career.ranks[rankIndex], terms, events }],
    credits,
    equipment,
    contacts,
    allies,
    enemies,
    background,
  };
}

async function exportCharacter() {
  if (!character.value) return;
  await exportCharacterArchive({
    data: character,
    filename: (characterRecord) => `${characterRecord.name.replace(/\s+/g, "-")}-Character.json`,
    serializeMessage: "Serializing character dossier...",
    encodeMessage: "Encoding character archive for transfer...",
    readyMessage: "Character archive staged for local transfer.",
  });
}
</script>

<style scoped>
.character-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.survey-content {
  padding: 1.25rem;
  flex: 1;
}

/* ── Controls ──────────────────────────────────────────────────── */
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

/* ── Character Sheet ───────────────────────────────────────────── */
.char-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.15rem;
}

.char-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
  gap: 1rem;
}

.char-header h2 {
  color: #00d9ff;
  margin: 0 0 0.3rem;
  font-size: 1.6rem;
}
.char-tagline {
  color: #aaa;
  font-style: italic;
  margin: 0;
  font-size: 0.9rem;
}

.upp-block {
  text-align: right;
}
.upp-label {
  display: block;
  color: #888;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.upp-value {
  font-family: monospace;
  font-size: 1.8rem;
  font-weight: bold;
  color: #00d9ff;
  letter-spacing: 0.12em;
}

/* ── Section Grid ─────────────────────────────────────────────── */
.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.char-section {
  background: #12122e;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.char-section--wide {
  grid-column: 1 / -1;
}

.char-section h3 {
  color: #00ffff;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Characteristics ──────────────────────────────────────────── */
.chars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.char-item {
  background: #0d0d2b;
  border-radius: 0.4rem;
  padding: 0.6rem 0.4rem;
  text-align: center;
}

.char-name {
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 0.2rem;
}
.char-val {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e0e0e0;
}
.char-dm {
  font-size: 0.85rem;
  font-family: monospace;
  font-weight: bold;
  margin-top: 0.15rem;
}
.char-dm.pos {
  color: #6bcf7f;
}
.char-dm.neg {
  color: #ff6b6b;
}
.char-dm.zero {
  color: #888;
}

/* ── Skills ───────────────────────────────────────────────────── */
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #1a1a3a;
  font-size: 0.9rem;
}

.skill-name {
  color: #e0e0e0;
}
.skill-level {
  font-family: monospace;
  font-weight: bold;
  color: #00d9ff;
  min-width: 1.5rem;
  text-align: right;
}

/* ── Career ───────────────────────────────────────────────────── */
.career-entry {
  margin-bottom: 0.75rem;
}

.career-header {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
}

.career-name {
  font-weight: bold;
  color: #00d9ff;
}
.career-rank {
  color: #e0e0e0;
  font-size: 0.9rem;
}
.career-terms {
  color: #888;
  font-size: 0.8rem;
  margin-left: auto;
}

.career-events {
  list-style: disc;
  padding-left: 1.25rem;
  color: #888;
  font-size: 0.85rem;
  margin: 0;
}

.career-events li {
  margin-bottom: 0.2rem;
}

/* ── Equipment ────────────────────────────────────────────────── */
.equip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.equip-item {
  padding: 0.3rem 0.65rem;
  background: rgba(0, 217, 255, 0.08);
  border-left: 3px solid #00d9ff;
  border-radius: 0.2rem;
  color: #e0e0e0;
  font-size: 0.85rem;
}

/* ── Prop list (connections, credits) ─────────────────────────── */
.prop-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.prop-row {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
  padding: 0.3rem 0;
  border-bottom: 1px solid #1a1a3a;
}

.prop-label {
  color: #00ffff;
  min-width: 80px;
  font-weight: bold;
}
.prop-value {
  color: #e0e0e0;
}

/* ── Background ───────────────────────────────────────────────── */
.background-text {
  color: #aaa;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

/* ── Empty states ─────────────────────────────────────────────── */
.empty-state {
  color: #555;
  font-style: italic;
  padding: 0.3rem 0;
  font-size: 0.85rem;
}

.empty-state-hero {
  text-align: center;
  padding: 4rem 2rem;
  color: #555;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
</style>
