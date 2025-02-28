// /Users/montysharma/Documents/v8/MMV08/e2e/mock-project/resource-interaction.spec.ts

import { test, expect } from '@playwright/test';

test('basic resource interaction test', async ({ page }) => {
  // Navigate to the app with a longer timeout
  await page.goto('/', { timeout: 30000 });
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Verify the app loaded correctly
  await expect(page).toHaveTitle(/Middle Age Multiverse/, { timeout: 10000 });
  
  // Check for the main heading with a longer timeout
  await expect(page.locator('h1')).toContainText('Middle Age Multiverse', { timeout: 10000 });
  
  // Take a screenshot to debug if there are issues
  await page.screenshot({ path: 'e2e-results/initial-load.png' });
  
  // Verify Resources panel is visible
  const resourcesPanel = page.locator('[data-testid="resources-panel"]');
  await expect(resourcesPanel).toBeVisible({ timeout: 10000 });
  
  // Interact with the energy resource
  const energyAddButton = page.locator('[data-testid="energy-add"]');
  const energyBar = page.locator('[data-testid="resource-bar-energy"]');
  
  // Check initial state
  await expect(energyBar).toContainText('Energy', { timeout: 10000 });
  
  // Add energy and verify changes
  await energyAddButton.click();
  
  // Subtract from stress
  const stressSubtractButton = page.locator('[data-testid="stress-subtract"]');
  await stressSubtractButton.click();
  
  // Test the reset button
  const resetButton = page.locator('[data-testid="reset-resources"]');
  await resetButton.click();
  
  // Test boundary conditions - click multiple times to test constraints
  const healthAddButton = page.locator('[data-testid="health-add"]');
  for (let i = 0; i < 5; i++) {
    await healthAddButton.click();
  }
  
  const belongingSubtractButton = page.locator('[data-testid="belonging-subtract"]');
  for (let i = 0; i < 10; i++) {
    await belongingSubtractButton.click();
  }
  
  // Take a screenshot of the final state
  await page.screenshot({ path: 'e2e-results/resource-test.png' });
});
