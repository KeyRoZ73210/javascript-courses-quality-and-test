const Game = require('../game.js');
const fs = require('fs');
const path = require('path');

let game;


beforeAll(() => {
    
    const testWords = "damien\njohn\npaul\n";
    fs.writeFileSync(path.join(__dirname, 'words_fr.txt'), testWords);
});

afterAll(() => {
    
    fs.unlinkSync(path.join(__dirname, 'words_fr.txt'));
});

describe("Game tests", () => {
    beforeEach(async () => {
        game = new Game();
        await game.loadWords();
        game.setGlobalWord("damien"); 
    });

    test("Le mot doit être 'damien'", () => {
        expect(game.word).toBe("damien");
    });

    test("doit commencer avec 5 tentatives", () => {
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("une bonne réponse ne réduit pas les tentatives", () => {
        game.guess("a");
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("une mauvaise réponse réduit les tentatives de 1", () => {
        game.guess("z");
        expect(game.getNumberOfTries()).toBe(4);
    });

    test("une entrée invalide retourne false", () => {
        expect(game.guess("abc")).toBe(false);
        expect(game.errorMessageInput).toBe("Invalid input: please enter a single letter.");
    });

    test("deviner une lettre correcte met à jour le mot caché", () => {
        game.guess("a");
        expect(game.print()).toBe("#a####");
    });

    test("reset réinitialise l'état initial", () => {
        game.guess("z"); 
        game.reset();
        expect(game.getNumberOfTries()).toBe(5);  
        expect(game.getScore()).toBe(1000);  
    
        
        expect(game.print()).toBe('#'.repeat(game.word.length));  
    });
    

    test("lance une erreur si aucun mot n'est disponible", () => {
        game.listOfWords = [];
        expect(() => game.chooseWord()).toThrow("No words available to choose from.");
    });

    test("updateScore diminue le score avec le temps", () => {
        jest.useFakeTimers();
        game.startChrono();
        const initialScore = game.getScore();
        jest.advanceTimersByTime(2000); 
        game.updateScore();
        expect(game.getScore()).toBeLessThan(initialScore);
        jest.useRealTimers();
    });

    test("saveScore insère un nouveau score dans le leaderboard", async () => {
        const lastID = await game.saveScore("testPlayer");
        expect(lastID).toBeGreaterThan(0);
    });

    test("constructor initialise toutes les propriétés", async () => {
        
        game.listOfWords = [];
    
        
        expect(game.listOfWords).toEqual([]);  
        expect(game.numberOfTry).toBe(5);
        expect(game.score).toBe(1000);
        expect(game.errorMessageInput).toBe('');
    
        
        await game.loadWords();
    });
    
    test("chooseWord choisit un mot dans la liste", () => {
        game.listOfWords = ['damien', 'john', 'paul']; 
        game.chooseWord(); 
        expect(game.word).toBeDefined(); 
        expect(game.unknowWord).toBe('#'.repeat(game.word.length));  
    });

    test("updateScore diminue le score au fil du temps", () => {
        jest.useFakeTimers();
        game.startChrono();
        const initialScore = game.getScore();
        jest.advanceTimersByTime(5000);  
        game.updateScore();
        expect(game.getScore()).toBeLessThan(initialScore);
        jest.useRealTimers();
    });

    test("une mauvaise réponse réduit les tentatives de 1", () => {
        game.guess("z");
        expect(game.getNumberOfTries()).toBe(4);
    });

    test("gameOver lorsqu'il n'y a plus de tentatives", () => {
        game.numberOfTry = 0;
        expect(game.guess('a')).toBe('gameOver');
    });

    jest.mock('../db.js', () => ({
        db: {
            run: jest.fn((query, params, callback) => {
                callback(null); 
            })
        }
    }));

    test("saveScore insère un nouveau record dans le leaderboard", async () => {
        const lastID = await game.saveScore("testPlayer");
        expect(lastID).toBeGreaterThan(0); 
    });
});
