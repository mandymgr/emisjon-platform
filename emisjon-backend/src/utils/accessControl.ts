
export const VALID_ACCESS_LEVELS = [
  { role: 'USER', level: 0 },   // Pending approval (unverified)
  { role: 'USER', level: 1 },   // Verified user (limited access)
  { role: 'USER', level: 2 },   // Shareholder (can trade)
  { role: 'USER', level: 3 },   // Power user (full data access)
  { role: 'ADMIN', level: 1 },  // Junior admin (approve trades)
  { role: 'ADMIN', level: 2 },  // Senior admin (full control)
] as const;

export interface UserAccess {
  role: 'USER' | 'ADMIN';
  level: number;
}

// STRICT validation - only 6 combinations allowed
export function isValidAccessLevel(role: string, level: number): boolean {
  // CRITICAL: Only these exact combinations are valid
  if (role === 'USER' && (level === 0 || level === 1 || level === 2 || level === 3)) {
    return true;
  }
  if (role === 'ADMIN' && (level === 1 || level === 2)) {
    return true;
  }
  // EVERYTHING ELSE IS INVALID
  return false;
}

// Throw error if invalid combination
export function enforceValidAccess(role: string, level: number): void {
  if (!isValidAccessLevel(role, level)) {
    throw new Error(
      `INVALID ACCESS COMBINATION: ${role} Level ${level}. ` +
      `Valid combinations: USER(0,1,2,3), ADMIN(1,2) ONLY.`
    );
  }
}

// Get access level description
export function getAccessDescription(role: string, level: number): string {
  if (role === 'USER') {
    switch (level) {
      case 0: return 'Pending approval (unverified)';
      case 1: return 'Verified user (limited access)';
      case 2: return 'Shareholder (can trade)';
      case 3: return 'Power user (full data access)';
      default: return 'Invalid level';
    }
  }
  if (role === 'ADMIN') {
    switch (level) {
      case 1: return 'Junior admin (approve trades)';
      case 2: return 'Senior admin (full control)';
      default: return 'Invalid level';
    }
  }
  return 'Invalid role';
}

// Permission checks
export class Permissions {
  static canViewOwnData(role: string, level: number): boolean {
    return isValidAccessLevel(role, level) && 
           !((role === 'USER' && level === 0)); // Pending users can't view
  }

  static canTrade(role: string, level: number): boolean {
    return (role === 'USER' && level >= 2) || // Shareholder and above
           (role === 'ADMIN'); // All admins
  }

  static canViewAllData(role: string, level: number): boolean {
    return (role === 'USER' && level === 3) || // Power user
           (role === 'ADMIN'); // All admins
  }

  static canApproveTrades(role: string, _level: number): boolean {
    return role === 'ADMIN'; // Both junior and senior admins
  }

  static canManageUsers(role: string, level: number): boolean {
    return role === 'ADMIN' && level === 2; // Senior admin only
  }

  static canManageEmissions(role: string, level: number): boolean {
    return role === 'ADMIN' && level === 2; // Senior admin only
  }

  static canDeleteData(role: string, level: number): boolean {
    return role === 'ADMIN' && level === 2; // Senior admin only
  }
}

// Middleware helper
export function checkPermission(
  userRole: string, 
  userLevel: number, 
  requiredCheck: (role: string, level: number) => boolean
): boolean {
  if (!isValidAccessLevel(userRole, userLevel)) {
    return false;
  }
  return requiredCheck(userRole, userLevel);
}