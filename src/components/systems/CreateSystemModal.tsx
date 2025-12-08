'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Settings } from 'lucide-react';
import { useCreateSystem } from '@/hooks/useSystemManagement';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface CreateSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (systemId: string) => void;
}

export function CreateSystemModal({
  isOpen,
  onClose,
  onCreated,
}: CreateSystemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createSystem, isCreating } = useCreateSystem();
  const { addToast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const system = await createSystem({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      addToast({
        type: 'success',
        title: 'System Created',
        message: `"${name}" has been created successfully`,
      });
      onClose();
      onCreated?.(system.id);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create System',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-corolla-on-surface/20 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'w-full max-w-lg',
            'bg-corolla-surface',
            'rounded-[2rem]',
            'border-4 border-white/50',
            'shadow-2xl',
            'overflow-hidden',
            'duration-300 animate-in fade-in zoom-in-95'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-corolla-outline px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corolla-primary-container">
                <Settings className="h-5 w-5 text-corolla-primary" />
              </div>
              <div>
                <h2 className="font-bold text-corolla-on-surface">
                  Create New System
                </h2>
                <p className="text-xs text-corolla-on-surface-variant">
                  Add a new system to manage access grants
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-corolla-surface-variant"
            >
              <X className="h-5 w-5 text-corolla-on-surface-variant" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label className="corolla-label mb-2 block">System Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="corolla-input w-full"
                placeholder="e.g., Salesforce, Magento, SAP"
                required
                autoFocus
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
                placeholder="Brief description of the system (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-corolla-on-surface-variant transition-colors hover:text-corolla-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isCreating}
                className={cn(
                  'flex items-center gap-2',
                  'bg-corolla-primary text-white',
                  'rounded-full px-6 py-2.5',
                  'text-sm font-semibold',
                  'shadow-lg shadow-corolla-primary/25',
                  'transition-all duration-150',
                  'hover:brightness-110',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create System
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
