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
  ChevronRight,
  Camera,
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/minimal-login');
  };

  // Norwegian navigation with role-based organization
  const mainNavigation: NavigationItem[] = [
    { name: 'Oversikt', href: '/minimal-dashboard', icon: LayoutDashboard },
    { name: 'Mine abonnementer', href: '/minimal-dashboard/my-subscriptions', icon: CreditCard, requiresLevel: 3 },
    { name: 'Handel', href: '/minimal-dashboard/trading', icon: Activity },
  ];

  const dataNavigation: NavigationItem[] = [
    { name: 'Aksjonærer', href: '/minimal-dashboard/shareholders', icon: Building2, requiresLevel: 2 },
    { name: 'Emisjoner', href: '/minimal-dashboard/emissions', icon: TrendingUp, requiresLevel: 3 },
    { name: 'Øyeblikksbilder', href: '/minimal-dashboard/snapshots', icon: Camera, requiresLevel: 2 },
  ];

  const adminNavigation: NavigationItem[] = [
    { name: 'Brukere', href: '/minimal-dashboard/users', icon: Users, requiresAdmin: true, requiresLevel: 2 },
    { name: 'Abonnementer', href: '/minimal-dashboard/subscriptions', icon: BarChart3, requiresAdmin: true, requiresLevel: 3 },
    { name: 'Design', href: '/minimal-dashboard/showcase', icon: Camera, special: true },
  ];

  // Filter navigation based on user permissions
  const filterNavigation = (navItems: NavigationItem[]) => {
    return navItems.filter(item => {
      if (item.requiresAdmin && user?.role !== 'ADMIN') return false;
      if (item.requiresLevel && user && user.level < item.requiresLevel) return false;
      return true;
    });
  };

  const filteredMainNavigation = filterNavigation(mainNavigation);
  const filteredDataNavigation = filterNavigation(dataNavigation);
  const filteredAdminNavigation = filterNavigation(adminNavigation);

  // Combine all navigation items for rendering
  const filteredNavigation = [...filteredMainNavigation, ...filteredDataNavigation, ...filteredAdminNavigation];

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
          className="relative z-30 h-screen shrink-0 border-r border-[#E6E6E0] bg-white/90 backdrop-blur dark:border-white/15 dark:bg-white/5 w-[260px] hidden lg:block"
          role="navigation"
          aria-label="Hovednavigasjon"
        >
          <div className="flex flex-col h-full">
            {/* Scandinavian Brand */}
            <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
              <img 
                src="/oblinor-new-logo.svg" 
                alt="Oblinor"
                className="h-8 w-auto text-teal-700"
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
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <main className="py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MinimalDashboardLayout;
