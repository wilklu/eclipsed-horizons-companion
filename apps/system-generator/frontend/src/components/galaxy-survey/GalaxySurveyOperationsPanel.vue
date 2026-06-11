<template>
  <div class="galaxy-survey-operations">
    <section class="detail-section detail-section--strip">
      <h3>🧭 Planner</h3>
      <div class="planner-panel">
        <div class="planner-summary-card">
          <div class="planner-summary-head">
            <span class="planner-kicker">{{ generationPlannerSummary.modeLabel }}</span>
            <strong>{{ generationPlannerSummary.actionLabel }}</strong>
          </div>
          <div class="planner-metrics">
            <div class="planner-metric">
              <span class="planner-metric-label">Layout Footprint</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.layoutCountLabel }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Targeted This Run</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.sectorsTouchedLabel }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Named Sectors On Hand</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.namedSectorsLabel }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Presence Coverage</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.presenceCoverageLabel }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Cached Systems</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.cachedSystemsLabel }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Expected Write Pattern</span>
              <span class="planner-metric-value">{{ generationPlannerSummary.writeProfile }}</span>
            </div>
          </div>
          <div v-if="generationPlannerSummary.warningMessages.length" class="planner-warning-list">
            <div
              v-for="warning in generationPlannerSummary.warningMessages"
              :key="warning"
              class="planner-warning-item"
            >
              {{ warning }}
            </div>
          </div>
          <div v-if="generationPlannerSummary.forecastRows?.length" class="planner-forecast-list">
            <div v-for="row in generationPlannerSummary.forecastRows" :key="row.label" class="planner-forecast-row">
              <span>{{ row.label }}</span>
              <strong :class="row.tone ? `planner-runtime planner-runtime--${row.tone}` : ''">{{ row.value }}</strong>
            </div>
          </div>
          <div v-if="generationPlannerSummary.forecastNote" class="planner-forecast-note">
            {{ generationPlannerSummary.forecastNote }}
          </div>
        </div>

        <div class="planner-summary-card planner-summary-card--guidance">
          <div class="planner-summary-head">
            <span class="planner-kicker">Frontier Guidance</span>
            <strong>{{ generationGuidance.recommendation.title }}</strong>
          </div>
          <div class="planner-guidance-copy">{{ generationGuidance.recommendation.body }}</div>
          <div class="planner-metrics">
            <div class="planner-metric">
              <span class="planner-metric-label">Completed Rings</span>
              <span class="planner-metric-value">
                {{ generationGuidance.completedRingCount.toLocaleString() }} /
                {{ generationGuidance.totalRingCount.toLocaleString() }}
              </span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Next Presence Ring</span>
              <span class="planner-metric-value">{{ ringLabel(generationGuidance.nextPresenceRing) }}</span>
            </div>
            <div class="planner-metric">
              <span class="planner-metric-label">Next Systems Ring</span>
              <span class="planner-metric-value">{{ ringLabel(generationGuidance.nextSystemsRing) }}</span>
            </div>
          </div>
          <div class="planner-guidance-actions">
            <button
              class="btn btn-info"
              :disabled="isGeneratingBusy || !generationGuidance.nextPresenceRing"
              @click="$emit('guided-generate', { mode: 'presence' })"
            >
              Generate Next Ring Presence
            </button>
            <button
              class="btn btn-info"
              :disabled="isGeneratingBusy || !generationGuidance.nextSystemsRing"
              @click="$emit('guided-generate', { mode: 'systems' })"
            >
              Resume Frontier Systems
            </button>
          </div>
          <div v-if="generationGuidance.ringSummaries.length" class="ring-summary-list">
            <div v-for="summary in visibleRingSummaries" :key="summary.ring" class="ring-summary-item">
              <strong>{{ summary.label }}</strong>
              <span
                >Persisted {{ summary.persistedCount.toLocaleString() }} /
                {{ summary.layoutCount.toLocaleString() }}</span
              >
              <span
                >Presence {{ summary.presenceCompleteCount.toLocaleString() }} /
                {{ summary.layoutCount.toLocaleString() }}</span
              >
              <span
                >Systems {{ summary.systemsCompleteCount.toLocaleString() }} /
                {{ summary.layoutCount.toLocaleString() }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-section detail-section--strip">
      <h3>🛠️ Reset</h3>
      <div class="planner-panel">
        <div class="reset-panel">
          <div class="reset-copy">
            Reset generated content without deleting the galaxy record. Use sector-only reset from the selected map tile
            when you need to rework a specific area.
          </div>
          <div class="reset-action-grid">
            <button
              class="btn btn-secondary"
              :disabled="isApplyingSectorReset || !hasGalaxySectors"
              @click="$emit('request-reset', { level: 'systems', scopeLabel: 'this galaxy' })"
            >
              {{ isApplyingSectorReset ? "Resetting…" : "Clear Systems Only" }}
            </button>
            <button
              class="btn btn-danger"
              :disabled="isApplyingSectorReset || !hasGalaxySectors"
              @click="$emit('request-reset', { level: 'presence', scopeLabel: 'this galaxy' })"
            >
              {{ isApplyingSectorReset ? "Resetting…" : "Clear Presence + Systems" }}
            </button>
            <button
              class="btn btn-secondary"
              :disabled="isApplyingSectorReset || !selectedSectorId"
              @click="
                $emit('request-reset', {
                  level: 'systems',
                  scopeLabel: selectedSectorName || 'the selected sector',
                  sectorIds: [selectedSectorId],
                })
              "
            >
              Clear Selected Sector Systems
            </button>
            <button
              class="btn btn-secondary"
              :disabled="isApplyingSectorReset || !selectedSectorId"
              @click="
                $emit('request-reset', {
                  level: 'presence',
                  scopeLabel: selectedSectorName || 'the selected sector',
                  sectorIds: [selectedSectorId],
                })
              "
            >
              Clear Selected Sector Survey
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-section detail-section--strip">
      <h3>🕘 History</h3>
      <div class="history-panel">
        <div v-if="currentGalaxyHistory.length" class="history-list">
          <div v-for="entry in currentGalaxyHistory" :key="entry.id" class="history-entry">
            <div class="history-entry-head">
              <strong>{{ entry.label }}</strong>
              <span>{{ formatHistoryTimestamp(entry.at) }}</span>
            </div>
            <div class="history-entry-body">{{ entry.detail }}</div>
            <div v-if="entry.metrics?.length" class="history-entry-metrics">
              <span v-for="metric in entry.metrics" :key="`${entry.id}-${metric.label}`" class="history-entry-metric">
                {{ metric.label }}: {{ metric.value }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="history-empty">No Galaxy Survey actions logged for this galaxy yet.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  generationPlannerSummary: { type: Object, required: true },
  generationGuidance: { type: Object, required: true },
  isGeneratingSectors: { type: Boolean, default: false },
  isGeneratingFullGalaxy: { type: Boolean, default: false },
  isApplyingSectorReset: { type: Boolean, default: false },
  hasGalaxySectors: { type: Boolean, default: false },
  selectedSectorName: { type: String, default: "" },
  selectedSectorId: { type: String, default: "" },
  currentGalaxyHistory: { type: Array, default: () => [] },
});

defineEmits(["guided-generate", "request-reset"]);

const isGeneratingBusy = computed(() => props.isGeneratingSectors || props.isGeneratingFullGalaxy);
const visibleRingSummaries = computed(() => props.generationGuidance.ringSummaries.slice(0, 6));

function formatHistoryTimestamp(value) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return "Unknown time";
  }
  return new Date(time).toLocaleString();
}

function ringLabel(summary) {
  return summary ? `Ring ${summary.ring}` : "Complete";
}
</script>

<style scoped>
.planner-panel,
.history-panel {
  min-width: 0;
}

.planner-panel {
  display: grid;
  gap: 0.9rem;
}

.planner-summary-card,
.reset-panel,
.history-entry,
.history-empty {
  border: 1px solid rgba(0, 217, 255, 0.14);
  border-radius: 0.5rem;
  background: rgba(6, 19, 35, 0.52);
}

.planner-summary-card,
.reset-panel,
.history-panel {
  padding: 0.9rem;
}

.planner-summary-head,
.history-entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.8rem;
}

.planner-kicker {
  color: #8fb3c9;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.planner-metrics,
.reset-action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
  margin-top: 0.8rem;
}

.planner-metric {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(95, 188, 223, 0.16);
  border-radius: 0.45rem;
  background: rgba(9, 25, 46, 0.58);
}

.planner-metric-label,
.history-entry-head span {
  color: #8fb3c9;
  font-size: 0.74rem;
}

.planner-metric-value,
.history-entry-body {
  color: #e8f8ff;
  font-family: monospace;
}

.planner-warning-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.planner-forecast-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.9rem;
}

.planner-forecast-row {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed rgba(120, 180, 220, 0.24);
  color: #9cc4de;
  font-size: 0.8rem;
}

.planner-forecast-row strong {
  color: #d7f3ff;
}

.planner-forecast-note {
  margin-top: 0.55rem;
  color: #a6c9dd;
  font-size: 0.76rem;
  line-height: 1.4;
}

.planner-runtime {
  padding: 0.08rem 0.42rem;
  border-radius: 999px;
  border: 1px solid transparent;
}

.planner-runtime--none {
  color: #8da7bb;
  background: rgba(124, 145, 160, 0.12);
  border-color: rgba(124, 145, 160, 0.25);
}

.planner-runtime--fast {
  color: #a5f0bf;
  background: rgba(74, 166, 112, 0.18);
  border-color: rgba(100, 201, 139, 0.34);
}

.planner-runtime--moderate {
  color: #ffe29a;
  background: rgba(176, 141, 57, 0.2);
  border-color: rgba(217, 179, 77, 0.35);
}

.planner-runtime--heavy {
  color: #ffc2b4;
  background: rgba(173, 85, 71, 0.2);
  border-color: rgba(225, 125, 108, 0.34);
}

.planner-warning-item {
  color: #ffd7aa;
  padding: 0.65rem 0.75rem;
  border-radius: 0.45rem;
  border: 1px solid rgba(255, 179, 95, 0.2);
  background: rgba(58, 32, 12, 0.4);
  font-size: 0.8rem;
}

.planner-guidance-copy,
.reset-copy,
.history-empty {
  color: #c9e2ef;
  line-height: 1.5;
}

.planner-guidance-copy {
  margin-top: 0.7rem;
}

.planner-guidance-actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  margin-top: 0.9rem;
}

.ring-summary-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.ring-summary-list {
  margin-top: 0.9rem;
}

.ring-summary-item,
.history-entry {
  padding: 0.8rem 0.9rem;
}

.ring-summary-item {
  display: grid;
  gap: 0.25rem;
  border: 1px solid rgba(95, 188, 223, 0.16);
  border-radius: 0.45rem;
  background: rgba(9, 25, 46, 0.58);
  color: #d8eef8;
}

.ring-summary-item span {
  color: #b8d8e7;
  font-size: 0.76rem;
}

.history-entry-body {
  margin-top: 0.35rem;
  line-height: 1.45;
}

.history-entry-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.history-entry-metric {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(143, 179, 201, 0.28);
  background: rgba(16, 36, 49, 0.72);
  color: #d8eef8;
  font-size: 0.72rem;
}

@media (max-width: 640px) {
  .planner-summary-head,
  .history-entry-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
