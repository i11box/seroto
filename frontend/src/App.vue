<template>
  <div id="app">
    <AppSidebar class="sidebar-custom" />
  </div>
</template>

<script setup>
  import AppSidebar from './components/AppSidebar.vue';
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  display: flex;
  height: 100vh;
  color: #b5c0ca;
}
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
.sidebar-custom {
  height: 100vh;
  flex-grow: 1;
  padding:0;
  margin: 0;
}
</style>
