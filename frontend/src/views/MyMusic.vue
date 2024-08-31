<template>
  <div class="my-music-container">
    <!-- 左侧：我的歌单 -->
    <div class="playlist-container">
      <div class="playlist-header">
        <button @click="showCreateForm = !showCreateForm">创建歌单</button>
        <button @click="globalPlaylists">全局歌单</button>
        <button @click="songsTest">歌曲查询</button>
        <!-- 搜索歌单 -->
        <input type="text" v-model="playlistSearchQuery" 
                           placeholder="搜索歌单..." 
                           @input="searchPlaylist" />
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
      <li v-for="playlist in playlists" :key="playlist.id" 
          @click="selectPlaylist(playlist.id)"
          @contextmenu.prevent = "openContextMenu($event,playlist)">
        {{ playlist.name }}
      </li>
    </ul>
    </div>

    <div v-if="showContextMenu" :style="{top: contextMenuPosition.y+ 'px',
                                         left: contextMenuPosition.x + 'px'}"
                                class="context-menu">
      <ul>
        <li @click="editPlaylist()">编辑歌单</li>
        <li @click="deletePlaylist(selectedPlaylistId)">删除歌单</li>
      </ul>
    </div>

    <!-- 编辑歌单信息的表单 -->
    <div v-if="showEditForm" class="edit-playlist-form">
      <h3>编辑歌单信息</h3>
      <form @submit.prevent="submitEditPlaylist">
        <div>
          <label for="editPlaylistName">歌单名：</label>
          <input type="text" v-model="selectedPlaylist.name" id="editPlaylistName" required />
        </div>
        <div>
          <label for="editPlaylistNotes">备注：</label>
          <input type="text" v-model="selectedPlaylist.notes" id="editPlaylistNotes" />
        </div>
        <button type="submit">保存</button>
        <button type="button" @click="showEditForm = false">取消</button>
      </form>
    </div>

    <!-- 右侧：歌曲列表 -->
    <div class="song-list-container">
      <button @click="fetchSongs">刷新</button>
      <!-- 搜索歌曲 -->
      <input type="text" v-model="songSearchQuery" 
                         placeholder="搜索歌曲..." 
                         @input="searchSong" />
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
// 被选中的歌单
const selectedPlaylist = ref({
  id: null,
  name: '',
  notes: ''
})
const emit = defineEmits(['play-song', 'remove-song', 'edit-song']);

const showContextMenu = ref(false);              // 控制歌单处的菜单的显示
const contextMenuPosition = ref({ x: 0, y: 0 }); // 菜单位置
const showEditForm = ref(false);                // 控制编辑歌单信息的表单的显示
const showCreateForm = ref(false);              // 控制创建歌单表单的显示

const playlistSearchQuery = ref('');
const songSearchQuery = ref('');

// 存储新歌单的信息
const newPlaylist = ref({
  name: '',
  notes: ''
});

// 存储选择的歌曲ID
const selectedSongs = ref([]);

// 搜索歌单
const searchPlaylist = async () => {
  playlists.value = await window.electron.ipcRenderer.searchPlaylist(playlistSearchQuery.value);
}

// 搜索歌曲
const searchSong = async () => {
  songs.value = await window.electron.ipcRenderer.searchSong(songSearchQuery.value, selectedPlaylistId.value);
}

// 全局歌单
const globalPlaylists = () => {
  selectedPlaylistId.value = null;
  selectedPlaylist.value = { id: null, name: '', notes: '' };
  loadAllSongs()
}

// 开启歌单处的菜单
const openContextMenu = (event, playlist) => {
  selectedPlaylist.value = { ...playlist }; // 复制歌单信息到selectedPlaylist
  selectedPlaylistId.value = playlist.id;
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  showContextMenu.value = true;
};

// 关闭菜单
const closeContextMenu = () => {
  showContextMenu.value = false;
}

// 编辑歌单
const editPlaylist = () => {
  showEditForm.value = true;
}

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
  console.log(selectedPlaylist.value)
  window.electron.ipcRenderer.songsTest();
};

const removeSong = (songHash) => {
  if(Object.is(selectedPlaylistId.value, null))
    window.electron.ipcRenderer.removeSong(songHash);
  else
    window.electron.ipcRenderer.removeSongFromPlaylist(songHash, selectedPlaylistId.value);
  fetchSongs();
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

const submitEditPlaylist = () => {
  window.electron.ipcRenderer.editPlaylist(
    selectedPlaylistId.value, 
    selectedPlaylist.value.name, 
    selectedPlaylist.value.notes
  );
  showEditForm.value = false;
  loadAllPlaylists();
}

const deletePlaylist = (playlistId) => {
  window.electron.ipcRenderer.deletePlaylist(playlistId);
  closeContextMenu();
  loadAllPlaylists();
}

const selectPlaylist = async (playlistId) => {
  selectedPlaylistId.value = playlistId;
  selectedPlaylist.value = playlists.value.find(playlist => playlist.id === playlistId);
  songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(playlistId);
};

const loadAllSongs = async () => {
  songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(undefined);
};

const fetchSongs = async () => {
  await window.electron.ipcRenderer.fetchSongs();
  if(!Object.is(selectedPlaylistId.value, null))
    songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(selectedPlaylistId.value);
  else
    songs.value = await window.electron.ipcRenderer.getSongsFromPlaylist(undefined);
};

onMounted(() => {
  loadAllPlaylists();
  fetchSongs();
});

// 关闭歌单处的右键菜单
window.addEventListener('click',closeContextMenu)
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
