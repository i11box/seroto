const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'music.db'), { verbose: console.log });

// song表增加列
db.prepare(`ALTER TABLE playlist ADD COLUMN name TEXT`).run();

db.prepare(`ALTER TABLE playlist DROP COLUMN playlist_cover`).run();
db.prepare(`ALTER TABLE playlist DROP COLUMN song_id`).run();
db.prepare(`ALTER TABLE playlist DROP COLUMN creator`).run();