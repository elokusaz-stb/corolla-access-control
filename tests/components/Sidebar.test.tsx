import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders the brand logo and name', () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.getByText('Corolla')).toBeInTheDocument();
  });

  it('renders all navigation sections', () => {
    render(<Sidebar user={mockUser} />);

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar user={mockUser} />);

    // Main section
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Access Overview')).toBeInTheDocument();

    // Actions section
    expect(screen.getByText('Log Access Grant')).toBeInTheDocument();
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();

    // Admin section
    expect(screen.getByText('Systems')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('displays user information when provided', () => {
    render(<Sidebar user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays user initial in avatar', () => {
    render(<Sidebar user={mockUser} />);

    // Check for the first letter of the name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses email initial when name is not provided', () => {
    render(<Sidebar user={{ email: 'test@example.com' }} />);

    expect(screen.getByText('t')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders logout button when onLogout is provided', () => {
    const handleLogout = vi.fn();
    render(<Sidebar user={mockUser} onLogout={handleLogout} />);

    const logoutButton = screen.getByTitle('Log out');
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const handleLogout = vi.fn();
    render(<Sidebar user={mockUser} onLogout={handleLogout} />);

    const logoutButton = screen.getByTitle('Log out');
    fireEvent.click(logoutButton);

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('does not render logout button when onLogout is not provided', () => {
    render(<Sidebar user={mockUser} />);

    expect(screen.queryByTitle('Log out')).not.toBeInTheDocument();
  });

  it('does not render user section when user is not provided', () => {
    render(<Sidebar />);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });
});
