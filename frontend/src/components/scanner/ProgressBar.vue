<template>
  <div class="scan-progress">
    <div class="scan-progress-bar" :style="{ width: progress + '%' }"></div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    progress: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100,
    },
  },
};
</script>

<style scoped>
.scan-progress {
  width: 200px;
  height: 8px;
  border: 1px solid #00ff00;
  background: rgba(0, 255, 0, 0.1);
  overflow: hidden;
  border-radius: 2px;
}

.scan-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #00aa00);
  width: 0%;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px #00ff00;
}
</style>
