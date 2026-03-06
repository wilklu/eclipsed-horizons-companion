<template>
  <header class="header">
    <div class="header-container">
      <h1 class="logo">
        <router-link to="/">🌌 Eclipsed Horizon</router-link>
      </h1>
      <nav class="nav">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/generate" class="nav-link btn-primary"> + Generate System </router-link>
        <router-link to="/scanner" class="nav-link">Stellar Scanner</router-link>
        <router-link to="/generate-system" class="nav-link">Generate System</router-link>
        <router-link to="/system-editor" class="nav-link">Editor</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.header {
  background-color: #1a1a1a;
  border-bottom: 2px solid #00d9ff;
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 217, 255, 0.2);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d9ff;
  margin: 0;
}

.logo a {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s;
}

.logo a:hover {
  color: #00ffff;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #e0e0e0;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  background-color: rgba(0, 217, 255, 0.1);
  color: #00d9ff;
}

.nav-link.router-link-active {
  color: #00d9ff;
  border-bottom: 2px solid #00d9ff;
}

.btn-primary {
  background-color: #00d9ff;
  color: #000;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
}

.btn-primary:hover {
  background-color: #00ffff;
  box-shadow: 0 0 10px #00d9ff;
}
</style>
