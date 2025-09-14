import { FiLock } from 'react-icons/fi';

interface LimitedAccessMessageProps {
  userLevel?: number;
  description?: string;
}

export default function LimitedAccessMessage({ 
  description
}: LimitedAccessMessageProps) {
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12">
      <div className="text-center">
        <FiLock className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={32} />
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Level 2+ Access Required
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description || 'Shareholders information requires higher access level.'}
        </p>
      </div>
    </div>
  );
}