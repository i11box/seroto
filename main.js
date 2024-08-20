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
  ipcMain.handle('load-music',(event, musicName) => {
    const musicPath = path.join(__dirname, 'music', musicName);
    const musicBuffer = fs.readFileSync(musicPath);
    console.log('main done');
    return musicBuffer.toString('base64'); // 将音频文件转换为 Base64 字符串
  })

  // 加载歌单
  ipcMain.handle('get-all-playlists',(event)=>{
    return db.getAllPlaylists();
  })

  // 加载歌曲
  ipcMain.handle('get-songs-from-playlist',(event, playlistId) => {
    return db.getSongsFromPlaylist(playlistId);
  })

  // 刷新曲库

  ipcMain.handle('fetch-songs', async () => {
    const musicDir = path.join(__dirname, 'music');
    const files = fs.readdirSync(musicDir);
    const existingPaths = await db.getAllSongPaths(); // 从数据库获取所有歌曲的路径
  
    // 遍历文件夹中的文件
    for (const file of files) {
      const filePath = path.join(musicDir, file);
      const normalizedPath = path.normalize(filePath);
      
      if (existingPaths.includes(normalizedPath)) 
        // 如果歌曲已经在数据库中，移除路径列表中的该条记录
        existingPaths.splice(existingPaths.indexOf(normalizedPath), 1);

      await db.insertSong(filePath);
      console.log(`Added ${filePath} to database`);
    }
  
    // 现在existingPaths 中剩下的路径都是已被删除的歌曲
    existingPaths.forEach(element => {
      console.log(element)
    });

    for (const oldPath of existingPaths) {
      console.log(oldPath);
      await db.removeSongByPath(oldPath);
    }

    return await db.getSongsFromPlaylist(undefined)
  });
}

app.whenReady().then(()=>{
  createWindow();
  db.createTableSongs();
  db.createTableSummary();
  db.createTablePlayLists();
  db.aaa();
});

// 关闭应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
