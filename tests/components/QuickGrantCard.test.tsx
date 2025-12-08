import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickGrantCard } from '@/components/access/QuickGrantCard';

describe('QuickGrantCard', () => {
  it('renders the card title', () => {
    render(<QuickGrantCard />);

    expect(screen.getByText('Quick Grant')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<QuickGrantCard />);

    expect(
      screen.getByText(/Need to grant someone access/)
    ).toBeInTheDocument();
  });

  it('renders the Log Access Grant button', () => {
    render(<QuickGrantCard />);

    const button = screen.getByRole('link', { name: /log access grant/i });
    expect(button).toBeInTheDocument();
  });

  it('button links to /access/new', () => {
    render(<QuickGrantCard />);

    const button = screen.getByRole('link', { name: /log access grant/i });
    expect(button).toHaveAttribute('href', '/access/new');
  });

  it('has corolla-quick-grant styling', () => {
    const { container } = render(<QuickGrantCard />);

    const section = container.querySelector('.corolla-quick-grant');
    expect(section).toBeInTheDocument();
  });

  it('button has corolla-btn-primary styling', () => {
    render(<QuickGrantCard />);

    const button = screen.getByRole('link', { name: /log access grant/i });
    expect(button).toHaveClass('corolla-btn-primary');
  });
});
