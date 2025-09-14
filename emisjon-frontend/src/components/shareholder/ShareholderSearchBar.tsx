import { FiSearch, FiUserPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';

interface ShareholderSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddClick: () => void;
}

export default function ShareholderSearchBar({ searchTerm, onSearchChange, onAddClick }: ShareholderSearchBarProps) {
  const currentUser = useAppSelector(state => state.auth.user);
  const isAdmin = currentUser?.role === 'ADMIN';
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Søk aksjonærer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Add shareholder button - Admin only */}
        {isAdmin && (
          <Button onClick={onAddClick} className="flex items-center space-x-2">
            <FiUserPlus size={18} />
            <span>Add Shareholder</span>
          </Button>
        )}
      </div>
    </div>
  );
}