import { UserRole } from '../types/auth';
import { NavigationTab } from '../types';

export interface RolePermissions {
  allowedTabs: NavigationTab[];
  canManageStaff: boolean;
  canManageSettings: boolean;
  canManageStores: boolean;
  canEditInventory: boolean;
  canManageExpenses: boolean;
  canManagePurchases: boolean;
  canManageTransfers: boolean;
  canViewReports: boolean;
  canPerformFactoryReset: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    allowedTabs: [
      'pos',
      'inventory',
      'handheld',
      'reports',
      'invoices',
      'transfers',
      'purchases',
      'shifts',
      'expenses',
      'customers',
      'stores',
      'staff',
      'labels',
      'settings'
    ],
    canManageStaff: true,
    canManageSettings: true,
    canManageStores: true,
    canEditInventory: true,
    canManageExpenses: true,
    canManagePurchases: true,
    canManageTransfers: true,
    canViewReports: true,
    canPerformFactoryReset: true
  },
  admin: {
    allowedTabs: [
      'pos',
      'inventory',
      'handheld',
      'reports',
      'invoices',
      'transfers',
      'purchases',
      'shifts',
      'expenses',
      'customers',
      'stores',
      'staff',
      'labels',
      'settings'
    ],
    canManageStaff: true,
    canManageSettings: true,
    canManageStores: true,
    canEditInventory: true,
    canManageExpenses: true,
    canManagePurchases: true,
    canManageTransfers: true,
    canViewReports: true,
    canPerformFactoryReset: false // Only owner can reset to factory demo
  },
  manager: {
    allowedTabs: [
      'pos',
      'inventory',
      'handheld',
      'reports',
      'invoices',
      'transfers',
      'purchases',
      'shifts',
      'expenses',
      'customers',
      'stores',
      'labels'
    ],
    canManageStaff: false,
    canManageSettings: false,
    canManageStores: false,
    canEditInventory: true,
    canManageExpenses: true,
    canManagePurchases: true,
    canManageTransfers: true,
    canViewReports: true,
    canPerformFactoryReset: false
  },
  cashier: {
    allowedTabs: [
      'pos',
      'invoices',
      'shifts',
      'customers',
      'inventory', // Read-only catalog lookup
      'handheld',
      'labels'
    ],
    canManageStaff: false,
    canManageSettings: false,
    canManageStores: false,
    canEditInventory: false, // Read-only
    canManageExpenses: false,
    canManagePurchases: false,
    canManageTransfers: false,
    canViewReports: false,
    canPerformFactoryReset: false
  }
};

/**
  Check if a role can access a specific navigation tab
 */
export function hasTabAccess(role: UserRole = 'cashier', tab: NavigationTab): boolean {
  const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.cashier;
  return perms.allowedTabs.includes(tab);
}

/**
  Check a specific action capability by role
 */
export function getRoleCapabilities(role: UserRole = 'cashier'): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.cashier;
}
