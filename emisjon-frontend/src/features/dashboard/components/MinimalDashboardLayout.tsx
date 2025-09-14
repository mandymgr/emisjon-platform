import * as React from 'react';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '../../auth/authSlice';
import { useTheme } from '@/contexts/ThemeContext';
import VersionInfo from '@/components/VersionInfo';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  CreditCard,
  Activity,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Camera,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

// Navigation item type definition
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
  requiresLevel?: number;
  special?: boolean;
}

const MinimalDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  // State for sidebar functionality
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('minimal-sidebar-collapsed') === 'true';
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('minimal-sidebar-collapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/minimal-login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Navigation with role-based organization
  const mainNavigation: NavigationItem[] = [
    { name: 'Overview', href: '/minimal-dashboard', icon: LayoutDashboard },
    { name: 'My Subscriptions', href: '/minimal-dashboard/my-subscriptions', icon: CreditCard, requiresLevel: 3 },
    { name: 'Trading', href: '/minimal-dashboard/trading', icon: Activity },
  ];

  const dataNavigation: NavigationItem[] = [
    { name: 'Shareholders', href: '/minimal-dashboard/shareholders', icon: Building2, requiresLevel: 2 },
    { name: 'Emission', href: '/minimal-dashboard/emissions', icon: TrendingUp },
    { name: 'Snapshots', href: '/minimal-dashboard/snapshots', icon: Camera, requiresLevel: 2 },
  ];

  const adminNavigation: NavigationItem[] = [
    { name: 'Users', href: '/minimal-dashboard/users', icon: Users, requiresAdmin: true, requiresLevel: 2 },
    { name: 'Subscriptions', href: '/minimal-dashboard/subscriptions', icon: BarChart3, requiresAdmin: true, requiresLevel: 3 },
    { name: 'Design', href: '/minimal-dashboard/showcase', icon: Camera, special: true },
  ];

  // Filter navigation based on user permissions
  const filterNavigation = (navItems: NavigationItem[]) => {
    return navItems.filter(item => {
      if (item.requiresAdmin && user?.role !== 'ADMIN') return false;

      // Admin users bypass level requirements
      if (user?.role === 'ADMIN') {
        // Hide "My Subscriptions" for admin users (they have "Subscriptions" in admin section)
        if (item.href === '/minimal-dashboard/my-subscriptions') return false;
        return true;
      }

      if (item.requiresLevel && user && user.level < item.requiresLevel) return false;

      return true;
    });
  };

  const filteredMainNavigation = filterNavigation(mainNavigation);
  const filteredDataNavigation = filterNavigation(dataNavigation);
  const filteredAdminNavigation = filterNavigation(adminNavigation);

  const isActive = (href: string) => {
    if (href === '/minimal-dashboard' && location.pathname === '/minimal-dashboard') return true;
    if (href !== '/minimal-dashboard' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]';

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62] dark:text-white">
      <div className="flex">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Scandinavian Sidebar */}
        <aside
          className={`
            relative z-30 h-screen shrink-0 border-r border-[#E6E6E0] bg-white/90 backdrop-blur dark:border-white/15 dark:bg-white/5
            transition-all duration-300 ease-in-out flex flex-col
            ${sidebarWidth}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 fixed lg:static
          `}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Scandinavian Brand */}
          <div className="flex h-24 items-center justify-center border-b border-sidebar-border relative py-6">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12"
            />

            {/* Mobile close button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden absolute right-4 p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center bg-white dark:bg-white/10 border border-[#E6E6E0] dark:border-white/15 rounded-full hover:bg-primary/10 dark:hover:bg-white/20 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* User info */}
          {!isSidebarCollapsed && (
            <div className="px-6 py-4 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'User'} • Level {user?.level}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user info */}
          {isSidebarCollapsed && (
            <div className="px-4 py-4 border-b border-sidebar-border flex justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center" title={user?.name || 'User'}>
                <span className="text-sm font-medium text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-4'} py-6 space-y-1 overflow-y-auto`}>
            {/* Main Navigation */}
            {filteredMainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isSidebarCollapsed ? item.name : ''}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 text-sm font-light rounded-lg transition-all duration-200 group ${
                    active
                      ? item.special
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : item.special
                        ? 'text-accent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                    <Icon className={`h-5 w-5 ${
                      active
                        ? item.special
                          ? 'text-accent-foreground'
                          : 'text-sidebar-primary-foreground'
                        : item.special
                          ? 'text-accent group-hover:text-accent'
                          : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                    }`} />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isSidebarCollapsed && active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}

            {/* Data Navigation */}
            {filteredDataNavigation.length > 0 && (
              <div className="pt-4">
                {!isSidebarCollapsed && (
                  <div className="border-t border-sidebar-border/50 mb-4"></div>
                )}
                {filteredDataNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      title={isSidebarCollapsed ? item.name : ''}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 text-sm font-light rounded-lg transition-all duration-200 group ${
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                        <Icon className={`h-5 w-5 ${
                          active
                            ? 'text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                        }`} />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && active && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Admin Navigation */}
            {filteredAdminNavigation.length > 0 && (
              <div className="pt-4">
                {!isSidebarCollapsed && (
                  <>
                    <div className="border-t border-sidebar-border/50 mb-4"></div>
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      ADMINISTRATION
                    </h3>
                  </>
                )}
                {filteredAdminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      title={isSidebarCollapsed ? item.name : ''}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 text-sm font-light rounded-lg transition-all duration-200 group ${
                        active
                          ? item.special
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : item.special
                            ? 'text-accent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <div className={`flex items-center ${isSidebarCollapsed ? '' : 'space-x-3'}`}>
                        <Icon className={`h-5 w-5 ${
                          active
                            ? item.special
                              ? 'text-accent-foreground'
                              : 'text-sidebar-primary-foreground'
                            : item.special
                              ? 'text-accent group-hover:text-accent'
                              : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                        }`} />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>
                      {!isSidebarCollapsed && active && <ChevronRight className="h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Bottom section with theme toggle and logout */}
          <div className={`${isSidebarCollapsed ? 'p-2' : 'p-4'} border-t border-sidebar-border space-y-2`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isSidebarCollapsed ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : ''}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2.5 text-sm font-light text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg transition-colors`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-sidebar-foreground/50" />
              ) : (
                <Moon className="h-5 w-5 text-sidebar-foreground/50" />
              )}
              {!isSidebarCollapsed && (
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              )}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? 'Sign out' : ''}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2.5 text-sm font-light text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg transition-colors`}
            >
              <LogOut className="h-5 w-5 text-sidebar-foreground/50" />
              {!isSidebarCollapsed && <span>Sign out</span>}
            </button>
            {!isSidebarCollapsed && <VersionInfo />}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile header for hamburger menu */}
          <div className="lg:hidden bg-white/90 backdrop-blur dark:bg-white/5 border-b border-[#E6E6E0] dark:border-white/15 px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <main className="py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboardLayout;