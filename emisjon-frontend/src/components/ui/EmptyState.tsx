import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-12 text-center ${className}`}>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-gray-400">
        {icon}
      </div>
      <h3 className="text-xl font-light text-teal-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}