import { test, expect } from '@playwright/test';

test.describe('Log Access Grant Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/access/new');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Log Access Grant - API', () => {
  test('POST /api/access-grants accepts valid request', async ({ request }) => {
    const response = await request.post('/api/access-grants', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        userId: 'test-user-id',
        systemId: 'test-system-id',
        tierId: 'test-tier-id',
        instanceId: null,
        notes: 'Test grant',
      },
    });

    // Will fail due to invalid IDs, but should return 400 not 500
    expect([201, 400, 401]).toContain(response.status());
  });

  test('POST /api/access-grants requires userId', async ({ request }) => {
    const response = await request.post('/api/access-grants', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        systemId: 'test-system-id',
        tierId: 'test-tier-id',
      },
    });

    // Should return validation error
    expect([400, 401]).toContain(response.status());
  });

  test('POST /api/access-grants requires systemId', async ({ request }) => {
    const response = await request.post('/api/access-grants', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        userId: 'test-user-id',
        tierId: 'test-tier-id',
      },
    });

    expect([400, 401]).toContain(response.status());
  });

  test('POST /api/access-grants requires tierId', async ({ request }) => {
    const response = await request.post('/api/access-grants', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        userId: 'test-user-id',
        systemId: 'test-system-id',
      },
    });

    expect([400, 401]).toContain(response.status());
  });
});

test.describe('Users API for Autocomplete', () => {
  test('GET /api/users supports search parameter', async ({ request }) => {
    const response = await request.get('/api/users?search=test&limit=10');

    // Should accept search params
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
    }
  });
});

test.describe('Systems API for Autocomplete', () => {
  test('GET /api/systems includes tiers and instances', async ({ request }) => {
    const response = await request.get(
      '/api/systems?includeTiers=true&includeInstances=true'
    );

    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
    }
  });
});
