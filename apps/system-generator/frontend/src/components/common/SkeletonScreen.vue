<template>
  <div class="skeleton-screen">
    <div class="skeleton-header">
      <div class="skeleton-box skeleton-title"></div>
      <div class="skeleton-box skeleton-subtitle"></div>
    </div>
    <div class="skeleton-content">
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
        <div class="skeleton-box skeleton-cell"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: {
    type: Number,
    default: 5,
  },
});
</script>

<style scoped>
.skeleton-screen {
  padding: 2rem;
  width: 100%;
}

.skeleton-header {
  margin-bottom: 2rem;
}

.skeleton-box {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 32px;
  width: 60%;
  margin-bottom: 0.75rem;
}

.skeleton-subtitle {
  height: 20px;
  width: 40%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-row {
  display: flex;
  gap: 1rem;
}

.skeleton-cell {
  height: 48px;
  flex: 1;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
