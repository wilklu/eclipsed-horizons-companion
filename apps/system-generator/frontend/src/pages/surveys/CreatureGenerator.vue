<template>
  <div class="creature-generator">
    <SurveyNavigation
      currentClass="Creature Generator"
      :show-regenerate="!!creature"
      :show-export="!!creature"
      :back-route="{ name: 'GalaxySurvey' }"
      @regenerate="generateCreature"
      @export="exportCreature"
    />

    <div class="survey-content">
      <!-- Controls -->
      <div class="control-panel">
        <div class="control-group">
          <label>Creature Name:</label>
          <div class="name-row">
            <input v-model="creatureName" placeholder="Enter creature name…" class="text-input" />
            <button class="btn btn-secondary" @click="randomizeName">🎲</button>
          </div>
        </div>
        <div class="control-group">
          <label>Ecological Role:</label>
          <select v-model="ecologicalRole" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="role in ECO_ROLES" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>Habitat:</label>
          <select v-model="habitat" class="select-input">
            <option value="random">🎲 Random</option>
            <option v-for="h in HABITATS" :key="h" :value="h">{{ h }}</option>
          </select>
        </div>
        <div class="control-group control-action">
          <button class="btn btn-primary" @click="generateCreature">⚡ Generate Creature</button>
        </div>
      </div>

      <!-- Creature Display -->
      <div v-if="creature" class="creature-display">
        <div class="creature-header">
          <div class="creature-icon">{{ creature.icon }}</div>
          <div>
            <h2>{{ creature.name }}</h2>
            <div class="creature-tags">
              <span class="tag">{{ creature.ecologicalRole }}</span>
              <span class="tag">{{ creature.habitat }}</span>
              <span class="tag">{{ creature.size }}</span>
            </div>
          </div>
        </div>

        <div class="creature-grid">
          <!-- Physical Description -->
          <section class="creature-section">
            <h3>🦴 Physical Characteristics</h3>
            <div class="prop-list">
              <div class="prop-row" v-for="(v, k) in creature.physical" :key="k">
                <span class="prop-label">{{ k }}:</span>
                <span class="prop-value">{{ v }}</span>
              </div>
            </div>
          </section>

          <!-- Combat Stats -->
          <section class="creature-section">
            <h3>⚔️ Combat Profile</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Hits</div>
                <div class="stat-value">{{ creature.combat.hits }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Armour</div>
                <div class="stat-value">{{ creature.combat.armour }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Speed</div>
                <div class="stat-value">{{ creature.combat.speed }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Attack</div>
                <div class="stat-value">{{ creature.combat.attack }}</div>
              </div>
            </div>
            <div class="prop-list" style="margin-top: 1rem">
              <div class="prop-row">
                <span class="prop-label">Weapons:</span>
                <span class="prop-value">{{ creature.combat.weapons.join(", ") }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Behaviour:</span>
                <span class="prop-value">{{ creature.combat.behaviour }}</span>
              </div>
            </div>
          </section>

          <!-- Traits & Abilities -->
          <section class="creature-section">
            <h3>✨ Traits & Abilities</h3>
            <div class="trait-list">
              <div v-for="trait in creature.traits" :key="trait" class="trait-item">{{ trait }}</div>
            </div>
            <div v-if="!creature.traits.length" class="empty-state">No special traits.</div>
          </section>

          <!-- Ecological Notes -->
          <section class="creature-section">
            <h3>🌿 Ecological Notes</h3>
            <div class="prop-list">
              <div class="prop-row">
                <span class="prop-label">Diet:</span>
                <span class="prop-value">{{ creature.ecology.diet }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Reproduction:</span>
                <span class="prop-value">{{ creature.ecology.reproduction }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Social:</span>
                <span class="prop-value">{{ creature.ecology.social }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Activity Cycle:</span>
                <span class="prop-value">{{ creature.ecology.activityCycle }}</span>
              </div>
              <div class="prop-row">
                <span class="prop-label">Lifespan:</span>
                <span class="prop-value">{{ creature.ecology.lifespan }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";

const ECO_ROLES = ["Herbivore", "Omnivore", "Carnivore", "Scavenger", "Parasite", "Filter Feeder", "Apex Predator", "Decomposer"];
const HABITATS = ["Forest", "Desert", "Ocean", "Arctic", "Jungle", "Mountain", "Underground", "Swamp", "Grassland", "Sky"];
const SIZES = ["Tiny (< 1 kg)", "Small (1–10 kg)", "Medium (10–100 kg)", "Large (100 kg–1 t)", "Huge (1–10 t)", "Massive (> 10 t)"];
const ICONS = ["🦎", "🐉", "🕷️", "🦂", "🐙", "🦈", "🦅", "🐻", "🦁", "🐊", "🦕", "🦟"];
const WEAPONS = ["Claws", "Teeth/Bite", "Sting/Venom", "Horns", "Tentacles", "Acid Spray", "Constriction", "Shell/Ram"];
const BEHAVIOURS = ["Territorial", "Pack Hunter", "Ambush Predator", "Flee on contact", "Aggressive", "Curious", "Docile"];
const TRAITS_POOL = [
  "Natural Armour +2", "Venomous bite (1D+2)", "Camouflage (natural)",
  "Bioluminescent", "Amphibious", "Echolocation", "Psi-sensitive",
  "Regeneration (1D/round)", "Armoured shell (+4)", "Flight",
  "Hive mind (swarm)", "Electromagnetic pulse (1/day)", "Acid blood",
];
const DIETS = ["Grass/Vegetation", "Fruits & Seeds", "Small prey", "Large prey", "Carrion", "Blood/Parasitic", "Minerals", "Microorganisms"];
const REPRODUCTIONS = ["Oviparous (eggs)", "Live birth (small litter)", "Live birth (single)", "Budding", "Sporulation"];
const SOCIALS = ["Solitary", "Mated pairs", "Small family groups", "Packs (3–12)", "Large herds", "Swarm colonies"];
const ACTIVITY = ["Diurnal", "Nocturnal", "Crepuscular", "Continuous"];
const NAME_PARTS1 = ["Vel", "Krax", "Shar", "Dun", "Mrak", "Oth", "Yss", "Cor"];
const NAME_PARTS2 = ["ath", "rak", "ith", "orn", "alis", "yx", "oth", "eus"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function d6(n = 1) { let t = 0; for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * 6); return t; }

const creatureName = ref("");
const ecologicalRole = ref("random");
const habitat = ref("random");
const creature = ref(null);

function randomizeName() {
  creatureName.value = pick(NAME_PARTS1) + pick(NAME_PARTS2);
}

function generateCreature() {
  const role = ecologicalRole.value === "random" ? pick(ECO_ROLES) : ecologicalRole.value;
  const hab = habitat.value === "random" ? pick(HABITATS) : habitat.value;
  const size = pick(SIZES);
  const sizeIdx = SIZES.indexOf(size);

  const hits = (sizeIdx + 1) * d6(2);
  const armour = Math.max(0, sizeIdx - 1 + Math.floor(Math.random() * 4));
  const speed = Math.max(3, 12 - sizeIdx + Math.floor(Math.random() * 4));
  const attackDice = Math.max(1, sizeIdx);
  const weapons = [pick(WEAPONS)];
  if (Math.random() < 0.4) weapons.push(pick(WEAPONS.filter((w) => w !== weapons[0])));

  const traitPool = [...TRAITS_POOL].sort(() => Math.random() - 0.5);
  const traits = Math.random() < 0.4 ? traitPool.slice(0, 1 + Math.floor(Math.random() * 3)) : [];

  creature.value = {
    name: creatureName.value || pick(NAME_PARTS1) + pick(NAME_PARTS2),
    icon: pick(ICONS),
    ecologicalRole: role,
    habitat: hab,
    size,
    physical: {
      "Body Plan": pick(["Bilateral", "Radial", "Asymmetric", "Segmented"]),
      Locomotion: pick(["Quadruped", "Biped", "Crawler", "Swimmer", "Flier", "Sessile"]),
      "External Features": pick(["Scales", "Fur/Hair", "Chitin", "Feathers", "Smooth skin", "Bony plates"]),
      Colour: pick(["Dull earth tones", "Vibrant warning colours", "Iridescent", "Transparent", "Camouflage pattern"]),
    },
    combat: {
      hits,
      armour,
      speed: `${speed}m`,
      attack: `${attackDice}D6`,
      weapons,
      behaviour: pick(BEHAVIOURS),
    },
    traits,
    ecology: {
      diet: pick(DIETS),
      reproduction: pick(REPRODUCTIONS),
      social: pick(SOCIALS),
      activityCycle: pick(ACTIVITY),
      lifespan: `${5 + (sizeIdx + 1) * 5 + Math.floor(Math.random() * 20)} years`,
    },
  };
}

function exportCreature() {
  if (!creature.value) return;
  const blob = new Blob([JSON.stringify(creature.value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${creature.value.name.replace(/\s+/g, "-")}-Creature.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.creature-generator {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.survey-content { padding: 2rem; flex: 1; }

.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #1a1a1a;
  border-radius: 0.5rem;
}

.control-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 200px; }
.control-group label { color: #00ffff; font-weight: bold; font-size: 0.9rem; }
.control-action { justify-content: flex-end; }
.name-row { display: flex; gap: 0.5rem; }
.name-row .text-input { flex: 1; }

.select-input,
.text-input {
  padding: 0.6rem 0.75rem;
  background: #2a2a3e;
  border: 1px solid #00d9ff;
  color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.btn { padding: 0.6rem 1.25rem; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: bold; font-size: 0.9rem; transition: all 0.2s; }
.btn-primary { background: #00d9ff; color: #000; }
.btn-primary:hover { background: #00ffff; box-shadow: 0 0 12px rgba(0, 217, 255, 0.4); }
.btn-secondary { background: #444; color: #e0e0e0; }
.btn-secondary:hover { background: #555; }

.creature-display {
  background: #1a1a2e;
  border: 2px solid #00d9ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.creature-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.creature-icon { font-size: 3rem; }
.creature-header h2 { color: #00d9ff; margin: 0 0 0.5rem; }

.creature-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag {
  background: rgba(0, 217, 255, 0.12);
  color: #00d9ff;
  border: 1px solid #00d9ff44;
  padding: 0.2rem 0.6rem;
  border-radius: 0.2rem;
  font-size: 0.8rem;
}

.creature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.creature-section { background: #12122e; border-radius: 0.5rem; padding: 1.25rem; }
.creature-section h3 { color: #00ffff; margin-bottom: 1rem; }

.prop-list { display: flex; flex-direction: column; gap: 0.4rem; }
.prop-row { display: flex; gap: 0.75rem; font-size: 0.9rem; padding: 0.3rem 0; border-bottom: 1px solid #1a1a3a; }
.prop-label { color: #00ffff; min-width: 130px; font-weight: bold; }
.prop-value { color: #e0e0e0; font-family: monospace; }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.stat-box { background: #0d0d2b; border-radius: 0.4rem; padding: 0.6rem; text-align: center; }
.stat-label { font-size: 0.7rem; color: #888; text-transform: uppercase; margin-bottom: 0.3rem; }
.stat-value { font-size: 1.2rem; font-weight: bold; color: #ffd700; font-family: monospace; }

.trait-list { display: flex; flex-direction: column; gap: 0.4rem; }
.trait-item { padding: 0.4rem 0.75rem; background: rgba(0, 217, 255, 0.08); border-left: 3px solid #00d9ff44; border-radius: 0.2rem; color: #e0e0e0; font-size: 0.9rem; }

.empty-state { color: #555; font-style: italic; padding: 0.3rem 0; }
</style>
