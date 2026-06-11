<template>
  <div v-if="selectedTile" class="density-map-inspector">
    <div class="density-map-inspector-head">
      <div>
        <div class="density-map-inspector-kicker">Selected Sector</div>
        <strong>{{ selectedTile.displayName }}</strong>
      </div>
      <span class="density-map-inspector-density">Density Class {{ selectedTile.dc }}</span>
    </div>
    <div class="density-map-inspector-grid">
      <div class="density-map-inspector-item">
        <span>Tile Type</span>
        <strong>{{ selectedTile.kind === "atlas" ? "Atlas Cell (Overview)" : "Persisted Sector" }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Sector ID</span>
        <strong>{{ selectedTile.sectorId }}</strong>
      </div>
      <div v-if="selectedTile.gridSpanLabel" class="density-map-inspector-item">
        <span>Atlas Coverage</span>
        <strong>{{ selectedTile.gridSpanLabel }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Grid</span>
        <strong>{{ formatTileGrid(selectedTile.gridX, selectedTile.gridY) }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Persisted</span>
        <strong>{{ selectedTile.persisted ? "Yes" : "Layout Only" }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Presence Hexes</span>
        <strong>{{ formatNumber(selectedTile.occupiedHexCount) }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Typed Hexes</span>
        <strong>{{ formatNumber(selectedTile.typedHexCount) }}</strong>
      </div>
      <div class="density-map-inspector-item">
        <span>Ring Distance</span>
        <strong>{{ selectedTile.ringLabel || `Ring ${selectedTile.ring}` }}</strong>
      </div>
    </div>
    <div class="density-map-inspector-ring-copy">
      {{ selectedTile.ringLabel || `Ring ${selectedTile.ring}` }} contains {{ ringTileCount.toLocaleString() }} layout
      tile{{ ringTileCount === 1 ? "" : "s" }} and {{ ringPersistedCount.toLocaleString() }} persisted sector{{
        ringPersistedCount === 1 ? "" : "s"
      }}.
    </div>
    <div class="density-map-inspector-actions">
      <button
        class="btn btn-secondary"
        :disabled="!selectedTile.persisted"
        @click="$emit('open-sector-survey', { viewName: 'SectorSurvey' })"
      >
        Open Sector Survey
      </button>
      <button
        class="btn btn-secondary"
        :disabled="!selectedTile.persisted"
        @click="$emit('open-sector-survey', { viewName: 'SubsectorSurvey' })"
      >
        Open Subsector Survey
      </button>
      <button
        class="btn btn-info"
        :disabled="isGeneratingBusy || !ringTileCount"
        @click="$emit('generate-ring', { mode: 'presence' })"
      >
        Generate Ring Presence
      </button>
      <button
        class="btn btn-info"
        :disabled="isGeneratingBusy || !ringTileCount"
        @click="$emit('generate-ring', { mode: 'systems' })"
      >
        Generate Ring Systems
      </button>
      <button
        class="btn btn-secondary"
        :disabled="isApplyingSectorReset || !ringPersistedSectorIds.length"
        @click="
          $emit('request-reset', {
            level: 'systems',
            scopeLabel: `ring ${selectedTile.ring}`,
            sectorIds: ringPersistedSectorIds,
          })
        "
      >
        Clear Ring Systems
      </button>
      <button
        class="btn btn-secondary"
        :disabled="isApplyingSectorReset || !ringPersistedSectorIds.length"
        @click="
          $emit('request-reset', {
            level: 'presence',
            scopeLabel: `ring ${selectedTile.ring}`,
            sectorIds: ringPersistedSectorIds,
          })
        "
      >
        Clear Ring Survey
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  selectedTile: { type: Object, default: null },
  ringTileCount: { type: Number, default: 0 },
  ringPersistedSectors: { type: Array, default: () => [] },
  isGeneratingSectors: { type: Boolean, default: false },
  isGeneratingFullGalaxy: { type: Boolean, default: false },
  isApplyingSectorReset: { type: Boolean, default: false },
});

defineEmits(["open-sector-survey", "generate-ring", "request-reset"]);

const isGeneratingBusy = computed(() => props.isGeneratingSectors || props.isGeneratingFullGalaxy);
const ringPersistedCount = computed(() => props.ringPersistedSectors.length);
const ringPersistedSectorIds = computed(() =>
  props.ringPersistedSectors.map((sector) => sector.sectorId).filter(Boolean),
);

function formatTileGrid(gridX, gridY) {
  const x = Number(gridX);
  const y = Number(gridY);
  return `${x >= 0 ? "+" : ""}${x}, ${y >= 0 ? "+" : ""}${y}`;
}

function formatNumber(num) {
  const numeric = Number(num) || 0;
  if (numeric >= 1e12) return (numeric / 1e12).toFixed(1) + "T";
  if (numeric >= 1e9) return (numeric / 1e9).toFixed(1) + "B";
  if (numeric >= 1e6) return (numeric / 1e6).toFixed(1) + "M";
  return numeric.toLocaleString();
}
</script>

<style scoped>
.density-map-inspector {
  width: min(100%, 640px);
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(0, 217, 255, 0.14);
  border-radius: 0.5rem;
  background: rgba(6, 19, 35, 0.52);
}

.density-map-inspector-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
}

.density-map-inspector-kicker {
  color: #8fb3c9;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.density-map-inspector-density {
  color: #8fb3c9;
  font-size: 0.76rem;
}

.density-map-inspector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.density-map-inspector-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(95, 188, 223, 0.16);
  border-radius: 0.45rem;
  background: rgba(9, 25, 46, 0.58);
}

.density-map-inspector-item span {
  color: #8fb3c9;
  font-size: 0.74rem;
}

.density-map-inspector-item strong {
  color: #e8f8ff;
  font-family: monospace;
}

.density-map-inspector-ring-copy {
  margin-top: 0.8rem;
  color: #c9e2ef;
  font-size: 0.8rem;
  line-height: 1.45;
}

.density-map-inspector-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  margin-top: 0.8rem;
}

@media (max-width: 640px) {
  .density-map-inspector-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
