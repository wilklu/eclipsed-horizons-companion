<template>
  <div class="dashboard">
    <h2>Star Systems</h2>

    <div v-if="isLoading" class="loading">Loading systems...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="systems.length === 0" class="empty-state">
        <p>No systems yet. <router-link to="/generate">Create one!</router-link></p>
      </div>

      <div v-else class="systems-grid">
        <div v-for="system in systems" :key="system.system_id" class="system-card">
          <h3>{{ system.system_name }}</h3>
          <p><strong>Sector:</strong> {{ system.sector }}</p>
          <p><strong>Created:</strong> {{ formatDate(system.created_at) }}</p>
          <div class="card-actions">
            <router-link :to="`/system/${system.system_id}`" class="btn btn-secondary"> Edit </router-link>
            <button @click="deleteSystem(system.system_id)" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useSystemStore } from "../stores/systemStore";
import { systemApi } from "../api/systemApi";

const systemStore = useSystemStore();
const isLoading = ref(false);
const error = ref(null);

const systems = computed(() => systemStore.systems);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const loadSystems = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const data = await systemApi.getAllSystems();
    systemStore.setSystems(data);
  } catch (err) {
    error.value = "Failed to load systems";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const deleteSystem = async (id) => {
  if (confirm("Are you sure?")) {
    try {
      await systemApi.deleteSystem(id);
      loadSystems();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }
};

onMounted(() => {
  loadSystems();
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #00d9ff;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  font-size: 1.1rem;
}

.error {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #a0a0a0;
}

.empty-state a {
  color: #00d9ff;
  text-decoration: none;
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.system-card {
  background-color: #1a1a1a;
  border: 2px solid #00d9ff;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.system-card:hover {
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
  transform: translateY(-2px);
}

.system-card h3 {
  color: #00d9ff;
  margin-top: 0;
}

.system-card p {
  color: #a0a0a0;
  margin: 0.5rem 0;
}

.card-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
  display: block;
}

.btn-secondary {
  background-color: #00d9ff;
  color: #000;
}

.btn-secondary:hover {
  background-color: #00ffff;
  box-shadow: 0 0 10px #00d9ff;
}

.btn-danger {
  background-color: #ff6b6b;
  color: #fff;
}

.btn-danger:hover {
  background-color: #ff5252;
  box-shadow: 0 0 10px #ff6b6b;
}
</style>
