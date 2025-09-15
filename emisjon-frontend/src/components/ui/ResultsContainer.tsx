import { ReactNode } from 'react';

interface ResultsContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResultsContainer({
  children,
  className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
}: ResultsContainerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
    >
      {children}
    </div>
  );
}