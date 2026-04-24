<template>
  <Teleport to="body">
    <div class="toast-container" role="log" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
          @click="toastStore.remove(toast.id)"
        >
          <span class="toast__icon" aria-hidden="true">{{ iconFor(toast.type) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" type="button" aria-label="Dismiss" @click.stop="toastStore.remove(toast.id)">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from "../../stores/toastStore.js";

const toastStore = useToastStore();

function iconFor(type) {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  if (type === "warning") return "⚠";
  return "ℹ";
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 24rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #f0f0f0;
  background: #2a2a2a;
  border-left: 3px solid #555;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  pointer-events: all;
}

.toast--success {
  border-left-color: #4ade80;
  background: #1a2e22;
}
.toast--error {
  border-left-color: #f87171;
  background: #2e1a1a;
}
.toast--warning {
  border-left-color: #fbbf24;
  background: #2e2510;
}
.toast--info {
  border-left-color: #60a5fa;
  background: #1a2233;
}

.toast__icon {
  flex-shrink: 0;
  font-weight: bold;
}
.toast--success .toast__icon {
  color: #4ade80;
}
.toast--error .toast__icon {
  color: #f87171;
}
.toast--warning .toast__icon {
  color: #fbbf24;
}
.toast--info .toast__icon {
  color: #60a5fa;
}

.toast__message {
  flex: 1;
  word-break: break-word;
}

.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  line-height: 1;
}
.toast__close:hover {
  color: #ccc;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
