import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(
      page.getByRole('heading', { name: /corolla access control/i })
    ).toBeVisible();

    // Check for description text
    await expect(page.getByText(/phase-1 access tracking tool/i)).toBeVisible();

    // Check for Get Started link
    await expect(
      page.getByRole('link', { name: /get started/i })
    ).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click the Get Started link
    await page.getByRole('link', { name: /get started/i }).click();

    // Should be on login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Check for email input
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Check for password input
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Email field should be required
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required');

    // Password field should be required
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute('required');
  });
});

test.describe('API Health Check', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});
