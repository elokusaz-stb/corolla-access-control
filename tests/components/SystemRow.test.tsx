import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemRow } from '@/components/systems/SystemRow';

describe('SystemRow', () => {
  const mockSystem = {
    id: 'system-1',
    name: 'Magento',
    description: 'E-commerce platform',
    tiers: [
      { id: 'tier-1', name: 'Admin' },
      { id: 'tier-2', name: 'Editor' },
    ],
    instances: [{ id: 'instance-1', name: 'Production' }],
    owners: [
      { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
      { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    ],
  };

  it('renders system name and description', () => {
    render(<SystemRow system={mockSystem} onManage={() => {}} />);

    expect(screen.getByText('Magento')).toBeInTheDocument();
    expect(screen.getByText('E-commerce platform')).toBeInTheDocument();
  });

  it('shows "No description" when description is null', () => {
    const systemWithoutDesc = { ...mockSystem, description: null };
    render(<SystemRow system={systemWithoutDesc} onManage={() => {}} />);

    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('displays correct tier count', () => {
    render(<SystemRow system={mockSystem} onManage={() => {}} />);

    expect(screen.getByText('2 tiers')).toBeInTheDocument();
  });

  it('displays singular tier when count is 1', () => {
    const systemWithOneTier = {
      ...mockSystem,
      tiers: [{ id: 'tier-1', name: 'Admin' }],
    };
    render(<SystemRow system={systemWithOneTier} onManage={() => {}} />);

    expect(screen.getByText('1 tier')).toBeInTheDocument();
  });

  it('displays correct instance count', () => {
    render(<SystemRow system={mockSystem} onManage={() => {}} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders owner avatars', () => {
    render(<SystemRow system={mockSystem} onManage={() => {}} />);

    expect(screen.getByTitle('John Doe')).toBeInTheDocument();
    expect(screen.getByTitle('Jane Smith')).toBeInTheDocument();
  });

  it('shows "No owners" when there are no owners', () => {
    const systemWithoutOwners = { ...mockSystem, owners: [] };
    render(<SystemRow system={systemWithoutOwners} onManage={() => {}} />);

    expect(screen.getByText('No owners')).toBeInTheDocument();
  });

  it('shows +N badge when more than 3 owners', () => {
    const systemWithManyOwners = {
      ...mockSystem,
      owners: [
        { id: 'user-1', name: 'User One', email: 'one@example.com' },
        { id: 'user-2', name: 'User Two', email: 'two@example.com' },
        { id: 'user-3', name: 'User Three', email: 'three@example.com' },
        { id: 'user-4', name: 'User Four', email: 'four@example.com' },
        { id: 'user-5', name: 'User Five', email: 'five@example.com' },
      ],
    };
    render(<SystemRow system={systemWithManyOwners} onManage={() => {}} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('calls onManage with system id when Manage button clicked', () => {
    const onManage = vi.fn();
    render(<SystemRow system={mockSystem} onManage={onManage} />);

    fireEvent.click(screen.getByText('Manage'));

    expect(onManage).toHaveBeenCalledWith('system-1');
  });
});
