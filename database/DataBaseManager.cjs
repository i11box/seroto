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
        name TEXT,
        play_count INTEGER DEFAULT 0,
        notes TEXT,
      )`
    ).run();
  }

  async createTablePlaylistSongs() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INTEGER,
        song_id INTEGER,
        FOREIGN KEY(playlist_id) REFERENCES playlists(id),
        FOREIGN KEY(song_id) REFERENCES songs(id)
        PRIMARY KEY (playlist_id, song_id)
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

  // 查找歌单
  async searchPlaylist(playlistSearchQuery) {
    return this.db.prepare(`
      SELECT *
      FROM playlists
      WHERE name LIKE ?
    `).all(`%${playlistSearchQuery}%`);
  }

  // 查找歌曲
  async searchSong(songSearchQuery,selectedPlaylistId) {
    if(selectedPlaylistId === undefined || selectedPlaylistId === null)
      return this.db.prepare(`
        SELECT *
        FROM songs
        WHERE name LIKE ? OR author LIKE ? OR album LIKE ? 
      `).all(`%${songSearchQuery}%`,`%${songSearchQuery}%`,`%${songSearchQuery}%`)
    else
      return this.db.prepare(`
        SELECT songs.*
        FROM songs, playlist_songs
        WHERE playlist_songs.playlist_id = ? 
          AND songs.id = playlist_songs.song_id 
          AND (songs.name LIKE ? OR songs.author LIKE ? OR songs.album LIKE ?)
      `).all(selectedPlaylistId, `%${songSearchQuery}%`,`%${songSearchQuery}%`,`%${songSearchQuery}%`)
  }

  // 获取歌单内所有歌曲
  async getSongsFromPlaylist(playlist_id) {
    let stmt;
    if (playlist_id === undefined) {
      stmt = this.db.prepare(`SELECT * FROM songs`);
      return stmt.all();
    } else {
      stmt = this.db.prepare(`SELECT songs.* 
                              FROM songs, playlist_songs 
                              WHERE playlist_songs.playlist_id = ? AND songs.id = playlist_songs.song_id`);
      return stmt.all(playlist_id);
    }
  }

  // 获取所有歌单
  async getAllPlaylists() {
    const stmt = this.db.prepare(`SELECT DISTINCT id, name FROM playlists`);
    return stmt.all();
  }

  // 创建歌单
  async insertPlaylist(songIds,playlistName, notes) {
    // 开始事务
    this.db.exec('BEGIN TRANSACTION');

    try {
      // 插入一个歌单
      const stmt = this.db.prepare(`INSERT INTO playlists (name, notes) VALUES (?, ?)`);
      stmt.run(playlistName, notes);

      // 获取新插入歌单的 ID
      const playlistId = this.db.prepare('SELECT last_insert_rowid() as id').get().id;

      // 准备一次插入歌单和歌曲关联的语句
      const insertPlaylistSongStmt = this.db.prepare(`INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`);

      // 插入所有歌曲到歌单
      for (const songId of songIds) {
        insertPlaylistSongStmt.run(playlistId, songId);
      }

      // 提交事务
      this.db.exec('COMMIT');
    } catch (error) {
      // 出现错误时回滚事务
      this.db.exec('ROLLBACK');
      throw error; // 抛出错误以便进一步处理
    }
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
    this.db.prepare(`DELETE FROM playlist_songs 
                     WHERE song_id = (SELECT id FROM songs WHERE hash = ?)`)
    this.db.prepare(`DELETE FROM songs WHERE hash = ?`).run(hash);
  }

  // 更新歌单信息
  async editPlaylist(playlistId, name, notes){
    this.db.prepare(`
      UPDATE playlists
      SET name = ?, notes = ?
      WHERE id = ?
      `).run(name, notes, playlistId)
  }

  // 删除歌单
  async deletePlaylist(playlistId){
    // 删除歌单中的歌
    this.db.prepare(`
      DELETE FROM playlist_songs WHERE playlist_id = ?
    `).run(playlistId)

    // 删除歌单信息
    this.db.prepare(`
      DELETE FROM playlists WHERE id = ?
    `).run(playlistId)
  }

  // 从歌单中删除歌曲，不会删除文件
  async removeSongFromPlaylist(songHash,playlistId) {
    this.db.prepare(`
      DELETE FROM playlist_songs
      WHERE song_id = (SELECT id FROM songs WHERE hash = ?)
      AND playlist_id = ?
    `).run(songHash,playlistId)
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
    // this.db.prepare(`DELETE FROM playlists`).run()
    // this.db.prepare(`DELETE FROM playlist_songs`).run()
  }
}

module.exports = DataBaseManager;

