<template>
  <div class="survey-unavailable">
    <div class="survey-unavailable-card">
      <p class="survey-kicker">Route unavailable</p>
      <h1>{{ title }}</h1>
      <p class="survey-copy">
        This screen is temporarily disabled on this branch because its supporting frontend modules are missing.
        Traveller Atlas, Galaxy Survey, and Orbital View remain available.
      </p>
      <div class="survey-actions">
        <button class="action action-primary" type="button" @click="router.push({ name: 'TravellerAtlas' })">
          Open Traveller Atlas
        </button>
        <button class="action action-secondary" type="button" @click="router.push({ name: 'GalaxySurvey' })">
          Open Galaxy Survey
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const title = computed(() => String(route.meta?.title || "Survey Unavailable"));
</script>

<style scoped>
.survey-unavailable {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background:
    radial-gradient(circle at top, rgba(44, 74, 120, 0.28), transparent 40%),
    linear-gradient(180deg, #08101f, #0d1528 60%, #10182d);
}

.survey-unavailable-card {
  width: min(680px, 100%);
  padding: 2rem;
  border: 1px solid rgba(102, 163, 255, 0.28);
  border-radius: 18px;
  background: rgba(8, 14, 28, 0.9);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}

.survey-kicker {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  color: #7fb8ff;
}

h1 {
  margin: 0 0 0.75rem;
  color: #f2f7ff;
}

.survey-copy {
  margin: 0;
  line-height: 1.6;
  color: #b8c7de;
}

.survey-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.action {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.action-primary {
  background: #4ba3ff;
  color: #07121f;
}

.action-secondary {
  background: #172640;
  color: #d7e8ff;
}
</style>
