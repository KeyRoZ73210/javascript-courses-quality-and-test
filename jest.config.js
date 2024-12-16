module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/jest/**/*.test.js'], // Limite aux tests dans `jest/`
    collectCoverage: true,
    coverageDirectory: './coverage',
};