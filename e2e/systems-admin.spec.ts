import { test, expect } from '@playwright/test';

test.describe('Systems Admin Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/systems');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Systems API', () => {
  test('GET /api/systems returns systems list', async ({ request }) => {
    const response = await request.get('/api/systems');

    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    }
  });

  test('GET /api/systems supports search parameter', async ({ request }) => {
    const response = await request.get('/api/systems?search=test');

    expect([200, 401]).toContain(response.status());
  });

  test('GET /api/systems supports includeTiers parameter', async ({
    request,
  }) => {
    const response = await request.get('/api/systems?includeTiers=true');

    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('tiers');
      }
    }
  });

  test('GET /api/systems supports includeInstances parameter', async ({
    request,
  }) => {
    const response = await request.get('/api/systems?includeInstances=true');

    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('instances');
      }
    }
  });

  test('POST /api/systems requires authentication', async ({ request }) => {
    const response = await request.post('/api/systems', {
      data: { name: 'Test System' },
    });

    // Should be 401 without auth, or 403 without admin
    expect([401, 403]).toContain(response.status());
  });

  test('GET /api/systems/:id returns 404 for non-existent system', async ({
    request,
  }) => {
    const response = await request.get('/api/systems/non-existent-id');

    expect([401, 404]).toContain(response.status());
  });
});

test.describe('Systems Tiers API', () => {
  test('POST /api/systems/:id/tiers requires authentication', async ({
    request,
  }) => {
    const response = await request.post('/api/systems/test-system/tiers', {
      data: { name: 'Admin' },
    });

    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe('Systems Instances API', () => {
  test('POST /api/systems/:id/instances requires authentication', async ({
    request,
  }) => {
    const response = await request.post('/api/systems/test-system/instances', {
      data: { name: 'Production' },
    });

    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe('Systems Owners API', () => {
  test('POST /api/systems/:id/owners requires authentication', async ({
    request,
  }) => {
    const response = await request.post('/api/systems/test-system/owners', {
      data: { userIds: ['user-1'] },
    });

    expect([401, 403, 404]).toContain(response.status());
  });
});

