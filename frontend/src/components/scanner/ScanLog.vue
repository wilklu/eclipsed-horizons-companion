<template>
  <div class="scan-log">
    <div v-for="(entry, idx) in entries" :key="idx" :class="['log-line', `log-${entry.type}`]">
      <span class="log-timestamp">[{{ entry.timestamp }}]</span>
      <span class="log-message">{{ entry.message }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScanLog",
  props: {
    entries: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.scan-log {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  border: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.02);
  margin-bottom: 15px;
}

.log-line {
  margin: 5px 0;
  line-height: 1.4;
}

.log-timestamp {
  color: #0088ff;
  min-width: 120px;
  display: inline-block;
}

.log-message {
  color: #00ff00;
}

.log-warning {
  color: #ffaa00;
}

.log-error {
  color: #ff0000;
}
</style>
