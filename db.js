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

// Fonction pour obtenir les meilleurs scores
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

// Exporter l'objet db et la fonction getTopScores
module.exports = { db, getTopScores };
