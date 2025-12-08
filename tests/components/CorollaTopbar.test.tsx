import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorollaTopbar } from '@/components/layout/CorollaTopbar';

describe('CorollaTopbar', () => {
  it('renders without crashing', () => {
    render(<CorollaTopbar />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the page title when provided', () => {
    render(<CorollaTopbar title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<CorollaTopbar />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders the Quick Grant button', () => {
    render(<CorollaTopbar />);
    const ctaButton = screen.getByRole('link', { name: /quick grant/i });
    expect(ctaButton).toHaveAttribute('href', '/access/new');
  });

  it('Quick Grant button has correct styling', () => {
    render(<CorollaTopbar />);
    const ctaButton = screen.getByRole('link', { name: /quick grant/i });
    expect(ctaButton).toHaveClass('corolla-btn-primary');
  });

  it('renders menu button when onMenuClick is provided', () => {
    const handleMenuClick = vi.fn();
    render(<CorollaTopbar onMenuClick={handleMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('calls onMenuClick when menu button is clicked', () => {
    const handleMenuClick = vi.fn();
    render(<CorollaTopbar onMenuClick={handleMenuClick} />);

    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });

  it('does not render menu button when onMenuClick is not provided', () => {
    render(<CorollaTopbar />);
    expect(
      screen.queryByRole('button', { name: /toggle menu/i })
    ).not.toBeInTheDocument();
  });

  it('has corolla-topbar class', () => {
    render(<CorollaTopbar />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('corolla-topbar');
  });
});
