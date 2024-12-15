require('dotenv').config();
const express = require('express');
const path = require('path');
const Game = require('./game.js');
const { getTopScores } = require('./db.js');

const PORT = process.env.PORT || 3030;
const URL_GAME = process.env.URL_GAME || `http://localhost:${PORT}`;

const app = express();
const game = new Game();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (request, response) => {
    response.render('pages/index', {
        game: game.print(),
        word: game.word,
        numberOfTries: game.getNumberOfTries(),
        errorMessageTry: game.errorMessageTry,
        errorMessageInput: game.errorMessageInput,
        score: game.getScore()

    });
});


app.post('/', (request, response) => {
    const { word } = request.body;

    try {
        if (!word) {
            return response.status(400).send("Please provide a letter.");
        }

        const result = game.guess(word);

        if (result === 'gameOver' || result === 'win') {
            return response.redirect('/game-over');
        }

        response.render('pages/index', {
            game: game.print(),
            word: game.word,
            numberOfTries: game.getNumberOfTries(),
            score: game.getScore(),
            errorMessageInput: game.errorMessageInput,
            errorMessageTry: game.errorMessageTry
        });
    } catch (error) {
        console.error(error.message);
        response.status(500).send("An error occurred: " + error.message);
    }
});


app.get('/leaderboard', async (request, response) => {
    try {
        const topScores = await getTopScores();
        response.render('pages/leaderboard', { topScores });
    } catch (error) {
        console.error("Failed to retrieve top scores:", error);
        response.status(500).send("error: " + error.message);
    }
});

app.post('/save-score', async (request, response) => {
    const { pseudo } = request.body;

    if (!pseudo || pseudo.trim() === '') {
        return response.status(400).send("Pseudo is required");
    }

    try {
        await game.saveScore(pseudo.trim());
        response.redirect('/leaderboard');
    } catch (error) {
        console.error("error save score:", error);
        response.status(500).send("error: " + error.message);
    }
});

app.get('/game-over', (request, response) => {
    response.render('pages/game-over', {
        score: game.getScore(),
        word: game.word,
        result: game.unknowWord === game.word ? 'Gagné !' : 'Perdu !',
        numberOfTries: game.getNumberOfTries(),
        urlGame: URL_GAME
    });
});

(async () => {
    try {
        await game.loadWords();
        game.chooseWord();
        console.log("Game started with word:", game.word);
        app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to load words and start the server:", error);
    }
})();
