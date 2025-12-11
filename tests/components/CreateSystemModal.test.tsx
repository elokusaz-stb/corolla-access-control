import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateSystemModal } from '@/components/systems/CreateSystemModal';

// Mock the hooks
vi.mock('@/hooks/useSystemManagement', () => ({
  useCreateSystem: vi.fn().mockReturnValue({
    createSystem: vi.fn().mockResolvedValue({ id: 'new-system' }),
    isCreating: false,
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: vi.fn().mockReturnValue({
    addToast: vi.fn(),
  }),
}));

describe('CreateSystemModal', () => {
  it('does not render when isOpen is false', () => {
    render(<CreateSystemModal isOpen={false} onClose={() => {}} />);

    expect(screen.queryByText('Create New System')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<CreateSystemModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Create New System')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<CreateSystemModal isOpen={true} onClose={() => {}} />);

    expect(
      screen.getByPlaceholderText(/salesforce, magento/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/brief description/i)
    ).toBeInTheDocument();
  });

  it('disables submit button when name is empty', () => {
    render(<CreateSystemModal isOpen={true} onClose={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /create system/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when name is provided', () => {
    render(<CreateSystemModal isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText(/salesforce, magento/i), {
      target: { value: 'New System' },
    });

    const submitButton = screen.getByRole('button', { name: /create system/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<CreateSystemModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn();
    render(<CreateSystemModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<CreateSystemModal isOpen={true} onClose={onClose} />);

    // Find the X button in the header
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(onClose).toHaveBeenCalled();
  });
});

