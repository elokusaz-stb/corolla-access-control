import { cn } from '@/lib/utils';

export interface NavSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function NavSection({ title, children, className }: NavSectionProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </h3>
      <nav className="space-y-0.5">{children}</nav>
    </div>
  );
}
