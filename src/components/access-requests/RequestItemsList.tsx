'use client';

import { RequestItem } from './AddRequestItemForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface RequestItemsListProps {
    items: RequestItem[];
    onRemove: (id: string) => void;
}

export function RequestItemsList({ items, onRemove }: RequestItemsListProps) {
    if (items.length === 0) {
        return (
            <div className="text-center p-8 text-[#49454F] bg-[#F7F2FA] rounded-xl border border-dashed border-[#CAC4D0]">
                No access items added yet. Select a system above to begin.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="group flex items-center justify-between p-4 bg-white border border-[#E7E0EC] rounded-2xl shadow-sm hover:bg-[#F3EDF7] transition-colors"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                        <div>
                            <div className="text-xs text-[#49454F]">System</div>
                            <div className="font-medium text-[#1C1B1F]">{item.systemName}</div>
                        </div>
                        <div>
                            <div className="text-xs text-[#49454F]">Tier</div>
                            <div className="font-medium text-[#1C1B1F]">{item.tierName}</div>
                        </div>
                        {item.instanceName && (
                            <div>
                                <div className="text-xs text-[#49454F]">Instance</div>
                                <div className="font-medium text-[#1C1B1F]">{item.instanceName}</div>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id)}
                        className="text-[#49454F] hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
