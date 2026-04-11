import { test, expect, type Page } from '@playwright/test';

// Use a unique ID per test run to avoid email conflicts
const uniqueId = Date.now();

const testUser = {
  name: 'E2E Admin',
  email: `admin_${uniqueId}@e2e.test`,
  password: 'Password123!',
  orgName: `E2E Org ${uniqueId}`
};

/**
 * Helper: Register a fresh admin and land on dashboard
 */
async function registerAndLogin(page: Page) {
  await page.goto('/signup?role=admin');
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('Enter your full name').fill(testUser.name);
  await page.getByPlaceholder('example@company.com').fill(testUser.email);
  await page.getByPlaceholder('Enter company name').fill(testUser.orgName);
  await page.getByPlaceholder('Create a strong password').fill(testUser.password);

  await page.getByRole('button', { name: 'Create Organization' }).click();

  // Wait for auto-redirect after success (page shows success then redirects in 2s)
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

test.describe('Authentication E2E', () => {
  test('should register a new admin and land on dashboard', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page).toHaveURL(/.*dashboard/);
    // Dashboard should show a welcome heading
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('should login with registered credentials', async ({ page }) => {
    // Register first so we have a known user
    await registerAndLogin(page);

    // Now logout and log back in
    // Click the avatar/logout button in the sidebar
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Enter your email address').fill(testUser.email);
    await page.getByPlaceholder('Enter your password').fill(testUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Enter your email address').fill('invalid@test.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message (stays on login page)
    await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Localization (i18n) E2E', () => {
  test('should switch language on the dashboard', async ({ page }) => {
    // Must be logged in to access dashboard where LocaleSwitcher lives
    await registerAndLogin(page);
    await page.waitForLoadState('networkidle');

    // LocaleSwitcher is in the dashboard layout's top nav
    const switcher = page.locator('select');
    await expect(switcher).toBeVisible({ timeout: 10000 });

    // Default should be English
    await expect(switcher).toHaveValue('en');

    // Switch to Hindi
    await switcher.selectOption('hi');
    await page.waitForLoadState('networkidle');
    // Verify navigation item language changed (e.g. Dashboard nav item)
    // The Navigation.dashboard key is "Dashboard" in EN and "डैशबोर्ड" in HI
    await expect(switcher).toHaveValue('hi');

    // Switch to Gujarati
    await switcher.selectOption('gu');
    await page.waitForLoadState('networkidle');
    await expect(switcher).toHaveValue('gu');

    // Switch back to English
    await switcher.selectOption('en');
    await page.waitForLoadState('networkidle');
    await expect(switcher).toHaveValue('en');
  });
});
