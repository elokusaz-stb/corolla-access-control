'use client';

import { useState, useCallback } from 'react';
import { Plus, Settings } from 'lucide-react';
import {
  SystemsList,
  SystemDrawer,
  CreateSystemModal,
} from '@/components/systems';
import { useSystems } from '@/hooks/useSystems';
import { cn } from '@/lib/utils';

export default function SystemsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { systems, isLoading, mutate } = useSystems({
    includeTiers: true,
    includeInstances: true,
  });

  const handleManageSystem = useCallback((systemId: string) => {
    setSelectedSystemId(systemId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedSystemId(null);
  }, []);

  const handleSystemCreated = useCallback((systemId: string) => {
    setSelectedSystemId(systemId);
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="corolla-page-title flex items-center gap-3">
            <Settings className="h-7 w-7 text-corolla-primary" />
            Manage Systems
          </h1>
          <p className="mt-1 text-corolla-on-surface-variant">
            Configure systems, access tiers, instances, and system owners.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={cn(
            'flex items-center gap-2',
            'bg-corolla-primary text-white',
            'rounded-full px-5 py-2.5',
            'text-sm font-semibold',
            'shadow-lg shadow-corolla-primary/25',
            'transition-all duration-150',
            'hover:shadow-xl hover:brightness-110',
            'active:scale-95'
          )}
        >
          <Plus className="h-4 w-4" />
          Add System
        </button>
      </div>

      {/* Systems List */}
      <SystemsList
        systems={systems}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onManage={handleManageSystem}
      />

      {/* System Detail Drawer */}
      <SystemDrawer systemId={selectedSystemId} onClose={handleCloseDrawer} />

      {/* Create System Modal */}
      <CreateSystemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleSystemCreated}
      />
    </div>
  );
}
