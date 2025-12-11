import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddRequestItemForm } from '@/components/access-requests/AddRequestItemForm';
import * as useSystemsSearchHook from '@/hooks/useSystemsSearch';
import * as useTiersBySystemHook from '@/hooks/useTiersBySystem';
import * as useInstancesBySystemHook from '@/hooks/useInstancesBySystem';

// Mock hooks
vi.mock('@/hooks/useSystemsSearch', () => ({
    useSystemsSearch: vi.fn(),
}));
vi.mock('@/hooks/useTiersBySystem', () => ({
    useTiersBySystem: vi.fn(),
}));
vi.mock('@/hooks/useInstancesBySystem', () => ({
    useInstancesBySystem: vi.fn(),
}));

describe('AddRequestItemForm', () => {
    const mockOnAdd = vi.fn();

    const mockSystem = { id: 'sys-1', name: 'System A' };
    const mockTier = { id: 'tier-1', name: 'Admin', systemId: 'sys-1' };
    const mockInstance = { id: 'inst-1', name: 'Prod', systemId: 'sys-1' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useSystemsSearchHook.useSystemsSearch as any).mockReturnValue({ systems: [], isLoading: false });
        (useTiersBySystemHook.useTiersBySystem as any).mockReturnValue({ tiers: [], isLoading: false });
        (useInstancesBySystemHook.useInstancesBySystem as any).mockReturnValue({ instances: [], isLoading: false });
    });

    it('renders initial state correctly', () => {
        render(<AddRequestItemForm onAdd={mockOnAdd} />);

        expect(screen.getByPlaceholderText(/search systems/i)).toBeInTheDocument();
        expect(screen.getByText('Select Tier')).toBeInTheDocument();
        expect(screen.getByText('Add to List')).toBeDisabled();
    });

    it('allows selecting a system', async () => {
        (useSystemsSearchHook.useSystemsSearch as any).mockReturnValue({
            systems: [mockSystem],
            isLoading: false,
        });

        render(<AddRequestItemForm onAdd={mockOnAdd} />);

        const input = screen.getByPlaceholderText(/search systems/i);
        fireEvent.change(input, { target: { value: 'Sys' } });
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('System A')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('System A'));

        // System should be selected (input replaced by selected view or value updated)
        // The component implementation replaces input with a div showing name
        expect(screen.getByText('System A')).toBeInTheDocument();
    });

    it('enables add button only when system and tier are selected', async () => {
        // Setup mocks for selected state
        (useSystemsSearchHook.useSystemsSearch as any).mockReturnValue({ systems: [mockSystem], isLoading: false });
        (useTiersBySystemHook.useTiersBySystem as any).mockReturnValue({ tiers: [mockTier], isLoading: false });
        (useInstancesBySystemHook.useInstancesBySystem as any).mockReturnValue({ instances: [mockInstance], isLoading: false });

        render(<AddRequestItemForm onAdd={mockOnAdd} />);

        // Select System
        const input = screen.getByPlaceholderText(/search systems/i);
        fireEvent.change(input, { target: { value: 'Sys' } });
        fireEvent.focus(input);

        await waitFor(() => {
            const sys = screen.getByText('System A');
            fireEvent.click(sys);
        });

        // Select Tier
        // Note: Combobox/Select usually needs finding by role or label
        // Using simple select in implementation
        // The implementation uses <select>
        const tierSelect = screen.getByDisplayValue('Select Tier') as HTMLSelectElement;
        // Or better find by options length or change event
        // Wait, getByDisplayValue might fail if "Select Tier" is an option value not text. 
        // The option text is "Select Tier".
        // Let's use querying by index or role.

        // Wait for tiers to render
        // Since we mocked the hook return value above, it should render immediately on re-render after system select

        fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'tier-1' } }); // Assuming first select is Tier? No, system is input.
        // The structure: Input (System), Select (Tier), Select (Instance)
        // Actually system uses Input if not selected, and div if selected. 
        // So after system selection, there are 2 selects.

        const selects = screen.getAllByRole('combobox');
        // selects[0] is Tier, selects[1] is Instance.

        fireEvent.change(selects[0], { target: { value: 'tier-1' } });

        // Now button should be enabled
        const addButton = screen.getByText('Add to List');
        expect(addButton).not.toBeDisabled();

        fireEvent.click(addButton);

        expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
            systemId: 'sys-1',
            tierId: 'tier-1',
        }));
    });
});
