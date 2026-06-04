<template>
  <aside class="world-terrain-hex-inspector">
    <div class="world-terrain-hex-inspector-head">
      <div>
        <div class="world-terrain-hex-inspector-kicker">Hex Inspector</div>
        <h3>{{ selectedHexLabel }}</h3>
      </div>
      <button
        type="button"
        class="world-terrain-hex-inspector-clear"
        :disabled="!hasSelection"
        @click="$emit('clear-selection')"
      >
        Clear
      </button>
    </div>

    <div class="world-terrain-hex-inspector-summary">
      <div class="world-terrain-hex-inspector-stat">
        <span>Tagged</span>
        <strong>{{ formatNumber(summary.taggedHexCount) }}</strong>
      </div>
      <div class="world-terrain-hex-inspector-stat">
        <span>Terrain</span>
        <strong>{{ formatNumber(summary.terrainTaggedHexCount) }}</strong>
      </div>
      <div class="world-terrain-hex-inspector-stat">
        <span>Feature</span>
        <strong>{{ formatNumber(summary.featureTaggedHexCount) }}</strong>
      </div>
      <div class="world-terrain-hex-inspector-stat">
        <span>Biomes</span>
        <strong>{{ formatNumber(summary.biomeTaggedHexCount) }}</strong>
      </div>
      <div class="world-terrain-hex-inspector-stat">
        <span>Shorelines</span>
        <strong>{{ formatNumber(summary.shorelineTriangleCount) }}</strong>
      </div>
    </div>

    <div v-if="hasSelection" class="world-terrain-hex-inspector-body">
      <dl class="world-terrain-hex-inspector-grid">
        <div class="world-terrain-hex-inspector-item">
          <dt>Hex Key</dt>
          <dd>{{ selectedKey }}</dd>
        </div>
        <div class="world-terrain-hex-inspector-item" v-if="selectedHex">
          <dt>Face</dt>
          <dd>{{ selectedHex.faceId || "—" }}</dd>
        </div>
        <div class="world-terrain-hex-inspector-item" v-if="selectedHex">
          <dt>Terrain Tags</dt>
          <dd>
            <span v-if="selectedHex.terrainTags.length" class="world-terrain-hex-inspector-tags">
              <span
                v-for="tag in selectedHex.terrainTags"
                :key="`terrain-${tag}`"
                class="world-terrain-hex-inspector-tag world-terrain-hex-inspector-tag--terrain"
              >
                {{ tag }}
              </span>
            </span>
            <span v-else>None</span>
          </dd>
        </div>
        <div class="world-terrain-hex-inspector-item" v-if="selectedHex">
          <dt>Terrain Class</dt>
          <dd>{{ selectedHex.terrainClass || "None" }}</dd>
        </div>
        <div class="world-terrain-hex-inspector-item" v-if="selectedHex">
          <dt>Feature Tags</dt>
          <dd>
            <span v-if="selectedHex.featureTags.length" class="world-terrain-hex-inspector-tags">
              <span
                v-for="tag in selectedHex.featureTags"
                :key="`feature-${tag}`"
                class="world-terrain-hex-inspector-tag world-terrain-hex-inspector-tag--feature"
              >
                {{ tag }}
              </span>
            </span>
            <span v-else>None</span>
          </dd>
        </div>
        <div class="world-terrain-hex-inspector-item" v-if="selectedHex">
          <dt>Biome Tags</dt>
          <dd>
            <span v-if="selectedHex.biomeTags.length" class="world-terrain-hex-inspector-tags">
              <span
                v-for="tag in selectedHex.biomeTags"
                :key="`biome-${tag}`"
                class="world-terrain-hex-inspector-tag world-terrain-hex-inspector-tag--biome"
              >
                {{ tag }}
              </span>
            </span>
            <span v-else>None</span>
          </dd>
        </div>
      </dl>

      <div class="world-terrain-hex-inspector-all-tags">
        <span class="world-terrain-hex-inspector-all-tags-label">All tags</span>
        <div v-if="selectedHex" class="world-terrain-hex-inspector-tags">
          <span v-if="selectedHex.tags.length">
            <span v-for="tag in selectedHex.tags" :key="`all-${tag}`" class="world-terrain-hex-inspector-tag">
              {{ tag }}
            </span>
          </span>
          <span v-else class="world-terrain-hex-inspector-empty">No tags recorded for this hex yet.</span>
        </div>
        <span v-else class="world-terrain-hex-inspector-empty"
          >This hex is selected but has no recorded tag entry yet.</span
        >
      </div>
    </div>

    <p v-if="!hasSelection" class="world-terrain-hex-inspector-empty">
      Click any classified hex on the map to inspect its terrain and feature tags.
    </p>
  </aside>
</template>

<script setup>
import { computed } from "vue";

defineEmits(["clear-selection"]);

const props = defineProps({
  selectedKey: { type: String, default: "" },
  selectedHex: { type: Object, default: null },
  summary: {
    type: Object,
    default: () => ({
      taggedHexCount: 0,
      terrainTaggedHexCount: 0,
      featureTaggedHexCount: 0,
      biomeTaggedHexCount: 0,
      shorelineTriangleCount: 0,
    }),
  },
});

const hasSelection = computed(() => Boolean(props.selectedKey));
const selectedHexLabel = computed(() => props.selectedHex?.key || props.selectedKey || "Select a hex");

function formatNumber(value) {
  const numeric = Number(value) || 0;
  return numeric.toLocaleString();
}
</script>

<style scoped>
.world-terrain-hex-inspector {
  margin-top: 0.95rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 0.7rem;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.98), rgba(241, 247, 252, 0.98));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.world-terrain-hex-inspector-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.world-terrain-hex-inspector-kicker {
  color: #5a6b7a;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.world-terrain-hex-inspector h3 {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
}

.world-terrain-hex-inspector-clear {
  padding: 0.45rem 0.7rem;
  border: 1px solid rgba(15, 23, 42, 0.22);
  border-radius: 999px;
  background: #fff;
  color: #213043;
  font-weight: 700;
}

.world-terrain-hex-inspector-clear:disabled {
  opacity: 0.45;
}

.world-terrain-hex-inspector-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.65rem;
  margin-top: 0.9rem;
}

.world-terrain-hex-inspector-stat {
  padding: 0.7rem 0.8rem;
  border-radius: 0.55rem;
  background: rgba(15, 23, 42, 0.04);
}

.world-terrain-hex-inspector-stat span,
.world-terrain-hex-inspector-item dt,
.world-terrain-hex-inspector-all-tags-label {
  color: #5a6b7a;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.world-terrain-hex-inspector-stat strong,
.world-terrain-hex-inspector-item dd {
  display: block;
  margin-top: 0.2rem;
  color: #111827;
}

.world-terrain-hex-inspector-body {
  margin-top: 0.9rem;
}

.world-terrain-hex-inspector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
  margin: 0;
}

.world-terrain-hex-inspector-item {
  padding: 0.72rem 0.8rem;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 0.55rem;
  background: rgba(255, 255, 255, 0.82);
}

.world-terrain-hex-inspector-item dd {
  margin-left: 0;
}

.world-terrain-hex-inspector-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.2rem;
}

.world-terrain-hex-inspector-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.45rem;
  border-radius: 999px;
  background: #e9eef4;
  color: #213043;
  font-size: 0.74rem;
  font-weight: 700;
}

.world-terrain-hex-inspector-tag--terrain {
  background: rgba(29, 78, 216, 0.12);
  color: #1e3a8a;
}

.world-terrain-hex-inspector-tag--feature {
  background: rgba(180, 83, 9, 0.12);
  color: #92400e;
}

.world-terrain-hex-inspector-tag--biome {
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
}

.world-terrain-hex-inspector-all-tags {
  margin-top: 0.9rem;
}

.world-terrain-hex-inspector-empty {
  margin: 0.9rem 0 0;
  color: #5a6b7a;
}

@media (max-width: 720px) {
  .world-terrain-hex-inspector-head {
    flex-direction: column;
  }
}
</style>
