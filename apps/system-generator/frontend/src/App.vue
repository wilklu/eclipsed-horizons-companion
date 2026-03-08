<template>
  <div id="app-root">
    <header class="app-header">
      <div class="header-brand">
        <span class="brand-icon">🌌</span>
        <span class="brand-name">Eclipsed Horizons Companion</span>
      </div>
      <nav class="header-nav">
        <router-link to="/" class="nav-link">Galaxy Survey</router-link>
        <router-link :to="galaxyId ? `/sector/${galaxyId}` : '/'" class="nav-link">Sector Survey</router-link>
        <router-link to="/sophont-generator" class="nav-link">Sophont Generator</router-link>
        <router-link to="/creature-generator" class="nav-link">Creature Generator</router-link>
        <router-link to="/history-generator" class="nav-link">History Generator</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGalaxyStore } from "./stores/galaxyStore.js";

const galaxyStore = useGalaxyStore();
const galaxyId = computed(() => galaxyStore.getCurrentGalaxy?.galaxyId ?? null);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #00d9ff;
}

.brand-icon {
  font-size: 1.5rem;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-link {
  color: #aaa;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #00d9ff;
  background: rgba(0, 217, 255, 0.1);
}

.app-main {
  flex: 1;
}
</style>
