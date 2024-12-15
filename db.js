const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./database/mock.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening database:', err.message);
    }
    console.log('Database Connected');
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pseudo TEXT NOT NULL,
        score INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS player_attempts (
        pseudo TEXT PRIMARY KEY,
        last_attempt DATE
    )`);
});


function getTopScores(limit = 1000) {
    return new Promise((resolve, reject) => {
        const query = `SELECT pseudo, score, date FROM leaderboard ORDER BY score DESC LIMIT ?`;
        db.all(query, [limit], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function canPlayToday(pseudo) {
    return new Promise((resolve, reject) => {
        const query = `SELECT last_attempt FROM player_attempts WHERE pseudo = ?`;
        db.get(query, [pseudo], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return resolve(true);
            }

            const lastAttempt = new Date(row.last_attempt);
            const today = new Date();
            const isSameDay = lastAttempt.toDateString() === today.toDateString();

            resolve(!isSameDay);
        });
    });
}

function updateLastAttempt(pseudo) {
    return new Promise((resolve, reject) => {
        const today = new Date().toISOString().split('T')[0];
        const query = `
            INSERT INTO player_attempts (pseudo, last_attempt) 
            VALUES (?, ?)
            ON CONFLICT(pseudo) DO UPDATE SET last_attempt = excluded.last_attempt
        `;
        db.run(query, [pseudo, today], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

module.exports = { db, getTopScores, canPlayToday, updateLastAttempt };
