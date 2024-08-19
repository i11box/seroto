// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

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

  ipcMain.handle('load-music',(event, musicName) => {
    const musicPath = path.join(__dirname, 'music', musicName);
    const musicBuffer = fs.readFileSync(musicPath);
    console.log('main done');
    return musicBuffer.toString('base64'); // 将音频文件转换为 Base64 字符串
  })
}

app.whenReady().then(createWindow);

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
