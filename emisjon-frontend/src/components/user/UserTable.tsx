import type { User, UpdateUserDTO } from './types';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  currentUserId?: string;
  onUpdate: (userId: string, data: UpdateUserDTO) => Promise<void>;
  onDelete: (user: User) => void;
  onEdit: (user: User) => void;
}

export default function UserTable({ 
  users, 
  currentUserId, 
  onUpdate, 
  onDelete,
  onEdit
}: UserTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow" style={{ overflow: 'visible' }}>
      <div className="min-w-full" style={{ overflow: 'visible' }}>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 relative">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}