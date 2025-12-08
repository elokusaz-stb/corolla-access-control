import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page shows login form', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.getByText('Welcome to Corolla')).toBeVisible();
    await expect(
      page.getByText('Access Control & Tracking System')
    ).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /continue with email/i })
    ).toBeVisible();
  });

  test('login page has email input field', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('you@company.com');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('login button is disabled when email is empty', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', {
      name: /continue with email/i,
    });
    await expect(submitButton).toBeDisabled();
  });

  test('login button is enabled when email is entered', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('you@company.com');
    await emailInput.fill('test@example.com');

    const submitButton = page.getByRole('button', {
      name: /continue with email/i,
    });
    await expect(submitButton).toBeEnabled();
  });

  test('shows magic link text', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText(/magic link/i)).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('visiting dashboard redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting access overview redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard/access');

    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting log access grant redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/access/new');

    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting bulk upload redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/access/bulk');

    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting admin systems redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/admin/systems');

    await expect(page).toHaveURL(/\/login/);
  });

  test('visiting admin users redirects to login when not authenticated', async ({
    page,
  }) => {
    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/login/);
  });

  test('home page redirects to dashboard', async ({ page }) => {
    await page.goto('/');

    // Should redirect to dashboard, then to login (since not authenticated)
    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });
});

test.describe('Authentication Callback', () => {
  test('auth callback page exists', async ({ page }) => {
    // Without a valid code, it should redirect to login with error
    const response = await page.goto('/auth/callback');

    // Should redirect somewhere (login page)
    await expect(page).toHaveURL(/\/login/);
  });
});
