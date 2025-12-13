<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/dices" class="nav-link">Dice Roller</router-link>
      <router-link to="/character" class="nav-link">Character</router-link>
    </nav>
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
// No need to import components here as they are handled by the router
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  background-color: #4a6da7;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.main-content {
  padding: 2rem;
}
</style>
