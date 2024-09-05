require('dotenv').config();
const express = require('express');
const path = require('path');
const Game = require('./game.js');
const { getTopScores } = require('./db.js');

const PORT = process.env.PORT || 3030;

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
    try {
        if (request.body.reset) {
            console.log("Reset !");
            game.reset();
        } else if (request.body.word) {
            const result = game.guess(request.body.word);
            if (result === 'gameOver') {
                return response.redirect('/game-over'); // Redirection vers la page de résultats
            } else if (result === 'win') {
                return response.redirect('/game-over'); // Redirection vers la page de résultats
            }
            console.log("Guess :" + request.body.word);
        } else {
            console.log("No word provided in the request body.");
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
        response.status(500).send("An error occurred: " + error.message);
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
        console.error("Failed to save score:", error);
        response.status(500).send("An error occurred: " + error.message);
    }
});

app.get('/game-over', (request, response) => {
    response.render('pages/game-over', {
        score: game.getScore(),
        word: game.word,
        result: game.unknowWord === game.word ? 'You Win!' : 'You Lose!',
        numberOfTries: game.getNumberOfTries()
    });
});


(async () => {
    try {
        await game.loadWords();
        app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Failed to load words and start the server:", error);
    }
})();
