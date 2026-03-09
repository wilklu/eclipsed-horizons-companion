<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="retry" class="btn btn-primary">🔄 Retry</button>
        <button @click="goHome" class="btn btn-secondary">🏠 Go Home</button>
      </div>
      <details v-if="errorDetails" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  errorTitle: {
    type: String,
    default: "Something went wrong",
  },
  errorMessage: {
    type: String,
    default: "We encountered an unexpected error. Please try again or return home.",
  },
});

const emit = defineEmits(["retry"]);
const router = useRouter();

const hasError = ref(false);
const errorDetails = ref(null);

function showError(error) {
  hasError.value = true;
  errorDetails.value = error?.stack || error?.message || String(error);
}

function retry() {
  hasError.value = false;
  errorDetails.value = null;
  emit("retry");
}

function goHome() {
  hasError.value = false;
  errorDetails.value = null;
  router.push({ name: "GalaxySurvey" });
}

// Expose showError method for parent components
defineExpose({ showError });
</script>

<style scoped>
.error-boundary {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  max-width: 600px;
  text-align: center;
  background: rgba(139, 0, 0, 0.1);
  border: 2px solid rgba(220, 38, 38, 0.3);
  border-radius: 8px;
  padding: 3rem 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #ff6b6b;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.error-message {
  color: #e0e0e0;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #00d9ff;
  color: #0a0a1a;
}

.btn-primary:hover {
  background: #00b8d4;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.error-details {
  text-align: left;
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  cursor: pointer;
}

.error-details summary {
  color: #00d9ff;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-details pre {
  color: #ff6b6b;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}
</style>
