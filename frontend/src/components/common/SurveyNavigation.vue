<template>
  <div class="survey-navigation">
    <div class="nav-header">
      <span class="survey-class" :class="`class-${currentClass}`">
        {{ surveyTitle }}
      </span>
      <span class="survey-id" v-if="systemId">
        System: {{ systemId }}
        <span v-if="planetId" class="planet-id">→ {{ planetId }}</span>
      </span>
    </div>

    <div class="nav-controls">
      <!-- Previous Survey Button -->
      <button v-if="showPrevious" @click="goToPrevious" class="btn btn-secondary nav-btn">
        ← Back: {{ previousSurveyName }}
      </button>

      <!-- Next Survey Button -->
      <button v-if="showNext" @click="goToNext" class="btn btn-primary nav-btn">Next: {{ nextSurveyName }} →</button>

      <!-- Jump to Specific Survey -->
      <div v-if="showJumpOptions" class="jump-menu">
        <span class="label">Jump to:</span>
        <button
          v-for="survey in jumpOptions"
          :key="survey.name"
          @click="jumpToSurvey(survey)"
          :class="`btn btn-jump ${survey.name === currentSurvey ? 'active' : ''}`"
        >
          {{ survey.label }}
        </button>
      </div>

      <!-- Regenerate Current -->
      <button @click="regenerateCurrent" class="btn btn-info nav-btn">🔄 Regenerate Current</button>

      <!-- Export Current -->
      <button @click="exportCurrent" class="btn btn-export nav-btn">📥 Export Data</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const props = defineProps({
  currentClass: {
    type: Number,
    required: true, // 0, 1, 2, 3, 4
  },
  systemId: String,
  planetId: String,
});

const emit = defineEmits(["regenerate", "export"]);

const surveyMap = {
  0: { name: "SectorSurvey", label: "Class 0 - Sector Survey" },
  1: { name: "StellarSurvey", label: "Class I - Stellar Survey" },
  2: { name: "SystemSurvey", label: "Class II - System Survey" },
  2.5: { name: "PlanetoidSurvey", label: "Class II - Planetoid Survey" },
  3: { name: "PhysicalSurvey", label: "Class III - Physical Survey" },
  4: { name: "CensusSurvey", label: "Class IV - Census Survey" },
};

const surveyTitle = computed(() => surveyMap[props.currentClass]?.label);

const showPrevious = computed(() => props.currentClass > 0);
const showNext = computed(() => props.currentClass < 4);

const previousSurveyName = computed(() => {
  const prevClass = props.currentClass - 1;
  return surveyMap[prevClass]?.label || "";
});

const nextSurveyName = computed(() => {
  const nextClass = props.currentClass + 1;
  return surveyMap[nextClass]?.label || "";
});

const showJumpOptions = computed(() => props.currentClass >= 1);

const jumpOptions = computed(() => {
  const current = props.currentClass;
  return Object.entries(surveyMap)
    .filter(([classNum]) => classNum <= current)
    .map(([, survey]) => survey);
});

const currentSurvey = computed(() => surveyMap[props.currentClass]?.name);

const goToPrevious = () => {
  const prevClass = props.currentClass - 1;
  const prevSurvey = surveyMap[prevClass];

  if (props.currentClass === 2 && route.name === "PlanetoidSurvey") {
    // Going back from planetoid to system
    router.push({
      name: "SystemSurvey",
      params: { systemId: props.systemId },
    });
  } else {
    navigateToSurvey(prevSurvey.name);
  }
};

const goToNext = () => {
  const nextClass = props.currentClass + 1;
  const nextSurvey = surveyMap[nextClass];
  navigateToSurvey(nextSurvey.name);
};

const jumpToSurvey = (survey) => {
  navigateToSurvey(survey.name);
};

const navigateToSurvey = (surveyName) => {
  const params = {};
  if (props.systemId) params.systemId = props.systemId;
  if (props.planetId) params.planetId = props.planetId;

  router.push({
    name: surveyName,
    params,
  });
};

const regenerateCurrent = () => {
  emit("regenerate");
};

const exportCurrent = () => {
  emit("export");
};
</script>

<style scoped>
.survey-navigation {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #00d9ff;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.survey-class {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d9ff;
}

.survey-class.class-0 {
  color: #00d9ff;
}
.survey-class.class-1 {
  color: #00ffff;
}
.survey-class.class-2 {
  color: #00ff88;
}
.survey-class.class-3 {
  color: #ffaa00;
}
.survey-class.class-4 {
  color: #ff4444;
}

.survey-id {
  font-family: monospace;
  color: #aaa;
  font-size: 0.9rem;
}

.planet-id {
  color: #00ff88;
  font-weight: bold;
}

.nav-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.nav-btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.btn-primary {
  background-color: #00d9ff;
  color: #000;
}

.btn-primary:hover {
  background-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
}

.btn-secondary {
  background-color: #666;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #888;
}

.btn-info {
  background-color: #0066cc;
  color: #fff;
}

.btn-info:hover {
  background-color: #0088ff;
}

.btn-export {
  background-color: #00aa00;
  color: #fff;
}

.btn-export:hover {
  background-color: #00dd00;
}

.jump-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.label {
  color: #aaa;
  font-weight: bold;
  margin-right: 0.5rem;
}

.btn-jump {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  background-color: #333;
  color: #00d9ff;
  border: 1px solid #00d9ff;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-jump:hover {
  background-color: #00d9ff;
  color: #000;
}

.btn-jump.active {
  background-color: #00d9ff;
  color: #000;
  font-weight: bold;
}
</style>
