import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotesField } from '@/components/access/form/NotesField';

describe('NotesField', () => {
  it('renders with placeholder', () => {
    render(<NotesField value="" onChange={() => {}} />);

    expect(
      screen.getByPlaceholderText(/add any relevant notes/i)
    ).toBeInTheDocument();
  });

  it('renders current value', () => {
    render(<NotesField value="Test note" onChange={() => {}} />);

    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<NotesField value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New note' },
    });

    expect(handleChange).toHaveBeenCalledWith('New note');
  });

  it('is disabled when disabled prop is true', () => {
    render(<NotesField value="" onChange={() => {}} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders label with optional indicator', () => {
    render(<NotesField value="" onChange={() => {}} />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('(optional)')).toBeInTheDocument();
  });

  it('renders help text', () => {
    render(<NotesField value="" onChange={() => {}} />);

    expect(screen.getByText(/optional context or reason/i)).toBeInTheDocument();
  });
});
