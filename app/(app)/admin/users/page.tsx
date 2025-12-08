'use client';

import { useState } from 'react';
import { Plus, Search, ChevronRight, Shield, Mail, Loader2, Users } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  managerId: string | null;
  _count?: {
    grants: number;
  };
}

function UserCard({ user }: { user: User }) {
  const grantCount = user._count?.grants ?? 0;

  return (
    <div className="corolla-row group flex items-center gap-4 border-b border-corolla-outline px-5 py-4 last:border-0">
      <div className="corolla-avatar h-12 w-12 text-base">
        {user.name[0]?.toUpperCase() ?? 'U'}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-corolla-on-surface">{user.name}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-corolla-on-surface-variant">
          <Mail className="h-3 w-3" aria-hidden="true" />
          {user.email}
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs text-corolla-on-surface-variant">
          <Shield className="h-3 w-3" aria-hidden="true" />
          {grantCount} active grant{grantCount !== 1 ? 's' : ''}
        </div>
      </div>
      <button 
        className={cn(
          "corolla-btn-secondary",
          "opacity-0 transition-opacity group-hover:opacity-100"
        )}
        onClick={() => {
          // TODO: Open user detail drawer/modal
          console.log('View user:', user.id);
        }}
      >
        View
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="corolla-empty-state py-12">
      <div className="corolla-empty-state-icon">
        <Users className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-corolla-on-surface">
        No users found
      </h3>
      <p className="mt-2 text-sm text-corolla-on-surface-variant">
        Try adjusting your search or add new users.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-corolla-primary" />
    </div>
  );
}

export default function UsersAdminPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { users, isLoading, error } = useUsers({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="corolla-page-title">Users</h1>
          <p className="mt-1 text-corolla-on-surface-variant">
            View and manage users in the system.
          </p>
        </div>
        <button className="corolla-btn-primary" disabled>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add User
        </button>
      </div>

      {/* Users List */}
      <div className="corolla-card--static">
        <div className="border-b border-corolla-outline px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-corolla-on-surface-variant" />
              <input
                type="search"
                placeholder="Search by name or email..."
                className="corolla-input w-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Users */}
        <div>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className="py-8 text-center text-red-600">
              Error loading users. Please try again.
            </div>
          ) : users.length === 0 ? (
            <EmptyState />
          ) : (
            users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </div>

      {/* Count */}
      {!isLoading && users.length > 0 && (
        <p className="text-center text-xs text-corolla-on-surface-variant">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
