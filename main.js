const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const DataBaseManager = require('./database/DataBaseManager.cjs');
const db = new DataBaseManager();

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    //resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 如果你有预加载脚本
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'frontend/public/index.html'));
  win.loadURL('http://localhost:3300');
  
  // 准备播放音乐
  ipcMain.handle('load-music',(event, musicHash,musicType) => {
    const musicDir = path.join(__dirname, 'music');
    const musicPath = musicDir + '/' + musicHash + musicType;
    const musicBuffer = fs.readFileSync(musicPath);
    return musicBuffer.toString('base64'); // 将音频文件转换为 Base64 字符串
  })

  // 删除歌单
  ipcMain.handle('delete-playlist',async (event,playlistId) => {
    return await db.deletePlaylist(playlistId);
  })

  // 编辑歌单
  ipcMain.handle('edit-playlist',async (event,playlistId,playlistName,playlistNotes) => {
    return await db.editPlaylist(playlistId,playlistName,playlistNotes);
  })

  // 创建歌单
  ipcMain.handle('create-playlist',(event,songsId,playlistName,playlistNotes) => {
    return db.insertPlaylist(songsId,playlistName,playlistNotes);
  })

  // 从歌单中删除歌曲，不会删除文件
  ipcMain.handle('remove-song-from-playlist',async (event,songHash,playlistId) => {
    return await db.removeSongFromPlaylist(songHash,playlistId);
  })

  // 删除歌曲
  ipcMain.handle('remove-song',(event, songHash) => {
    return db.removeSongByHash(songHash);
  })

  // 更新歌曲
  ipcMain.handle('edit-song',(event,info,songId)=>{
    db.editSong(info,songId);
  })

  // 加载歌单
  ipcMain.handle('get-all-playlists',(event)=>{
    return db.getAllPlaylists();
  })

  // 加载歌曲
  ipcMain.handle('get-songs-from-playlist',(event, playlistId) => {
    return db.getSongsFromPlaylist(playlistId);
  })

  // 测试
  ipcMain.handle('songs-test',(event)=>{return db.searchAllSongs()})

  // 更新曲库
  ipcMain.handle('fetch-songs', async () => {
    const musicDir = path.join(__dirname, 'music');
    const files = fs.readdirSync(musicDir);
    
    // 获取数据库中所有歌曲的哈希值和文件类型
    const existingSongsHashFiletypes = await db.getAllSongsHashFileType();

    // 构建文件名
    const existingFiles = existingSongsHashFiletypes.map(element => {
      const hash = element.hash ? element.hash.toString() : ''; 
      const filetype = element.file_type ? element.file_type.toString() : ''; 
      return hash + filetype;
    });
  
    // 遍历文件夹中的文件并处理
    for (const file of files) {
      const filePath = path.join(musicDir, file);
      
      // 插入新的歌曲，并更新文件名为哈希
      await db.insertSong(filePath);
      console.log(`Added ${filePath} to database`);
    }
  
    // 移除数据库中不再存在的歌曲
    for (const oldFile of existingFiles) {
      const oldFilePath = path.join(musicDir, oldFile);
      if (!files.includes(oldFile) && fs.existsSync(oldFilePath)) {
        const fileHash = path.basename(oldFile, path.extname(oldFile)); // 获取哈希值
        await db.removeSongByHash(fileHash);
        console.log(`Removed ${oldFilePath} from database`);
      }
    }
  
    return await db.getSongsFromPlaylist(undefined);
  });
}  

app.whenReady().then(()=>{
  createWindow();
  db.aaa();
  db.createTableSongs();
  db.createTableSummary();
  db.createTablePlayLists();
  db.createTablePlaylistSongs();
});

// 关闭应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.databaseClose();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
