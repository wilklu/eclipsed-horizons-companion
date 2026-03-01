<template>
  <div class="system-editor">
    <div v-if="isLoading">Loading system...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="system">
      <h2>{{ system.system_name }}</h2>
      <p>System ID: {{ system.system_id }}</p>
      <p>Sector: {{ system.sector }}</p>
      <p>Created: {{ formatDate(system.created_at) }}</p>
      <p style="color: #a0a0a0; margin-top: 2rem">ℹ️ Editor functionality will be implemented in Sprint 5</p>
    </div>
    <div v-else>System not found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { systemApi } from "../api/systemApi";

const route = useRoute();
const system = ref(null);
const isLoading = ref(false);
const error = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const data = await systemApi.getSystem(route.params.id);
    system.value = data;
  } catch (err) {
    error.value = "Failed to load system";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.system-editor {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  color: #00d9ff;
}

.error {
  color: #ff6b6b;
  padding: 1rem;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 4px;
}
</style>
