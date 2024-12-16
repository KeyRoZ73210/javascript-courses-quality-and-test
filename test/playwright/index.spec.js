const { test, expect } = require('@playwright/test');

test.describe('Page d\'accueil - Jeu du Pendu', () => {
    test('La page d\'accueil se charge correctement', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /Le jeu du pendu/i })).toBeVisible();
        await expect(page.getByPlaceholder('Tapez une lettre')).toBeVisible();

    });

    test('Le mot masqué est affiché correctement', async ({ page }) => {
        await page.goto('/');

        const maskedWord = await page.locator('#current-word span');
        const maskedWordText = await maskedWord.allTextContents();
        maskedWordText.forEach(letter => {
            expect(letter).toBe('#');
        });
    });
    
    test('le bouton "Tester" est cliqué et fonctionne', async ({ page }) => {
        await page.goto('/');
    
        const button = await page.getByRole('button', { name: 'Tester' });


    });
    
    test('La page game over se charge correctement', async ({ page }) => {
        await page.goto('/game-over');


        const title = await page.locator('header h1');
    });

    test('l\'input sauvegarder est accessible et accepte du texte', async ({ page }) => {
        await page.goto('/game-over');
    
        const input = await page.getByRole('textbox');
    
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();
    

        const pseudo = 'joueur_test';
        await input.fill(pseudo);
    

        await expect(input).toHaveValue(pseudo);
    });

    test('La page leaderboard se charge correctement', async ({ page }) => {
        await page.goto('/leaderboard');


        const title = await page.locator('header h1');
    });
});