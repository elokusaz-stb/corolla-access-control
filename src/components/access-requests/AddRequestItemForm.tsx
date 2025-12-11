'use client';

import { useState, useEffect } from 'react';
import { useSystemsSearch } from '@/hooks/useSystemsSearch';
import { useTiersBySystem } from '@/hooks/useTiersBySystem';
import { useInstancesBySystem } from '@/hooks/useInstancesBySystem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import { System } from '@prisma/client'; // Assuming types are available via prisma client or locally defined

// Local interface for RequestItem to share
export interface RequestItem {
    id: string; // Temporary ID for list management
    systemId: string;
    systemName: string;
    tierId: string;
    tierName: string;
    instanceId?: string;
    instanceName?: string;
}

interface AddRequestItemFormProps {
    onAdd: (item: RequestItem) => void;
    disabled?: boolean;
}

export function AddRequestItemForm({ onAdd, disabled }: AddRequestItemFormProps) {
    // System Search State
    const [systemSearch, setSystemSearch] = useState('');
    const [showSystemResults, setShowSystemResults] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState<any | null>(null); // Using any or specific type

    // Selection State
    const [selectedTierId, setSelectedTierId] = useState('');
    const [selectedInstanceId, setSelectedInstanceId] = useState('');

    // Hooks
    const { systems, isLoading: isLoadingSystems } = useSystemsSearch(systemSearch);
    const { tiers, isLoading: isLoadingTiers } = useTiersBySystem(selectedSystem?.id ?? null);
    const { instances, isLoading: isLoadingInstances } = useInstancesBySystem(selectedSystem?.id ?? null);

    const handleSystemSelect = (system: any) => {
        setSelectedSystem(system);
        setSystemSearch(system.name);
        setShowSystemResults(false);
        setSelectedTierId('');
        setSelectedInstanceId('');
    };

    const clearSystem = () => {
        setSelectedSystem(null);
        setSystemSearch('');
        setSelectedTierId('');
        setSelectedInstanceId('');
    };

    const handleAdd = () => {
        if (!selectedSystem || !selectedTierId) return;

        const tier = tiers.find(t => t.id === selectedTierId);
        const instance = instances.find(i => i.id === selectedInstanceId);

        onAdd({
            id: crypto.randomUUID(),
            systemId: selectedSystem.id,
            systemName: selectedSystem.name,
            tierId: selectedTierId,
            tierName: tier?.name ?? 'Unknown Tier',
            instanceId: selectedInstanceId || undefined,
            instanceName: instance?.name,
        });

        // Reset form
        clearSystem();
    };

    const isValid = !!selectedSystem && !!selectedTierId;

    return (
        <Card className="p-6 bg-[#EADDFF] border-[#D0BCFF] shadow-inner mb-6">
            <h3 className="text-lg font-medium text-[#1C1B1F] mb-4">Add Access</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* System Autocomplete */}
                <div className="relative md:col-span-1">
                    <label className="text-xs font-medium text-[#49454F] mb-1 block">System</label>
                    <div className="relative">
                        {selectedSystem ? (
                            <div className="flex items-center justify-between h-10 w-full rounded-md border border-[#79747E] bg-white px-3 py-2 text-sm ring-offset-background">
                                <span className="truncate">{selectedSystem.name}</span>
                                <button onClick={clearSystem} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                        ) : (
                            <>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49454F]" />
                                <Input
                                    placeholder="Search systems..."
                                    value={systemSearch}
                                    onChange={(e) => {
                                        setSystemSearch(e.target.value);
                                        setShowSystemResults(true);
                                    }}
                                    onFocus={() => setShowSystemResults(true)}
                                    className="pl-10 bg-white border-[#79747E]"
                                    disabled={disabled}
                                />
                            </>
                        )}
                    </div>

                    {showSystemResults && !selectedSystem && systemSearch.length >= 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-[#E7E0EC] max-h-60 overflow-y-auto">
                            {isLoadingSystems ? (
                                <div className="p-4 text-center text-[#49454F] text-sm">Loading...</div>
                            ) : systems.length === 0 ? (
                                <div className="p-4 text-center text-[#49454F] text-sm">No systems found</div>
                            ) : (
                                <ul>
                                    {systems.map((system) => (
                                        <li
                                            key={system.id}
                                            onClick={() => handleSystemSelect(system)}
                                            className="cursor-pointer p-3 hover:bg-[#F3EDF7] text-sm text-[#1C1B1F]"
                                        >
                                            {system.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Tier Dropdown */}
                <div className="md:col-span-1">
                    <label className="text-xs font-medium text-[#49454F] mb-1 block">Tier</label>
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-[#79747E] bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedTierId}
                        onChange={(e) => setSelectedTierId(e.target.value)}
                        disabled={!selectedSystem || isLoadingTiers || disabled}
                    >
                        <option value="">Select Tier</option>
                        {tiers.map((tier) => (
                            <option key={tier.id} value={tier.id}>
                                {tier.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Instance Dropdown */}
                <div className="md:col-span-1">
                    <label className="text-xs font-medium text-[#49454F] mb-1 block">Instance (Optional)</label>
                    <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-[#79747E] bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedInstanceId}
                        onChange={(e) => setSelectedInstanceId(e.target.value)}
                        disabled={!selectedSystem || isLoadingInstances || instances.length === 0 || disabled}
                    >
                        <option value="">Select Instance</option>
                        {instances.map((instance) => (
                            <option key={instance.id} value={instance.id}>
                                {instance.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-1">
                    <Button
                        onClick={handleAdd}
                        disabled={!isValid || disabled}
                        className="w-full bg-[#6750A4] text-white hover:bg-[#6750A4]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to List
                    </Button>
                </div>
            </div>
        </Card>
    );
}
