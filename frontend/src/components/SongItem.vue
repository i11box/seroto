<template>
  <div class="song-item" @dblclick="play" @contextmenu.prevent="openContextMenu">
    <span>{{ name }} - {{ author }} - {{ album }} - {{ formatTime(duration) }}</span>

    <!-- 右键菜单 -->
    <div v-if="showMenu" class="context-menu" 
         :style="{ top: menuPosition.y + 'px', left: menuPosition.x + 'px' }" ref="contextMenu">
      <div @click="edit">编辑信息</div>
      <div @click="confirmRemove">删除歌曲</div>
    </div>

    <!-- 编辑信息表单 -->
    <div v-if="showEditForm" class="edit-form">
      <h3>编辑歌曲信息</h3>
      <label>
        歌曲名称:
        <input v-model="editedName" type="text" />
      </label>
      <label>
        作者:
        <input v-model="editedAuthor" type="text" />
      </label>
      <label>
        专辑:
        <input v-model="editedAlbum" type="text" />
      </label>
      <label>
        备注:
        <input v-model="editedNotes" type="text" />
      </label>
      <button @click="submitEdit">提交</button>
      <button @click="cancelEdit">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  name: { type: String, default: 'Unknown' },
  author: { type: String, default: 'Unknown' },
  album: { type: String, default: 'Unknown' },
  duration: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  id: { type: Number, default: null },
});

const emit = defineEmits(['play', 'edit', 'remove']);

const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const contextMenu = ref(null);

// 控制编辑表单的显示
const showEditForm = ref(false);
const editedName = ref(props.name);
const editedAuthor = ref(props.author);
const editedNotes = ref(props.notes);
const editedAlbum = ref(props.album);

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
  showEditForm.value = true;
};

// 提交编辑信息
const submitEdit = () => {
  emit('edit', { 
    name: editedName.value, 
    author: editedAuthor.value, 
    album: editedAlbum.value,
    notes:editedNotes.value
  },props.id);
  showEditForm.value = false;
};

// 取消编辑
const cancelEdit = () => {
  showEditForm.value = false;
};

// 删除歌曲前确认
const confirmRemove = () => {
  const confirmation = confirm("确定要删除这首歌曲吗？此操作会同步删除磁盘上的文件！");
  if (confirmation) {
    emit('remove');
  }
  showMenu.value = false;
};

// 点击菜单外部时关闭菜单
const handleClickOutside = (event) => {
  if (contextMenu.value && !contextMenu.value.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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

.edit-form {
  margin-top: 10px;
  background-color: #222;
  padding: 10px;
  border-radius: 5px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-form input {
  width: 100%;
  padding: 5px;
  margin-top: 5px;
  background-color: #333;
  border: none;
  border-radius: 3px;
  color: #fff;
}

.edit-form button {
  padding: 5px 10px;
  background-color: #555;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  color: #fff;
}

.edit-form button:hover {
  background-color: #666;
}
</style>
