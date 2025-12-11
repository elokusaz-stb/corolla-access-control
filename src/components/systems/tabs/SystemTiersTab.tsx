'use client';

import { useState } from 'react';
import { Shield, Plus, Loader2 } from 'lucide-react';
import {
  useSystemMutations,
  type SystemTier,
} from '@/hooks/useSystemManagement';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface SystemTiersTabProps {
  systemId: string;
  tiers: SystemTier[];
  onUpdate: () => void;
}

export function SystemTiersTab({
  systemId,
  tiers,
  onUpdate,
}: SystemTiersTabProps) {
  const [newTierName, setNewTierName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addTier, isUpdating } = useSystemMutations(systemId);
  const { addToast } = useToast();

  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) return;

    try {
      await addTier(newTierName.trim());
      setNewTierName('');
      setIsAdding(false);
      onUpdate();
      addToast({
        type: 'success',
        title: 'Tier Added',
        message: `"${newTierName}" has been added as an access tier`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Add Tier',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-corolla-on-surface">Access Tiers</h3>
          <p className="text-sm text-corolla-on-surface-variant">
            Define permission levels for this system
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="corolla-btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        )}
      </div>

      {/* Add Tier Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTier}
          className={cn(
            'rounded-2xl p-4',
            'bg-corolla-primary-container/50',
            'border-2 border-corolla-quick-grant-border',
            'duration-200 animate-in slide-in-from-top-2'
          )}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={newTierName}
              onChange={(e) => setNewTierName(e.target.value)}
              placeholder="Enter tier name (e.g., Admin, Editor, Viewer)"
              className="corolla-input flex-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newTierName.trim() || isUpdating}
              className={cn(
                'flex items-center gap-2',
                'bg-corolla-primary text-white',
                'rounded-full px-4 py-2',
                'text-sm font-medium',
                'shadow-md',
                'disabled:opacity-50'
              )}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTierName('');
              }}
              className="px-4 py-2 text-sm text-corolla-on-surface-variant hover:text-corolla-on-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tiers List */}
      <div className="space-y-2">
        {tiers.length === 0 ? (
          <div className="py-8 text-center text-corolla-on-surface-variant">
            <Shield className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>No access tiers defined yet</p>
            <p className="mt-1 text-sm">Add tiers like Admin, Editor, Viewer</p>
          </div>
        ) : (
          tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'flex items-center gap-3',
                'rounded-xl bg-white',
                'border border-corolla-outline',
                'px-4 py-3',
                'shadow-sm',
                'transition-colors hover:bg-corolla-surface-variant/50'
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-corolla-primary-container">
                <Shield className="h-4 w-4 text-corolla-primary" />
              </div>
              <span className="font-medium text-corolla-on-surface">
                {tier.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

