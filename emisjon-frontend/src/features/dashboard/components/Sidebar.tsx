import React from 'react';
import { Link, useLocation } from 'react-router';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiHome,
  FiX,
  FiLogOut,
  FiGrid,
  FiFileText,
  FiCheckSquare,
  FiShoppingCart,
  FiChevronLeft,
  FiCamera,
  FiBarChart2
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import VersionInfo from '@/components/VersionInfo';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: <FiHome size={20} />,
    path: '/dashboard'
  },
  {
    id: 'my-subscriptions',
    label: 'My Subscriptions',
    icon: <FiShoppingCart size={20} />,
    path: '/dashboard/my-subscriptions'
  }
];

const userItems: SidebarItem[] = [
  {
    id: 'shareholders',
    label: 'Shareholders',
    icon: <FiTrendingUp size={20} />,
    path: '/dashboard/shareholders'
  },
  {
    id: 'emissions',
    label: 'Emissions',
    icon: <FiFileText size={20} />,
    path: '/dashboard/emissions'
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: <FiBarChart2 size={20} />,
    path: '/dashboard/trading'
  }
];

const adminItems: SidebarItem[] = [
  {
    id: 'users',
    label: 'Users',
    icon: <FiUsers size={20} />,
    path: '/dashboard/users'
  },
  {
    id: 'shareholders',
    label: 'Shareholders',
    icon: <FiTrendingUp size={20} />,
    path: '/dashboard/shareholders'
  },
  {
    id: 'snapshots',
    label: 'Shareholders log',
    icon: <FiCamera size={20} />,
    path: '/dashboard/snapshots'
  },
  {
    id: 'emissions',
    label: 'Emissions',
    icon: <FiFileText size={20} />,
    path: '/dashboard/emissions'
  },
  {
    id: 'subscriptions',
    label: 'Manage Subscriptions',
    icon: <FiCheckSquare size={20} />,
    path: '/dashboard/subscriptions'
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: <FiBarChart2 size={20} />,
    path: '/dashboard/trading'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onToggle, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border 
          transition-all duration-300 ease-in-out z-50 flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
          ${isCollapsed ? 'lg:w-[80px] w-[80px]' : 'lg:w-[271px] w-[271px]'}
        `}
        style={{ minWidth: isCollapsed ? 80 : 271, width: isCollapsed ? 80 : 271 }}
      >
        {/* Header */}
        <div className={`relative flex items-center justify-between h-16 border-b border-sidebar-border`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'px-5 gap-3'}`}>
            <span className="flex items-center justify-center text-sidebar-foreground">
              <FiGrid size={20} />
            </span>
            {!isCollapsed && (
              <span className="text-xl font-bold text-sidebar-foreground flex items-center">Oblinor</span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
          {/* Desktop toggle button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center bg-sidebar-accent border border-sidebar-border rounded-full hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors cursor-pointer`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FiChevronLeft 
              size={14} 
              className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
  <nav className={`flex-1 ${isCollapsed ? 'px-0' : 'px-4'} py-4 space-y-1 overflow-y-auto`}>
          {/* Main Navigation - Always visible items */}
          {sidebarItems.map(item => {
            // Hide My Subscriptions for admin users (they have Manage Subscriptions)
            if (item.id === 'my-subscriptions' && isAdmin) {
              return null;
            }
            
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`
                  flex items-center mx-2 ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <span className={`flex items-center ${isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium flex items-center">{item.label}</span>
                )}
              </Link>
            );
          })}

          {/* User items - Show for all non-admin users (content will be controlled on individual pages) */}
          {!isAdmin && userItems.map(item => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                className={`
                  flex items-center mx-2 ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <span className={`flex items-center ${isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium flex items-center">{item.label}</span>
                )}
              </Link>
            );
          })}
          
          {/* Admin Tools Section - Only visible to admins */}
          {isAdmin && (
            <div className="pt-4">
              <div className="border-t border-sidebar-border mb-4"></div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  ADMINISTRATION
                </h3>
              )}
              {adminItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={isCollapsed ? item.label : ''}
                    className={`
                      flex items-center mx-2 ${isCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 rounded-lg
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <span className={`flex items-center ${isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="font-medium flex items-center">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Logout button */}
        <div className={`${isCollapsed ? 'p-0 flex justify-center' : 'p-4'} border-t border-sidebar-border`}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200 cursor-pointer`}
          >
            <span className="flex items-center">
              <FiLogOut size={20} />
            </span>
            {!isCollapsed && (
              <span className="font-medium flex items-center">Logout</span>
            )}
          </button>
          {!isCollapsed && <VersionInfo />}
        </div>
      </aside>
    </>
  );
}