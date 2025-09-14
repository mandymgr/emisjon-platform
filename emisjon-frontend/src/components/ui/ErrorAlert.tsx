import { FiAlertCircle, FiX } from 'react-icons/fi';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="relative bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <FiAlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 -mr-1.5 -mt-1.5 rounded-lg p-1.5 hover:bg-destructive/20 transition-colors"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}