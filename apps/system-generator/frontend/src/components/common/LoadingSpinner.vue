<template>
  <div v-if="isVisible" class="loading-spinner-overlay">
    <div class="loading-spinner-content">
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="message" class="spinner-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Loading...",
  },
});
</script>

<style scoped>
.loading-spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.loading-spinner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  position: relative;
  width: 80px;
  height: 80px;
  animation: spin-container 2s linear infinite;
}

.spinner-ring {
  box-sizing: border-box;
  position: absolute;
  width: 80px;
  height: 80px;
  border: 4px solid transparent;
  border-radius: 50%;
  border-top-color: #60a5fa;
  animation: spin-ring 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.375s;
  border-top-color: #3b82f6;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.75s;
  border-top-color: #1e40af;
}

.spinner-ring:nth-child(4) {
  animation-delay: -1.125s;
  border-top-color: #1e3a8a;
}

@keyframes spin-container {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-ring {
  0% {
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(96, 165, 250, 0.8);
  }
  100% {
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }
}

.spinner-message {
  color: #e5e7eb;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}
</style>
