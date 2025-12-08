import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavLinkItem } from '@/components/nav/NavLinkItem';
import { Home, Settings } from 'lucide-react';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('NavLinkItem', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard');
  });

  it('renders the link with correct href', () => {
    render(<NavLinkItem href="/dashboard" label="Dashboard" icon={Home} />);

    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders the label text', () => {
    render(<NavLinkItem href="/dashboard" label="Dashboard" icon={Home} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('marks link as active when pathname matches exactly (with exact=true)', () => {
    mockPathname.mockReturnValue('/dashboard');

    render(
      <NavLinkItem href="/dashboard" label="Dashboard" icon={Home} exact />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-accent');
    expect(link).toHaveClass('font-medium');
  });

  it('does not mark link as active when pathname is a subpath (with exact=true)', () => {
    mockPathname.mockReturnValue('/dashboard/access');

    render(
      <NavLinkItem href="/dashboard" label="Dashboard" icon={Home} exact />
    );

    const link = screen.getByRole('link');
    expect(link).not.toHaveClass('font-medium');
    expect(link).toHaveClass('text-muted-foreground');
  });

  it('marks link as active when pathname starts with href (without exact)', () => {
    mockPathname.mockReturnValue('/dashboard/access');

    render(<NavLinkItem href="/dashboard" label="Dashboard" icon={Home} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-accent');
    expect(link).toHaveClass('font-medium');
  });

  it('marks link as inactive when pathname does not match', () => {
    mockPathname.mockReturnValue('/admin/systems');

    render(<NavLinkItem href="/dashboard" label="Dashboard" icon={Home} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-muted-foreground');
    expect(link).not.toHaveClass('font-medium');
  });

  it('renders with different icons', () => {
    render(<NavLinkItem href="/settings" label="Settings" icon={Settings} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
