const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');
const {db} = require('./db.js');

class Game {
    constructor() {
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.score = 1000;
        this.errorMessageInput = '';
        this.errorMessageTry = '';
        this.startTime = null;
        this.word = null;
        this.unknowWord = null;
    }

    startChrono() {
        this.startTime = Date.now();
    }

    updateScore() {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this.startTime) / 1000);
        this.score -= elapsedSeconds;
        if (this.score < 0) {
            this.score = 0;
        }
        this.startTime = now;
    }

    loadWords() {
        return new Promise((resolve, reject) => {
            fs.createReadStream('words_fr.txt')
                .pipe(csv())
                .on('data', (row) => {
                    this.listOfWords.push(row.word.toLowerCase());
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    this.chooseWord();
                    resolve();
                })
                .on('error', reject);
        });
    }

    chooseWord() {
        if (this.listOfWords.length > 0) {
            this.word = this.listOfWords[tools.getRandomInt(this.listOfWords.length)];
            this.unknowWord = this.word.replace(/./g, '#');
            this.startChrono();
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    guess(oneLetter) {
        if (this.numberOfTry === 0) {
            return 'gameOver'; // Indique que le jeu est terminé
        }

        if (typeof oneLetter !== "string" || oneLetter.length !== 1 || !/[a-z]/i.test(oneLetter)) {
            this.errorMessageInput = "Invalid input: please enter a single letter.";
            return false;
        }

        this.updateScore();

        oneLetter = oneLetter.toLowerCase();

        if (!this.word) {
            throw new Error("The word has not been set. Please ensure that the game has been initialized properly.");
        }

        let oneLetterFound = false;

        for (let i = 0; i < this.word.length; i++) {
            if (this.word[i] === oneLetter) {
                this.unknowWord = tools.replaceAt(this.unknowWord, i, oneLetter);
                oneLetterFound = true;
            }
        }

        if (oneLetterFound) {
            if (this.unknowWord === this.word) {
                return 'win'; // Jeu gagné
            }
            return true;
        } else {
            this.numberOfTry--;
            this.score -= 50;
            if (this.score < 0) {
                this.score = 0;
            }
            if (this.numberOfTry === 0) {
                return 'gameOver'; // Indique que le jeu est terminé
            }
            return false;
        }
    }

    print() {
        return this.unknowWord;
    }

    getScore() {
        return this.score;
    }

    getNumberOfTries() {
        return this.numberOfTry;
    }

    saveScore(pseudo) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO leaderboard (pseudo, score) VALUES (?, ?)`;
            db.run(query, [pseudo, this.score], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID); // retourne l'ID du dernier enregistrement
            });
        });
    }

    reset() {
        this.numberOfTry = 5;
        this.chooseWord();
        this.score = 1000;
        this.startTime = Date.now();
    }
}

module.exports = Game;
