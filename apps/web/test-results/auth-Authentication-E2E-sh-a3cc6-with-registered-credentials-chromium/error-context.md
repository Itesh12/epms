# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication E2E >> should login with registered credentials
- Location: tests\auth.spec.ts:39:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e14]:
    - generic [ref=e15]:
      - button "← Back" [ref=e16]
      - heading "Register Organization" [level=2] [ref=e17]
    - generic [ref=e18]: Server error
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]: Full Name
        - generic [ref=e22]:
          - img [ref=e23]
          - textbox "Enter your full name" [ref=e26]: E2E Admin
      - generic [ref=e27]:
        - generic [ref=e28]: Email Address
        - generic [ref=e29]:
          - img [ref=e30]
          - textbox "example@company.com" [ref=e33]: admin_1775908212464@e2e.test
      - generic [ref=e34]:
        - generic [ref=e35]: Organization Name
        - generic [ref=e36]:
          - img [ref=e37]
          - textbox "Enter company name" [ref=e40]: E2E Org 1775908212464
      - generic [ref=e41]:
        - generic [ref=e42]: Password
        - generic [ref=e43]:
          - img [ref=e44]
          - textbox "Create a strong password" [ref=e47]: Password123!
      - button "Create Organization" [ref=e48]:
        - generic [ref=e49]: Create Organization
        - img [ref=e50]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | // Use a unique ID per test run to avoid email conflicts
  4   | const uniqueId = Date.now();
  5   | 
  6   | const testUser = {
  7   |   name: 'E2E Admin',
  8   |   email: `admin_${uniqueId}@e2e.test`,
  9   |   password: 'Password123!',
  10  |   orgName: `E2E Org ${uniqueId}`
  11  | };
  12  | 
  13  | /**
  14  |  * Helper: Register a fresh admin and land on dashboard
  15  |  */
  16  | async function registerAndLogin(page: Page) {
  17  |   await page.goto('/signup?role=admin');
  18  |   await page.waitForLoadState('networkidle');
  19  | 
  20  |   await page.getByPlaceholder('Enter your full name').fill(testUser.name);
  21  |   await page.getByPlaceholder('example@company.com').fill(testUser.email);
  22  |   await page.getByPlaceholder('Enter company name').fill(testUser.orgName);
  23  |   await page.getByPlaceholder('Create a strong password').fill(testUser.password);
  24  | 
  25  |   await page.getByRole('button', { name: 'Create Organization' }).click();
  26  | 
  27  |   // Wait for auto-redirect after success (page shows success then redirects in 2s)
> 28  |   await page.waitForURL('**/dashboard', { timeout: 15000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  29  | }
  30  | 
  31  | test.describe('Authentication E2E', () => {
  32  |   test('should register a new admin and land on dashboard', async ({ page }) => {
  33  |     await registerAndLogin(page);
  34  |     await expect(page).toHaveURL(/.*dashboard/);
  35  |     // Dashboard should show a welcome heading
  36  |     await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  37  |   });
  38  | 
  39  |   test('should login with registered credentials', async ({ page }) => {
  40  |     // Register first so we have a known user
  41  |     await registerAndLogin(page);
  42  | 
  43  |     // Now logout and log back in
  44  |     // Click the avatar/logout button in the sidebar
  45  |     await page.goto('/login');
  46  |     await page.waitForLoadState('networkidle');
  47  | 
  48  |     await page.getByPlaceholder('Enter your email address').fill(testUser.email);
  49  |     await page.getByPlaceholder('Enter your password').fill(testUser.password);
  50  |     await page.getByRole('button', { name: 'Sign In' }).click();
  51  | 
  52  |     await page.waitForURL('**/dashboard', { timeout: 15000 });
  53  |     await expect(page).toHaveURL(/.*dashboard/);
  54  |   });
  55  | 
  56  |   test('should show error for invalid credentials', async ({ page }) => {
  57  |     await page.goto('/login');
  58  |     await page.waitForLoadState('networkidle');
  59  | 
  60  |     await page.getByPlaceholder('Enter your email address').fill('invalid@test.com');
  61  |     await page.getByPlaceholder('Enter your password').fill('wrongpassword');
  62  |     await page.getByRole('button', { name: 'Sign In' }).click();
  63  | 
  64  |     // Should show error message (stays on login page)
  65  |     await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 10000 });
  66  |   });
  67  | });
  68  | 
  69  | test.describe('Localization (i18n) E2E', () => {
  70  |   test('should switch language on the dashboard', async ({ page }) => {
  71  |     // Must be logged in to access dashboard where LocaleSwitcher lives
  72  |     await registerAndLogin(page);
  73  |     await page.waitForLoadState('networkidle');
  74  | 
  75  |     // LocaleSwitcher is in the dashboard layout's top nav
  76  |     const switcher = page.locator('select');
  77  |     await expect(switcher).toBeVisible({ timeout: 10000 });
  78  | 
  79  |     // Default should be English
  80  |     await expect(switcher).toHaveValue('en');
  81  | 
  82  |     // Switch to Hindi
  83  |     await switcher.selectOption('hi');
  84  |     await page.waitForLoadState('networkidle');
  85  |     // Verify navigation item language changed (e.g. Dashboard nav item)
  86  |     // The Navigation.dashboard key is "Dashboard" in EN and "डैशबोर्ड" in HI
  87  |     await expect(switcher).toHaveValue('hi');
  88  | 
  89  |     // Switch to Gujarati
  90  |     await switcher.selectOption('gu');
  91  |     await page.waitForLoadState('networkidle');
  92  |     await expect(switcher).toHaveValue('gu');
  93  | 
  94  |     // Switch back to English
  95  |     await switcher.selectOption('en');
  96  |     await page.waitForLoadState('networkidle');
  97  |     await expect(switcher).toHaveValue('en');
  98  |   });
  99  | });
  100 | 
```