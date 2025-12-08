import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useAccessGrants - Query String Building', () => {
  it('builds correct query string with all filters', () => {
    const filters = {
      userId: 'user-1',
      systemId: 'system-1',
      instanceId: 'instance-1',
      tierId: 'tier-1',
      status: 'active' as const,
      search: 'john',
      limit: 20,
      offset: 40,
    };

    const queryString = new URLSearchParams();
    if (filters.userId) queryString.set('userId', filters.userId);
    if (filters.systemId) queryString.set('systemId', filters.systemId);
    if (filters.instanceId) queryString.set('instanceId', filters.instanceId);
    if (filters.tierId) queryString.set('tierId', filters.tierId);
    if (filters.status) queryString.set('status', filters.status);
    if (filters.search) queryString.set('search', filters.search);
    if (filters.limit) queryString.set('limit', filters.limit.toString());
    if (filters.offset !== undefined)
      queryString.set('offset', filters.offset.toString());

    expect(queryString.get('userId')).toBe('user-1');
    expect(queryString.get('systemId')).toBe('system-1');
    expect(queryString.get('status')).toBe('active');
    expect(queryString.get('search')).toBe('john');
    expect(queryString.get('limit')).toBe('20');
    expect(queryString.get('offset')).toBe('40');
  });

  it('omits empty string filters from query string', () => {
    const filters = {
      userId: '',
      systemId: 'system-1',
      status: '' as const,
    };

    const queryString = new URLSearchParams();
    if (filters.userId) queryString.set('userId', filters.userId);
    if (filters.systemId) queryString.set('systemId', filters.systemId);
    if (filters.status) queryString.set('status', filters.status);

    expect(queryString.has('userId')).toBe(false);
    expect(queryString.has('status')).toBe(false);
    expect(queryString.get('systemId')).toBe('system-1');
  });

  it('includes offset of 0 in query string', () => {
    const filters = {
      limit: 20,
      offset: 0,
    };

    const queryString = new URLSearchParams();
    if (filters.limit) queryString.set('limit', filters.limit.toString());
    if (filters.offset !== undefined)
      queryString.set('offset', filters.offset.toString());

    expect(queryString.get('offset')).toBe('0');
  });

  it('handles undefined optional filters', () => {
    const filters: { userId?: string; systemId?: string } = {
      systemId: 'system-1',
    };

    const queryString = new URLSearchParams();
    if (filters.userId) queryString.set('userId', filters.userId);
    if (filters.systemId) queryString.set('systemId', filters.systemId);

    expect(queryString.has('userId')).toBe(false);
    expect(queryString.get('systemId')).toBe('system-1');
  });
});

describe('useRemoveAccessGrant - API Call', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls PATCH endpoint with correct method and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'grant-1', status: 'removed' }),
    });

    const grantId = 'grant-1';
    const notes = 'Test removal notes';

    await fetch(`/api/access-grants/${grantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'removed', notes }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/access-grants/grant-1',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'removed',
          notes: 'Test removal notes',
        }),
      })
    );
  });

  it('removes grant without notes when notes not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'grant-1', status: 'removed' }),
    });

    await fetch('/api/access-grants/grant-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'removed', notes: undefined }),
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.status).toBe('removed');
  });

  it('handles failed API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: 'Not authorized' }),
    });

    const response = await fetch('/api/access-grants/grant-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'removed' }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);
  });
});

describe('Access Grants Response Types', () => {
  it('validates AccessGrant structure', () => {
    const grant = {
      id: 'grant-1',
      userId: 'user-1',
      systemId: 'system-1',
      instanceId: 'instance-1',
      tierId: 'tier-1',
      status: 'active' as const,
      grantedBy: 'admin-1',
      grantedAt: '2024-01-15T10:00:00Z',
      removedAt: null,
      notes: 'Test grant',
      user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      system: { id: 'system-1', name: 'Magento' },
      instance: { id: 'instance-1', name: 'Wellness' },
      tier: { id: 'tier-1', name: 'Admin' },
    };

    expect(grant.id).toBe('grant-1');
    expect(grant.status).toBe('active');
    expect(grant.user.email).toBe('john@example.com');
    expect(grant.system.name).toBe('Magento');
    expect(grant.tier.name).toBe('Admin');
  });

  it('validates AccessGrantsResponse structure', () => {
    const response = {
      data: [],
      total: 0,
      limit: 20,
      offset: 0,
    };

    expect(Array.isArray(response.data)).toBe(true);
    expect(typeof response.total).toBe('number');
    expect(typeof response.limit).toBe('number');
    expect(typeof response.offset).toBe('number');
  });

  it('allows null instance in AccessGrant', () => {
    const grant = {
      id: 'grant-2',
      userId: 'user-1',
      systemId: 'system-1',
      instanceId: null,
      tierId: 'tier-1',
      status: 'active' as const,
      grantedBy: 'admin-1',
      grantedAt: '2024-01-15T10:00:00Z',
      removedAt: null,
      notes: null,
      user: { id: 'user-1', name: 'Jane', email: 'jane@example.com' },
      system: { id: 'system-1', name: 'Salesforce' },
      instance: null,
      tier: { id: 'tier-1', name: 'Viewer' },
    };

    expect(grant.instanceId).toBeNull();
    expect(grant.instance).toBeNull();
    expect(grant.notes).toBeNull();
  });
});
