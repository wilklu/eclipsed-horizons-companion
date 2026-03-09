<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="() => toast.remove()">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { subscribe } from "../../utils/toast.js";

const toasts = ref([]);
let unsubscribe = null;

function getIcon(type) {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };
  return icons[type] || "•";
}

onMounted(() => {
  unsubscribe = subscribe((newToasts) => {
    toasts.value = newToasts;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  margin-top: 0.75rem;
  border-radius: 0.5rem;
  background: #2a2a2a;
  color: #e0e0e0;
  border-left: 4px solid #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.95rem;
}

.toast-success {
  background: rgba(34, 197, 94, 0.1);
  border-left-color: #22c55e;
  color: #bbf7d0;
}

.toast-error {
  background: rgba(220, 38, 38, 0.1);
  border-left-color: #dc2626;
  color: #fca5a5;
}

.toast-info {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  color: #bfdbfe;
}

.toast-warning {
  background: rgba(217, 119, 6, 0.1);
  border-left-color: #d97706;
  color: #fed7aa;
}

.toast-icon {
  font-weight: bold;
  flex-shrink: 0;
  font-size: 1.1rem;
}

.toast-message {
  flex: 1;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
