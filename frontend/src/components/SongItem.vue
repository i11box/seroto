<template>
  <div class="song-item" @dblclick="play" @contextmenu.prevent="openContextMenu">
    <span>{{ name }} - {{ author }} - {{ album }} - {{ formatTime(duration) }}</span>

    <!-- 右键菜单 -->
    <div v-if="showMenu" class="context-menu" 
         :style="{ top: menuPosition.y + 'px', left: menuPosition.x + 'px' }">
      <div @click="edit">编辑信息</div>
      <div @click="remove">删除歌曲</div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    name: { type: String, default: 'Unknown' },
    author: { type: String, default: 'Unknown' },
    album: { type: String, default: 'Unknown' },
    duration: { type: Number, default: 0 },
  });

  const emit = defineEmits(['play', 'edit', 'remove']);

  const showMenu = ref(false);
  const menuPosition = ref({ x: 0, y: 0 });

  // 格式化时间（秒 -> 分:秒）
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // 播放歌曲
  const play = () => {
    emit('play');
  };

  // 打开右键菜单
  const openContextMenu = (event) => {
    showMenu.value = true;
    menuPosition.value = { x: event.clientX, y: event.clientY };
  };

  // 编辑歌曲信息
  const edit = () => {
    showMenu.value = false;
    emit('edit');
  };

  // 删除歌曲
  const remove = () => {
    showMenu.value = false;
    emit('remove');
  };
</script>

<style scoped>
.song-item {
  padding: 10px;
  margin-bottom: 5px;
  background-color: #333;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
}

.song-item:hover {
  background-color: #444;
}

.context-menu {
  position: absolute;
  background-color: #222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 5px;
  z-index: 1000;
  padding: 5px;
}

.context-menu div {
  padding: 5px 10px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: #555;
}
</style>
