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
        hash TEXT UNIQUE,
        notes TEXT,
        file_type TEXT
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
      const { title,artist, album, genre, year, picture } = metadata.common;
      const duration = Math.floor(metadata.format.duration);
      const fileSize = fs.statSync(filePath).size;
      const cover = picture ? picture[0].data : null;
      const fileType = path.extname(filePath);
      // 插入新歌曲到数据库
      this.db.prepare(`
        INSERT INTO songs (duration, author, name, cover, album, release_date, file_size, genre, hash, file_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
      `).run(duration, artist ? artist:'null', title?title:'unknown', cover,
             album? album:'unknown', year ? year:'unknown', fileSize, genre ? genre.join(', ') : null, fileHash, fileType);
      
      // 新文件名为哈希值加上原文件扩展名
      const newFileName = `${fileHash}${path.extname(absoluteFilePath)}`;
      const newFilePath = path.join(path.dirname(absoluteFilePath), newFileName);

      fs.renameSync(absoluteFilePath, newFilePath);

      console.log(`Song "${title}" inserted successfully.`);
    } catch (error) {
      console.error('Error inserting song:', error.message);
    }
  }

  // 获取所有歌曲哈希值与后缀名
  async getAllSongsHashFileType() {
    return this.db.prepare(`SELECT hash, file_type FROM songs`).all();
  }

  // 获取所有歌曲路径
  async getAllSongHashs() {
    let stmt = this.db.prepare(`SELECT hash FROM songs`);
    return stmt.all()
  }

  // 移除指定路径的歌曲
  async removeSongByHash(hash){
    // 移除文件
    const fileType = this.db.prepare(`SELECT file_type FROM songs WHERE hash = ?`).get(hash).file_type;
    const filePath = path.join(path.resolve(__dirname, '..'), 'music', `${hash}${fileType}`);
    console.log(filePath)
    if(fs.existsSync(filePath)){ fs.unlinkSync(filePath); }
    // 移除数据库记录
    this.db.prepare(`DELETE FROM songs WHERE hash = ?`).run(hash);
  }

  // 更新歌曲信息
  editSong(info,songId){
    try {
      // 构建 SET 部分的 SQL 语句
      const setClause = Object.keys(info).map(key => `${key} = ?`).join(', ');
  
      // 构建完整的 SQL 语句
      const sql = `UPDATE songs SET ${setClause} WHERE id = ?`;
  
      // 将所有值连同 songId 一起传递给 run 方法
      this.db.prepare(sql).run(...Object.values(info), songId);
    } catch (e) {
      console.log(e);
    }
  }

  // 计算文件的哈希值（SHA-256）
  calculateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // 关闭数据库连接
  databaseClose(){this.db.close()}

  // 打印所有歌曲(调试用)
  searchAllSongs(){
    let stmt = this.db.prepare(`SELECT * FROM songs`);
    for (const song of stmt.all()) { 
      console.log(song); 
    }
  }

  aaa(){
    this.db.prepare(`delete from songs`).run()
    this.db.prepare(`drop table songs`).run()
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
          hash TEXT UNIQUE,
          notes TEXT,
          file_type TEXT
        )
      `).run()
    this.db.prepare(`update sqlite_sequence SET seq = 0 WHERE name = 'songs'`).run()
  }
}

module.exports = DataBaseManager;

