const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

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
        hash TEXT UNIQUE,
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

  // 获取歌单内所有歌曲
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

  // 获取所有歌单
  async getAllPlaylists() {
    const stmt = this.db.prepare(`SELECT DISTINCT id, playlist_cover FROM playlists`);
    return stmt.all();
  }

  // 插入歌曲
  async insertSong(filePath) {
    try {
      const mm = await import('music-metadata');

      const absoluteFilePath = path.resolve(filePath);
      const fileHash = this.calculateFileHash(absoluteFilePath);

      // 检查是否已存在相同哈希值的歌曲
      const existingSong = this.db.prepare('SELECT * FROM songs WHERE hash = ?').get(fileHash);

      if (existingSong) {
        console.log(`Song "${existingSong.name}" already exists in the database.`);
        return; // 如果歌曲已经存在，则不再插入
      }

      // 获取歌曲的元数据
      const metadata = await mm.parseFile(filePath);
      const title = path.parse(path.basename(filePath)).name;
      const { artist, album, genre, year, picture } = metadata.common;
      const duration = Math.floor(metadata.format.duration);
      const fileSize = fs.statSync(filePath).size;
      const cover = picture ? picture[0].data : null;

      // 插入新歌曲到数据库
      this.db.prepare(`
        INSERT INTO songs (duration, author, name, cover, album, release_date, file_size, genre, path, hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(duration, artist ? artist:null, title, cover, album, year, fileSize, genre ? genre.join(', ') : null, absoluteFilePath, fileHash);

      console.log(`Song "${title}" inserted successfully.`);
    } catch (error) {
      console.error('Error inserting song:', error.message);
    }
  }

  // 获取所有歌曲路径
  async getAllSongPaths() {
    let stmt = this.db.prepare(`SELECT path FROM songs`);
    return stmt.all()
  }

  // 移除指定路径的歌曲
  async removeSongByPath(filePath){
    this.db.prepare(`DELETE FROM songs WHERE path = ?`).run(filePath);
  }

  // 计算文件的哈希值（SHA-256）
  calculateFileHash(filePath) {
    
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  aaa(){
    // this.db.prepare(`delete from songs`).run()
    // this.db.prepare(`update sqlite_sequence SET seq = 0 WHERE name = 'songs'`).run()
  }
}

module.exports = DataBaseManager;

