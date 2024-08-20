const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'music.db'), { verbose: console.log });

// song表增加列
db.prepare(`ALTER TABLE song ADD COLUMN hash TEXT UNIQUE`).run();