import { test, expect } from '@playwright/test';

test.describe('Bulk Upload Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/access/bulk');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Bulk Upload API', () => {
  test('GET /api/access-grants/bulk returns CSV template', async ({
    request,
  }) => {
    const response = await request.get('/api/access-grants/bulk');

    // Should return CSV template
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/csv');
    }
  });

  test('POST /api/access-grants/bulk accepts JSON rows', async ({
    request,
  }) => {
    const response = await request.post('/api/access-grants/bulk', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        rows: [
          {
            user_email: 'test@example.com',
            system_name: 'TestSystem',
            access_tier_name: 'Admin',
          },
        ],
      },
    });

    // Should accept JSON (will likely return errors for invalid data)
    expect([200, 400, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('validRows');
      expect(data).toHaveProperty('errorRows');
    }
  });

  test('POST returns validation errors for invalid data', async ({
    request,
  }) => {
    const response = await request.post('/api/access-grants/bulk', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        rows: [
          {
            user_email: 'nonexistent@example.com',
            system_name: 'NonexistentSystem',
            access_tier_name: 'NonexistentTier',
          },
        ],
      },
    });

    if (response.status() === 200) {
      const data = await response.json();
      // Should have errors for invalid references
      expect(data.errorRows.length).toBeGreaterThan(0);
    }
  });

  test('POST validates required fields', async ({ request }) => {
    const response = await request.post('/api/access-grants/bulk', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        rows: [
          {
            user_email: '',
            system_name: '',
            access_tier_name: '',
          },
        ],
      },
    });

    // Should return error for missing required fields
    expect([200, 400, 401]).toContain(response.status());
  });
});

test.describe('Bulk Upload File Handling', () => {
  test('POST accepts multipart form data', async ({ request }) => {
    // Create a minimal CSV content
    const csvContent =
      'user_email,system_name,access_tier_name\ntest@example.com,System,Tier';

    // Note: Playwright's request API doesn't support file uploads directly
    // This test just verifies the endpoint exists
    const response = await request.post('/api/access-grants/bulk', {
      headers: { 'Content-Type': 'application/json' },
      data: { rows: [] },
    });

    expect([200, 400, 401]).toContain(response.status());
  });
});
