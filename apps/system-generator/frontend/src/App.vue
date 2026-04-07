<template>
  <div id="app-root">
    <LoadingSpinner
      :isVisible="isBooting"
      mode="boot"
      tone="boot"
      :context="bootLoadingContext"
      :message="`Initializing ${headerContextTitle || 'Traveller systems'}...`"
    />
    <header class="app-header">
      <div class="header-page-title">{{ headerContextTitle || "Eclipsed Horizons Companion" }}</div>
      <nav class="header-nav">
        <router-link to="/atlas" class="nav-link">Traveller Atlas</router-link>
        <router-link to="/galaxy" class="nav-link">Galaxy Survey</router-link>
        <router-link :to="sectorSurveyRoute" class="nav-link">Sector Survey</router-link>
        <router-link to="/sophont-generator" class="nav-link">Sophont Generator</router-link>
        <router-link to="/creature-generator" class="nav-link">Creature Generator</router-link>
        <router-link to="/history-generator" class="nav-link">History Generator</router-link>
        <router-link to="/character-generator" class="nav-link">Character Generator</router-link>
        <router-link to="/session-planner" class="nav-link">Session Planner</router-link>
        <router-link to="/preferences" class="nav-link">Preferences</router-link>
      </nav>
      <div class="header-brand">
        <span class="brand-name">Eclipsed Horizons Companion</span>
        <span class="brand-icon">🌌</span>
      </div>
    </header>
    <main class="app-main">
      <div v-if="routeErrorMessage" class="route-error-state" role="alert">
        <div class="route-error-card">
          <p class="route-error-kicker">Route Error</p>
          <h1>{{ headerContextTitle || "Application Error" }}</h1>
          <p class="route-error-copy">{{ routeErrorMessage }}</p>
          <pre v-if="routeErrorDetails" class="route-error-details">{{ routeErrorDetails }}</pre>
        </div>
      </div>
      <router-view v-else />
    </main>
  </div>
</template>

<script setup>
import { computed, onErrorCaptured, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingSpinner from "./components/common/LoadingSpinner.vue";
import { useGalaxyStore } from "./stores/galaxyStore.js";
import { useSectorStore } from "./stores/sectorStore.js";

const galaxyStore = useGalaxyStore();
const sectorStore = useSectorStore();
const route = useRoute();
const isBooting = ref(true);
const routeErrorMessage = ref("");
const routeErrorDetails = ref("");
const galaxyId = computed(() => galaxyStore.getCurrentGalaxy?.galaxyId ?? null);
const sectorSurveyRoute = computed(() => {
  if (!galaxyId.value) {
    return "/galaxy";
  }

  const currentSectorId = String(sectorStore.currentSectorId || "").trim();
  return currentSectorId && currentSectorId.startsWith(`${galaxyId.value}:`)
    ? {
        name: "SectorSurvey",
        params: { galaxyId: galaxyId.value },
        query: { sectorId: currentSectorId },
      }
    : `/sector/${galaxyId.value}`;
});
const routeTitleFallbacks = Object.freeze({
  TravellerAtlas: "Traveller Atlas",
  GalaxySurvey: "Galaxy Survey",
  SectorSurvey: "Sector Survey",
  StarSystemBuilder: "Stellar Survey",
  OrbitalView: "Orbital View",
  WorldBuilder: "World Survey",
});

const routeLoadingContexts = Object.freeze({
  TravellerAtlas: "atlas",
  GalaxySurvey: "galaxy",
  SectorSurvey: "sector",
  StarSystemBuilder: "stellar",
  OrbitalView: "world",
  WorldBuilder: "world",
});

const headerContextTitle = computed(() => route.meta?.title || routeTitleFallbacks[route.name] || "");
const bootLoadingContext = computed(() => routeLoadingContexts[route.name] || "generic");

watch(
  () => route.fullPath,
  () => {
    routeErrorMessage.value = "";
    routeErrorDetails.value = "";
  },
);

onErrorCaptured((error, instance, info) => {
  routeErrorMessage.value = error instanceof Error ? error.message : String(error || "Unexpected route error");
  const componentName = instance?.type?.name || instance?.type?.__name || instance?.type?.__file || "Unknown component";
  const stack = error instanceof Error ? String(error.stack || "") : "";
  routeErrorDetails.value = [
    `Component: ${componentName}`,
    info ? `Context: ${info}` : null,
    stack ? `Stack:\n${stack}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
  console.error("[Route Error]", { error, componentName, info });
  return false;
});

onMounted(() => {
  window.setTimeout(() => {
    isBooting.value = false;
  }, 1100);
});
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #0a0a1a;
  color: #e0e0e0;
  min-height: 100vh;
}

#app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #0d0d2b, #1a1a3e);
  border-bottom: 2px solid #00d9ff;
  padding: 1rem 2rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-page-title {
  color: #d9f7ff;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-self: end;
  font-size: 1.1rem;
  font-weight: bold;
  color: #00d9ff;
}

.brand-icon {
  font-size: 1.5rem;
  order: 2;
}

.brand-name {
  order: 1;
}

.header-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-link {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition:
    color 0.2s,
    background 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #00d9ff;
  background: rgba(0, 217, 255, 0.1);
}

.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.app-main > * {
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.route-error-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.route-error-card {
  width: min(40rem, 100%);
  padding: 1.5rem;
  border: 1px solid rgba(255, 101, 101, 0.35);
  border-radius: 0.75rem;
  background: linear-gradient(180deg, rgba(44, 11, 18, 0.92), rgba(24, 8, 14, 0.95));
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
}

.route-error-kicker {
  color: #ff9f9f;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.route-error-card h1 {
  color: #fff1f1;
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
}

.route-error-copy {
  color: #ffd4d4;
  line-height: 1.55;
}

.route-error-details {
  margin-top: 1rem;
  padding: 0.9rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.28);
  color: #ffdede;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow: auto;
}

@media (max-width: 1200px) {
  .app-header {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .header-page-title,
  .header-brand {
    justify-self: start;
  }

  .header-nav {
    justify-content: flex-start;
  }
}
</style>
