import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CorollaAppShell } from '@/components/layout/CorollaAppShell';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock Supabase client
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

describe('CorollaAppShell', () => {
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(
      <CorollaAppShell user={mockUser}>
        <div>Test Content</div>
      </CorollaAppShell>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar with user information', () => {
    render(
      <CorollaAppShell user={mockUser}>
        <div>Content</div>
      </CorollaAppShell>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders all navigation sections', () => {
    render(
      <CorollaAppShell user={mockUser}>
        <div>Content</div>
      </CorollaAppShell>
    );

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    render(
      <CorollaAppShell user={mockUser}>
        <div>Content</div>
      </CorollaAppShell>
    );

    fireEvent.click(screen.getByTitle('Log out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('renders Quick Grant CTA button in topbar', () => {
    render(
      <CorollaAppShell user={mockUser}>
        <div>Content</div>
      </CorollaAppShell>
    );

    const ctaButton = screen.getByRole('link', { name: /quick grant/i });
    expect(ctaButton).toHaveAttribute('href', '/access/new');
  });

  it('applies corolla-window styling to container', () => {
    const { container } = render(
      <CorollaAppShell user={mockUser}>
        <div>Content</div>
      </CorollaAppShell>
    );

    const window = container.querySelector('.corolla-window');
    expect(window).toBeInTheDocument();
  });
});

