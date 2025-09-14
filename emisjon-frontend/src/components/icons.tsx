import * as React from 'react';

/**
 * Clean icon exports with readable names and proper TypeScript typing
 * Based on Lucide-style icons (24x24, stroke, round caps/joins)
 *
 * All icons support className, size, and standard SVG props
 */

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  className?: string;
}

// Import the minified exports and map to readable names
import {
  // From the analyzed bundle - mapping cryptic names to readable ones
  o as BoltIcon,
  n as InfoIcon,
  e as BarChartIcon,
  a as CalendarIcon,
  l as CameraIcon,
  c as CheckSquareIcon,
  d as CheckIcon,
  h as ArrowDownIcon,
  s as ArrowLeftIcon,
  u as ArrowRightIcon,
  k as ClockIcon,
  x as CurrencyIcon,
  y as EditIcon,
  g as EyeOffIcon,
  p as EyeIcon,
  L as FileIcon,
  f as GridIcon,
  v as HomeIcon,
  C as LockIcon,
  w as LogOutIcon,
  B as MenuIcon,
  F as MoonIcon,
  j as SearchIcon,
  W as ShoppingCartIcon,
  M as SunIcon,
  H as TrashIcon,
  z as TaskCompleteIcon,
  m as UserPlusIcon,
  V as UsersIcon,
  A as XIcon,
} from './ui/index-DwBq7slB'; // Adjust path as needed

// Enhanced icon wrapper with consistent styling
const createIcon = (IconComponent: React.ComponentType<any>, displayName: string) => {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className = '', ...props }, ref) => {
      return (
        <IconComponent
          ref={ref}
          width={size}
          height={size}
          className={`stroke-current ${className}`}
          {...props}
        />
      );
    }
  );

  Icon.displayName = displayName;
  return Icon;
};

// Dashboard & Navigation Icons
export const HomeIcon = createIcon(v, 'HomeIcon');
export const MenuIcon = createIcon(B, 'MenuIcon');
export const SearchIcon = createIcon(j, 'SearchIcon');
export const BoltIcon = createIcon(o, 'BoltIcon');

// Data & Analytics Icons
export const BarChartIcon = createIcon(e, 'BarChartIcon');
export const GridIcon = createIcon(f, 'GridIcon');
export const CalendarIcon = createIcon(a, 'CalendarIcon');
export const ClockIcon = createIcon(k, 'ClockIcon');

// User & Authentication Icons
export const UsersIcon = createIcon(V, 'UsersIcon');
export const UserPlusIcon = createIcon(m, 'UserPlusIcon');
export const LockIcon = createIcon(C, 'LockIcon');
export const LogOutIcon = createIcon(w, 'LogOutIcon');

// UI Interaction Icons
export const CheckIcon = createIcon(d, 'CheckIcon');
export const CheckSquareIcon = createIcon(c, 'CheckSquareIcon');
export const TaskCompleteIcon = createIcon(z, 'TaskCompleteIcon');
export const XIcon = createIcon(A, 'XIcon');

// Form & Input Icons
export const EyeIcon = createIcon(p, 'EyeIcon');
export const EyeOffIcon = createIcon(g, 'EyeOffIcon');
export const EditIcon = createIcon(y, 'EditIcon');

// Direction Icons
export const ArrowLeftIcon = createIcon(s, 'ArrowLeftIcon');
export const ArrowRightIcon = createIcon(u, 'ArrowRightIcon');
export const ArrowDownIcon = createIcon(h, 'ArrowDownIcon');

// Theme & Mode Icons
export const SunIcon = createIcon(M, 'SunIcon');
export const MoonIcon = createIcon(F, 'MoonIcon');

// Content Icons
export const FileIcon = createIcon(L, 'FileIcon');
export const CameraIcon = createIcon(l, 'CameraIcon');
export const InfoIcon = createIcon(n, 'InfoIcon');

// Action Icons
export const TrashIcon = createIcon(H, 'TrashIcon');
export const ShoppingCartIcon = createIcon(W, 'ShoppingCartIcon');
export const CurrencyIcon = createIcon(x, 'CurrencyIcon');

// Specialized component icons for common use cases
export const ThemeToggleIcon: React.FC<IconProps & { isDark: boolean }> = ({
  isDark,
  ...props
}) => {
  return isDark ? <SunIcon {...props} /> : <MoonIcon {...props} />;
};

export const PasswordToggleIcon: React.FC<IconProps & { isVisible: boolean }> = ({
  isVisible,
  ...props
}) => {
  return isVisible ? <EyeOffIcon {...props} /> : <EyeIcon {...props} />;
};

export const SortIcon: React.FC<IconProps & { direction?: 'asc' | 'desc' }> = ({
  direction,
  ...props
}) => {
  if (direction === 'desc') return <ArrowDownIcon {...props} />;
  return <ArrowDownIcon {...props} className={`transform rotate-180 ${props.className}`} />;
};

// Icon collections for easier imports
export const NavigationIcons = {
  Home: HomeIcon,
  Menu: MenuIcon,
  Search: SearchIcon,
  LogOut: LogOutIcon,
} as const;

export const DataIcons = {
  BarChart: BarChartIcon,
  Calendar: CalendarIcon,
  Clock: ClockIcon,
  Grid: GridIcon,
} as const;

export const UserIcons = {
  Users: UsersIcon,
  UserPlus: UserPlusIcon,
  Lock: LockIcon,
} as const;

export const ActionIcons = {
  Check: CheckIcon,
  CheckSquare: CheckSquareIcon,
  Edit: EditIcon,
  Trash: TrashIcon,
  X: XIcon,
} as const;

export const ThemeIcons = {
  Sun: SunIcon,
  Moon: MoonIcon,
  Toggle: ThemeToggleIcon,
} as const;

// Default export for convenience
export default {
  // Individual icons
  HomeIcon,
  MenuIcon,
  SearchIcon,
  BoltIcon,
  BarChartIcon,
  GridIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  UserPlusIcon,
  LockIcon,
  LogOutIcon,
  CheckIcon,
  CheckSquareIcon,
  TaskCompleteIcon,
  XIcon,
  EyeIcon,
  EyeOffIcon,
  EditIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  SunIcon,
  MoonIcon,
  FileIcon,
  CameraIcon,
  InfoIcon,
  TrashIcon,
  ShoppingCartIcon,
  CurrencyIcon,

  // Specialized components
  ThemeToggleIcon,
  PasswordToggleIcon,
  SortIcon,

  // Collections
  NavigationIcons,
  DataIcons,
  UserIcons,
  ActionIcons,
  ThemeIcons,
};