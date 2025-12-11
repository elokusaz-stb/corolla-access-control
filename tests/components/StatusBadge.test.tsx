import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/access/StatusBadge';

describe('StatusBadge', () => {
  it('renders active badge correctly', () => {
    render(<StatusBadge status="active" />);

    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('corolla-badge--active');
  });

  it('renders removed badge correctly', () => {
    render(<StatusBadge status="removed" />);

    const badge = screen.getByText('Removed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('corolla-badge--removed');
  });

  it('applies custom className', () => {
    render(<StatusBadge status="active" className="custom-class" />);

    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('custom-class');
  });

  it('has base corolla-badge class', () => {
    render(<StatusBadge status="active" />);

    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('corolla-badge');
  });
});

