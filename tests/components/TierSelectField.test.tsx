import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TierSelectField } from '@/components/access/form/TierSelectField';

describe('TierSelectField', () => {
  const mockTiers = [
    { id: 'tier-1', name: 'Viewer' },
    { id: 'tier-2', name: 'Editor' },
    { id: 'tier-3', name: 'Admin' },
  ];

  it('renders with placeholder when no value selected', () => {
    render(
      <TierSelectField value={null} onChange={() => {}} tiers={mockTiers} />
    );

    expect(screen.getByText('Select access tier...')).toBeInTheDocument();
  });

  it('renders selected value', () => {
    render(
      <TierSelectField
        value={mockTiers[1]}
        onChange={() => {}}
        tiers={mockTiers}
      />
    );

    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(
      <TierSelectField value={null} onChange={() => {}} tiers={mockTiers} />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('calls onChange when tier is selected', () => {
    const handleChange = vi.fn();
    render(
      <TierSelectField value={null} onChange={handleChange} tiers={mockTiers} />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Admin'));

    expect(handleChange).toHaveBeenCalledWith(mockTiers[2]);
  });

  it('shows disabled message when no tiers available', () => {
    render(<TierSelectField value={null} onChange={() => {}} tiers={[]} />);

    expect(screen.getByText('Select a system first')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when error prop provided', () => {
    render(
      <TierSelectField
        value={null}
        onChange={() => {}}
        tiers={mockTiers}
        error="Please select a tier"
      />
    );

    expect(screen.getByText('Please select a tier')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <TierSelectField
        value={null}
        onChange={() => {}}
        tiers={mockTiers}
        disabled
      />
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders label', () => {
    render(
      <TierSelectField value={null} onChange={() => {}} tiers={mockTiers} />
    );

    expect(screen.getByText('Access Tier')).toBeInTheDocument();
  });
});
