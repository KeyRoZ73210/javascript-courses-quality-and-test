jest.setTimeout(10000);

jest.mock('sqlite3', () => {
    const mDatabase = {
        run: jest.fn(),
        get: jest.fn(),
        all: jest.fn(),
        serialize: jest.fn(),
    };
    const sqlite3Mock = {
        verbose: jest.fn(() => sqlite3Mock),
        Database: jest.fn(() => mDatabase),
    };

    return sqlite3Mock;
});

const { getTopScores, canPlayToday, updateLastAttempt } = require('../../db');

describe('Database functions', () => {

    let db;

    beforeEach(() => {
        db = new (require('sqlite3').Database)();
    });

    test('getTopScores récupère les scores avec succès', async () => {
        const mockRows = [
            { pseudo: 'player1', score: 1000, date: '2024-12-15' },
            { pseudo: 'player2', score: 950, date: '2024-12-14' }
        ];

        db.all.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(null, mockRows));
        });

        const scores = await getTopScores();
        expect(scores).toEqual(mockRows);
        expect(db.all).toHaveBeenCalledWith(
            expect.any(String),
            [1000],
            expect.any(Function)
        );
    });

    test('getTopScores rejette la promesse en cas d\'erreur', async () => {
        const errorMessage = 'Database error';
        
        db.all.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(new Error(errorMessage)));
        });

        await expect(getTopScores()).rejects.toThrow(errorMessage);
    });

    test('canPlayToday renvoie true si le joueur peut jouer aujourd\'hui', async () => {
        const getMock = db.get;
        getMock.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(null, null));
        });

        const result = await canPlayToday('player1');
        expect(result).toBe(true);
    });

    test('canPlayToday renvoie false si le joueur a joué aujourd\'hui', async () => {
        const today = new Date().toISOString().split('T')[0];
        const getMock = db.get;
        getMock.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(null, { last_attempt: today }));
        });

        const result = await canPlayToday('player1');
        expect(result).toBe(false);
    });

    test('canPlayToday rejette la promesse en cas d\'erreur', async () => {
        const errorMessage = 'Database error';
        const getMock = db.get;
        getMock.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(new Error(errorMessage)));
        });

        await expect(canPlayToday('player1')).rejects.toThrow(errorMessage);
    });

    test('updateLastAttempt met à jour la dernière tentative avec succès', async () => {
        const runMock = db.run;
        runMock.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(null));
        });

        await updateLastAttempt('player1');
        expect(runMock).toHaveBeenCalledWith(
            expect.any(String),
            ['player1', expect.any(String)],
            expect.any(Function)
        );
    });

    test('updateLastAttempt rejette la promesse en cas d\'erreur', async () => {
        const errorMessage = 'Database error';
        const runMock = db.run;
        runMock.mockImplementation((query, params, callback) => {
            setImmediate(() => callback(new Error(errorMessage)));
        });

        await expect(updateLastAttempt('player1')).rejects.toThrow(errorMessage);
    });

});
