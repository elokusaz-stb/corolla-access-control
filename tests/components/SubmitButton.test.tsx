import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmitButton } from '@/components/access/form/SubmitButton';

describe('SubmitButton', () => {
  it('renders default state correctly', () => {
    render(<SubmitButton isLoading={false} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Log Access Grant');
    expect(button).not.toBeDisabled();
  });

  it('shows loading state', () => {
    render(<SubmitButton isLoading={true} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Creating Access Grant...');
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<SubmitButton isLoading={false} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when both loading and disabled', () => {
    render(<SubmitButton isLoading={true} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('has submit type', () => {
    render(<SubmitButton isLoading={false} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('has corolla primary button styling', () => {
    render(<SubmitButton isLoading={false} disabled={false} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-corolla-primary');
    expect(button).toHaveClass('rounded-full');
  });
});

