import { useState, useRef, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiChevronDown, FiCheck } from 'react-icons/fi';
import type { User, UpdateUserDTO } from './types';
import { getRoleLevelOptions } from './utils';
import { useNorwegianDate } from '@/hooks';

interface UserTableRowProps {
  user: User;
  currentUserId?: string;
  onUpdate: (userId: string, data: UpdateUserDTO) => Promise<void>;
  onDelete: (user: User) => void;
  onEdit: (user: User) => void;
}

export default function UserTableRow({ 
  user, 
  currentUserId, 
  onUpdate, 
  onDelete,
  onEdit
}: UserTableRowProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const isCurrentUser = user.id === currentUserId;
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);
  const { formatDate } = useNorwegianDate();

  const handleRoleChange = async (newRole: 'USER' | 'ADMIN') => {
    setShowRoleDropdown(false);
    if (newRole === user.role) return;
    
    try {
      const maxLevel = newRole === 'USER' ? 3 : 2;
      const adjustedLevel = Math.min(user.level, maxLevel);
      await onUpdate(user.id, { role: newRole, level: adjustedLevel });
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleLevelChange = async (newLevel: number) => {
    setShowLevelDropdown(false);
    if (newLevel === user.level) return;
    
    try {
      await onUpdate(user.id, { level: newLevel });
    } catch (error) {
      console.error('Failed to update user level:', error);
    }
  };

  const handleRoleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentUser) return;
    setShowRoleDropdown(!showRoleDropdown);
    setShowLevelDropdown(false);
  };

  const handleLevelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentUser) return;
    setShowLevelDropdown(!showLevelDropdown);
    setShowRoleDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target as Node)) {
        setShowLevelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
            {user.name[0]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <div ref={roleDropdownRef} className="relative">
          <button
            onClick={handleRoleClick}
            disabled={isCurrentUser}
            className={`group inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-all ${
              user.role === 'ADMIN' 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
            } ${!isCurrentUser ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-400' : 'cursor-not-allowed opacity-60'}`}
            title={!isCurrentUser ? 'Click to edit role' : 'Cannot edit your own role'}
          >
            {user.role}
            {!isCurrentUser && (
              <FiChevronDown 
                size={12} 
                className={`opacity-50 group-hover:opacity-100 transition-all duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} 
              />
            )}
          </button>
          
          {showRoleDropdown && !isCurrentUser && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[9999] min-w-[100px]">
              {['USER', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role as 'USER' | 'ADMIN')}
                  className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                    user.role === role ? 'bg-gray-100 dark:bg-gray-600' : ''
                  }`}
                >
                  {role}
                  {user.role === role && <FiCheck size={12} className="text-primary dark:text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap">
        <div ref={levelDropdownRef} className="relative">
          <button
            onClick={handleLevelClick}
            disabled={isCurrentUser}
            className={`group inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-all bg-gray-100 text-gray-800 hover:bg-gray-200 ${
              !isCurrentUser ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-gray-400' : 'cursor-not-allowed opacity-60'
            }`}
            title={!isCurrentUser ? 'Click to edit level' : 'Cannot edit your own level'}
          >
            Level {user.level}
            {!isCurrentUser && (
              <FiChevronDown 
                size={12} 
                className={`opacity-50 group-hover:opacity-100 transition-all duration-200 ${showLevelDropdown ? 'rotate-180' : ''}`} 
              />
            )}
          </button>
          
          {showLevelDropdown && !isCurrentUser && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-[9999] min-w-[100px]">
              {getRoleLevelOptions(user.role).map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                    user.level === level ? 'bg-gray-100 dark:bg-gray-600' : ''
                  }`}
                >
                  Level {level}
                  {user.level === level && <FiCheck size={12} className="text-primary dark:text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-3">
          <button 
            onClick={() => onEdit(user)}
            className={`text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 flex items-center space-x-1 ${!isCurrentUser ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            disabled={isCurrentUser}
          >
            <FiEdit2 size={16} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => onDelete(user)}
            className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1 ${!isCurrentUser ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            disabled={isCurrentUser}
          >
            <FiTrash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}