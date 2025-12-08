import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';

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

describe('AuthenticatedLayout', () => {
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
      <AuthenticatedLayout user={mockUser}>
        <div>Test Content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar with user information', () => {
    render(
      <AuthenticatedLayout user={mockUser}>
        <div>Content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders topbar with page title', () => {
    render(
      <AuthenticatedLayout user={mockUser} pageTitle="My Page Title">
        <div>Content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByText('My Page Title')).toBeInTheDocument();
  });

  it('renders all navigation sections', () => {
    render(
      <AuthenticatedLayout user={mockUser}>
        <div>Content</div>
      </AuthenticatedLayout>
    );

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    render(
      <AuthenticatedLayout user={mockUser}>
        <div>Content</div>
      </AuthenticatedLayout>
    );

    const logoutButton = screen.getByTitle('Log out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows mobile menu button in topbar', () => {
    render(
      <AuthenticatedLayout user={mockUser}>
        <div>Content</div>
      </AuthenticatedLayout>
    );

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('renders quick action CTA button in topbar', () => {
    render(
      <AuthenticatedLayout user={mockUser}>
        <div>Content</div>
      </AuthenticatedLayout>
    );

    // There are two links to /access/new - one in sidebar and one in topbar
    const ctaButtons = screen.getAllByRole('link', {
      name: /log access grant/i,
    });
    expect(ctaButtons.length).toBeGreaterThan(0);
    expect(ctaButtons[0]).toHaveAttribute('href', '/access/new');
  });
});
