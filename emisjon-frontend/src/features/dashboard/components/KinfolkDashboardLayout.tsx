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
  Sun,
  Moon,
  Camera,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import IconButton
import { IconButton } from '@/components/ui/IconButton';

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
    <IconButton
      onClick={toggleTheme}
      aria-label={isDark ? 'Bytt til lys modus' : 'Bytt til mørk modus'}
      tooltip={isDark ? 'Light mode' : 'Dark mode'}
      pressed={isDark}
    >
      {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </IconButton>
  );
}

// Enhanced Section Label with active state indicator
function SectionLabel({
  children,
  hidden,
  isActive
}: {
  children: React.ReactNode;
  hidden?: boolean;
  isActive?: boolean;
}) {
  if (hidden) return null;
  return (
    <div className="mb-2 flex items-center gap-2 px-2 text-[11px] uppercase tracking-[0.14em] text-black/45 dark:text-white/60">
      <span>{children}</span>
      {isActive && (
        <span
          aria-hidden="true"
          className="h-[3px] w-[3px] rounded-full bg-[#124F62] dark:bg-white/70"
        />
      )}
    </div>
  );
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
  requiresLevel?: number;
  special?: boolean;
};

// Breadcrumbs component for professional navigation
function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  const items = parts.map((seg, i) => {
    const to = "/" + parts.slice(0, i + 1).join("/");
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, m => m.toUpperCase())
      .replace(/Minimal Dashboard/, "Dashboard");
    const isLast = i === parts.length - 1;

    return (
      <span key={to} className="flex items-center gap-2 text-sm">
        {i > 0 && <span className="text-black/30 dark:text-white/40">/</span>}
        {isLast ? (
          <span className="text-black/60 dark:text-white/70 font-light">{label}</span>
        ) : (
          <Link to={to} className="text-[#124F62] hover:underline font-light dark:text-white/80">
            {label}
          </Link>
        )}
      </span>
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1">
      {items}
    </nav>
  );
}

// Enhanced NavLink with active state and Scandinavian styling
function NavLink({
  item,
  collapsed = false,
  isActive = false,
  onClick
}: {
  item: NavItem;
  collapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <li className="relative">
      {/* Active indicator bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1/2 h-6 w-0.5 bg-[#124F62] dark:bg-white rounded-r-full -translate-y-1/2"
          aria-hidden="true"
        />
      )}

      <Link
        to={item.href}
        className={`group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#124F62]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-transparent ${
          isActive
            ? item.special
              ? 'bg-accent/5 text-accent'
              : 'bg-black/5 text-[#124F62] dark:bg-white/10 dark:text-white'
            : 'text-black/70 hover:bg-black/5 hover:text-[#124F62] dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white'
        }`}
        onClick={onClick}
        title={collapsed ? item.name : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Scandinavian Active Indicator - elegant left bar */}
        <span
          aria-hidden="true"
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full transition-all duration-200 ${
            isActive ? 'bg-[#124F62] dark:bg-white' : 'bg-transparent'
          }`}
        />

        {/* Icon with thin stroke for Kinfolk aesthetic */}
        <item.icon
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 transition-colors ${
            isActive
              ? item.special
                ? 'text-accent'
                : 'text-[#124F62] dark:text-white'
              : 'text-black/50 group-hover:text-[#124F62] dark:text-white/60 dark:group-hover:text-white'
          }`}
          aria-hidden="true"
        />

        {!collapsed && <span className="truncate font-light">{item.name}</span>}
        {collapsed && <span className="sr-only">{item.name}</span>}
      </Link>
    </li>
  );
}

const KinfolkDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oblinor:sidebar-collapsed') === '1';
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
    localStorage.setItem('oblinor:sidebar-collapsed', newCollapsed ? '1' : '0');
  };

  // Norwegian navigation with role-based organization
  const mainNavigation: NavItem[] = [
    { name: 'Oversikt', href: '/minimal-dashboard', icon: LayoutDashboard },
    { name: 'Mine abonnementer', href: '/minimal-dashboard/my-subscriptions', icon: CreditCard, requiresLevel: 3 },
    { name: 'Handel', href: '/minimal-dashboard/trading', icon: Activity },
  ];

  const dataNavigation: NavItem[] = [
    { name: 'Aksjonærer', href: '/minimal-dashboard/shareholders', icon: Building2, requiresLevel: 2 },
    { name: 'Emisjoner', href: '/minimal-dashboard/emissions', icon: TrendingUp, requiresLevel: 3 },
    { name: 'Øyeblikksbilder', href: '/minimal-dashboard/snapshots', icon: Camera, requiresLevel: 2 },
  ];

  const adminNavigation: NavItem[] = [
    { name: 'Brukere', href: '/minimal-dashboard/users', icon: Users, requiresAdmin: true, requiresLevel: 2 },
    { name: 'Abonnementer', href: '/minimal-dashboard/subscriptions', icon: BarChart3, requiresAdmin: true, requiresLevel: 3 },
    { name: 'Design', href: '/minimal-dashboard/showcase', icon: Camera, special: true },
  ];

  // Filter navigation based on user permissions
  const filterNavigation = (navItems: NavItem[]) => {
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

  // Check if any navigation items in a section are active
  const isMainSectionActive = filteredMainNavigation.some(item => isActive(item.href));
  const isDataSectionActive = filteredDataNavigation.some(item => isActive(item.href));
  const isAdminSectionActive = filteredAdminNavigation.some(item => isActive(item.href));

  const initials = user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? 'U';

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] dark:bg-gradient-to-b dark:from-[#0C3C4A] dark:to-[#124F62] dark:text-white">
      <div className="flex">
        {/* Scandinavian Desktop Sidebar */}
        <aside
          className={`relative z-30 h-screen shrink-0 border-r border-[#E6E6E0] bg-white/90 backdrop-blur dark:border-white/15 dark:bg-white/5 transition-[width] duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-[88px]' : 'w-[260px]'
          } hidden lg:block`}
          role="navigation"
          aria-label="Hovednavigasjon"
          aria-expanded={!sidebarCollapsed}
        >
          {/* Scandinavian Brand */}
          <div className="flex h-16 items-center gap-3 px-5">
            {sidebarCollapsed ? (
              <div
                className="text-2xl font-serif text-primary tracking-wider"
                style={{ fontFamily: '"EB Garamond", serif' }}
                title="Oblinor"
              >
                O
              </div>
            ) : (
              <h2
                className="text-2xl font-serif text-primary tracking-wider"
                style={{ fontFamily: '"EB Garamond", serif' }}
              >
                Oblinor
              </h2>
            )}
          </div>

          {/* User info - Scandinavian style */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 border-b border-[#E6E6E0]/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-[#E6E6E0] bg-white/90 text-sm font-light text-[#0E1A1C] dark:border-white/20 dark:bg-white/10 dark:text-white">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-black/80 dark:text-white/80 truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Bruker'} • Nivå {user?.level}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation - Scandinavian organization */}
          <nav className="mt-4 px-3 flex-1 overflow-y-auto">
            <SectionLabel hidden={sidebarCollapsed} isActive={isMainSectionActive}>
              Hoved
            </SectionLabel>
            <ul className="space-y-1">
              {filteredMainNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={sidebarCollapsed}
                  isActive={isActive(item.href)}
                />
              ))}
            </ul>

            {filteredDataNavigation.length > 0 && (
              <>
                <div className="my-5 border-t border-[#E6E6E0] dark:border-white/15" />
                <SectionLabel hidden={sidebarCollapsed} isActive={isDataSectionActive}>
                  Data
                </SectionLabel>
                <ul className="space-y-1">
                  {filteredDataNavigation.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={sidebarCollapsed}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </ul>
              </>
            )}

            {filteredAdminNavigation.length > 0 && (
              <>
                <div className="my-5 border-t border-[#E6E6E0] dark:border-white/15" />
                <SectionLabel hidden={sidebarCollapsed} isActive={isAdminSectionActive}>
                  Admin
                </SectionLabel>
                <ul className="space-y-1" aria-label="Administrator tools">
                  {filteredAdminNavigation.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      collapsed={sidebarCollapsed}
                      isActive={isActive(item.href)}
                    />
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* Footer with elegant collapse toggle */}
          <div className="absolute inset-x-0 bottom-0 border-t border-[#E6E6E0] px-4 py-3 text-xs text-black/60 dark:border-white/15 dark:text-white/70">
            <div className="flex items-center justify-between">
              {/* Scandinavian collapse button with IconButton */}
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={toggleSidebarCollapsed}
                  aria-label={sidebarCollapsed ? 'Utvid sidebar' : 'Skjul sidebar'}
                  tooltip={sidebarCollapsed ? 'Expand' : 'Collapse'}
                  pressed={sidebarCollapsed}
                  size="sm"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight size={14} strokeWidth={1.5} />
                  ) : (
                    <ChevronLeft size={14} strokeWidth={1.5} />
                  )}
                </IconButton>

                {!sidebarCollapsed && (
                  <span className="text-[10px] font-light text-black/50 dark:text-white/50 uppercase tracking-wider">
                    Skjul
                  </span>
                )}
              </div>

              {/* Logout button */}
              <div className="flex items-center gap-2">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-light text-black/50 dark:text-white/50 uppercase tracking-wider">
                    Logg ut
                  </span>
                )}

                <IconButton
                  onClick={handleLogout}
                  aria-label="Logg ut"
                  tooltip="Logout"
                  size="sm"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                </IconButton>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden ${
            sidebarOpen ? 'block' : 'hidden'
          }`}
          aria-hidden={!sidebarOpen}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-[260px] border-r border-[#E6E6E0] bg-white/95 backdrop-blur dark:border-white/15 dark:bg-[#0F2C36]/95 transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="navigation"
          aria-label="Mobilnavigasjon"
        >
          <div className="flex h-16 items-center justify-between px-5">
            <h2
              className="text-2xl font-serif text-primary tracking-wider"
              style={{ fontFamily: '"EB Garamond", serif' }}
            >
              Oblinor
            </h2>
            <IconButton
              onClick={() => setSidebarOpen(false)}
              aria-label="Lukk meny"
              tooltip="Close"
              size="sm"
            >
              <X size={16} strokeWidth={1.5} />
            </IconButton>
          </div>

          <nav className="mt-4 px-3">
            <SectionLabel>Hoved</SectionLabel>
            <ul className="space-y-1">
              {filteredMainNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </ul>

            {filteredDataNavigation.length > 0 && (
              <>
                <div className="my-5 border-t border-[#E6E6E0] dark:border-white/15" />
                <SectionLabel>Data</SectionLabel>
                <ul className="space-y-1">
                  {filteredDataNavigation.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive(item.href)}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </ul>
              </>
            )}

            {filteredAdminNavigation.length > 0 && (
              <>
                <div className="my-5 border-t border-[#E6E6E0] dark:border-white/15" />
                <SectionLabel>Admin</SectionLabel>
                <ul className="space-y-1">
                  {filteredAdminNavigation.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive(item.href)}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </ul>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen grow flex-col">
          {/* Scandinavian Header */}
          <header
            role="banner"
            className="sticky top-0 z-10 border-b border-[#E6E6E0] bg-white/80 backdrop-blur dark:border-white/15 dark:bg-white/5"
          >
            <div className="mx-auto w-full max-w-6xl px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <IconButton
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Åpne meny"
                    aria-controls="mobile-sidebar"
                    aria-expanded={sidebarOpen}
                    tooltip="Menu"
                    className="lg:hidden"
                    size="sm"
                  >
                    <Menu size={16} strokeWidth={1.5} />
                  </IconButton>

                  <div className="min-w-0 flex-1">
                    <h1
                      className="font-serif text-[clamp(20px,4vw,28px)] leading-tight tracking-tight text-[#0E1A1C] dark:text-white"
                      style={{ fontFamily: '"EB Garamond", serif' }}
                    >
                      Dashboard
                    </h1>
                    <Breadcrumbs />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#E6E6E0] bg-white/90 text-sm font-medium text-[#0E1A1C] dark:border-white/20 dark:bg-white/10 dark:text-white"
                    aria-label={user?.email ? `Logget inn som ${user.email}` : 'Bruker'}
                    title={user?.name || user?.email}
                  >
                    {initials}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto w-full max-w-6xl grow px-4 py-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* CSS for prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transition-all,
          .transition-colors,
          .transition-transform,
          .duration-300,
          .duration-200 {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default KinfolkDashboardLayout;