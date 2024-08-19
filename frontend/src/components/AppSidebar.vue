<template>
  <aside class="sidebar">
    <img alt="logo" src="../assets/logo.png" class="logo">
    <!-- 导航项 -->
    <nav class="nav">
      <router-link to="/mymusic" class="router-link">
        <AppLabel class="navlabel">我的音乐</AppLabel>
      </router-link>
      <router-link to="/mydata" class="router-link">
        <AppLabel class="navlabel">我的数据</AppLabel>
      </router-link>
      <router-link to="/formatconvert" class="router-link">
        <AppLabel class="navlabel">格式转换</AppLabel>
      </router-link>
      <router-link to="/mysettings" class="router-link">
        <AppLabel class="navlabel">个人设置</AppLabel>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import AppLabel from './AppLabel.vue';
</script>

<style scoped>
.sidebar {
  background-color: #22212C;
  width: 18vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 0;
}

.logo {
  width: 50%; 
  margin-top: 5vh;
  margin-bottom: 6vh;
}

.nav {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* .router-link{
  margin-top: 4vh;
  margin-bottom: 4vh;
} */

.navlabel {
  margin-top: 4vh;
  margin-bottom: 4vh;
}

.router-link-active .navlabel {
  background-color: #C570C9; /* 激活时的背景颜色 */
}

.router-link-active .navlabel h2 {
  color: #ffffff; /* 激活时的文字颜色 */
}
</style>
