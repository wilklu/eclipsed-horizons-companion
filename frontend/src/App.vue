<template>
  <div id="app" class="app-container">
    <Header />
    <div class="main-content">
      <Sidebar />
      <RouterView class="page-content" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Header from "./components/common/Header.vue";
import Sidebar from "./components/common/Sidebar.vue";
import { RouterView } from "vue-router";

onMounted(() => {
  console.log("✓ Vue 3 app mounted successfully");
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #0f0f0f;
  color: #e0e0e0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #00d9ff;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00ffff;
}
</style>
