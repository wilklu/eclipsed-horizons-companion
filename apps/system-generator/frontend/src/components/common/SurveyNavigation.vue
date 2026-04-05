<template>
  <div class="survey-navigation">
    <div class="survey-breadcrumb">
      <span class="breadcrumb-current">{{ currentClass }}</span>
    </div>
    <div class="survey-actions">
      <button v-if="showRegenerate" class="btn btn-secondary" @click="$emit('regenerate')">
        {{ regenerateLabel }}
      </button>
      <button v-if="showExport" class="btn btn-secondary" @click="$emit('export')">📤 Export</button>
      <router-link v-if="backRoute" :to="backRoute" class="btn btn-outline"> ← Back </router-link>
    </div>
  </div>
</template>

<script setup>
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
  regenerateLabel: {
    type: String,
    default: "🔄 Regenerate",
  },
  showExport: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["regenerate", "export"]);
</script>

<style scoped>
.survey-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.breadcrumb-current {
  color: #00d9ff;
  font-weight: bold;
  font-size: 1rem;
}

.survey-actions {
  display: flex;
  gap: 0.75rem;
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
</style>
