const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    once: (channel, func) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
    removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    loadMusic: (musicHash, musicType) => ipcRenderer.invoke('load-music', musicHash,musicType),
    getAllPlaylists: () => ipcRenderer.invoke('get-all-playlists'),
    getSongsFromPlaylist: (playlistId) => ipcRenderer.invoke('get-songs-from-playlist', playlistId),
    fetchSongs:() => ipcRenderer.invoke('fetch-songs'),
    removeSong: (songHash) => ipcRenderer.invoke('remove-song', songHash),
    removeSongFromPlaylist: (songHash,playlistId) => ipcRenderer.invoke('remove-song-from-playlist', songHash,playlistId),
    editSong: (info,songId)=> { ipcRenderer.invoke('edit-song',info,songId)},
    songsTest: ()=> ipcRenderer.invoke('songs-test'),
    createPlaylist: (songsId,playlistName,playlistNotes) => ipcRenderer.invoke('create-playlist', songsId,playlistName,playlistNotes),
    editPlaylist: (playlistId,playlistName,playlistNotes) => ipcRenderer.invoke('edit-playlist', playlistId,playlistName,playlistNotes),
    deletePlaylist: (playlistId) => ipcRenderer.invoke('delete-playlist', playlistId)
  }
})