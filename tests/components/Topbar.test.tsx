import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Topbar } from '@/components/layout/Topbar';

describe('Topbar', () => {
  it('renders without crashing', () => {
    render(<Topbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the page title when provided', () => {
    render(<Topbar title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<Topbar />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the quick action button', () => {
    render(<Topbar />);
    const ctaButton = screen.getByRole('link', { name: /log access grant/i });
    expect(ctaButton).toHaveAttribute('href', '/access/new');
  });

  it('renders search bar when showSearch is true', () => {
    render(<Topbar showSearch />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('does not render search bar by default', () => {
    render(<Topbar />);
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('renders menu button when onMenuClick is provided', () => {
    const handleMenuClick = vi.fn();
    render(<Topbar onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    const handleMenuClick = vi.fn();
    render(<Topbar onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });

  it('does not render menu button when onMenuClick is not provided', () => {
    render(<Topbar />);
    expect(
      screen.queryByRole('button', { name: /toggle menu/i })
    ).not.toBeInTheDocument();
  });
});
