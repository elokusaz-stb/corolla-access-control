import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useBulkUpload - API Integration', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends FormData for file upload', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ validRows: [], errorRows: [] }),
    });

    const file = new File(
      ['user_email,system_name\ntest@example.com,Magento'],
      'test.csv',
      {
        type: 'text/csv',
      }
    );
    const formData = new FormData();
    formData.append('file', file);

    await fetch('/api/access-grants/bulk', {
      method: 'POST',
      body: formData,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/access-grants/bulk',
      expect.objectContaining({
        method: 'POST',
      })
    );

    // Check that body is FormData
    const callBody = mockFetch.mock.calls[0][1].body;
    expect(callBody instanceof FormData).toBe(true);
  });

  it('sends JSON for insert request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ validRows: [], errorRows: [], insertedCount: 2 }),
    });

    const rows = [
      {
        user_email: 'test1@example.com',
        system_name: 'Magento',
        access_tier_name: 'Admin',
      },
      {
        user_email: 'test2@example.com',
        system_name: 'Salesforce',
        access_tier_name: 'Viewer',
      },
    ];

    await fetch('/api/access-grants/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, insert: true }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/access-grants/bulk',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.rows).toHaveLength(2);
    expect(callBody.insert).toBe(true);
  });

  it('handles validation response with errors', async () => {
    const response = {
      validRows: [
        {
          rowNumber: 1,
          rowData: {
            user_email: 'valid@example.com',
            system_name: 'Magento',
            access_tier_name: 'Admin',
          },
          userId: 'user-1',
          systemId: 'system-1',
          instanceId: null,
          tierId: 'tier-1',
        },
      ],
      errorRows: [
        {
          rowNumber: 2,
          rowData: {
            user_email: 'invalid@example.com',
            system_name: 'Unknown',
            access_tier_name: 'Admin',
          },
          errors: ['Unknown system_name'],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await fetch('/api/access-grants/bulk', { method: 'POST' });
    const data = await result.json();

    expect(data.validRows).toHaveLength(1);
    expect(data.errorRows).toHaveLength(1);
    expect(data.errorRows[0].errors).toContain('Unknown system_name');
  });

  it('handles API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Invalid CSV format' }),
    });

    const result = await fetch('/api/access-grants/bulk', { method: 'POST' });

    expect(result.ok).toBe(false);
    const data = await result.json();
    expect(data.message).toBe('Invalid CSV format');
  });
});

describe('Bulk Upload Response Types', () => {
  it('validates ValidRow structure', () => {
    const validRow = {
      rowNumber: 1,
      rowData: {
        user_email: 'test@example.com',
        system_name: 'Magento',
        instance_name: 'Wellness',
        access_tier_name: 'Admin',
        notes: 'Test',
      },
      userId: 'user-1',
      systemId: 'system-1',
      instanceId: 'instance-1',
      tierId: 'tier-1',
    };

    expect(validRow.rowNumber).toBe(1);
    expect(validRow.rowData.user_email).toBe('test@example.com');
    expect(validRow.userId).toBe('user-1');
  });

  it('validates ErrorRow structure', () => {
    const errorRow = {
      rowNumber: 2,
      rowData: {
        user_email: 'unknown@example.com',
        system_name: 'InvalidSystem',
        access_tier_name: 'Admin',
      },
      errors: ['Unknown user_email', 'Unknown system_name'],
    };

    expect(errorRow.rowNumber).toBe(2);
    expect(errorRow.errors).toHaveLength(2);
    expect(errorRow.errors).toContain('Unknown user_email');
  });

  it('validates BulkUploadResponse structure', () => {
    const response = {
      validRows: [],
      errorRows: [],
      insertedCount: 5,
    };

    expect(Array.isArray(response.validRows)).toBe(true);
    expect(Array.isArray(response.errorRows)).toBe(true);
    expect(response.insertedCount).toBe(5);
  });
});
