import { test, expect } from '@playwright/test';

// These tests require a mocked authenticated session
// For now, we test the login page navigation elements

test.describe('Login Page Navigation Elements', () => {
  test('login page renders Corolla branding', async ({ page }) => {
    await page.goto('/login');

    // Check for Corolla logo/icon
    await expect(page.getByText('Welcome to Corolla')).toBeVisible();
  });

  test('login page has accessible form', async ({ page }) => {
    await page.goto('/login');

    // Check form accessibility
    const emailInput = page.getByLabel('Email address');
    await expect(emailInput).toBeVisible();

    // Should be focusable
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });
});

test.describe('API Health Check', () => {
  test('health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
  });
});

test.describe('Page Structure', () => {
  test('login page has proper document title', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Corolla/i);
  });

  test('login page uses proper semantic HTML', async ({ page }) => {
    await page.goto('/login');

    // Check for form element
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check for button
    const submitButton = page.getByRole('button', {
      name: /continue with email/i,
    });
    await expect(submitButton).toHaveAttribute('type', 'submit');
  });
});

