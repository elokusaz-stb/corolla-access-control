'use client';

import { useState } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import {
  useSystemMutations,
  type SystemDetails,
} from '@/hooks/useSystemManagement';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface SystemInfoTabProps {
  system: SystemDetails;
  onUpdate: () => void;
}

export function SystemInfoTab({ system, onUpdate }: SystemInfoTabProps) {
  const [name, setName] = useState(system.name);
  const [description, setDescription] = useState(system.description ?? '');
  const [saved, setSaved] = useState(false);
  const { updateSystem, isUpdating } = useSystemMutations(system.id);
  const { addToast } = useToast();

  const hasChanges =
    name !== system.name || description !== (system.description ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    try {
      await updateSystem({ name, description: description || undefined });
      onUpdate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      addToast({
        type: 'success',
        title: 'System Updated',
        message: 'System information has been saved',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message:
          error instanceof Error ? error.message : 'Failed to update system',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="corolla-label mb-2 block">System Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="corolla-input w-full"
          placeholder="Enter system name"
          required
        />
      </div>

      <div>
        <label className="corolla-label mb-2 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(
            'w-full resize-none rounded-xl bg-white p-3 shadow-sm',
            'text-corolla-on-surface placeholder:text-corolla-on-surface-variant/60',
            'border-2 border-transparent',
            'focus:outline-none focus:ring-2 focus:ring-corolla-primary',
            'transition-all duration-150'
          )}
          placeholder="Enter system description (optional)"
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-corolla-on-surface-variant">
          {hasChanges ? (
            <span className="text-corolla-primary">Unsaved changes</span>
          ) : saved ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Saved
            </span>
          ) : (
            <span>No changes</span>
          )}
        </div>
        <button
          type="submit"
          disabled={!hasChanges || isUpdating}
          className={cn(
            'flex items-center gap-2',
            'bg-corolla-primary text-white',
            'rounded-full px-5 py-2.5',
            'text-sm font-semibold',
            'shadow-lg shadow-corolla-primary/25',
            'transition-all duration-150',
            'hover:brightness-110',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Metadata */}
      <div className="mt-8 border-t border-corolla-outline pt-6">
        <h4 className="corolla-label mb-3">System Metadata</h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-corolla-on-surface-variant">System ID</dt>
            <dd className="font-mono text-xs text-corolla-on-surface">
              {system.id}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-corolla-on-surface-variant">Created</dt>
            <dd className="text-corolla-on-surface">
              {new Date(system.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-corolla-on-surface-variant">Last Updated</dt>
            <dd className="text-corolla-on-surface">
              {new Date(system.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </form>
  );
}
