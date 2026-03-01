<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3>Quick Links</h3>
      <ul>
        <li>
          <router-link to="/">📊 All Systems</router-link>
        </li>
        <li>
          <router-link to="/generate">⚡ Generate New</router-link>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3>Info</h3>
      <p class="info-text">Total Systems: {{ systemCount }}</p>
      <p class="info-text">Status: Online</p>
    </div>

    <div class="sidebar-section">
      <h3>Development</h3>
      <ul>
        <li><a href="#" @click.prevent="healthCheck">🔧 API Health</a></li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useSystemStore } from "../../stores/systemStore";
import { systemApi } from "../../api/systemApi";

const systemStore = useSystemStore();
const systemCount = computed(() => systemStore.systemCount);

const healthCheck = async () => {
  try {
    const result = await systemApi.healthCheck();
    console.log("✓ API Health:", result);
    alert("✓ Backend is running!");
  } catch (error) {
    console.error("✗ API Health Check Failed:", error);
    alert("✗ Backend is not running!");
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #1a1a1a;
  border-right: 2px solid #00d9ff;
  padding: 2rem 1rem;
  max-height: 100vh;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section h3 {
  color: #00d9ff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #00d9ff;
  padding-bottom: 0.5rem;
}

.sidebar-section ul {
  list-style: none;
  padding: 0;
}

.sidebar-section li {
  margin-bottom: 0.5rem;
}

.sidebar-section a {
  color: #e0e0e0;
  text-decoration: none;
  display: block;
  padding: 0.75rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.sidebar-section a:hover {
  background-color: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
  padding-left: 1rem;
}

.info-text {
  color: #a0a0a0;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}
</style>
