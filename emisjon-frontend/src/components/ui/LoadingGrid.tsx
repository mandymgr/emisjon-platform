import { Skeleton } from '@/components/ui/skeleton';

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 6, className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" }: LoadingGridProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading content...</span>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}