import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessGrantRow } from '@/components/access/AccessGrantRow';
import type { AccessGrant } from '@/hooks/useAccessGrants';

describe('AccessGrantRow', () => {
  const mockGrant: AccessGrant = {
    id: 'grant-1',
    userId: 'user-1',
    systemId: 'system-1',
    instanceId: 'instance-1',
    tierId: 'tier-1',
    status: 'active',
    grantedBy: 'admin-1',
    grantedAt: '2024-01-15T10:00:00Z',
    removedAt: null,
    notes: null,
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    system: {
      id: 'system-1',
      name: 'Magento',
    },
    instance: {
      id: 'instance-1',
      name: 'Wellness',
    },
    tier: {
      id: 'tier-1',
      name: 'Admin',
    },
  };

  const mockOnRemove = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders user avatar with initial', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders system name', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('Magento')).toBeInTheDocument();
  });

  it('renders instance name', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('Wellness')).toBeInTheDocument();
  });

  it('renders tier name', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders active status badge', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows "All instances" when instance is null', () => {
    const grantWithoutInstance = {
      ...mockGrant,
      instance: null,
      instanceId: null,
    };
    render(
      <AccessGrantRow grant={grantWithoutInstance} onRemove={mockOnRemove} />
    );

    expect(screen.getByText('All instances')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    // Use aria-label instead of title
    const removeButton = screen.getByRole('button', {
      name: /remove access grant for john doe/i,
    });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('grant-1');
    });
  });

  it('disables remove button while removing', async () => {
    const slowRemove = vi
      .fn()
      .mockImplementation(() => new Promise((r) => setTimeout(r, 100)));
    render(<AccessGrantRow grant={mockGrant} onRemove={slowRemove} />);

    const removeButton = screen.getByRole('button', {
      name: /remove access grant for john doe/i,
    });
    fireEvent.click(removeButton);

    expect(removeButton).toBeDisabled();
  });

  it('updates status badge to removed after successful removal', async () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', {
      name: /remove access grant for john doe/i,
    });
    fireEvent.click(removeButton);

    await waitFor(
      () => {
        expect(screen.getByText('Removed')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('does not show remove button when status is already removed', () => {
    const removedGrant = { ...mockGrant, status: 'removed' as const };
    render(<AccessGrantRow grant={removedGrant} onRemove={mockOnRemove} />);

    expect(
      screen.queryByRole('button', { name: /remove access grant/i })
    ).not.toBeInTheDocument();
  });
});
