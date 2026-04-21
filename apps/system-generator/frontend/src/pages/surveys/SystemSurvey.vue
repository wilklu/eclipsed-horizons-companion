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
              v-for="signal in savedSystemSummary.linkedEcologySignals || []"
              :key="`${signal.kind}-${signal.scientificName}`"
              class="survey-summary-pill survey-summary-pill--wide"
            >
              {{ signal.icon }} {{ signal.scientificName }}
            </span>
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
        <div class="survey-header-actions">
          <button class="survey-action-btn" type="button" @click="openCreatureGenerator">🐾 Fauna Generator</button>
          <button class="survey-action-btn" type="button" @click="openFloraGenerator">🌱 Flora Generator</button>
          <button class="survey-action-btn" type="button" @click="openSophontGenerator">🧬 Sophont Generator</button>
        </div>
      </header>

      <SystemSurveyForm :system-record="currentSystem" :system-id="resolvedSystemId" :autofill="true" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import SystemSurveyForm from "../../components/forms/SystemSurveyForm.vue";
import { useSystemStore } from "../../stores/systemStore";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";
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
const router = useRouter();
const systemStore = useSystemStore();

const resolvedSystemId = computed(() =>
  String(
    props.systemId || route.query.systemId || route.query.systemRecordId || systemStore.currentSystemId || "",
  ).trim(),
);

function parseHexCoordinates(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/\D/g, "");
  if (!/^\d{4}$/.test(normalized)) {
    return null;
  }

  return {
    x: Number(normalized.slice(0, 2)),
    y: Number(normalized.slice(2, 4)),
  };
}

function buildSectorHexLabel({ sectorName = "", sectorId = "", hex = "", existing = "" } = {}) {
  const explicit = String(existing || "").trim();
  if (explicit) {
    return explicit;
  }

  const sectorLabel = String(sectorName || sectorId || "").trim();
  const hexLabel = String(hex || "")
    .trim()
    .replace(/\D/g, "");
  return [sectorLabel, hexLabel].filter(Boolean).join(" ").trim();
}

const currentSystem = computed(() => {
  const baseSystem = !resolvedSystemId.value
    ? systemStore.getCurrentSystem
    : (systemStore.systems.find((system) => String(system?.systemId) === resolvedSystemId.value) ??
      systemStore.getCurrentSystem);

  const routedSystemName = String(route.query.systemName || "").trim();
  const routedHex = String(route.query.hex || "")
    .trim()
    .replace(/\D/g, "");
  const routedSectorName = String(route.query.sectorName || "").trim();
  const routedSectorId = String(
    props.sectorId || route.params.sectorId || route.query.sectorId || baseSystem?.sectorId || "",
  ).trim();
  const parsedHex = parseHexCoordinates(routedHex);
  const existingSectorHex = String(baseSystem?.sectorHex || baseSystem?.metadata?.sectorHex || "").trim();
  const nextSectorHex = buildSectorHexLabel({
    sectorName: routedSectorName || baseSystem?.sectorName || baseSystem?.metadata?.sectorName,
    sectorId: routedSectorId,
    hex: routedHex,
    existing: existingSectorHex,
  });

  if (!baseSystem) {
    return {
      systemId: resolvedSystemId.value || routedHex,
      ...(routedSectorId ? { sectorId: routedSectorId } : {}),
      ...(routedSectorName ? { sectorName: routedSectorName } : {}),
      ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
      ...(parsedHex ? { hexCoordinates: parsedHex } : {}),
      name: routedSystemName,
      systemName: routedSystemName,
      systemDesignation: routedSystemName,
      stars: route.query.star ? [{ designation: String(route.query.star).trim() }] : [],
      metadata: {
        ...(routedSectorName ? { sectorName: routedSectorName } : {}),
        ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
        displayName: routedSystemName,
        systemRecord: {
          name: routedSystemName,
          systemName: routedSystemName,
          systemDesignation: routedSystemName,
          ...(routedSectorName ? { sectorName: routedSectorName } : {}),
          ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
        },
      },
    };
  }

  const existingName = String(
    baseSystem?.name ||
      baseSystem?.systemName ||
      baseSystem?.systemDesignation ||
      baseSystem?.profiles?.systemDesignation ||
      baseSystem?.metadata?.systemRecord?.name ||
      "",
  ).trim();
  const nextSystemName = existingName || routedSystemName;

  return {
    ...baseSystem,
    ...(routedSectorId ? { sectorId: routedSectorId } : {}),
    ...(routedSectorName ? { sectorName: routedSectorName } : {}),
    ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
    ...(!baseSystem?.hexCoordinates && parsedHex ? { hexCoordinates: parsedHex } : {}),
    ...(nextSystemName
      ? {
          name: nextSystemName,
          systemName: nextSystemName,
          systemDesignation: nextSystemName,
        }
      : {}),
    metadata: {
      ...(baseSystem?.metadata && typeof baseSystem.metadata === "object" ? baseSystem.metadata : {}),
      ...(routedSectorName ? { sectorName: routedSectorName } : {}),
      ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
      ...(nextSystemName ? { displayName: nextSystemName } : {}),
      systemRecord: {
        ...(baseSystem?.metadata?.systemRecord && typeof baseSystem.metadata.systemRecord === "object"
          ? baseSystem.metadata.systemRecord
          : {}),
        ...(nextSystemName
          ? {
              name: nextSystemName,
              systemName: nextSystemName,
              systemDesignation: nextSystemName,
            }
          : {}),
        ...(routedSectorName ? { sectorName: routedSectorName } : {}),
        ...(nextSectorHex ? { sectorHex: nextSectorHex } : {}),
      },
    },
  };
});

const savedSystemSummary = computed(() => summarizeSystemRecord(currentSystem.value));
const preferredWorld = computed(
  () => currentSystem.value?.mainworld ?? currentSystem.value?.worlds?.find?.((world) => world),
);
const preferredWorldIndex = computed(() => {
  const worlds = Array.isArray(currentSystem.value?.worlds) ? currentSystem.value.worlds : [];
  const index = worlds.findIndex((world) => String(world?.name || "") === String(preferredWorld.value?.name || ""));
  return index >= 0 ? index : 0;
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
  return buildSystemSummaryLabel({
    system: currentSystem.value,
    fallbackHex: String(route.query.hex || "Unknown Hex"),
    starLabel: String(route.query.star || ""),
  });
});

function buildGeneratorQuery(source = "system-survey") {
  const returnTo = serializeReturnRoute({
    name: String(route.name || "SystemSurvey"),
    params: { ...route.params },
    query: { ...route.query },
  });

  return {
    systemId: resolvedSystemId.value,
    systemRecordId: resolvedSystemId.value,
    worldName: String(preferredWorld.value?.name || ""),
    worldIndex: String(preferredWorldIndex.value),
    source,
    ...(returnTo ? { returnTo } : {}),
  };
}

function openCreatureGenerator() {
  router.push({ name: "CreatureGenerator", query: buildGeneratorQuery("system-survey-creature") });
}

function openFloraGenerator() {
  router.push({ name: "FloraGenerator", query: buildGeneratorQuery("system-survey-flora") });
}

function openSophontGenerator() {
  router.push({ name: "SophontGenerator", query: buildGeneratorQuery("system-survey-sophont") });
}
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

.survey-header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.survey-action-btn {
  border: 1px solid rgba(120, 173, 214, 0.35);
  border-radius: 999px;
  background: rgba(15, 30, 54, 0.82);
  color: #d9edf9;
  font-weight: 700;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
}
</style>
