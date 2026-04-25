<template>
  <div class="gas-giant-physical-survey-page">
    <SurveyNavigation
      currentClass="Gas Giant Physical Survey"
      :show-regenerate="false"
      :show-export="false"
      :back-route="backRoute"
    />

    <div class="survey-shell">
      <header class="survey-header">
        <div>
          <h1>Gas Giant Physical Survey</h1>
          <p class="survey-subtitle">{{ worldSummaryLabel }}</p>
        </div>
      </header>

      <GasGiantPhysicalSurveyForm
        :system-record="currentSystem"
        :world-record="currentWorld"
        :system-id="resolvedSystemId"
        :world-index="resolvedWorldIndex"
        :autofill="true"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import GasGiantPhysicalSurveyForm from "../../components/forms/GasGiantPhysicalSurveyForm.vue";
import { useSystemStore } from "../../stores/systemStore.js";
import { deserializeReturnRoute } from "../../utils/returnRoute.js";

const props = defineProps({
  systemId: {
    type: String,
    default: "",
  },
  worldIndex: {
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

const resolvedWorldIndex = computed(() => String(props.worldIndex || route.query.worldIndex || "").trim());

const currentSystem = computed(() => {
  if (!resolvedSystemId.value) {
    return systemStore.getCurrentSystem;
  }
  return (
    systemStore.systems.find((system) => String(system?.systemId) === resolvedSystemId.value) ??
    systemStore.getCurrentSystem
  );
});

const currentWorld = computed(() => {
  const index = Number.parseInt(resolvedWorldIndex.value, 10);
  if (!Number.isInteger(index) || index < 0) {
    return null;
  }
  return Array.isArray(currentSystem.value?.planets) ? (currentSystem.value.planets[index] ?? null) : null;
});

const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) {
    return explicitReturnRoute;
  }

  return {
    name: "WorldBuilder",
    params: { systemId: props.systemId || undefined },
    query: { ...route.query },
  };
});

const worldSummaryLabel = computed(() => {
  const worldName = String(currentWorld.value?.name || route.query.worldName || "Unknown Gas Giant");
  const worldType = String(currentWorld.value?.type || route.query.worldType || "Gas Giant");
  const orbitLabel = currentWorld.value?.orbitAU ?? route.query.orbitAU ?? "";
  return [worldName, worldType, orbitLabel ? `${orbitLabel} AU` : ""].filter(Boolean).join(" · ");
});
</script>

<style scoped>
.gas-giant-physical-survey-page {
  min-height: 100%;
  background: radial-gradient(circle at top, #1f2748, #0a1020 60%);
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
  color: #e2ebff;
}

.survey-header h1 {
  margin: 0;
  font-size: 1.35rem;
}

.survey-subtitle {
  margin: 0.2rem 0 0;
  color: #b7c6f0;
}
</style>
