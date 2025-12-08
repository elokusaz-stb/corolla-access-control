'use client';

import Link from 'next/link';
import { ArrowLeft, List } from 'lucide-react';
import { AccessGrantForm } from '@/components/access/AccessGrantForm';

export default function LogAccessGrantPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/access"
          className="corolla-btn-secondary text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
        <Link href="/access/bulk" className="corolla-btn-secondary text-sm">
          <List className="h-4 w-4" />
          Bulk Upload
        </Link>
      </div>

      {/* Form */}
      <AccessGrantForm />

      {/* Help Text */}
      <p className="text-center text-xs text-corolla-on-surface-variant">
        Need to grant access to multiple users?{' '}
        <Link
          href="/access/bulk"
          className="underline hover:text-corolla-primary"
        >
          Use bulk upload
        </Link>
      </p>
    </div>
  );
}
