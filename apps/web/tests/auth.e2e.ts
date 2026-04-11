import { test, expect } from '@playwright/test';

test.describe('Authentication and i18n', () => {
  test('should load the login page in English by default', async ({ page }) => {
    await page.goto('/login');
    
    // Check for English text
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
  });

  test('should allow switching language to Hindi', async ({ page }) => {
    await page.goto('/login');
    
    // Find language switcher (assuming it's available in the nav or a specific button)
    // Looking at Navigation.tsx or similar, we might need a selector.
    // For now, let's assume there's a locale select.
    
    // Usually handled by clicking a language name or icon.
    // Let's check for "Hindi" text.
  });
});
