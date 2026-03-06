<template>
  <div class="scanner-container">
    <div class="header">
      <h1>⚡ IISS STELLAR SURVEY SYSTEM ⚡</h1>
      <p>Imperial Interstellar Scout Service - Class 0 Remote Scan</p>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">SCAN STATUS:</span>
        <span class="status-value" :class="{ scanning: systemStore.isScanning }">
          {{ systemStore.isScanning ? "SCANNING" : "READY" }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">PROGRESS:</span>
        <ProgressBar :progress="systemStore.scanProgress" />
      </div>
      <div class="status-item">
        <span class="status-label">OBJECTS DETECTED:</span>
        <span class="status-value">{{ systemStore.starsCount }}</span>
      </div>
    </div>

    <ScanLog :entries="systemStore.surveyLog" />

    <div class="control-panel">
      <input v-model="systemName" type="text" placeholder="Enter system name..." :disabled="systemStore.isScanning" />
      <button @click="startScan" :disabled="systemStore.isScanning">START SCAN</button>
      <button @click="resetScan" :disabled="systemStore.isScanning">RESET</button>
      <button @click="exportData" :disabled="systemStore.starsCount === 0">EXPORT DATA</button>
    </div>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-label">SCAN STATUS:</span>
        <span class="status-value" :class="{ scanning: isScanning }">{{ status }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">PROGRESS:</span>
        <ProgressBar :progress="scanProgress" />
      </div>
      <div class="status-item">
        <span class="status-label">OBJECTS DETECTED:</span>
        <span class="status-value">{{ starsDetected.length }}</span>
      </div>
    </div>

    <ScanLog :entries="scanLog" />

    <div class="control-panel">
      <button @click="startScan" :disabled="isScanning">START SCAN</button>
      <button @click="pauseScan" :disabled="!isScanning">PAUSE</button>
      <button @click="resetScan">RESET</button>
      <button @click="exportData" :disabled="starsDetected.length === 0">EXPORT DATA</button>
    </div>
  </div>
</template>

<script>
import { useSystemStore } from "../stores/systemStore";
import ScanLog from "../components/scanner/ScanLog.vue";
import ProgressBar from "../components/scanner/ProgressBar.vue";

export default {
  name: "StellarSurveyScanner",
  components: {
    ScanLog,
    ProgressBar,
  },
  data() {
    return {
      systemName: "Test System",
    };
  },
  computed: {
    systemStore() {
      return useSystemStore();
    },
  },
  methods: {
    async startScan() {
      try {
        await this.systemStore.generateSystem({
          systemName: this.systemName,
          seed: Math.random(),
        });
      } catch (error) {
        console.error("Scan failed:", error);
      }
    },

    resetScan() {
      this.systemStore.resetSurvey();
    },

    exportData() {
      const system = this.systemStore.generatedSystem;
      if (!system) return;

      let data = `IISS STELLAR SURVEY EXPORT\n`;
      data += `===========================\n\n`;
      data += `System: ${this.systemName}\n`;
      data += `Generated: ${new Date().toISOString()}\n\n`;

      this.systemStore.starsDetected.forEach((star) => {
        data += `Designation: ${star.designation}\n`;
        data += `Class: ${star.spectralClass}${star.subtype} ${star.luminosityClass}\n`;
        data += `Mass: ${star.mass} M☉\n`;
        data += `Temperature: ${star.temperature}K\n`;
        data += `Luminosity: ${star.luminosity} L☉\n`;
        data += `Gas Giants: ${star.hasGasGiants ? "YES" : "NO"}\n`;
        data += `Planetoid Belts: ${star.hasPlanetoidBelts ? "YES" : "NO"}\n`;
        data += `---\n\n`;
      });

      const blob = new Blob([data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stellar-survey-${Date.now()}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.scanner-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 100%);
  border: 2px solid #00ff00;
  color: #00ff00;
  font-family: "Courier New", monospace;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.header {
  border-bottom: 2px solid #00ff00;
  padding-bottom: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.header h1 {
  font-size: 1.5em;
  text-shadow: 0 0 10px #00ff00;
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid #00ff00;
}

.status-item {
  display: flex;
  gap: 10px;
  font-size: 0.85em;
}

.status-label {
  color: #00aa00;
  min-width: 100px;
}

.status-value {
  color: #00ff00;
  font-weight: bold;
}

.status-value.scanning {
  animation: scan 1s ease-in-out infinite;
}

@keyframes scan {
  0%,
  100% {
    text-shadow: 0 0 5px #00ff00;
  }
  50% {
    text-shadow: 0 0 15px #00ff00;
  }
}

.control-panel {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 10px;
}

button {
  padding: 8px 20px;
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
  color: #00ff00;
  cursor: pointer;
  font-family: "Courier New", monospace;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.85em;
  letter-spacing: 1px;
}

button:hover:not(:disabled) {
  background: rgba(0, 255, 0, 0.4);
  box-shadow: 0 0 10px #00ff00;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
