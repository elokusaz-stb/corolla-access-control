import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorollaSidebar } from '@/components/layout/CorollaSidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('CorollaSidebar', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders the brand logo and name', () => {
    render(<CorollaSidebar user={mockUser} />);
    expect(screen.getByText('Corolla')).toBeInTheDocument();
  });

  it('renders all navigation sections', () => {
    render(<CorollaSidebar user={mockUser} />);

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<CorollaSidebar user={mockUser} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Access Overview')).toBeInTheDocument();
    expect(screen.getByText('Log Access Grant')).toBeInTheDocument();
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
    expect(screen.getByText('Systems')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('displays user information when provided', () => {
    render(<CorollaSidebar user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays user initial in avatar', () => {
    render(<CorollaSidebar user={mockUser} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses email initial when name is not provided', () => {
    render(<CorollaSidebar user={{ email: 'test@example.com' }} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders logout button when onLogout is provided', () => {
    const handleLogout = vi.fn();
    render(<CorollaSidebar user={mockUser} onLogout={handleLogout} />);

    const logoutButton = screen.getByTitle('Log out');
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const handleLogout = vi.fn();
    render(<CorollaSidebar user={mockUser} onLogout={handleLogout} />);

    fireEvent.click(screen.getByTitle('Log out'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('applies active styles to current route', () => {
    render(<CorollaSidebar user={mockUser} />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('corolla-nav-item--active');
  });

  it('applies inactive styles to non-current routes', () => {
    render(<CorollaSidebar user={mockUser} />);

    const systemsLink = screen.getByRole('link', { name: /systems/i });
    expect(systemsLink).toHaveClass('corolla-nav-item--inactive');
  });
});

