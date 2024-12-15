const sqlite3 = require('sqlite3');
const db = require('../db.js');


jest.mock('sqlite3', () => {
  const mockDatabase = function () {
    return {
      serialize: jest.fn(),
      run: jest.fn((query, params, callback) => callback(null)), 
      all: jest.fn((query, params, callback) => callback(null, [])), 
      get: jest.fn((query, params, callback) => callback(null, null)), 
    };
  };

  return {
    Database: mockDatabase,
    verbose: jest.fn().mockReturnValue({ Database: mockDatabase }),
  };
});

describe('DB tests', () => {
  let mockDb;


  beforeEach(() => {
    mockDb = new sqlite3.Database();
  });


  describe('getTopScores', () => {
    test('devrait retourner les meilleurs scores', async () => {
      const mockRows = [
        { pseudo: 'player1', score: 200, date: '2024-12-15T00:00:00' },
        { pseudo: 'player2', score: 150, date: '2024-12-14T00:00:00' },
      ];


      mockDb.all.mockImplementationOnce((query, params, callback) => {
        callback(null, mockRows); 
      });

      const result = await db.getTopScores(2); 

      expect(result).toEqual(mockRows);
      expect(mockDb.all).toHaveBeenCalledWith(
        'SELECT pseudo, score, date FROM leaderboard ORDER BY score DESC LIMIT ?',
        [2],
        expect.any(Function)
      );
    });

    test('devrait gérer les erreurs de requête', async () => {
      const errorMessage = 'Database error';


      mockDb.all.mockImplementationOnce((query, params, callback) => {
        callback(new Error(errorMessage), null);
      });

      await expect(db.getTopScores(2)).rejects.toThrow(errorMessage); 
    });
  });

  describe('canPlayToday', () => {
    test('devrait retourner true si l\'utilisateur n\'a pas joué aujourd\'hui', async () => {

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, null);
      });

      const result = await db.canPlayToday('player1');
      expect(result).toBe(true);
    });

    test('devrait retourner false si l\'utilisateur a joué aujourd\'hui', async () => {
      const lastAttempt = new Date().toISOString().split('T')[0];

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { last_attempt: lastAttempt });
      });

      const result = await db.canPlayToday('player1');
      expect(result).toBe(false); 
    });

    test('devrait gérer les erreurs de requête', async () => {
      const errorMessage = 'Database error';

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(new Error(errorMessage), null);
      });

      await expect(db.canPlayToday('player1')).rejects.toThrow(errorMessage); 
    });
  });

  describe('updateLastAttempt', () => {
    test('devrait insérer ou mettre à jour la dernière tentative', async () => {
      const pseudo = 'player1';
      const today = new Date().toISOString().split('T')[0];

      mockDb.run.mockImplementationOnce((query, params, callback) => {
        callback(null);
      });

      await db.updateLastAttempt(pseudo); 

      expect(mockDb.run).toHaveBeenCalledWith(
        `INSERT INTO player_attempts (pseudo, last_attempt) 
         VALUES (?, ?) 
         ON CONFLICT(pseudo) DO UPDATE SET last_attempt = excluded.last_attempt`,
        [pseudo, today],
        expect.any(Function)
      );
    });

    test('devrait gérer les erreurs de requête', async () => {
      const errorMessage = 'Database error';

      mockDb.run.mockImplementationOnce((query, params, callback) => {
        callback(new Error(errorMessage));
      });

      await expect(db.updateLastAttempt('player1')).rejects.toThrow(errorMessage); 
    });
  });
});
