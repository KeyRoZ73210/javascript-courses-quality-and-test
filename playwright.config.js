const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './test/playwright', // Limite aux tests dans `playwright/`
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3030',
        headless: true, // Exécute les tests en mode headless par défaut
        browserName: 'chromium',
    },
    reporter: [['html', { outputFolder: 'playwright-report' }]], // Rapport HTML
});