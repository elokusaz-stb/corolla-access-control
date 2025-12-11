'use client';

import { useState, useEffect } from 'react';
import { useUsers, User } from '@/hooks/useUsers';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, User as UserIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to get initials
function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

interface UserSelectProps {
    selectedUser: User | null;
    onSelect: (user: User | null) => void;
}

export function UserSelect({ selectedUser, onSelect }: UserSelectProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Use the hook for autocomplete
    const { users, isLoading } = useUsers(search);

    // Close dropdown when user is selected
    const handleSelect = (user: User) => {
        onSelect(user);
        setSearch('');
        setIsOpen(false);
    };

    // Clear selection
    const handleClear = () => {
        onSelect(null);
        setSearch('');
    };

    return (
        <Card className="p-6 bg-[#EADDFF] border-[#D0BCFF] shadow-inner mb-6">
            <h3 className="text-lg font-medium text-[#1C1B1F] mb-4">Select User</h3>

            {selectedUser ? (
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E7E0EC]">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#6750A4] text-white flex items-center justify-center font-medium">
                            {getInitials(selectedUser.name)}
                        </div>
                        <div>
                            <div className="font-medium text-[#1C1B1F]">{selectedUser.name}</div>
                            <div className="text-sm text-[#49454F]">{selectedUser.email}</div>
                            {selectedUser.managerId && (
                                <div className="text-xs text-[#6750A4] mt-0.5">
                                    {/* Note: In a real app we might fetch manager name, for now showing ID or just text */}
                                    Manager assigned
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-[#6750A4] text-sm font-medium hover:underline"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49454F]" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            className="pl-10 bg-white border-[#79747E]"
                        />
                    </div>

                    {isOpen && search.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-[#E7E0EC] max-h-60 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-[#49454F] text-sm">Loading...</div>
                            ) : users.length === 0 ? (
                                <div className="p-4 text-center text-[#49454F] text-sm">No users found</div>
                            ) : (
                                <ul>
                                    {users.map((user) => (
                                        <li
                                            key={user.id}
                                            onClick={() => handleSelect(user)}
                                            className="flex items-center gap-3 p-3 hover:bg-[#F3EDF7] cursor-pointer"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center text-xs font-medium">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[#1C1B1F]">{user.name}</div>
                                                <div className="text-xs text-[#49454F]">{user.email}</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
