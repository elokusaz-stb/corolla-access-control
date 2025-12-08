'use client';

import { useState } from 'react';
import { Layers, Plus, Loader2 } from 'lucide-react';
import {
  useSystemMutations,
  type SystemInstance,
} from '@/hooks/useSystemManagement';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface SystemInstancesTabProps {
  systemId: string;
  instances: SystemInstance[];
  onUpdate: () => void;
}

export function SystemInstancesTab({
  systemId,
  instances,
  onUpdate,
}: SystemInstancesTabProps) {
  const [newInstanceName, setNewInstanceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addInstance, isUpdating } = useSystemMutations(systemId);
  const { addToast } = useToast();

  const handleAddInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName.trim()) return;

    try {
      await addInstance(newInstanceName.trim());
      setNewInstanceName('');
      setIsAdding(false);
      onUpdate();
      addToast({
        type: 'success',
        title: 'Instance Added',
        message: `"${newInstanceName}" has been added as an instance`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Add Instance',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-corolla-on-surface">
            System Instances
          </h3>
          <p className="text-sm text-corolla-on-surface-variant">
            Different environments or deployments of this system
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="corolla-btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Instance
          </button>
        )}
      </div>

      {/* Add Instance Form */}
      {isAdding && (
        <form
          onSubmit={handleAddInstance}
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
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              placeholder="Enter instance name (e.g., Production, Staging)"
              className="corolla-input flex-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newInstanceName.trim() || isUpdating}
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
                setNewInstanceName('');
              }}
              className="px-4 py-2 text-sm text-corolla-on-surface-variant hover:text-corolla-on-surface"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Instances List */}
      <div className="space-y-2">
        {instances.length === 0 ? (
          <div className="py-8 text-center text-corolla-on-surface-variant">
            <Layers className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>No instances defined yet</p>
            <p className="mt-1 text-sm">
              Add instances like Production, Staging, Development
            </p>
          </div>
        ) : (
          instances.map((instance) => (
            <div
              key={instance.id}
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
                <Layers className="h-4 w-4 text-corolla-primary" />
              </div>
              <span className="font-medium text-corolla-on-surface">
                {instance.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
