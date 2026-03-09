<template>
  <div class="survey-navigation">
    <div class="survey-breadcrumb">
      <span class="breadcrumb-label">Survey Class:</span>
      <span class="breadcrumb-current">{{ currentClass }}</span>
    </div>
    <div class="survey-actions">
      <button v-if="showRegenerate" class="btn btn-secondary" @click="$emit('regenerate')">🔄 Regenerate</button>
      <button v-if="showExport" class="btn btn-secondary" @click="$emit('export')">📤 Export</button>
      <router-link v-if="backRoute" :to="backRoute" class="btn btn-outline"> ← Back </router-link>

      <!-- Navigation shortcuts with conditional disabling -->
      <div class="nav-shortcuts">
        <router-link
          to="/"
          class="btn btn-nav"
          :class="{ disabled: false }"
          :title="canAccessGalaxy ? 'Galaxy Survey' : 'Galaxy Survey (Create a galaxy first)'"
        >
          🌌 Galaxy
        </router-link>

        <router-link
          v-if="canAccessSector"
          :to="`/sector/${currentGalaxyId}`"
          class="btn btn-nav"
          :title="canAccessSector ? 'Sector Survey' : 'Select a galaxy first'"
        >
          🗺️ Sector
        </router-link>
        <button v-else class="btn btn-nav disabled" @click.prevent title="Select a galaxy first">🗺️ Sector</button>

        <router-link
          v-if="canAccessSystem"
          :to="`/sector/${currentGalaxyId}/star-system/${currentSectorId}`"
          class="btn btn-nav"
          :title="canAccessSystem ? 'Star System Builder' : 'Select a sector first'"
        >
          ⭐ System
        </router-link>
        <button v-else class="btn btn-nav disabled" @click.prevent title="Select a sector first">⭐ System</button>

        <router-link
          v-if="canAccessWorld"
          :to="`/world-builder/${currentSystemId}`"
          class="btn btn-nav"
          :title="canAccessWorld ? 'World Builder' : 'Select a system first'"
        >
          🌍 World
        </router-link>
        <button v-else class="btn btn-nav disabled" @click.prevent title="Select a system first">🌍 World</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useGalaxyStore } from "../../stores/galaxyStore.js";
import { useSectorStore } from "../../stores/sectorStore.js";
import { useSystemStore } from "../../stores/systemStore.js";
import { useWorldStore } from "../../stores/worldStore.js";

const galaxyStore = useGalaxyStore();
const sectorStore = useSectorStore();
const systemStore = useSystemStore();
const worldStore = useWorldStore();

defineProps({
  currentClass: {
    type: String,
    required: true,
  },
  backRoute: {
    type: [String, Object],
    default: null,
  },
  showRegenerate: {
    type: Boolean,
    default: true,
  },
  showExport: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["regenerate", "export"]);

// Navigation availability based on store state
const canAccessGalaxy = computed(() => true);
const canAccessSector = computed(() => galaxyStore.currentGalaxyId && galaxyStore.getCurrentGalaxy !== null);
const canAccessSystem = computed(
  () => sectorStore.currentSectorId && sectorStore.getCurrentSector !== null && canAccessSector.value,
);
const canAccessWorld = computed(
  () => systemStore.currentSystemId && systemStore.getCurrentSystem !== null && canAccessSystem.value,
);

// Current entity IDs for navigation
const currentGalaxyId = computed(() => galaxyStore.currentGalaxyId);
const currentSectorId = computed(() => sectorStore.currentSectorId);
const currentSystemId = computed(() => systemStore.currentSystemId);
</script>

<style scoped>
.survey-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #0d0d2b, #1a1a3e);
  border-bottom: 1px solid #333;
  margin-bottom: 0;
}

.survey-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.breadcrumb-label {
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breadcrumb-current {
  color: #00d9ff;
  font-weight: bold;
  font-size: 1rem;
}

.survey-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav-shortcuts {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #444;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #555;
}

.btn-outline {
  background: transparent;
  color: #00d9ff;
  border: 1px solid #00d9ff;
}

.btn-outline:hover {
  background: rgba(0, 217, 255, 0.1);
}

.btn-nav {
  padding: 0.4rem 0.8rem;
  background: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  border: 1px solid rgba(0, 217, 255, 0.3);
  font-size: 0.75rem;
}

.btn-nav:hover:not(.disabled) {
  background: rgba(0, 217, 255, 0.2);
  border-color: rgba(0, 217, 255, 0.6);
}

.btn-nav.disabled {
  background: rgba(100, 100, 100, 0.2);
  color: #666;
  border-color: rgba(100, 100, 100, 0.3);
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-nav.disabled:hover {
  background: rgba(100, 100, 100, 0.2);
  border-color: rgba(100, 100, 100, 0.3);
}
</style>
