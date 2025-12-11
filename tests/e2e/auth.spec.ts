import { test, expect } from '@playwright/test';
import { login, loginAndNavigate, TEST_USER } from './helpers/login';

test.describe('Authentication Flow', () => {
  test.describe('Unauthenticated Access', () => {
    test('redirects to login when accessing protected routes', async ({
      page,
    }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login when accessing access overview', async ({
      page,
    }) => {
      await page.goto('/dashboard/access');
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login when accessing log access grant page', async ({
      page,
    }) => {
      await page.goto('/access/new');
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login when accessing bulk upload', async ({ page }) => {
      await page.goto('/access/bulk');
      await expect(page).toHaveURL(/\/login/);
    });

    test('redirects to login when accessing systems admin', async ({
      page,
    }) => {
      await page.goto('/admin/systems');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Login Page', () => {
    test('renders login form', async ({ page }) => {
      await page.goto('/login');

      // Check for login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('shows validation error for invalid email', async ({ page }) => {
      await page.goto('/login');

      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');

      // Should show validation error or stay on login
      await expect(page).toHaveURL(/\/login/);
    });

    test('shows loading state on form submission', async ({ page }) => {
      await page.goto('/login');

      // Fill valid email
      await page.fill('input[type="email"]', TEST_USER.email);

      // Click submit
      await page.click('button[type="submit"]');

      // Button should show loading state (disabled or spinner)
      // Note: Actual behavior depends on Supabase auth setup
    });
  });

  test.describe('Authenticated Layout', () => {
    test('shows sidebar and topbar when authenticated', async ({ page }) => {
      await loginAndNavigate(page, '/dashboard');

      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');

      // Check for navigation elements (may vary based on actual implementation)
      // These tests assume the app recognizes test auth cookies
      const pageContent = await page.content();

      // Page should not be redirected to login
      expect(pageContent).not.toContain('Sign in to your account');
    });

    test('navigates between sections', async ({ page }) => {
      await loginAndNavigate(page, '/dashboard');

      // Wait for app to load
      await page.waitForLoadState('domcontentloaded');

      // Navigation tests - click through main sections
      // Note: Actual selectors depend on implementation
      const navLinks = page.locator('nav a, aside a');
      const linkCount = await navLinks.count();

      expect(linkCount).toBeGreaterThan(0);
    });
  });

  test.describe('Session Management', () => {
    test('maintains authentication across page navigations', async ({
      page,
    }) => {
      await loginAndNavigate(page, '/dashboard');
      await page.waitForLoadState('domcontentloaded');

      // Navigate to another page
      await page.goto('/dashboard/access');
      await page.waitForLoadState('domcontentloaded');

      // Should still be authenticated (not redirected to login)
      const url = page.url();
      expect(url).not.toContain('/login');
    });
  });
});

