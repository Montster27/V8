import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page has loaded
  await expect(page).toHaveTitle(/Middle Age Multiverse/);
  
  // Check for the main heading
  await expect(page.locator('h1')).toContainText('Middle Age Multiverse');
});
