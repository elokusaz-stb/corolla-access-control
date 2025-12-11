import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSelect } from '@/components/access-requests/UserSelect';
import * as useUsersHook from '@/hooks/useUsers';

// Mock the hook
vi.mock('@/hooks/useUsers', () => ({
    useUsers: vi.fn(),
}));

describe('UserSelect', () => {
    const mockOnSelect = vi.fn();
    const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        managerId: 'manager-1',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders search input initially', () => {
        (useUsersHook.useUsers as any).mockReturnValue({
            users: [],
            isLoading: false,
        });

        render(<UserSelect selectedUser={null} onSelect={mockOnSelect} />);
        expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
    });

    it('renders selected user details', () => {
        render(<UserSelect selectedUser={mockUser} onSelect={mockOnSelect} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Change')).toBeInTheDocument();
    });

    it('calls onSelect when a user is clicked', async () => {
        (useUsersHook.useUsers as any).mockReturnValue({
            users: [mockUser],
            isLoading: false,
        });

        render(<UserSelect selectedUser={null} onSelect={mockOnSelect} />);

        const input = screen.getByPlaceholderText(/search by name or email/i);
        fireEvent.change(input, { target: { value: 'Jo' } });
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('John Doe'));

        expect(mockOnSelect).toHaveBeenCalledWith(mockUser);
    });

    it('clears selection when Change is clicked', () => {
        render(<UserSelect selectedUser={mockUser} onSelect={mockOnSelect} />);

        fireEvent.click(screen.getByText('Change'));

        expect(mockOnSelect).toHaveBeenCalledWith(null);
    });
});
