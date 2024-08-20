const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
    removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    loadMusic: (musicName) => ipcRenderer.invoke('load-music', musicName),
    getAllPlaylists: () => ipcRenderer.invoke('get-all-playlists'),
    getSongsFromPlaylist: (playlistId) => ipcRenderer.invoke('get-songs-from-playlist', playlistId),
    fetchSongs:() => ipcRenderer.invoke('fetch-songs')
  }
})