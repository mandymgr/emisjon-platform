import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-300 bg-red-50 text-red-800 p-6 flex items-center gap-3 ${className}`}
    >
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}