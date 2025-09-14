import { Skeleton } from '@/components/ui/skeleton';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  loading?: boolean;
}

export default function StatsCard({ title, value, icon, loading = false }: StatsCardProps) {
  return (
    <div className="bg-card border border-border p-8 hover:border-primary/20 hover:shadow-lg transition-all text-left w-full rounded-lg group">
      <div className="flex items-center justify-between mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="text-primary group-hover:text-primary/80 transition-colors">
            {icon}
          </div>
        </div>
      </div>
      <p className="text-xs font-light text-muted-foreground mb-3 uppercase tracking-wider">{title}</p>
      {loading ? (
        <Skeleton className="h-10 w-32" />
      ) : (
        <p className="text-4xl font-light text-card-foreground group-hover:text-primary/90 transition-colors">
          {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
        </p>
      )}
    </div>
  );
}