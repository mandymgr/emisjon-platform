import * as React from 'react';

/**
 * Clean icon exports with readable names and proper TypeScript typing
 * Using Lucide React icons as the base implementation
 */

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  className?: string;
}

// Base SVG Icon component
const SvgIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, className = '', children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`stroke-current ${className}`}
        {...props}
      >
        {children}
      </svg>
    );
  }
);
SvgIcon.displayName = 'SvgIcon';

// Dashboard & Navigation Icons
export const HomeIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </SvgIcon>
));
HomeIcon.displayName = 'HomeIcon';

export const MenuIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </SvgIcon>
));
MenuIcon.displayName = 'MenuIcon';

export const SearchIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </SvgIcon>
));
SearchIcon.displayName = 'SearchIcon';

export const BoltIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
  </SvgIcon>
));
BoltIcon.displayName = 'BoltIcon';

// Data & Analytics Icons
export const BarChartIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </SvgIcon>
));
BarChartIcon.displayName = 'BarChartIcon';

export const GridIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </SvgIcon>
));
GridIcon.displayName = 'GridIcon';

export const CalendarIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </SvgIcon>
));
CalendarIcon.displayName = 'CalendarIcon';

export const ClockIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </SvgIcon>
));
ClockIcon.displayName = 'ClockIcon';

// User & Authentication Icons
export const UsersIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m22 21-3.5-3.5" />
    <circle cx="18" cy="15" r="3" />
  </SvgIcon>
));
UsersIcon.displayName = 'UsersIcon';

export const UserPlusIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </SvgIcon>
));
UserPlusIcon.displayName = 'UserPlusIcon';

export const LockIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="m7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIcon>
));
LockIcon.displayName = 'LockIcon';

export const LogOutIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m9 21 5-5-5-5" />
    <path d="m20 4v7a4 4 0 0 1-4 4H5l-3-3 3-3h11a4 4 0 0 1 4 4z" />
  </SvgIcon>
));
LogOutIcon.displayName = 'LogOutIcon';

// UI Interaction Icons
export const CheckIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <polyline points="20,6 9,17 4,12" />
  </SvgIcon>
));
CheckIcon.displayName = 'CheckIcon';

export const CheckSquareIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <polyline points="9,11 12,14 22,4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </SvgIcon>
));
CheckSquareIcon.displayName = 'CheckSquareIcon';

export const TaskCompleteIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="16,12 12,16 8,12" />
  </SvgIcon>
));
TaskCompleteIcon.displayName = 'TaskCompleteIcon';

export const XIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </SvgIcon>
));
XIcon.displayName = 'XIcon';

// Form & Input Icons
export const EyeIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIcon>
));
EyeIcon.displayName = 'EyeIcon';

export const EyeOffIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m15 18-.722-3.25" />
    <path d="M2 2l20 20" />
    <path d="M6.71 6.71C4.49 8.4 3 10.9 3 12s1.49 3.6 3.71 5.29" />
    <path d="M12 5C8.24 5 5.46 7.32 4.5 10.5" />
    <path d="m17 13-1.17-1.17" />
  </SvgIcon>
));
EyeOffIcon.displayName = 'EyeOffIcon';

export const EditIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </SvgIcon>
));
EditIcon.displayName = 'EditIcon';

// Direction Icons
export const ArrowLeftIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </SvgIcon>
));
ArrowLeftIcon.displayName = 'ArrowLeftIcon';

export const ArrowRightIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </SvgIcon>
));
ArrowRightIcon.displayName = 'ArrowRightIcon';

export const ArrowDownIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </SvgIcon>
));
ArrowDownIcon.displayName = 'ArrowDownIcon';

// Theme & Mode Icons
export const SunIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="m12 2-3 3-3-3 3-3 3 3z" />
    <path d="m12 22-3-3-3 3 3 3 3-3z" />
    <path d="m20 12-3-3 3-3 3 3-3 3z" />
    <path d="m4 12-3 3 3 3 3-3-3-3z" />
  </SvgIcon>
));
SunIcon.displayName = 'SunIcon';

export const MoonIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </SvgIcon>
));
MoonIcon.displayName = 'MoonIcon';

// Content Icons
export const FileIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </SvgIcon>
));
FileIcon.displayName = 'FileIcon';

export const CameraIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="m9 9 3-3 3 3" />
    <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
    <path d="M21 5H3l3-3h12l3 3z" />
  </SvgIcon>
));
CameraIcon.displayName = 'CameraIcon';

export const InfoIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m12 16-4-4 4-4" />
    <path d="M16 12H8" />
  </SvgIcon>
));
InfoIcon.displayName = 'InfoIcon';

// Action Icons
export const TrashIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
  </SvgIcon>
));
TrashIcon.displayName = 'TrashIcon';

export const ShoppingCartIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L22 6H7" />
  </SvgIcon>
));
ShoppingCartIcon.displayName = 'ShoppingCartIcon';

export const CurrencyIcon = React.forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </SvgIcon>
));
CurrencyIcon.displayName = 'CurrencyIcon';

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