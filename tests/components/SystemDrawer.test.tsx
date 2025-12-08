import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemDrawer } from '@/components/systems/SystemDrawer';

// Mock the hooks
vi.mock('@/hooks/useSystemManagement', () => ({
  useSystemDetails: vi.fn().mockReturnValue({
    system: {
      id: 'system-1',
      name: 'Test System',
      description: 'Test Description',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      tiers: [
        { id: 'tier-1', name: 'Admin' },
        { id: 'tier-2', name: 'Editor' },
      ],
      instances: [{ id: 'instance-1', name: 'Production' }],
      owners: [{ id: 'user-1', name: 'John Doe', email: 'john@example.com' }],
    },
    isLoading: false,
    revalidate: vi.fn(),
  }),
  useSystemMutations: vi.fn().mockReturnValue({
    isUpdating: false,
    updateSystem: vi.fn(),
    addTier: vi.fn(),
    addInstance: vi.fn(),
    addOwners: vi.fn(),
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: vi.fn().mockReturnValue({
    addToast: vi.fn(),
  }),
}));

describe('SystemDrawer', () => {
  it('does not render when systemId is null', () => {
    render(<SystemDrawer systemId={null} onClose={() => {}} />);

    expect(screen.queryByText('System Management')).not.toBeInTheDocument();
  });

  it('renders when systemId is provided', () => {
    render(<SystemDrawer systemId="system-1" onClose={() => {}} />);

    expect(screen.getByText('Test System')).toBeInTheDocument();
    expect(screen.getByText('System Management')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<SystemDrawer systemId="system-1" onClose={() => {}} />);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText(/Access Tiers/)).toBeInTheDocument();
    expect(screen.getByText(/Instances/)).toBeInTheDocument();
    expect(screen.getByText(/Owners/)).toBeInTheDocument();
  });

  it('shows tier count in tab', () => {
    render(<SystemDrawer systemId="system-1" onClose={() => {}} />);

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('shows instance count in tab', () => {
    render(<SystemDrawer systemId="system-1" onClose={() => {}} />);

    // There are multiple (1) texts - one for instances and one for owners
    const countTexts = screen.getAllByText('(1)');
    expect(countTexts.length).toBeGreaterThan(0);
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<SystemDrawer systemId="system-1" onClose={onClose} />);

    // Find the backdrop (first fixed element with animate-in fade-in)
    const backdrop = document.querySelector('.backdrop-blur-sm');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn();
    render(<SystemDrawer systemId="system-1" onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('switches tabs when clicked', () => {
    render(<SystemDrawer systemId="system-1" onClose={() => {}} />);

    // Click on Access Tiers tab
    fireEvent.click(screen.getByText(/Access Tiers/));

    // Should show tiers content
    expect(
      screen.getByText('Define permission levels for this system')
    ).toBeInTheDocument();
  });
});
