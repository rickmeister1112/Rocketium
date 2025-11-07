import { expect, test } from '@playwright/test';

test.describe('Design editor smoke test', () => {
  test('homepage renders and new design button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'My Designs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New design' })).toBeVisible();
  });
});

