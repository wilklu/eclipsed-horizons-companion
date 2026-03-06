<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>Page not found</p>
      <p class="path">Looking for: {{ $route.path }}</p>
      <router-link to="/" class="btn-home"> ← Back to Dashboard </router-link>
    </div>
  </div>
</template>

<script setup>
// No setup needed for 404 page
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.content h1 {
  font-size: 5rem;
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.content p {
  font-size: 1.2rem;
  margin: 1rem 0;
}

.path {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  word-break: break-all;
}

.btn-home {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 0.25rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.btn-home:hover {
  transform: translateY(-2px);
}
</style>
