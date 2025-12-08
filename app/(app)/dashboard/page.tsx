'use client';

import {
  Shield,
  Users,
  Settings,
  Activity,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <div className="corolla-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="corolla-label">{title}</p>
          <p className="mt-2 text-3xl font-black text-corolla-on-surface">
            {isLoading ? (
              <span className="inline-block h-9 w-12 animate-pulse rounded bg-corolla-surface-variant" />
            ) : (
              value
            )}
          </p>
          <p className="mt-1 text-sm text-corolla-on-surface-variant">
            {description}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-corolla-primary-container">
          <Icon className="h-5 w-5 text-corolla-primary" />
        </div>
      </div>
    </div>
  );
}

interface RecentGrant {
  id: string;
  user: { name: string; email: string };
  system: { name: string };
  tier: { name: string };
  instance?: { name: string } | null;
  grantedAt: string;
  status: string;
}

function RecentGrantRow({ grant }: { grant: RecentGrant }) {
  const grantedDate = new Date(grant.grantedAt);
  const timeAgo = getTimeAgo(grantedDate);

  return (
    <div className="flex items-center justify-between border-b border-corolla-outline px-5 py-4 last:border-0">
      <div className="flex items-center gap-4">
        <div className="corolla-avatar h-10 w-10 text-sm">
          {grant.user.name[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <p className="font-medium text-corolla-on-surface">
            {grant.user.name}
          </p>
          <p className="text-sm text-corolla-on-surface-variant">
            {grant.system.name} • {grant.tier.name}
            {grant.instance && ` • ${grant.instance.name}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            grant.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {grant.status}
        </span>
        <p className="mt-1 text-xs text-corolla-on-surface-variant">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  // Fetch stats
  const { data: grantsData, isLoading: grantsLoading } = useSWR<{
    total: number;
    data: RecentGrant[];
  }>('/api/access-grants?limit=5&offset=0', fetcher);
  const { data: usersData, isLoading: usersLoading } = useSWR<{
    total: number;
  }>('/api/users?limit=1', fetcher);
  const { data: systemsData, isLoading: systemsLoading } = useSWR<{
    total: number;
  }>('/api/systems?limit=1', fetcher);

  const totalGrants = grantsData?.total ?? 0;
  const recentGrants = grantsData?.data ?? [];

  // Calculate this week's grants
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekGrants = recentGrants.filter(
    (g) => new Date(g.grantedAt) >= oneWeekAgo
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="corolla-page-title">Dashboard</h1>
          <p className="mt-1 text-corolla-on-surface-variant">
            Overview of access grants and system activity.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Grants"
          value={totalGrants}
          description="Total active access grants"
          icon={Shield}
          isLoading={grantsLoading}
        />
        <StatCard
          title="Users"
          value={usersData?.total ?? 0}
          description="Total registered users"
          icon={Users}
          isLoading={usersLoading}
        />
        <StatCard
          title="Systems"
          value={systemsData?.total ?? 0}
          description="Connected systems"
          icon={Settings}
          isLoading={systemsLoading}
        />
        <StatCard
          title="This Week"
          value={thisWeekGrants}
          description="Grants this week"
          icon={Activity}
          isLoading={grantsLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="corolla-card--static">
        <div className="border-b border-corolla-outline px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-corolla-on-surface">
              Recent Access Grants
            </h2>
            <Link
              href="/dashboard/access"
              className="corolla-btn-secondary text-xs"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        
        {grantsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-corolla-primary" />
          </div>
        ) : recentGrants.length === 0 ? (
          <div className="p-8 text-center text-corolla-on-surface-variant">
            <Shield className="mx-auto h-12 w-12 text-corolla-outline" />
            <p className="mt-3 font-medium">No recent activity</p>
            <p className="mt-1 text-sm">
              Dashboard data will appear here once grants are logged.
            </p>
          </div>
        ) : (
          <div>
            {recentGrants.map((grant) => (
              <RecentGrantRow key={grant.id} grant={grant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
