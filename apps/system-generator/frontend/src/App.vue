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
        <router-link :to="galaxyId ? `/sector/${galaxyId}` : '/galaxy'" class="nav-link">Sector Survey</router-link>
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
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import LoadingSpinner from "./components/common/LoadingSpinner.vue";
import { useGalaxyStore } from "./stores/galaxyStore.js";

const galaxyStore = useGalaxyStore();
const route = useRoute();
const isBooting = ref(true);
const galaxyId = computed(() => galaxyStore.getCurrentGalaxy?.galaxyId ?? null);
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
}

.app-main > * {
  flex: 1;
  min-height: 0;
  min-width: 0;
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
