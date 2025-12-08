'use client';

import { useState, useCallback } from 'react';
import { User, Plus, Loader2, Search, X } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useSystemMutations,
  type SystemOwner,
} from '@/hooks/useSystemManagement';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface SystemOwnersTabProps {
  systemId: string;
  owners: SystemOwner[];
  onUpdate: () => void;
}

export function SystemOwnersTab({
  systemId,
  owners,
  onUpdate,
}: SystemOwnersTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { users, isLoading: isSearching } = useUsers(debouncedQuery);
  const { addOwners, isUpdating } = useSystemMutations(systemId);
  const { addToast } = useToast();

  // Filter out users who are already owners
  const availableUsers = users.filter(
    (user) => !owners.some((owner) => owner.id === user.id)
  );

  const handleAddOwner = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await addOwners([selectedUser.id]);
      setSelectedUser(null);
      setSearchQuery('');
      setIsAdding(false);
      onUpdate();
      addToast({
        type: 'success',
        title: 'Owner Added',
        message: `${selectedUser.name} is now a system owner`,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Add Owner',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [selectedUser, addOwners, onUpdate, addToast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-corolla-on-surface">System Owners</h3>
          <p className="text-sm text-corolla-on-surface-variant">
            Users who can manage this system&apos;s access grants
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="corolla-btn-secondary text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Owner
          </button>
        )}
      </div>

      {/* Add Owner Form */}
      {isAdding && (
        <div
          className={cn(
            'rounded-2xl p-4',
            'bg-corolla-primary-container/50',
            'border-2 border-corolla-quick-grant-border',
            'duration-200 animate-in slide-in-from-top-2'
          )}
        >
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border-2 border-corolla-primary/20 bg-white p-3">
                <div className="corolla-avatar h-10 w-10 text-sm">
                  {selectedUser.name[0]?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-corolla-on-surface">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-corolla-on-surface-variant">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full p-1 hover:bg-corolla-surface-variant"
                >
                  <X className="h-4 w-4 text-corolla-on-surface-variant" />
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedUser(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-corolla-on-surface-variant hover:text-corolla-on-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOwner}
                  disabled={isUpdating}
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
                  Add as Owner
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="corolla-input w-full pl-10"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-corolla-primary" />
                )}
              </div>

              {searchQuery.length >= 2 && (
                <div className="max-h-48 overflow-hidden overflow-y-auto rounded-xl border border-corolla-outline bg-white">
                  {availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-corolla-on-surface-variant">
                      {isSearching ? 'Searching...' : 'No users found'}
                    </div>
                  ) : (
                    availableUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-corolla-surface-variant"
                      >
                        <div className="corolla-avatar h-9 w-9 text-xs">
                          {user.name[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-corolla-on-surface">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-corolla-on-surface-variant">
                            {user.email}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm text-corolla-on-surface-variant hover:text-corolla-on-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owners List */}
      <div className="space-y-2">
        {owners.length === 0 ? (
          <div className="py-8 text-center text-corolla-on-surface-variant">
            <User className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>No owners assigned yet</p>
            <p className="mt-1 text-sm">
              Add users who should manage this system
            </p>
          </div>
        ) : (
          owners.map((owner) => (
            <div
              key={owner.id}
              className={cn(
                'flex items-center gap-3',
                'rounded-full bg-corolla-primary-container',
                'border border-corolla-quick-grant-border',
                'py-1 pl-1 pr-4',
                'transition-colors hover:bg-corolla-active-nav'
              )}
            >
              <div className="corolla-avatar h-9 w-9 text-sm">
                {owner.name[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-corolla-on-surface">
                  {owner.name}
                </p>
                <p className="truncate text-xs text-corolla-on-surface-variant">
                  {owner.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
