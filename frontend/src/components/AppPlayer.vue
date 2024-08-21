<template>
  <div class="player-bar">
    <!-- 音乐控制按钮 -->
    <button @click="prevTrack" class="control-button">
      <i class="fa fa-step-backward"></i>
    </button>
    <button @click="togglePlay" class="control-button">
      <span v-if="isPlaying">
        <i class="fa fa-stop"></i>
      </span>
      <span v-else>
        <i class="fa fa-play"></i>
      </span>
    </button>
    <button @click="nextTrack" class="control-button">
      <i class="fa fa-step-forward"></i>
    </button>

    <div class="progress-container">
      <span>{{ formatTime(currentTime) }}</span>
      <input type="range" min="0" :max="duration" v-model="currentTime" @input="seek" class="progress-bar" />
      <span>{{ formatTime(duration) }}</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, onUnmounted, inject,watch } from 'vue';
  import '../../../service/Config.js'
  import 'font-awesome/css/font-awesome.min.css'

  const audio = new Audio(); // 创建一个 Audio 对象
  const isPlaying = ref(false); // 播放状态
  const currentTime = ref(0); // 当前播放时间
  const duration = ref(0); // 音频总时长
  const currentSong = inject('currentSong'); // 从父组件注入当前歌曲信息

  // 播放/暂停切换
  const togglePlay = () => {
    if (isPlaying.value) {
      audio.pause();
    } else {
      audio.play();
    }
    isPlaying.value = !isPlaying.value;
  };

  // 跳转到上一首歌曲
  const prevTrack = () => {
    // 实现你的上一首逻辑
    console.log('上一首');
  };

  // 跳转到下一首歌曲
  const nextTrack = () => {
    // 实现你的下一首逻辑
    console.log('下一首');
  };

  // 格式化时间（秒 -> 分:秒）
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const loadSong = async () => {
    if (currentSong.value) {
      try {
        console.log(currentSong.value);
        const musicData = await window.electron.ipcRenderer.loadMusic(currentSong.value.hash,currentSong.value.file_type);
        audio.src = `data:audio/mp3;base64,${musicData}`;
        audio.play();
        isPlaying.value = true;

        // 当音频加载完成时，更新总时长
        audio.addEventListener('loadedmetadata', () => {
          duration.value = audio.duration;
        });

        // 当音频播放时，更新当前播放时间
        audio.addEventListener('timeupdate', () => {
          currentTime.value = audio.currentTime;
        });

      } catch (e) {
        console.error(e);
      }
    }
  };

  // 监听歌曲名变化
  watch(currentSong, () => {
    loadSong();
  });

  // 解绑事件监听器
  onUnmounted(() => {
    audio.removeEventListener('loadedmetadata', () => { });
    audio.removeEventListener('timeupdate', () => { });
  });

  // 实现进度条跳转
  const seek = () => {
    audio.currentTime = currentTime.value;
  };
</script>

<style scoped>
.player-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #22212C;
  color: #ffffff;
}

.control-button {
  font-size: 1.5rem;
  margin: 0 10px;
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
}

.progress-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-left: 20px;
}

.progress-bar {
  flex-grow: 1;
  margin: 0 10px;
}
</style>
