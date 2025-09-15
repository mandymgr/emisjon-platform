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

  // Breadcrumbs component
  const Breadcrumbs = () => {
    const parts = location.pathname.split("/").filter(Boolean);

    const items = parts.map((seg, i) => {
      const to = "/" + parts.slice(0, i + 1).join("/");
      const label = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, m => m.toUpperCase())
        .replace(/Minimal Dashboard/, "Dashboard");
      const isLast = i === parts.length - 1;

      return (
        <span key={to} className="flex items-center gap-2 text-sm">
          {i > 0 && <span className="text-muted-foreground">/</span>}
          {isLast ? (
            <span className="text-muted-foreground/70 font-light">{label}</span>
          ) : (
            <Link to={to} className="text-sidebar-primary hover:underline font-light">
              {label}
            </Link>
          )}
        </span>
      );
    });

    if (items.length <= 1) return null;

    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 px-4 py-2 text-xs">
        {items}
      </nav>
    );
  };

  // Section label component
  const SectionLabel = ({ children, isActive }: { children: React.ReactNode; isActive?: boolean }) => {
    if (isSidebarCollapsed) return null;
    return (
      <div className="mb-2 flex items-center gap-2 px-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span>{children}</span>
        {isActive && (
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full bg-sidebar-primary"
          />
        )}
      </div>
    );
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

  // Check if any navigation items in a section are active
  const isMainSectionActive = filteredMainNavigation.some(item => isActive(item.href));
  const isDataSectionActive = filteredDataNavigation.some(item => isActive(item.href));
  const isAdminSectionActive = filteredAdminNavigation.some(item => isActive(item.href));

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
            fixed top-0 left-0 z-30 h-full shrink-0 border-r border-[#E6E6E0] bg-white/90 backdrop-blur dark:border-white/15 dark:bg-white/5
            transition-all duration-300 ease-in-out flex flex-col
            ${sidebarWidth}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={!isSidebarCollapsed}
        >
          {/* Header area with logo and controls */}
          <div className="border-b border-sidebar-border">
            {/* Mobile close button in header area */}
            <div className="lg:hidden flex justify-end p-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Logo and collapse toggle */}
            <div className={`flex items-center px-6 py-8 ${isSidebarCollapsed ? 'flex-col space-y-4' : 'justify-between'}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? '' : 'flex-1 justify-center'}`}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  className={`${isSidebarCollapsed ? 'h-8 w-8' : 'h-16 w-16'} transition-all duration-300`}
                />
              </div>

              {/* Desktop collapse toggle positioned next to logo */}
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:flex w-6 h-6 items-center justify-center bg-white dark:bg-white/10 border border-[#E6E6E0] dark:border-white/15 rounded-full hover:bg-primary/10 dark:hover:bg-white/20 transition-colors"
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft
                  className={`h-4 w-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
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
            <section aria-labelledby="main-navigation">
              <SectionLabel isActive={isMainSectionActive}>
                <span id="main-navigation">MAIN</span>
              </SectionLabel>
              <ul role="list">
                {filteredMainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.name} className="relative">
                  {/* Active indicator bar */}
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 h-6 w-0.5 bg-sidebar-primary rounded-r-full -translate-y-1/2"
                      aria-hidden="true"
                    />
                  )}

                  <Link
                    to={item.href}
                    title={isSidebarCollapsed ? item.name : ''}
                    aria-current={active ? "page" : undefined}
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
                </li>
              );
            })}
              </ul>
            </section>

            {/* Data Navigation */}
            {filteredDataNavigation.length > 0 && (
              <section aria-labelledby="data-navigation" className="pt-4">
                {!isSidebarCollapsed && (
                  <div className="border-t border-sidebar-border/50 mb-4"></div>
                )}
                <SectionLabel isActive={isDataSectionActive}>
                  <span id="data-navigation">DATA</span>
                </SectionLabel>
                <ul role="list">
                {filteredDataNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name} className="relative">
                      {/* Active indicator bar */}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 h-6 w-0.5 bg-sidebar-primary rounded-r-full -translate-y-1/2"
                          aria-hidden="true"
                        />
                      )}

                      <Link
                        to={item.href}
                        title={isSidebarCollapsed ? item.name : ''}
                        aria-current={active ? "page" : undefined}
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
                    </li>
                  );
                })}
                </ul>
              </section>
            )}

            {/* Admin Navigation */}
            {filteredAdminNavigation.length > 0 && (
              <section aria-labelledby="admin-navigation" className="pt-4">
                {!isSidebarCollapsed && (
                  <div className="border-t border-sidebar-border/50 mb-4"></div>
                )}
                <SectionLabel isActive={isAdminSectionActive}>
                  <span id="admin-navigation">ADMINISTRATION</span>
                </SectionLabel>
                <ul role="list" aria-label="Administrator tools">
                {filteredAdminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.name} className="relative">
                      {/* Active indicator bar */}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 h-6 w-0.5 bg-sidebar-primary rounded-r-full -translate-y-1/2"
                          aria-hidden="true"
                        />
                      )}

                      <Link
                        to={item.href}
                        title={isSidebarCollapsed ? item.name : ''}
                        aria-current={active ? "page" : undefined}
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
                    </li>
                  );
                })}
                </ul>
              </section>
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
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'}`}>
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

          <main className="pt-4 pb-8 px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboardLayout;