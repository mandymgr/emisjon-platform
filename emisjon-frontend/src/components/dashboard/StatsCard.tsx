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
    <div className="bg-white border border-gray-200 p-6 hover:shadow-soft transition-all text-left w-full rounded-2xl group">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-teal-100 p-3 rounded-xl">
          <div className="text-teal-700 group-hover:text-teal-900 transition-colors">
            {icon}
          </div>
        </div>
      </div>
      <p className="text-xs font-light text-gray-500 mb-2 uppercase tracking-wider">{title}</p>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-3xl font-serif text-teal-900 group-hover:text-teal-700 transition-colors">
          {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
        </p>
      )}
    </div>
  );
}