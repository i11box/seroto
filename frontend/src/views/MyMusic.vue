<template>
  <div class="my-music-container">
    <!-- 左侧：我的歌单 -->
    <div class="playlist-container">
      <div class="playlist-header">
        <button @click="showCreateForm = !showCreateForm">创建歌单</button>
        <button @click="loadAllSongs">全局歌单</button>
        <button @click="songsTest">歌曲查询</button>
      </div>
      
      <!-- 歌单创建表单 -->
      <div v-if="showCreateForm" class="create-playlist-form">
        <h3>创建新的歌单</h3>
        <form @submit.prevent="submitPlaylist">
          <div>
            <label for="playlistName">歌单名：</label>
            <input type="text" v-model="newPlaylist.name" id="playlistName" required />
          </div>
          <div>
            <label for="playlistNotes">备注：</label>
            <input type="text" v-model="newPlaylist.notes" id="playlistNotes" />
          </div>
          <div>
            <h4>选择歌曲：</h4>
            <div v-for="song in songs" :key="song.id">
              <label>
                <input type="checkbox" v-model="selectedSongs" :value="song.id" multiple/>
                {{ song.name }} - {{ song.author }}
              </label>
            </div>
          </div>
          <button type="submit">创建</button>
          <button type="button" @click="showCreateForm = false">取消</button>
        </form>
      </div>

      <ul class="playlist-list">
        <li v-for="playlist in playlists" :key="playlist.id" @click="selectPlaylist(playlist.id)">
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
              :id="song.id"
              :notes="song.notes"
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
import { ref, onMounted, defineEmits, toRaw } from 'vue';
import SongItem from '@/components/SongItem.vue';

const playlists = ref([]);
const songs = ref([]);
const selectedPlaylistId = ref(null);
const emit = defineEmits(['play-song', 'remove-song', 'edit-song']);

// 控制表单的显示
const showCreateForm = ref(false);

// 存储新歌单的信息
const newPlaylist = ref({
  name: '',
  notes: ''
});

// 存储选择的歌曲ID
const selectedSongs = ref([]);

// 提交表单，创建歌单
const submitPlaylist = () => {
  const playlistName = newPlaylist.value.name
  const playlistNotes = newPlaylist.value.notes
  const playlistSongs = toRaw(selectedSongs.value)

  // 这里调用后端的逻辑去创建歌单，带上歌单名称，备注，和选中的歌曲
  try{
    window.electron.ipcRenderer.createPlaylist(
      playlistSongs, playlistName, playlistNotes);
  }catch(error){
    console.log(error);
    console.log(playlistSongs);
  }
  

  // 重置表单
  newPlaylist.value = { name: '', notes: '' };
  selectedSongs.value = [];
  showCreateForm.value = false;

  // 重新加载歌单
  loadAllPlaylists();
};

// 其他功能和现有代码保持不变
const songsTest = () => {
  window.electron.ipcRenderer.songsTest();
};

const removeSong = (songHash) => {
  window.electron.ipcRenderer.removeSong(songHash);
};

const editSong = (info, songId) => {
  window.electron.ipcRenderer.editSong(info, songId);
};

const playSong = (song) => {
  emit('play-song', song);
};

const loadAllPlaylists = async () => {
  playlists.value = await window.electron.ipcRenderer.getAllPlaylists();
};

const selectPlaylist = async (playlistId) => {
  selectedPlaylistId.value = playlistId;
  songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(playlistId);
};

const loadAllSongs = async () => {
  songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(undefined);
};

const fetchSongs = async () => {
  songs.value = await window.electron.ipcRenderer.fetchSongs();
};

onMounted(() => {
  loadAllPlaylists();
  fetchSongs();
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
