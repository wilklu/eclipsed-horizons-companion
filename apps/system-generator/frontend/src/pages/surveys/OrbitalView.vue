<template>
  <div class="orbital-view-page">
    <SurveyNavigation
      :currentClass="'Orbital View'"
      :showRegenerate="false"
      :showExport="false"
      :backRoute="backRoute"
    />

    <div class="orbital-layout">
      <section class="orbital-panel orbital-panel-main">
        <h2>Orbital Simulation</h2>
        <p class="orbital-subtitle">Hex {{ hexLabel }} · Sector {{ sectorLabel }} · Primary {{ primaryLabel }}</p>

        <div class="calendar-controls">
          <button class="btn btn-secondary" @click="shiftDays(-30)">-30d</button>
          <button class="btn btn-secondary" @click="shiftDays(-7)">-7d</button>
          <button class="btn btn-secondary" @click="shiftDays(-1)">-1d</button>
          <button class="btn btn-primary" @click="setToday">Today</button>
          <button class="btn btn-secondary" @click="shiftDays(1)">+1d</button>
          <button class="btn btn-secondary" @click="shiftDays(7)">+7d</button>
          <button class="btn btn-secondary" @click="shiftDays(30)">+30d</button>
        </div>

        <div class="calendar-readout">
          <span>Galactic Date:</span>
          <strong>{{ galacticDateLabel }}</strong>
        </div>

        <svg class="orbital-svg" viewBox="-180 -180 360 360" overflow="visible">
          <rect x="-180" y="-180" width="360" height="360" fill="#050a18" rx="10" />
          <circle cx="0" cy="0" r="18" class="star-core" />

          <g v-for="body in orbitBodies" :key="body.id">
            <ellipse cx="0" cy="0" :rx="body.rx" :ry="body.ry" class="orbit-ring" :class="`ring-${body.zone}`" />
            <circle :cx="body.x" :cy="body.y" :r="body.r" :fill="body.color" class="orbit-body" />
            <text :x="body.x + body.r + 4" :y="body.y + 3" class="orbit-label">{{ body.name }}</text>
          </g>
        </svg>
      </section>

      <aside class="orbital-panel orbital-panel-side">
        <h3>Orbital Level Notes</h3>
        <p>
          This is a calendar-driven orbital layer for map context. You can step the galactic date to shift body
          positions, then open full System Survey for detailed generation.
        </p>
        <button class="btn btn-primary" @click="openSystemSurvey">⭐ Open System Survey</button>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SurveyNavigation from "../../components/common/SurveyNavigation.vue";
import { deserializeReturnRoute, serializeReturnRoute } from "../../utils/returnRoute.js";

const route = useRoute();
const router = useRouter();

const epochMs = Date.UTC(5630, 0, 1);
const currentDate = ref(new Date());

const galaxyId = computed(() => String(route.params.galaxyId || ""));
const sectorId = computed(() => String(route.params.sectorId || ""));
const hexLabel = computed(() => String(route.query.hex || "????"));
const primaryLabel = computed(() => String(route.query.star || "Unknown"));
const sectorLabel = computed(() => sectorId.value || "Unknown");

const dayIndex = computed(() => Math.floor((currentDate.value.getTime() - epochMs) / 86400000));
const galacticDateLabel = computed(() => {
  const d = currentDate.value;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} (Day ${dayIndex.value})`;
});

const orbitBodies = computed(() => {
  const t = dayIndex.value;
  const base = [
    { id: "inner-1", name: "I", rx: 42, ry: 36, period: 24, r: 3.6, color: "#dba37a", zone: "inner" },
    { id: "inner-2", name: "II", rx: 65, ry: 54, period: 52, r: 4.2, color: "#7bc0a7", zone: "hab" },
    { id: "mid-1", name: "III", rx: 92, ry: 76, period: 120, r: 4.8, color: "#75a8d8", zone: "outer" },
    { id: "mid-2", name: "IV", rx: 124, ry: 104, period: 260, r: 5.5, color: "#8da3d6", zone: "outer" },
  ];

  return base.map((body, index) => {
    const phase = ((t + index * 19) % body.period) / body.period;
    const angle = phase * Math.PI * 2;
    return {
      ...body,
      x: Math.cos(angle) * body.rx,
      y: Math.sin(angle) * body.ry,
    };
  });
});

const backRoute = computed(() => {
  const explicitReturnRoute = deserializeReturnRoute(String(route.query.returnTo || ""));
  if (explicitReturnRoute) return explicitReturnRoute;
  if (String(route.query.from || "") === "atlas") return { name: "TravellerAtlas" };
  return { name: "StarSystemBuilder", params: { galaxyId: galaxyId.value, sectorId: sectorId.value } };
});

function shiftDays(days) {
  currentDate.value = new Date(currentDate.value.getTime() + days * 86400000);
}

function setToday() {
  currentDate.value = new Date();
}

function openSystemSurvey() {
  const returnTo = serializeReturnRoute({
    name: "OrbitalView",
    params: { galaxyId: galaxyId.value, sectorId: sectorId.value },
    query: { ...route.query },
  });
  router.push({
    name: "StarSystemBuilder",
    params: { galaxyId: galaxyId.value, sectorId: sectorId.value },
    query: {
      hex: hexLabel.value,
      star: primaryLabel.value,
      from: "orbital",
      ...(returnTo ? { returnTo } : {}),
    },
  });
}
</script>

<style scoped>
.orbital-view-page {
  min-height: 100%;
  background: radial-gradient(circle at 20% 10%, #10203c, #070b1c 60%);
}

.orbital-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.orbital-panel {
  background: rgba(8, 14, 32, 0.92);
  border: 1px solid #2c4a78;
  border-radius: 10px;
  padding: 1rem;
}

.orbital-panel-main h2 {
  color: #9fe3ff;
  margin: 0 0 0.25rem;
}

.orbital-subtitle {
  color: #89aac8;
  margin: 0 0 0.75rem;
}

.calendar-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}

.calendar-readout {
  margin-bottom: 0.75rem;
  color: #b8d6f0;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.orbital-svg {
  width: 100%;
  height: 460px;
  border-radius: 8px;
}

.star-core {
  fill: #f2d27f;
  filter: drop-shadow(0 0 8px rgba(242, 210, 127, 0.8));
}

.orbit-ring {
  fill: none;
  stroke-width: 1.2;
  stroke-dasharray: 5 4;
}

.ring-inner {
  stroke: rgba(225, 135, 92, 0.55);
}

.ring-hab {
  stroke: rgba(86, 170, 125, 0.55);
}

.ring-outer {
  stroke: rgba(114, 165, 220, 0.55);
}

.orbit-body {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 0.8;
}

.orbit-label {
  fill: rgba(210, 230, 255, 0.8);
  font-size: 11px;
  font-weight: 600;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: #2f8fd0;
  color: #f0f7ff;
}

.btn-secondary {
  background: #1a2a50;
  color: #cfe2f8;
}

@media (max-width: 1000px) {
  .orbital-layout {
    grid-template-columns: 1fr;
  }

  .orbital-svg {
    height: 360px;
  }
}
</style>
