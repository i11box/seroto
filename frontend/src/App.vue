<template>
  <div id="app">
    <div class="layout">
      <AppSidebar class="sidebar-custom" />
      <router-view class="view MyMusic" name="MyMusic" />
      <router-view class="view MyData" name="MyData" />
      <router-view class="view FormatConverter" name="FormatConverter" />
      <router-view class="view MySettings" name="MySettings" />
      <div class="content">
        <AppPlayer class = "player-bar" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import AppSidebar from './components/AppSidebar.vue';
  import AppPlayer from './components/AppPlayer.vue';

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

.layout {
  display: flex;
  height: 100%;
  flex-grow: 1;
}

.sidebar-custom {
  height: 100vh;
  flex-grow: 1;
  padding:0;
  margin: 0;
}

.content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.player-bar {
  width: 80%;
  background-color: #333;
  /* padding: 10px; */
  color: #ffffff;
  /* display: flex; */
  align-items: center;
  /* justify-content: space-between; */
  position: absolute;
  bottom: 0;
  left: 18.25%;
}
</style>
