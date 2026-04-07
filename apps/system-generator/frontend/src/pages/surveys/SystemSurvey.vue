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
  const system = currentSystem.value;
  const fallbackHex = String(route.query.hex || "Unknown Hex");
  const systemName = String(system?.systemDesignation || system?.mainworldName || system?.systemId || fallbackHex);
  const starLabel = String(
    route.query.star || system?.primaryStar?.designation || system?.stars?.[0]?.designation || "Unknown primary",
  );
  return `${systemName} · ${starLabel}`;
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
</style>
