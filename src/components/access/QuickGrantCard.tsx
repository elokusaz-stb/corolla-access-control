'use client';

import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

export function QuickGrantCard() {
  return (
    <section className="corolla-quick-grant flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-corolla-primary/10">
          <Zap className="h-6 w-6 text-corolla-primary" />
        </div>
        <div>
          <h3 className="font-bold text-corolla-on-surface">Quick Grant</h3>
          <p className="text-sm text-corolla-on-surface-variant">
            Need to grant someone access? Use the Quick Grant form.
          </p>
        </div>
      </div>
      <Link href="/access/new" className="corolla-btn-primary shrink-0">
        Log Access Grant
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

