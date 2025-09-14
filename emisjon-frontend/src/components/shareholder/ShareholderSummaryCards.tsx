import { formatCurrency, formatNumber } from './utils';

interface ShareholderSummaryCardsProps {
  totalShareholders: number;
  totalShares: number;
  totalValue: number;
}

export default function ShareholderSummaryCards({ 
  totalShareholders, 
  totalShares, 
  totalValue 
}: ShareholderSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Shareholders</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalShareholders}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(totalShares)}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalValue)}</p>
      </div>
    </div>
  );
}