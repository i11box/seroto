<template>
  <div class="my-music-container">
    <!-- 左侧：我的歌单 -->
    <div class="playlist-container">
      <div class="playlist-header">
        <button @click="createPlaylist">创建歌单</button>
        <button @click="loadAllSongs">全局歌单</button>
        <button @click="songsTest">歌曲查询</button>
      </div>
      <ul class="playlist-list">
        <li v-for="playlist in playlists" :key="playlist.id" @click="selectPlaylist(playlist.id)">
          <img :src="playlist.playlist_cover" alt="封面" />
        </li>
      </ul>
    </div>

    <!-- 右侧：歌曲列表 -->
    <div class="song-list-container">
      <button @click="fetchSongs">刷新</button>
      <ul class="song-list">
        <li v-for="song in songs" :key="song.id">
          <div class="song-info">
            <SongItem 
            :name="song.name" 
            :author="song.author" 
            :album="song.album" 
            :duration="song.duration"
            :id = "song.id"
            :notes = "song.notes"
            @play="playSong(song)"
            @edit="editSong"
            @remove="removeSong(song.hash)"
          />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted,defineEmits } from 'vue';
  import SongItem from '@/components/SongItem.vue';

  const playlists = ref([]);
  const songs = ref([]);
  const selectedPlaylistId = ref(null);
  const emit = defineEmits(['play-song','remove-song','edit-song']);

  // 测试
  const songsTest = () => {
    window.electron.ipcRenderer.songsTest();
  }

  // 删除歌曲
  const removeSong = (songHash) => {
    window.electron.ipcRenderer.removeSong(songHash);
  }

  // 更新歌曲信息
  const editSong = (info,songId) => {
    window.electron.ipcRenderer.editSong(info,songId);
  }

  // 播放歌曲
  const playSong = (song) => {
    emit('play-song', song);
  }

  // 加载所有歌单
  const loadAllPlaylists = async () => {
    playlists.value = await window.electron.ipcRenderer.getAllPlaylists();
  };

  // 选择歌单后加载其中的歌曲
  const selectPlaylist = async (playlistId) => {
    selectedPlaylistId.value = playlistId;
    songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(playlistId);
  };

  // 加载所有歌曲
  const loadAllSongs = async () => {
    songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(undefined);
  };

  // 创建歌单
  const createPlaylist = () => {
    // 实现创建歌单的逻辑
  };

  // 刷新曲库
  const fetchSongs = async () => {
    songs.value = await window.electron.ipcRenderer.fetchSongs();
  };

  onMounted(() => {
    loadAllPlaylists();
  });
</script>

<style scoped>
.my-music-container {
  display: flex;
  height: 100%;
}

.playlist-container {
  width: 30%;
  padding: 20px;
  background-color: #f4f4f4;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.playlist-list {
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
}

.playlist-list li {
  margin: 10px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.playlist-list img {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.song-list-container {
  width: 70%;
  padding: 20px;
  overflow-y: auto;
}

.song-list {
  list-style-type: none;
  padding: 0;
}

.song-list li {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

.song-list img {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.song-info {
  display: flex;
  flex-direction: column;
}

.song-info span {
  margin-bottom: 5px;
}
</style>
