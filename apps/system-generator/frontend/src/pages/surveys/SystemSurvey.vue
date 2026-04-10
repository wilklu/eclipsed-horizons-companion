<template>
  <div class="system-survey-page">
    <SurveyNavigation
      currentClass="System Survey"
      :show-regenerate="false"
      :show-export="false"
      :back-route="backRoute"
    />

    <div class="survey-shell">
      <header class="survey-header">
        <div>
          <h1>System Survey</h1>
          <p class="survey-subtitle">
            {{ systemSummaryLabel }}
          </p>
          <div v-if="savedSystemSummary.hasSavedSystem" class="survey-summary-strip">
            <span class="survey-summary-pill">UWP {{ savedSystemSummary.uwp }}</span>
            <span class="survey-summary-pill">Starport {{ savedSystemSummary.starport }}</span>
            <span v-if="savedSystemSummary.habitability !== '—'" class="survey-summary-pill"
              >Habitability {{ savedSystemSummary.habitability }}</span
            >
            <span v-if="savedSystemSummary.resourceRating !== '—'" class="survey-summary-pill"
              >Resources {{ savedSystemSummary.resourceRating }}</span
            >
            <span
              v-if="savedSystemSummary.secondaryProfiles !== '—'"
              class="survey-summary-pill survey-summary-pill--wide"
            >
              {{ savedSystemSummary.secondaryProfiles }}
            </span>
            <span
              v-else-if="savedSystemSummary.factionsProfile !== '—'"
              class="survey-summary-pill survey-summary-pill--wide"
            >
              {{ savedSystemSummary.factionsProfile }}
            </span>
          </div>
        </div>
      </header>

      <SystemSurveyForm :system-id="resolvedSystemId" :autofill="true" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import SystemSurveyForm from "../../components/forms/SystemSurveyForm.vue";
import { useSystemStore } from "../../stores/systemStore";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";
import { buildSystemSummaryLabel, summarizeSystemRecord } from "../../utils/systemSummary.js";

const props = defineProps({
  galaxyId: {
    type: String,
    default: "",
  },
  sectorId: {
    type: String,
    default: "",
  },
  systemId: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const systemStore = useSystemStore();

const resolvedSystemId = computed(() =>
  String(
    props.systemId || route.query.systemId || route.query.systemRecordId || systemStore.currentSystemId || "",
  ).trim(),
);

const currentSystem = computed(() => {
  if (!resolvedSystemId.value) {
    return systemStore.getCurrentSystem;
  }
  return (
    systemStore.systems.find((system) => String(system?.systemId) === resolvedSystemId.value) ??
    systemStore.getCurrentSystem
  );
});

const savedSystemSummary = computed(() => summarizeSystemRecord(currentSystem.value));

const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }

  if (props.galaxyId) {
    return { name: "StarSystemBuilder", params: { galaxyId: props.galaxyId, sectorId: props.sectorId || undefined } };
  }

  return { name: "TravellerAtlas" };
});

const systemSummaryLabel = computed(() => {
  return buildSystemSummaryLabel({
    system: currentSystem.value,
    fallbackHex: String(route.query.hex || "Unknown Hex"),
    starLabel: String(route.query.star || ""),
  });
});
</script>

<style scoped>
.system-survey-page {
  min-height: 100%;
  background: radial-gradient(circle at top, #11243f, #09101f 60%);
  padding-bottom: 2rem;
}

.survey-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1rem 0;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
  margin-bottom: 0.85rem;
  color: #d9edf9;
}

.survey-header h1 {
  margin: 0;
  font-size: 1.35rem;
}

.survey-subtitle {
  margin: 0.2rem 0 0;
  color: #95b9d0;
}

.survey-summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.survey-summary-pill {
  background: rgba(15, 30, 54, 0.82);
  border: 1px solid rgba(120, 173, 214, 0.22);
  border-radius: 999px;
  color: #d9edf9;
  font-size: 0.82rem;
  line-height: 1.2;
  padding: 0.35rem 0.65rem;
}

.survey-summary-pill--wide {
  max-width: min(100%, 42rem);
}
</style>
