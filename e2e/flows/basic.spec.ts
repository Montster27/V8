import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to the app with a longer timeout
  await page.goto('/', { timeout: 30000 });
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot to debug if there are issues
  await page.screenshot({ path: 'e2e-results/basic-test-initial.png' });
  
  // Check that the page has loaded
  await expect(page).toHaveTitle(/Middle Age Multiverse/, { timeout: 10000 });
  
  // Check for the main heading with a longer timeout
  await expect(page.locator('h1')).toContainText('Middle Age Multiverse', { timeout: 10000 });
});
