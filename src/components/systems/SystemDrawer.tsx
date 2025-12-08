'use client';

import { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { SystemInfoTab } from './tabs/SystemInfoTab';
import { SystemTiersTab } from './tabs/SystemTiersTab';
import { SystemInstancesTab } from './tabs/SystemInstancesTab';
import { SystemOwnersTab } from './tabs/SystemOwnersTab';
import { useSystemDetails } from '@/hooks/useSystemManagement';
import { cn } from '@/lib/utils';

export interface SystemDrawerProps {
  systemId: string | null;
  onClose: () => void;
}

type Tab = 'info' | 'tiers' | 'instances' | 'owners';

const tabs: { id: Tab; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'tiers', label: 'Access Tiers' },
  { id: 'instances', label: 'Instances' },
  { id: 'owners', label: 'Owners' },
];

export function SystemDrawer({ systemId, onClose }: SystemDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { system, isLoading, revalidate } = useSystemDetails(systemId);

  // Reset tab when drawer opens
  useEffect(() => {
    if (systemId) {
      setActiveTab('info');
    }
  }, [systemId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!systemId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-corolla-on-surface/20 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50',
          'w-full max-w-xl',
          'bg-corolla-surface',
          'border-l-4 border-white/50',
          'shadow-2xl',
          'flex flex-col',
          'duration-300 animate-in slide-in-from-right'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-corolla-outline px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corolla-primary-container">
              <Settings className="h-5 w-5 text-corolla-primary" />
            </div>
            <div>
              <h2 className="font-bold text-corolla-on-surface">
                {isLoading ? 'Loading...' : (system?.name ?? 'System')}
              </h2>
              <p className="text-xs text-corolla-on-surface-variant">
                System Management
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

        {/* Tabs */}
        <div className="flex gap-1 border-b border-corolla-outline bg-corolla-surface-variant/30 px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
                activeTab === tab.id
                  ? 'bg-corolla-primary text-white shadow-md'
                  : 'text-corolla-on-surface-variant hover:bg-white/50'
              )}
            >
              {tab.label}
              {tab.id === 'tiers' && system?.tiers && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({system.tiers.length})
                </span>
              )}
              {tab.id === 'instances' && system?.instances && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({system.instances.length})
                </span>
              )}
              {tab.id === 'owners' && system?.owners && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({system.owners.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-pulse text-corolla-on-surface-variant">
                Loading...
              </div>
            </div>
          ) : system ? (
            <>
              {activeTab === 'info' && (
                <SystemInfoTab system={system} onUpdate={revalidate} />
              )}
              {activeTab === 'tiers' && (
                <SystemTiersTab
                  systemId={system.id}
                  tiers={system.tiers}
                  onUpdate={revalidate}
                />
              )}
              {activeTab === 'instances' && (
                <SystemInstancesTab
                  systemId={system.id}
                  instances={system.instances}
                  onUpdate={revalidate}
                />
              )}
              {activeTab === 'owners' && (
                <SystemOwnersTab
                  systemId={system.id}
                  owners={system.owners}
                  onUpdate={revalidate}
                />
              )}
            </>
          ) : (
            <div className="text-center text-corolla-on-surface-variant">
              System not found
            </div>
          )}
        </div>
      </div>
    </>
  );
}
