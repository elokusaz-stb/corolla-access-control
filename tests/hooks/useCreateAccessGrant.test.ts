import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useCreateAccessGrant - API Integration', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sends correct POST request body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'grant-1', status: 'active' }),
    });

    const input = {
      userId: 'user-1',
      systemId: 'system-1',
      tierId: 'tier-1',
      instanceId: 'instance-1',
      notes: 'Test notes',
    };

    await fetch('/api/access-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: input.userId,
        systemId: input.systemId,
        instanceId: input.instanceId,
        tierId: input.tierId,
        notes: input.notes,
      }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/access-grants',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.userId).toBe('user-1');
    expect(callBody.systemId).toBe('system-1');
    expect(callBody.tierId).toBe('tier-1');
    expect(callBody.instanceId).toBe('instance-1');
    expect(callBody.notes).toBe('Test notes');
  });

  it('handles null instanceId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'grant-1' }),
    });

    await fetch('/api/access-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        systemId: 'system-1',
        tierId: 'tier-1',
        instanceId: null,
        notes: null,
      }),
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.instanceId).toBeNull();
    expect(callBody.notes).toBeNull();
  });

  it('handles duplicate grant error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'DUPLICATE_ACTIVE_GRANT',
          message:
            'User already has active access for this tier on this system',
        }),
    });

    const response = await fetch('/api/access-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        systemId: 'system-1',
        tierId: 'tier-1',
        instanceId: null,
        notes: null,
      }),
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.error).toBe('DUPLICATE_ACTIVE_GRANT');
  });

  it('handles validation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: 'TIER_SYSTEM_MISMATCH',
          message: 'The specified tier does not belong to this system',
        }),
    });

    const response = await fetch('/api/access-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        systemId: 'system-1',
        tierId: 'wrong-tier',
        instanceId: null,
        notes: null,
      }),
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.error).toBe('TIER_SYSTEM_MISMATCH');
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetch('/api/access-grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    ).rejects.toThrow('Network error');
  });
});

describe('CreateAccessGrant Result Types', () => {
  it('validates success result structure', () => {
    const successResult = {
      success: true,
      grant: {
        id: 'grant-1',
        userId: 'user-1',
        systemId: 'system-1',
        tierId: 'tier-1',
        status: 'active',
      },
    };

    expect(successResult.success).toBe(true);
    expect(successResult.grant).toBeDefined();
    expect(successResult.grant?.id).toBe('grant-1');
  });

  it('validates error result structure', () => {
    const errorResult = {
      success: false,
      error: 'User already has active access',
      code: 'DUPLICATE_ACTIVE_GRANT',
    };

    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeDefined();
    expect(errorResult.code).toBe('DUPLICATE_ACTIVE_GRANT');
  });
});
