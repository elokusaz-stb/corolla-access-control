import { Page, BrowserContext } from '@playwright/test';

/**
 * Test user credentials - these should match the seeded test user
 */
export const TEST_USER = {
  id: 'test-user-admin',
  email: 'admin@test.corolla.com',
  name: 'Test Admin',
};

export const TEST_REGULAR_USER = {
  id: 'test-user-regular',
  email: 'user@test.corolla.com',
  name: 'Test User',
};

/**
 * Sets up authentication cookies to bypass Supabase Auth for E2E tests.
 * This injects auth state directly, allowing tests to proceed as authenticated.
 *
 * In a real scenario, you might:
 * 1. Use Supabase test credentials with magic link
 * 2. Use Supabase service role to generate tokens
 * 3. Mock the auth endpoint
 *
 * For E2E testing, we use a test-mode bypass that the app recognizes.
 */
export async function login(page: Page, user = TEST_USER): Promise<void> {
  // Set test authentication headers/cookies that the app will recognize in test mode
  // The app should check for these in test environment and treat as authenticated

  await page.context().addCookies([
    {
      name: 'sb-test-auth-token',
      value: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { full_name: user.name },
        },
        expires_at: Date.now() + 3600000, // 1 hour
      }),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'x-test-user-id',
      value: user.id,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'x-test-user-email',
      value: user.email,
      domain: 'localhost',
      path: '/',
    },
  ]);

  // Also set localStorage for client-side auth state
  await page.addInitScript((userData) => {
    localStorage.setItem(
      'sb-test-auth',
      JSON.stringify({
        user: {
          id: userData.id,
          email: userData.email,
          user_metadata: { full_name: userData.name },
        },
      })
    );
  }, user);
}

/**
 * Performs a real login flow through the UI (for testing the login page itself)
 */
export async function loginViaUI(page: Page, email: string): Promise<void> {
  await page.goto('/login');

  // Fill in email
  await page.fill('input[type="email"]', email);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for response - in test mode this should auto-redirect
  await page.waitForURL(/\/(dashboard|access)/, { timeout: 10000 });
}

/**
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Clear auth cookies
  await page.context().clearCookies();

  // Clear localStorage
  await page.evaluate(() => {
    localStorage.removeItem('sb-test-auth');
  });

  // Navigate to login to confirm logout
  await page.goto('/login');
}

/**
 * Checks if the page shows authenticated state
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for sidebar which only appears when authenticated
  const sidebar = await page
    .locator('.corolla-sidebar, [class*="sidebar"]')
    .count();
  return sidebar > 0;
}

/**
 * Sets up page with authentication and navigates to a path
 */
export async function loginAndNavigate(
  page: Page,
  path: string,
  user = TEST_USER
): Promise<void> {
  await login(page, user);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to create an authenticated context for parallel tests
 */
export async function createAuthenticatedContext(
  context: BrowserContext,
  user = TEST_USER
): Promise<BrowserContext> {
  await context.addCookies([
    {
      name: 'x-test-user-id',
      value: user.id,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'x-test-user-email',
      value: user.email,
      domain: 'localhost',
      path: '/',
    },
  ]);

  return context;
}

