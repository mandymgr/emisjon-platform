import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import type { Shareholder } from './types';
import { useNorwegianNumber } from '@/hooks';

interface ShareholderTableRowProps {
  shareholder: Shareholder;
  onDelete: (shareholder: Shareholder) => void;
  onEdit: (shareholder: Shareholder) => void;
  isAdmin?: boolean;
}

export default function ShareholderTableRow({ 
  shareholder, 
  onDelete,
  onEdit,
  isAdmin = false
}: ShareholderTableRowProps) {
  const { formatNumber } = useNorwegianNumber();
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm">
            {shareholder.name[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{shareholder.name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <p className="text-sm text-gray-900">{shareholder.email}</p>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{formatNumber(shareholder.shares)}</p>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
          {formatNumber(shareholder.percentage, 1)} %
        </span>
      </td>
      {isAdmin && (
        <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-3">
            <button 
              onClick={() => onEdit(shareholder)}
              className="text-teal-700 hover:text-teal-900 flex items-center space-x-1 cursor-pointer"
            >
              <FiEdit2 size={16} />
              <span>Rediger</span>
            </button>
            <button 
              onClick={() => onDelete(shareholder)}
              className="text-black hover:text-gray-800 flex items-center space-x-1 cursor-pointer"
            >
              <FiTrash2 size={16} />
              <span>Slett</span>
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}