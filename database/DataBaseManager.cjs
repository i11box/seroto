const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class DataBaseManager {
  constructor() {
    this.db = new Database(path.join(__dirname, 'music.db'), { verbose: console.log });
  }

  async createTableSongs() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER,
        author TEXT,
        name TEXT,
        cover BLOB,
        album TEXT,
        release_date TEXT,
        file_size INTEGER,
        play_count INTEGER DEFAULT 0,
        genre TEXT,
        path TEXT UNIQUE,
        notes TEXT
      )
    `).run();
  }

  async createTablePlayLists() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        song_id INTEGER,
        playlist_cover BLOB,
        creator TEXT,
        play_count INTEGER DEFAULT 0,
        notes TEXT,
        FOREIGN KEY(song_id) REFERENCES songs(id)
      )
    `).run();
  }

  async createTableSummary() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS summaries (
        year INTEGER,
        month INTEGER,
        first_use_time TEXT,
        total_songs_played INTEGER,
        total_play_duration INTEGER
      )
    `).run();
  }

  async getSongsFromPlaylist(playlist_id) {
    let stmt;
    if (playlist_id === undefined) {
      stmt = this.db.prepare(`SELECT * FROM songs`);
      return stmt.all();
    } else {
      stmt = this.db.prepare('SELECT songs.* FROM songs, playlists WHERE playlists.id = ? AND songs.id = playlists.song_id');
      return stmt.all(playlist_id);
    }
  }

  async getAllPlaylists() {
    const stmt = this.db.prepare(`SELECT DISTINCT id, playlist_cover FROM playlists`);
    return stmt.all();
  }

  async insertSong(filePath) {
    const { parseFile } = await import('music-metadata');  // 动态导入 music-metadata 模块
    try {
      const metadata = await parseFile(filePath);
      const { title, artist, album, genre, year, picture } = metadata.common;
      const duration = Math.floor(metadata.format.duration);
      const fileSize = fs.statSync(filePath).size;

      const cover = picture ? picture[0].data : null;

      this.db.prepare(`
        INSERT INTO songs (duration, author, name, cover, album, release_date, file_size, genre, path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(duration, artist, title, cover, album, year, fileSize, genre ? genre.join(', ') : null, filePath);

      console.log('Song inserted successfully.');
    } catch (error) {
      console.error('Error inserting song:', error.message);
    }
  }
}

module.exports = DataBaseManager;

