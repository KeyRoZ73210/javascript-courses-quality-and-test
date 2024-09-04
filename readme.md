# Hangman Game

This is a small project to build a classic Hangman game in JavaScript.
The primary goal of this project is to practice and learn how to write tests using various tools and frameworks, including Jest.

**Test-Driven Development:** The project is structured to encourage writing tests for each feature of the game.

## Getting Started

### Running the Game

To start the game, copy and paste the .env.example file to .env and set the PORT variable to 3030.

Then use the following command:

```bash
npm start
```

This will start the server, and you can play the game by visiting `http://localhost:3030` in your browser.

### Running Tests

This project uses Jest for testing. To run the tests, use the following command:

```bash
npm test
```

The tests are designed to ensure that the game logic works correctly and to demonstrate best practices in test-driven development.

## Project Structure

- **`game.js`**: Contains the core game logic.
- **`tools.js`**: Utility functions used in the game.
- **`test/`**: Contains test files for each module (e.g., `game.test.js`, `tools.test.js`).
- **`index.js`**: Main server file that sets up the Express app and routes.
- **`public/`**: Static files such as HTML, CSS, and client-side JavaScript.
- **`views/`**: EJS templates used to render the game interface.
