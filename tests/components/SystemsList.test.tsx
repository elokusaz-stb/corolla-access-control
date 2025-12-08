import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemsList } from '@/components/systems/SystemsList';

describe('SystemsList', () => {
  const mockSystems = [
    {
      id: 'system-1',
      name: 'Magento',
      description: 'E-commerce platform',
      tiers: [{ id: 'tier-1', name: 'Admin' }],
      instances: [],
      owners: [],
    },
    {
      id: 'system-2',
      name: 'Salesforce',
      description: 'CRM platform',
      tiers: [],
      instances: [{ id: 'instance-1', name: 'Production' }],
      owners: [],
    },
  ];

  it('renders search input', () => {
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/search systems/i)).toBeInTheDocument();
  });

  it('renders all systems', () => {
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByText('Magento')).toBeInTheDocument();
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <SystemsList
        systems={[]}
        isLoading={true}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    // Should not show "No systems yet" while loading
    expect(screen.queryByText('No systems yet')).not.toBeInTheDocument();
  });

  it('shows empty state when no systems', () => {
    render(
      <SystemsList
        systems={[]}
        isLoading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByText('No systems yet')).toBeInTheDocument();
  });

  it('filters systems by search query', () => {
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery="Mag"
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByText('Magento')).toBeInTheDocument();
    expect(screen.queryByText('Salesforce')).not.toBeInTheDocument();
  });

  it('shows no results message when search has no matches', () => {
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery="NonExistent"
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByText('No systems found')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', () => {
    const onSearchChange = vi.fn();
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery=""
        onSearchChange={onSearchChange}
        onManage={() => {}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/search systems/i), {
      target: { value: 'test' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('shows system count in footer', () => {
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={() => {}}
      />
    );

    expect(screen.getByText('2 systems')).toBeInTheDocument();
  });

  it('calls onManage when system manage button clicked', () => {
    const onManage = vi.fn();
    render(
      <SystemsList
        systems={mockSystems}
        isLoading={false}
        searchQuery=""
        onSearchChange={() => {}}
        onManage={onManage}
      />
    );

    const manageButtons = screen.getAllByText('Manage');
    fireEvent.click(manageButtons[0]);

    expect(onManage).toHaveBeenCalledWith('system-1');
  });
});
