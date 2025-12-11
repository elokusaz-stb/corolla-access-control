import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InsertGrantsButton } from '@/components/bulk/InsertGrantsButton';

describe('InsertGrantsButton', () => {
  it('renders count and button in default state', () => {
    render(
      <InsertGrantsButton
        count={5}
        onInsert={() => {}}
        isInserting={false}
        isSuccess={false}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/access grants ready/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /insert access grants/i })
    ).toBeInTheDocument();
  });

  it('uses singular form for count of 1', () => {
    render(
      <InsertGrantsButton
        count={1}
        onInsert={() => {}}
        isInserting={false}
        isSuccess={false}
      />
    );

    expect(screen.getByText(/access grant ready/i)).toBeInTheDocument();
  });

  it('calls onInsert when button clicked', () => {
    const onInsert = vi.fn();
    render(
      <InsertGrantsButton
        count={5}
        onInsert={onInsert}
        isInserting={false}
        isSuccess={false}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onInsert).toHaveBeenCalled();
  });

  it('shows loading state when inserting', () => {
    render(
      <InsertGrantsButton
        count={5}
        onInsert={() => {}}
        isInserting={true}
        isSuccess={false}
      />
    );

    expect(screen.getByText('Inserting...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows success state', () => {
    render(
      <InsertGrantsButton
        count={5}
        onInsert={() => {}}
        isInserting={false}
        isSuccess={true}
      />
    );

    expect(
      screen.getByText(/successfully inserted 5 access grants/i)
    ).toBeInTheDocument();
  });

  it('uses singular form in success message for count of 1', () => {
    render(
      <InsertGrantsButton
        count={1}
        onInsert={() => {}}
        isInserting={false}
        isSuccess={true}
      />
    );

    expect(
      screen.getByText(/successfully inserted 1 access grant!/i)
    ).toBeInTheDocument();
  });
});

