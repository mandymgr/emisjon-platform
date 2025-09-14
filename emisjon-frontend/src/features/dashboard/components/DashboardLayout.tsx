import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { useAppSelector } from '@/store/hooks';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-accent text-foreground"
                aria-label="Toggle mobile menu"
              >
                <FiMenu size={20} />
              </button>
              <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-foreground">
                Dashboard
              </h1>
            </div>

            {/* Right side of header - user info and theme toggle */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {user?.email || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}