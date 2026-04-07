<template>
  <Teleport to="body" v-if="isVisible">
    <div class="loading-spinner-overlay">
      <div
        class="loading-spinner-content"
        :class="[`mode-${mode}`, `context-${resolvedContext}`, `tone-${resolvedTone}`]"
      >
        <div class="loading-screen-grid"></div>
        <div class="loading-screen-noise"></div>

        <div class="loading-shell">
          <div class="loading-shell-header">
            <span class="loading-kicker">{{ resolvedKicker }}</span>
            <span class="loading-state">{{ resolvedState }}</span>
          </div>

          <div class="loading-title-block">
            <div class="loading-title">{{ resolvedTitle }}</div>
            <p v-if="message" class="spinner-message">{{ message }}</p>
          </div>

          <div class="loading-diagnostics">
            <div v-for="line in resolvedDiagnostics" :key="line.label" class="diagnostic-row">
              <span class="diagnostic-label">{{ line.label }}</span>
              <span class="diagnostic-value">{{ line.value }}</span>
            </div>
          </div>

          <div class="loading-bar-block">
            <div v-if="hasProgress" class="loading-progress-summary">
              <span>{{ progressCountLabel }}</span>
              <span>{{ progressSummaryLabel }}</span>
            </div>
            <div class="loading-bar-track">
              <div class="loading-bar-fill" :class="{ determinate: hasProgress }" :style="progressFillStyle"></div>
            </div>
            <div class="loading-bar-meta">
              <span>{{ resolvedBarLabel }}</span>
              <span class="loading-percent">{{ progressCodeLabel }}</span>
            </div>
          </div>

          <div class="loading-orbit-panel">
            <div class="loading-radar">
              <div class="loading-radar-ring ring-1"></div>
              <div class="loading-radar-ring ring-2"></div>
              <div class="loading-radar-ring ring-3"></div>
              <div class="loading-radar-sweep"></div>
              <div class="loading-radar-core"></div>
            </div>
            <div class="loading-ledger">
              <div v-for="entry in resolvedLedger" :key="entry" class="ledger-line">{{ entry }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Loading...",
  },
  mode: {
    type: String,
    default: "loading",
  },
  context: {
    type: String,
    default: "generic",
  },
  title: {
    type: String,
    default: "",
  },
  barLabel: {
    type: String,
    default: "",
  },
  kicker: {
    type: String,
    default: "",
  },
  stateLabel: {
    type: String,
    default: "",
  },
  statusCode: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "",
  },
  diagnostics: {
    type: Array,
    default: () => [],
  },
  ledger: {
    type: Array,
    default: () => [],
  },
  progressCurrent: {
    type: Number,
    default: null,
  },
  progressTotal: {
    type: Number,
    default: null,
  },
  progressPercent: {
    type: Number,
    default: null,
  },
  progressMeta: {
    type: String,
    default: "",
  },
});

const LOADING_CONTEXT_PROFILES = Object.freeze({
  generic: {
    kicker: "Data Link",
    state: "ACTIVE TRANSFER",
    title: "Traveller Archive Access",
    barLabel: "Synchronizing survey archive",
    statusCode: "LINK-OPEN",
    diagnostics: [
      { label: "Route", value: "Authenticated" },
      { label: "Archive", value: "Streaming" },
      { label: "Telemetry", value: "Nominal" },
    ],
    ledger: ["Traveller Survey Systems", "Astrogation Kernel v5.110", "Imperial Date Sync: OK"],
  },
  atlas: {
    kicker: "Atlas Relay",
    state: "STAR CHART UPLINK",
    title: "Traveller Atlas Link",
    barLabel: "Reconstructing sector lattice",
    statusCode: "ATLAS-SYNC",
    diagnostics: [
      { label: "Sectors", value: "Resolving" },
      { label: "Routes", value: "Indexing" },
      { label: "Overlay", value: "Nominal" },
    ],
    ledger: ["Traveller Atlas", "Sector Mesh Cache", "Transit Ledger: Ready"],
  },
  galaxy: {
    kicker: "Survey Command",
    state: "GALAXY INDEX",
    title: "Galaxy Survey Archive",
    barLabel: "Mounting galactic registers",
    statusCode: "GAL-LOAD",
    diagnostics: [
      { label: "Morphology", value: "Scanning" },
      { label: "Sectors", value: "Enumerating" },
      { label: "Density", value: "Profiling" },
    ],
    ledger: ["Galaxy Registry", "Density Cartography", "Survey Planner: Online"],
  },
  sector: {
    kicker: "Sector Control",
    state: "HEX MATRIX",
    title: "Sector Survey Access",
    barLabel: "Resolving hex survey matrix",
    statusCode: "HEX-LOCK",
    diagnostics: [
      { label: "Hex Grid", value: "Mapping" },
      { label: "Presence", value: "Rolling" },
      { label: "Systems", value: "Queued" },
    ],
    ledger: ["Sector Survey", "Subsector Partitions", "Hex Ledger: Synced"],
  },
  stellar: {
    kicker: "Stellar Console",
    state: "PRIMARY ANALYSIS",
    title: "Stellar Survey Access",
    barLabel: "Compiling stellar profiles",
    statusCode: "STAR-CORE",
    diagnostics: [
      { label: "Spectra", value: "Sampling" },
      { label: "Orbits", value: "Modeling" },
      { label: "Bodies", value: "Queued" },
    ],
    ledger: ["Stellar Survey", "Orbital Solver", "Primary Cache: Stable"],
  },
  world: {
    kicker: "World Archive",
    state: "PLANETARY DATA",
    title: "World Survey Access",
    barLabel: "Synchronizing planetary registers",
    statusCode: "WRLD-SYNC",
    diagnostics: [
      { label: "Climate", value: "Parsing" },
      { label: "Culture", value: "Indexing" },
      { label: "Trade", value: "Nominal" },
    ],
    ledger: ["World Survey", "Census Matrix", "Planetology Core: Linked"],
  },
});

const resolvedContext = computed(() => (LOADING_CONTEXT_PROFILES[props.context] ? props.context : "generic"));
const resolvedTone = computed(() => props.tone || (props.mode === "boot" ? "boot" : "default"));

const loadingProfile = computed(() => {
  const baseProfile = LOADING_CONTEXT_PROFILES[resolvedContext.value] || LOADING_CONTEXT_PROFILES.generic;
  if (props.mode !== "boot") {
    return baseProfile;
  }

  return {
    ...baseProfile,
    kicker: "Shipboard Computer",
    state: "BOOT SEQUENCE",
    title: `${baseProfile.title} Initialization`,
    barLabel: "Calibrating navigation lattice",
    statusCode: "SYS-INIT",
    diagnostics: [
      { label: "Nav Mesh", value: "Aligning" },
      { label: "Survey Core", value: "Mounting" },
      { label: "Chart Cache", value: "Priming" },
    ],
    ledger: [baseProfile.title, "Astrogation Kernel v5.110", "Imperial Date Sync: OK"],
  };
});

const resolvedTitle = computed(() => props.title || loadingProfile.value.title);
const resolvedBarLabel = computed(() => props.barLabel || loadingProfile.value.barLabel);
const resolvedKicker = computed(() => props.kicker || loadingProfile.value.kicker);
const resolvedState = computed(() => props.stateLabel || loadingProfile.value.state);
const resolvedDiagnostics = computed(() => {
  if (Array.isArray(props.diagnostics) && props.diagnostics.length > 0) {
    return props.diagnostics;
  }
  return loadingProfile.value.diagnostics;
});
const resolvedLedger = computed(() => {
  if (Array.isArray(props.ledger) && props.ledger.length > 0) {
    return props.ledger;
  }
  return loadingProfile.value.ledger;
});
const hasProgress = computed(() => Number.isFinite(props.progressPercent));
const normalizedProgressPercent = computed(() => {
  if (!hasProgress.value) return 0;
  return Math.max(0, Math.min(100, Math.round(props.progressPercent)));
});
const progressFillStyle = computed(() =>
  hasProgress.value ? { width: `${normalizedProgressPercent.value}%`, transform: "none" } : undefined,
);
const progressCodeLabel = computed(() =>
  hasProgress.value ? `${normalizedProgressPercent.value}%` : props.statusCode || loadingProfile.value.statusCode,
);
const progressCountLabel = computed(() => {
  if (!Number.isFinite(props.progressCurrent) || !Number.isFinite(props.progressTotal)) return "";
  return `${props.progressCurrent.toLocaleString()} / ${props.progressTotal.toLocaleString()}`;
});
const progressSummaryLabel = computed(() => props.progressMeta || `${normalizedProgressPercent.value}% complete`);
</script>

<style scoped>
.loading-spinner-content {
  --loading-accent: #51c5ff;
  --loading-accent-soft: rgba(81, 197, 255, 0.35);
  --loading-accent-glow: rgba(57, 153, 209, 0.18);
  --loading-highlight: #ffd98a;
  --loading-highlight-glow: rgba(255, 217, 138, 0.75);
  --loading-grid-opacity: 0.3;
  --loading-sweep-duration: 2.8s;
  --loading-shell-inset: rgba(0, 170, 255, 0.08);
}

.loading-spinner-content.context-galaxy {
  --loading-accent: #6ec7ff;
  --loading-accent-soft: rgba(110, 199, 255, 0.35);
  --loading-accent-glow: rgba(89, 150, 255, 0.18);
}

.loading-spinner-content.context-sector {
  --loading-accent: #78efd1;
  --loading-accent-soft: rgba(120, 239, 209, 0.32);
  --loading-accent-glow: rgba(48, 181, 146, 0.16);
}

.loading-spinner-content.context-atlas {
  --loading-accent: #ffb45d;
  --loading-accent-soft: rgba(255, 180, 93, 0.28);
  --loading-accent-glow: rgba(212, 124, 43, 0.16);
  --loading-highlight: #ffe4a4;
  --loading-highlight-glow: rgba(255, 228, 164, 0.75);
}

.loading-spinner-content.context-stellar,
.loading-spinner-content.context-world {
  --loading-accent: #b597ff;
  --loading-accent-soft: rgba(181, 151, 255, 0.3);
  --loading-accent-glow: rgba(115, 90, 202, 0.16);
}

.loading-spinner-content.tone-analysis {
  --loading-grid-opacity: 0.34;
  --loading-sweep-duration: 2.35s;
}

.loading-spinner-content.tone-boot {
  --loading-grid-opacity: 0.38;
  --loading-sweep-duration: 2.1s;
  --loading-shell-inset: rgba(129, 214, 255, 0.18);
}

.loading-spinner-content.tone-fabrication {
  --loading-grid-opacity: 0.42;
  --loading-sweep-duration: 1.95s;
  --loading-shell-inset: rgba(255, 205, 112, 0.16);
}

.loading-spinner-content.tone-sync {
  --loading-grid-opacity: 0.24;
  --loading-sweep-duration: 3.25s;
  --loading-shell-inset: rgba(120, 239, 209, 0.16);
}

.loading-spinner-content.tone-ready {
  --loading-highlight: #9bffcb;
  --loading-highlight-glow: rgba(155, 255, 203, 0.72);
  --loading-grid-opacity: 0.2;
  --loading-sweep-duration: 4.4s;
  --loading-shell-inset: rgba(155, 255, 203, 0.18);
}

.loading-spinner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 18, 0.84);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  overflow: hidden;
}

.loading-spinner-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(92vw, 760px);
  min-height: min(78vh, 520px);
  padding: 2rem;
}

.loading-screen-grid,
.loading-screen-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.loading-screen-grid {
  background:
    linear-gradient(rgba(63, 198, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63, 198, 255, 0.08) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: var(--loading-grid-opacity);
}

.loading-screen-noise {
  background: linear-gradient(180deg, rgba(125, 236, 255, 0.04), transparent 16%, rgba(125, 236, 255, 0.05));
  animation: screen-flicker 3.6s linear infinite;
}

.loading-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  border: 1px solid var(--loading-accent-soft);
  border-radius: 18px;
  padding: 1.35rem;
  background:
    linear-gradient(180deg, rgba(6, 18, 32, 0.98), rgba(7, 15, 28, 0.94)),
    radial-gradient(circle at top right, var(--loading-accent-glow), transparent 35%);
  box-shadow:
    0 0 0 1px var(--loading-shell-inset) inset,
    0 24px 70px rgba(0, 0, 0, 0.42);
}

.loading-shell-header,
.loading-bar-meta,
.diagnostic-row,
.loading-ledger {
  font-family: Consolas, "Courier New", monospace;
}

.loading-shell-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.loading-kicker,
.loading-state,
.diagnostic-label {
  color: var(--loading-accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.loading-state,
.loading-percent {
  color: var(--loading-highlight);
}

.loading-title-block {
  margin-bottom: 1rem;
}

.loading-title {
  color: #e8fbff;
  font-size: clamp(1.4rem, 2vw, 1.9rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.35rem;
}

.loading-diagnostics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 1.15rem;
}

.diagnostic-row {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--loading-accent-soft);
  border-radius: 10px;
  background: rgba(10, 29, 51, 0.55);
}

.diagnostic-value {
  color: #def7ff;
  font-size: 0.95rem;
}

.loading-bar-block {
  margin-bottom: 1.25rem;
}

.loading-progress-summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
  color: #d7eef7;
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.8rem;
}

.loading-bar-track {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(31, 56, 82, 0.82);
  border: 1px solid var(--loading-accent-soft);
}

.loading-bar-fill {
  width: 38%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--loading-accent), #d4f8ff 42%, var(--loading-highlight) 90%);
  animation: loading-bar-sweep 1.6s ease-in-out infinite;
}

.loading-bar-fill.determinate {
  width: 0;
  animation: none;
  transition: width 0.2s ease;
}

.loading-bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.55rem;
  color: #95c4d6;
  font-size: 0.76rem;
}

.loading-orbit-panel {
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 1rem;
  align-items: center;
}

.loading-radar {
  position: relative;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  border: 1px solid var(--loading-accent-soft);
  background: radial-gradient(circle, rgba(54, 119, 146, 0.25), rgba(2, 11, 21, 0.18) 72%);
  overflow: hidden;
}

.loading-radar-ring,
.loading-radar-core,
.loading-radar-sweep {
  position: absolute;
  inset: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.loading-radar-ring {
  border: 1px solid var(--loading-accent-soft);
}

.ring-1 {
  width: 42px;
  height: 42px;
}

.ring-2 {
  width: 92px;
  height: 92px;
}

.ring-3 {
  width: 142px;
  height: 142px;
}

.loading-radar-core {
  width: 8px;
  height: 8px;
  background: var(--loading-highlight);
  box-shadow: 0 0 16px var(--loading-highlight-glow);
}

.loading-radar-sweep {
  width: 150px;
  height: 150px;
  background: conic-gradient(from 0deg, transparent 0deg 305deg, var(--loading-accent-soft) 345deg, transparent 360deg);
  animation: radar-sweep var(--loading-sweep-duration) linear infinite;
}

.loading-ledger {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--loading-accent-soft);
  background: rgba(8, 23, 40, 0.58);
}

.ledger-line {
  color: #d4f8ff;
  font-size: 0.86rem;
}

.spinner-message {
  color: #a9cfdf;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.45;
}

@keyframes radar-sweep {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes loading-bar-sweep {
  0% {
    transform: translateX(-72%);
  }
  50% {
    transform: translateX(85%);
  }
  100% {
    transform: translateX(-72%);
  }
}

@keyframes screen-flicker {
  0%,
  100% {
    opacity: 0.28;
  }
  50% {
    opacity: 0.44;
  }
}

@media (max-width: 720px) {
  .loading-spinner-content {
    width: min(96vw, 760px);
    min-height: auto;
    padding: 1rem;
  }

  .loading-shell {
    padding: 1rem;
  }

  .loading-diagnostics,
  .loading-orbit-panel {
    grid-template-columns: 1fr;
  }

  .loading-radar {
    width: 132px;
    height: 132px;
    margin: 0 auto;
  }

  .ring-1 {
    width: 32px;
    height: 32px;
  }

  .ring-2 {
    width: 72px;
    height: 72px;
  }

  .ring-3 {
    width: 112px;
    height: 112px;
  }
}
</style>
