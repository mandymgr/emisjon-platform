import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionTableSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-md border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                {[...Array(9)].map((_, i) => (
                  <td key={i} className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}