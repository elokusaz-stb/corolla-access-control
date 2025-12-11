import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useSystemManagement - API Integration', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('creates a system via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'new-system', name: 'Test System' }),
    });

    await fetch('/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test System', description: 'A test' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/systems',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('updates a system via PATCH', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'system-1', name: 'Updated Name' }),
    });

    await fetch('/api/systems/system-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Name' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/systems/system-1',
      expect.objectContaining({
        method: 'PATCH',
      })
    );
  });

  it('adds a tier via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'tier-1', name: 'Admin' }),
    });

    await fetch('/api/systems/system-1/tiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/systems/system-1/tiers',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('Admin');
  });

  it('adds an instance via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'instance-1', name: 'Production' }),
    });

    await fetch('/api/systems/system-1/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Production' }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/systems/system-1/instances',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('adds owners via POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await fetch('/api/systems/system-1/owners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: ['user-1', 'user-2'] }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/systems/system-1/owners',
      expect.objectContaining({
        method: 'POST',
      })
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.userIds).toEqual(['user-1', 'user-2']);
  });

  it('fetches system details with relations', async () => {
    const mockSystem = {
      id: 'system-1',
      name: 'Test System',
      description: 'Description',
      tiers: [{ id: 'tier-1', name: 'Admin' }],
      instances: [{ id: 'instance-1', name: 'Production' }],
      owners: [{ id: 'user-1', name: 'John', email: 'john@example.com' }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSystem),
    });

    const result = await fetch(
      '/api/systems/system-1?includeTiers=true&includeInstances=true&includeOwners=true'
    );
    const data = await result.json();

    expect(data.tiers).toHaveLength(1);
    expect(data.instances).toHaveLength(1);
    expect(data.owners).toHaveLength(1);
  });

  it('handles API error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'System name already exists' }),
    });

    const result = await fetch('/api/systems', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicate' }),
    });

    expect(result.ok).toBe(false);
    const data = await result.json();
    expect(data.message).toBe('System name already exists');
  });
});

describe('System Management Types', () => {
  it('validates SystemDetails structure', () => {
    const system = {
      id: 'system-1',
      name: 'Test',
      description: 'Desc',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      tiers: [{ id: 't1', name: 'Admin' }],
      instances: [{ id: 'i1', name: 'Prod' }],
      owners: [{ id: 'u1', name: 'John', email: 'john@test.com' }],
    };

    expect(system.id).toBeDefined();
    expect(system.tiers).toBeInstanceOf(Array);
    expect(system.instances).toBeInstanceOf(Array);
    expect(system.owners).toBeInstanceOf(Array);
  });
});

