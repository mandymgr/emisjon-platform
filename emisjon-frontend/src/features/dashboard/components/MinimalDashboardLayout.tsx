import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '../../auth/authSlice';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  CreditCard,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Camera,
  Sun,
  Moon
} from 'lucide-react';

// Theme toggle component
function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      aria-label={isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

const MinimalDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    // Retrieve from localStorage with fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/minimal-login');
  };

  // Toggle sidebar collapsed state and save to localStorage
  const toggleSidebarCollapsed = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

  // Norwegian navigation with role-based organization
  const mainNavigation = [
    { name: 'Oversikt', href: '/minimal-dashboard', icon: LayoutDashboard },
    { name: 'Mine abonnementer', href: '/minimal-dashboard/my-subscriptions', icon: CreditCard, requiresLevel: 3 },
    { name: 'Handel', href: '/minimal-dashboard/trading', icon: Activity },
  ];

  const dataNavigation = [
    { name: 'Aksjonærer', href: '/minimal-dashboard/shareholders', icon: Building2, requiresLevel: 2 },
    { name: 'Emisjoner', href: '/minimal-dashboard/emissions', icon: TrendingUp, requiresLevel: 3 },
    { name: 'Øyeblikksbilder', href: '/minimal-dashboard/snapshots', icon: Camera, requiresLevel: 2 },
  ];

  const adminNavigation = [
    { name: 'Brukere', href: '/minimal-dashboard/users', icon: Users, requiresAdmin: true, requiresLevel: 2 },
    { name: 'Abonnementer', href: '/minimal-dashboard/subscriptions', icon: BarChart3, requiresAdmin: true, requiresLevel: 3 },
    { name: 'Design', href: '/minimal-dashboard/showcase', icon: Camera, special: true },
  ];

  // Filter navigation based on user permissions
  const filterNavigation = (navItems: typeof mainNavigation) => {
    return navItems.filter(item => {
      if (item.requiresAdmin && user?.role !== 'ADMIN') return false;
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

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62] dark:text-white">
      <div className="flex">
        {/* Scandinavian Sidebar */}
        <aside
          className={`relative z-30 h-screen shrink-0 border-r border-[#E6E6E0] bg-white/90 backdrop-blur dark:border-white/15 dark:bg-white/5 transition-[width] duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-[88px]' : 'w-[260px]'
          } hidden lg:block`}
          role="navigation"
          aria-label="Hovednavigasjon"
          aria-expanded={!sidebarCollapsed}
          aria-controls="sidebar-nav"
        >
          {/* Scandinavian Brand */}
          <div className="flex h-16 items-center gap-3 px-5">
            {/* Logo med serif styling */}
            {sidebarCollapsed ? (
              <div
                className="text-2xl font-serif text-primary tracking-wider"
                style={{ fontFamily: '"EB Garamond", serif' }}
                title="Oblinor"
              >
                O
              </div>
            ) : (
              <h1
                className="text-2xl font-serif text-primary tracking-wider"
                style={{ fontFamily: '"EB Garamond", serif' }}
              >
                Oblinor
              </h1>
            )}
          </div>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <img
              src="/oblinor-logo.svg"
              alt="Oblinor"
              className="h-10 w-auto"
            />
          </div>

          {/* User info */}
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm font-light rounded-lg transition-all duration-200 group ${
                    active
                      ? item.special
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : item.special
                        ? 'text-accent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${
                      active
                        ? item.special
                          ? 'text-accent-foreground'
                          : 'text-sidebar-primary-foreground'
                        : item.special
                          ? 'text-accent group-hover:text-accent'
                          : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                    }`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm font-light text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 text-sidebar-foreground/50" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-8 px-4 sm:px-6 lg:px-8 pt-20 lg:pt-8 editorial-spacing">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MinimalDashboardLayout;