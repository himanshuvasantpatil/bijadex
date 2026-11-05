import { UserRole } from './auth';

export type AuditCategory = 'auth' | 'sales' | 'inventory' | 'staff' | 'settings' | 'system';
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: AuditCategory;
  details: string;
  terminalId?: string;
  storeName?: string;
  severity: AuditSeverity;
}

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    userId: 'usr-1',
    userName: 'Himanshu V. Patil',
    userRole: 'owner',
    action: 'SETTINGS_UPDATE',
    category: 'settings',
    details: 'Updated global currency to USD ($) and receipt header format',
    terminalId: 'POS-MAIN-01',
    storeName: 'Main Retail Store',
    severity: 'info'
  },
  {
    id: 'log-1002',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    userId: 'usr-3',
    userName: 'Sarah Miller',
    userRole: 'cashier',
    action: 'POS_CHECKOUT',
    category: 'sales',
    details: 'Completed Invoice BJX-2026-0045 for $349.99 (Payment: Credit Card)',
    terminalId: 'POS-TERM-02',
    storeName: 'Main Retail Store',
    severity: 'info'
  },
  {
    id: 'log-1003',
    timestamp: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
    userId: 'usr-2',
    userName: 'Alex Chen',
    userRole: 'manager',
    action: 'STOCK_ADJUSTMENT',
    category: 'inventory',
    details: 'Adjusted stock for "Industrial Drill Kit X-9" (+15 units, Audit)',
    terminalId: 'POS-WH-01',
    storeName: 'Logistics Warehouse',
    severity: 'warning'
  },
  {
    id: 'log-1004',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userId: 'usr-1',
    userName: 'Himanshu V. Patil',
    userRole: 'owner',
    action: 'STAFF_ADDED',
    category: 'staff',
    details: 'Created new cashier account for Sarah Jenkins (PIN: 654321)',
    terminalId: 'POS-MAIN-01',
    storeName: 'Main Retail Store',
    severity: 'info'
  },
  {
    id: 'log-1005',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    userId: 'usr-3',
    userName: 'Sarah Miller',
    userRole: 'cashier',
    action: 'SHIFT_OPEN',
    category: 'auth',
    details: 'Opened morning register shift with opening cash float $200.00',
    terminalId: 'POS-TERM-02',
    storeName: 'Main Retail Store',
    severity: 'info'
  },
  {
    id: 'log-1006',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    userId: 'usr-1',
    userName: 'Himanshu V. Patil',
    userRole: 'owner',
    action: 'INVOICE_REFUND',
    category: 'sales',
    details: 'Authorized full refund of Invoice BJX-2026-0012 ($120.00) - Reason: Customer return',
    terminalId: 'POS-MAIN-01',
    storeName: 'Main Retail Store',
    severity: 'warning'
  },
  {
    id: 'log-1007',
    timestamp: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    userId: 'usr-2',
    userName: 'Alex Chen',
    userRole: 'manager',
    action: 'OFFLINE_SYNC_COMPLETE',
    category: 'system',
    details: 'Synchronized 4 offline queued transactions to cloud database',
    terminalId: 'POS-TERM-01',
    storeName: 'Main Retail Store',
    severity: 'info'
  },
  {
    id: 'log-1008',
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    userId: 'usr-1',
    userName: 'Himanshu V. Patil',
    userRole: 'owner',
    action: 'PIN_AUTH_SUCCESS',
    category: 'auth',
    details: 'PIN lock screen authenticated successfully as Store Owner',
    terminalId: 'POS-MAIN-01',
    storeName: 'Main Retail Store',
    severity: 'info'
  }
];
