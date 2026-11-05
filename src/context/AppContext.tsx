import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Product,
  CartItem,
  Customer,
  Invoice,
  Expense,
  StockMovement,
  NavigationTab,
  PaymentMethod,
  TaxBreakdown,
  Store,
  Organization,
  Supplier,
  PurchaseOrder,
  StockTransfer,
  RegisterShift,
  CurrencyConfig
} from '../types';
import { UserProfile, DEFAULT_USERS } from '../types/auth';
import { AuditLog, AuditCategory, AuditSeverity, DEFAULT_AUDIT_LOGS } from '../types/audit';

import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STORES,
  INITIAL_ORGANIZATION,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_REGISTER_SHIFT
} from '../data/initialData';
import { soundManager } from '../utils/audio';
import { setActiveCurrency } from '../utils/format';
import {
  persistAllToIndexedDB,
  loadAllFromIndexedDB,
  enqueueSyncMutation,
  getAllSyncQueue,
  getPendingSyncQueue,
  updateSyncItemStatus,
  clearSyncedItems,
  getStorageStats,
  setMetaItem,
  getMetaItem
} from '../services/indexedDB';
import { SyncQueueItem, StorageStats } from '../types/sync';

interface ScanFeedback {
  id: string;
  code: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  productName?: string;
  timestamp: number;
}

interface AppContextType {
  // Organization & Multi-Store
  organization: Organization;
  updateOrganization: (orgData: Partial<Organization>) => void;
  stores: Store[];
  activeStoreId: string;
  activeStore: Store;
  setActiveStoreId: (storeId: string) => void;
  addStore: (storeData: Omit<Store, 'id'>) => Store;
  updateStore: (id: string, storeData: Partial<Store>) => void;
  deleteStore: (id: string) => void;

  // Onboarding wizard
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (orgData: Partial<Organization>, primaryStoreData?: Partial<Store>) => void;

  // Inventory & Products
  products: Product[];
  getProductStock: (productId: string, storeId?: string) => number;
  addProduct: (productData: Omit<Product, 'id' | 'updatedAt'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, adjustmentQty: number, type: 'in' | 'out' | 'audit', reason: string, storeId?: string) => void;

  // Inter-store Transfers
  stockTransfers: StockTransfer[];
  createStockTransfer: (data: {
    fromStoreId: string;
    toStoreId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => StockTransfer;
  completeStockTransfer: (transferId: string) => void;

  // Suppliers & Purchase Orders
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (data: {
    supplierId: string;
    storeId: string;
    items: { productId: string; quantity: number; costPrice: number }[];
    notes?: string;
  }) => PurchaseOrder;
  receivePurchaseOrder: (poId: string) => void;

  // Register Shifts & Cash Drawer
  activeShift: RegisterShift | null;
  openShift: (openingFloat: number) => void;
  closeShift: (actualCashCounted: number, notes?: string) => void;

  // Customers & Loyalty
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalPurchases'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  // Billing & Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discountPercent: number) => void;
  updateCartItemPrice: (productId: string, unitPrice: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (details: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    discountType: 'percent' | 'flat';
    discountValue: number;
    cashier: string;
    notes?: string;
    useLoyaltyPoints?: number;
  }) => Invoice;

  // Invoices & Expenses
  invoices: Invoice[];
  refundInvoice: (invoiceId: string, reason: string) => void;
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;
  stockMovements: StockMovement[];

  // Navigation & Shell UI
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isScannerOpen: boolean;
  scannerTarget: 'pos' | 'inventory' | 'lookup';
  openScanner: (target?: 'pos' | 'inventory' | 'lookup') => void;
  closeScanner: () => void;
  isSoundMuted: boolean;
  toggleSoundMuted: () => void;
  scanFeedback: ScanFeedback | null;
  handleBarcodeScan: (code: string) => { found: boolean; product?: Product; message: string };
  selectedInvoiceForPrint: Invoice | null;
  setSelectedInvoiceForPrint: (inv: Invoice | null) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;

  // IndexedDB Local-First Engine & Sync Center
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  isSyncing: boolean;
  syncPendingNow: () => Promise<void>;
  syncQueue: SyncQueueItem[];
  clearSyncedQueue: () => Promise<void>;
  lastSyncedAt: string | null;
  storageStats: StorageStats;
  isSyncCenterOpen: boolean;
  setIsSyncCenterOpen: (open: boolean) => void;

  // IAM & RBAC Access Management & Audit Logging
  currentUser: UserProfile | null;
  users: UserProfile[];
  loginWithPin: (userId: string, pin: string) => boolean;
  logoutUser: () => void;
  addUser: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => UserProfile;
  updateUser: (id: string, userData: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, category: AuditCategory, details: string, severity?: AuditSeverity) => void;
  clearAuditLogs: () => void;

  // System
  exportDatabase: () => void;
  importDatabase: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  ORGANIZATION: 'bijadex_org_v1',
  STORES: 'bijadex_stores_v1',
  ACTIVE_STORE: 'bijadex_active_store_v1',
  PRODUCTS: 'bijadex_products_v1',
  CUSTOMERS: 'bijadex_customers_v1',
  INVOICES: 'bijadex_invoices_v1',
  EXPENSES: 'bijadex_expenses_v1',
  STOCK_MOVEMENTS: 'bijadex_movements_v1',
  STOCK_TRANSFERS: 'bijadex_transfers_v1',
  SUPPLIERS: 'bijadex_suppliers_v1',
  PURCHASE_ORDERS: 'bijadex_pos_v1',
  ACTIVE_SHIFT: 'bijadex_shift_v1',
  FIRST_RUN: 'bijadex_setup_done'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if first-time install / onboarding is needed
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEYS.FIRST_RUN);
      return done !== 'true';
    } catch {
      return false;
    }
  });

  // Organization
  const [organization, setOrganization] = useState<Organization>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
      return stored ? JSON.parse(stored) : INITIAL_ORGANIZATION;
    } catch {
      return INITIAL_ORGANIZATION;
    }
  });

  // Keep format utility currency in sync with organization
  useEffect(() => {
    if (organization.currency) {
      setActiveCurrency(organization.currency);
    }
  }, [organization.currency]);

  // Stores
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STORES);
      return stored ? JSON.parse(stored) : INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  });

  // Active Store
  const [activeStoreId, setActiveStoreIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_STORE);
      return stored && INITIAL_STORES.some(s => s.id === stored) ? stored : INITIAL_STORES[0].id;
    } catch {
      return INITIAL_STORES[0].id;
    }
  });

  const activeStore = useMemo(() => {
    return stores.find(s => s.id === activeStoreId) || stores[0] || INITIAL_STORES[0];
  }, [stores, activeStoreId]);

  const setActiveStoreId = useCallback((id: string) => {
    setActiveStoreIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, id);
    } catch { /* storage fallback */ }
  }, []);

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Customers
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return stored ? JSON.parse(stored) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  // Stock movements
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
      return stored ? JSON.parse(stored) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  // Stock Transfers
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STOCK_TRANSFERS);
      return stored ? JSON.parse(stored) : INITIAL_STOCK_TRANSFERS;
    } catch {
      return INITIAL_STOCK_TRANSFERS;
    }
  });

  // Suppliers & Purchase Orders
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return stored ? JSON.parse(stored) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      return stored ? JSON.parse(stored) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  // Active register shift
  const [activeShift, setActiveShift] = useState<RegisterShift | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT);
      return stored ? JSON.parse(stored) : INITIAL_REGISTER_SHIFT;
    } catch {
      return INITIAL_REGISTER_SHIFT;
    }
  });

  // UI state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(INITIAL_CUSTOMERS[0] || null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('pos');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'pos' | 'inventory' | 'lookup'>('pos');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // IAM & RBAC Access Management State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem('bijadex_users_v1');
      return stored ? JSON.parse(stored) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bijadex_users_v1', JSON.stringify(users));
    } catch { /* storage fallback */ }
  }, [users]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('bijadex_current_user');
      return stored ? JSON.parse(stored) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  // Audit Logs State & Persistence
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem('bijadex_audit_logs_v1');
      return stored ? JSON.parse(stored) : DEFAULT_AUDIT_LOGS;
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bijadex_audit_logs_v1', JSON.stringify(auditLogs));
    } catch { /* storage fallback */ }
  }, [auditLogs]);

  const addAuditLog = useCallback((
    action: string,
    category: AuditCategory,
    details: string,
    severity: AuditSeverity = 'info'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'Himanshu V. Patil',
      userRole: currentUser?.role || 'owner',
      action,
      category,
      details,
      terminalId: 'POS-MAIN-01',
      storeName: activeStore?.name || 'Main Retail Store',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentUser, activeStore]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  const loginWithPin = useCallback((userId: string, pin: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && user.pin === pin && user.isActive) {
      setCurrentUser(user);
      try {
        localStorage.setItem('bijadex_current_user', JSON.stringify(user));
      } catch { /* storage fallback */ }

      // Log successful PIN authentication
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'PIN_AUTH_SUCCESS',
        category: 'auth',
        details: `Authenticated shift login as ${user.name} (${user.role.toUpperCase()})`,
        terminalId: 'POS-MAIN-01',
        storeName: activeStore?.name || 'Main Retail Store',
        severity: 'info'
      };
      setAuditLogs(prev => [newLog, ...prev]);
      return true;
    }
    return false;
  }, [users, activeStore]);

  const logoutUser = useCallback(() => {
    if (currentUser) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'PIN_LOCK_WORKSTATION',
        category: 'auth',
        details: `Workstation locked by ${currentUser.name}`,
        terminalId: 'POS-MAIN-01',
        storeName: activeStore?.name || 'Main Retail Store',
        severity: 'info'
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('bijadex_current_user');
    } catch { /* storage fallback */ }
  }, [currentUser, activeStore]);

  const addUser = useCallback((userData: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    addAuditLog('STAFF_ADDED', 'staff', `Added new staff member: ${userData.name} (${userData.role.toUpperCase()})`, 'info');
    return newUser;
  }, [addAuditLog]);

  const updateUser = useCallback((id: string, userData: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    setCurrentUser(prev => prev && prev.id === id ? { ...prev, ...userData } : prev);
    addAuditLog('STAFF_UPDATED', 'staff', `Updated staff credentials/role for user ID ${id}`, 'info');
  }, [addAuditLog]);

  const deleteUser = useCallback((id: string) => {
    const target = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('STAFF_DELETED', 'staff', `Revoked staff profile: ${target?.name || id} (${target?.role?.toUpperCase() || 'USER'})`, 'warning');
  }, [users, addAuditLog]);

  // IndexedDB & Offline Sync States
  const [networkOnline, setNetworkOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bijadex_simulated_offline') === 'true';
    } catch {
      return false;
    }
  });
  const isOnline = networkOnline && !isSimulatedOffline;

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({
    usedBytes: 184320,
    quotaBytes: 1073741824,
    percentage: 0.01,
    productCount: INITIAL_PRODUCTS.length,
    invoiceCount: INITIAL_INVOICES.length,
    queueCount: 0
  });
  const [isSyncCenterOpen, setIsSyncCenterOpen] = useState<boolean>(false);

  // Initialize audio
  useEffect(() => {
    soundManager.initFromStorage();
    setIsSoundMuted(soundManager.getMuted());
  }, []);

  // Listen to browser network connectivity changes
  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle simulated offline mode
  const toggleSimulateOffline = useCallback(() => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      try {
        localStorage.setItem('bijadex_simulated_offline', next ? 'true' : 'false');
      } catch { /* storage fallback */ }
      return next;
    });
  }, []);

  // IndexedDB Initial Boot Hydration
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const idbData = await loadAllFromIndexedDB();
        if (idbData && isMounted) {
          if (idbData.products.length > 0) setProducts(idbData.products);
          if (idbData.stores.length > 0) setStores(idbData.stores);
          if (idbData.organization) setOrganization(idbData.organization);
          if (idbData.customers.length > 0) setCustomers(idbData.customers);
          if (idbData.invoices.length > 0) setInvoices(idbData.invoices);
          if (idbData.expenses.length > 0) setExpenses(idbData.expenses);
          if (idbData.stockMovements.length > 0) setStockMovements(idbData.stockMovements);
          if (idbData.stockTransfers.length > 0) setStockTransfers(idbData.stockTransfers);
          if (idbData.suppliers.length > 0) setSuppliers(idbData.suppliers);
          if (idbData.purchaseOrders.length > 0) setPurchaseOrders(idbData.purchaseOrders);
          if (idbData.activeShift) setActiveShift(idbData.activeShift);
        } else if (isMounted) {
          // First time, seed initial data into IndexedDB
          await persistAllToIndexedDB({
            products,
            stores,
            organization,
            customers,
            invoices,
            expenses,
            stockMovements,
            stockTransfers,
            suppliers,
            purchaseOrders,
            activeShift
          });
        }

        const queue = await getAllSyncQueue();
        if (isMounted) setSyncQueue(queue);

        const lastSync = await getMetaItem<string>('lastSyncedAt');
        if (isMounted && lastSync) setLastSyncedAt(lastSync);

        const stats = await getStorageStats();
        if (isMounted) setStorageStats(stats);
      } catch (err) {
        console.warn('[IndexedDB] Boot initialization warning:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time synchronization worker
  const syncPendingNow = useCallback(async () => {
    if (isSyncing) return;
    const pending = await getPendingSyncQueue();
    if (pending.length === 0) return;

    setIsSyncing(true);

    try {
      // Mark as syncing in progress
      for (const item of pending) {
        await updateSyncItemStatus(item.id, 'syncing');
      }
      setSyncQueue(await getAllSyncQueue());

      // Realistic cloud round-trip delay
      await new Promise(resolve => setTimeout(resolve, 750));

      // Mark all as successfully synced
      const now = new Date().toISOString();
      for (const item of pending) {
        await updateSyncItemStatus(item.id, 'synced');
      }

      await setMetaItem('lastSyncedAt', now);
      setLastSyncedAt(now);

      const refreshed = await getAllSyncQueue();
      setSyncQueue(refreshed);

      const stats = await getStorageStats();
      setStorageStats(stats);

      soundManager.playSyncChime();
    } catch (err) {
      console.warn('[SyncEngine] Error during synchronization:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Automatic sync on network restoration
  useEffect(() => {
    if (isOnline) {
      getPendingSyncQueue().then(pending => {
        if (pending.length > 0) {
          syncPendingNow();
        }
      });
    }
  }, [isOnline, syncPendingNow]);

  // Clear completed synced items
  const clearSyncedQueue = useCallback(async () => {
    await clearSyncedItems();
    setSyncQueue(await getAllSyncQueue());
    setStorageStats(await getStorageStats());
  }, []);

  // Save to IndexedDB & fallback LocalStorage
  useEffect(() => {
    persistAllToIndexedDB({
      products,
      stores,
      organization,
      customers,
      invoices,
      expenses,
      stockMovements,
      stockTransfers,
      suppliers,
      purchaseOrders,
      activeShift
    }).then(() => {
      getStorageStats().then(setStorageStats);
    });

    try {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(organization));
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
      localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(stockTransfers));
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT, JSON.stringify(activeShift));
    } catch { /* storage fallback */ }
  }, [products, stores, organization, customers, invoices, expenses, stockMovements, stockTransfers, suppliers, purchaseOrders, activeShift]);

  const toggleSoundMuted = useCallback(() => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    soundManager.setMuted(next);
  }, [isSoundMuted]);

  const openScanner = useCallback((target: 'pos' | 'inventory' | 'lookup' = 'pos') => {
    setScannerTarget(target);
    setIsScannerOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsScannerOpen(false);
  }, []);

  // Helper to get stock for a product at a specific store or active store
  const getProductStock = useCallback((productId: string, storeId?: string): number => {
    const targetStoreId = storeId || activeStoreId;
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    if (prod.storeStock && prod.storeStock[targetStoreId] !== undefined) {
      return prod.storeStock[targetStoreId];
    }
    return prod.stock;
  }, [products, activeStoreId]);

  // Organization Updates
  const updateOrganization = useCallback((orgData: Partial<Organization>) => {
    setOrganization(prev => {
      const updated = { ...prev, ...orgData };
      if (updated.currency) {
        setActiveCurrency(updated.currency);
      }
      return updated;
    });
  }, []);

  // Complete Onboarding Wizard
  const completeOnboarding = useCallback((orgData: Partial<Organization>, primaryStoreData?: Partial<Store>) => {
    setOrganization(prev => {
      const updated: Organization = {
        ...prev,
        ...orgData,
        isSetupComplete: true
      };
      if (updated.currency) {
        setActiveCurrency(updated.currency);
      }
      return updated;
    });

    if (primaryStoreData && primaryStoreData.name) {
      setStores(prev => {
        const first = prev[0] || INITIAL_STORES[0];
        const updatedFirst: Store = {
          ...first,
          ...primaryStoreData,
          isActive: true
        };
        return [updatedFirst, ...prev.slice(1)];
      });
    }

    try {
      localStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'true');
    } catch { /* ignore */ }

    setIsOnboardingOpen(false);
  }, []);

  // Store Management
  const addStore = useCallback((storeData: Omit<Store, 'id'>): Store => {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`
    };
    setStores(prev => [...prev, newStore]);
    return newStore;
  }, []);

  const updateStore = useCallback((id: string, storeData: Partial<Store>) => {
    setStores(prev => prev.map(s => (s.id === id ? { ...s, ...storeData } : s)));
  }, []);

  const deleteStore = useCallback((id: string) => {
    if (stores.length <= 1) {
      alert('Cannot delete the only remaining store location.');
      return;
    }
    setStores(prev => prev.filter(s => s.id !== id));
    if (activeStoreId === id) {
      const remaining = stores.find(s => s.id !== id);
      if (remaining) setActiveStoreId(remaining.id);
    }
  }, [stores, activeStoreId, setActiveStoreId]);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const item = updated[existingIndex];
        const newQty = item.quantity + quantity;
        const subtotal = newQty * item.unitPrice * (1 - item.discountPercent / 100);
        const tax = (subtotal * item.taxRate) / 100;
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          total: subtotal + tax
        };
        return updated;
      } else {
        const subtotal = quantity * product.sellingPrice;
        const tax = (subtotal * product.taxRate) / 100;
        return [
          ...prevCart,
          {
            product,
            quantity,
            unitPrice: product.sellingPrice,
            discountPercent: 0,
            taxRate: product.taxRate,
            total: subtotal + tax
          }
        ];
      }
    });
  }, []);

  const updateCartItemQty = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        const subtotal = quantity * item.unitPrice * (1 - item.discountPercent / 100);
        const tax = (subtotal * item.taxRate) / 100;
        return {
          ...item,
          quantity,
          total: subtotal + tax
        };
      })
    );
  }, []);

  const updateCartItemDiscount = useCallback((productId: string, discountPercent: number) => {
    const validDiscount = Math.min(100, Math.max(0, discountPercent));
    setCart(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        const subtotal = item.quantity * item.unitPrice * (1 - validDiscount / 100);
        const tax = (subtotal * item.taxRate) / 100;
        return {
          ...item,
          discountPercent: validDiscount,
          total: subtotal + tax
        };
      })
    );
  }, []);

  const updateCartItemPrice = useCallback((productId: string, unitPrice: number) => {
    const validPrice = Math.max(0, unitPrice);
    setCart(prev =>
      prev.map(item => {
        if (item.product.id !== productId) return item;
        const subtotal = item.quantity * validPrice * (1 - item.discountPercent / 100);
        const tax = (subtotal * item.taxRate) / 100;
        return {
          ...item,
          unitPrice: validPrice,
          total: subtotal + tax
        };
      })
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Universal Barcode Scan Handler
  const handleBarcodeScan = useCallback((code: string): { found: boolean; product?: Product; message: string } => {
    const cleanCode = code.trim();
    if (!cleanCode) return { found: false, message: 'Empty barcode' };

    const product = products.find(
      p => p.barcode === cleanCode || p.sku.toLowerCase() === cleanCode.toLowerCase()
    );

    if (product) {
      soundManager.playScanBeep();

      const fb: ScanFeedback = {
        id: `scan-${Date.now()}`,
        code: cleanCode,
        type: 'success',
        message: `Scanned: ${product.name}`,
        productName: product.name,
        timestamp: Date.now()
      };
      setScanFeedback(fb);

      if (activeTab === 'pos' || scannerTarget === 'pos') {
        addToCart(product, 1);
      }

      return {
        found: true,
        product,
        message: `Found: ${product.name}`
      };
    } else {
      soundManager.playWarning();
      const fb: ScanFeedback = {
        id: `scan-${Date.now()}`,
        code: cleanCode,
        type: 'warning',
        message: `Unrecognized Barcode "${cleanCode}"`,
        timestamp: Date.now()
      };
      setScanFeedback(fb);
      return {
        found: false,
        message: `No product matches "${cleanCode}".`
      };
    }
  }, [products, activeTab, scannerTarget, addToCart]);

  // Checkout & Multi-store Stock Deduction
  const checkout = useCallback((details: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    discountType: 'percent' | 'flat';
    discountValue: number;
    cashier: string;
    notes?: string;
    useLoyaltyPoints?: number;
  }): Invoice => {
    if (cart.length === 0) {
      throw new Error('Cart is empty.');
    }

    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    let discountAmount = 0;
    if (details.discountType === 'percent') {
      discountAmount = (subtotal * Math.min(100, Math.max(0, details.discountValue))) / 100;
    } else {
      discountAmount = Math.min(subtotal, Math.max(0, details.discountValue));
    }

    // Loyalty points redemption discount
    let loyaltyDiscount = 0;
    const pointsToUse = details.useLoyaltyPoints || 0;
    if (pointsToUse > 0 && selectedCustomer) {
      loyaltyDiscount = pointsToUse * (organization.loyaltyRedemptionRate || 0.5);
    }

    const totalDiscountAll = discountAmount + loyaltyDiscount;
    const discountedSubtotal = Math.max(0, subtotal - totalDiscountAll);

    // Compute tax breakdown
    const taxBreakdownMap: { [rate: number]: { taxable: number; tax: number } } = {};
    for (const item of cart) {
      const lineTotal = item.quantity * item.unitPrice;
      const ratio = subtotal > 0 ? (lineTotal / subtotal) : 0;
      const lineDiscountedSub = discountedSubtotal * ratio;
      const lineTax = (lineDiscountedSub * item.taxRate) / 100;

      if (!taxBreakdownMap[item.taxRate]) {
        taxBreakdownMap[item.taxRate] = { taxable: 0, tax: 0 };
      }
      taxBreakdownMap[item.taxRate].taxable += lineDiscountedSub;
      taxBreakdownMap[item.taxRate].tax += lineTax;
    }

    const taxBreakdown: TaxBreakdown[] = Object.entries(taxBreakdownMap).map(([rate, vals]) => ({
      rate: Number(rate),
      taxableAmount: vals.taxable,
      taxAmount: vals.tax
    }));

    const taxTotal = taxBreakdown.reduce((sum, t) => sum + t.taxAmount, 0);
    const grandTotal = discountedSubtotal + taxTotal;

    const prefix = organization.invoicePrefix || 'INV-2026-';
    const invoiceNumber = `${prefix}${(invoices.length + 101).toString().padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      storeId: activeStore.id,
      storeName: activeStore.name,
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      discountType: details.discountType,
      discountValue: details.discountValue,
      discountAmount,
      loyaltyPointsUsed: pointsToUse,
      loyaltyDiscountAmount: loyaltyDiscount,
      taxTotal,
      taxBreakdown,
      grandTotal,
      paymentMethod: details.paymentMethod,
      amountTendered: details.amountTendered || grandTotal,
      changeDue: Math.max(0, (details.amountTendered || grandTotal) - grandTotal),
      status: 'completed',
      cashier: details.cashier || `${activeStore.manager} (POS)`,
      notes: details.notes || ''
    };

    // Deduct stock per active store and consolidated total
    const newMovements: StockMovement[] = [];
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (!cartItem) return p;

        const currentStoreStock = (p.storeStock && p.storeStock[activeStore.id] !== undefined)
          ? p.storeStock[activeStore.id]
          : p.stock;
        const newStoreStock = Math.max(0, currentStoreStock - cartItem.quantity);
        const newTotalStock = Math.max(0, p.stock - cartItem.quantity);

        const updatedStoreMap = {
          ...(p.storeStock || {}),
          [activeStore.id]: newStoreStock
        };

        newMovements.push({
          id: `sm-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          storeId: activeStore.id,
          type: 'sale',
          quantity: -cartItem.quantity,
          previousStock: currentStoreStock,
          newStock: newStoreStock,
          reason: `Sale ${invoiceNumber} at ${activeStore.name}`,
          date: new Date().toISOString(),
          referenceId: invoiceNumber
        });

        return {
          ...p,
          stock: newTotalStock,
          storeStock: updatedStoreMap,
          updatedAt: new Date().toISOString()
        };
      })
    );

    // Update customer loyalty points and lifetime purchases
    if (selectedCustomer) {
      const pointsEarned = Math.floor(grandTotal * (organization.loyaltyPointsRate || 0.1));
      setCustomers(prev =>
        prev.map(c =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                totalPurchases: c.totalPurchases + grandTotal,
                loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - pointsToUse + pointsEarned)
              }
            : c
        )
      );
    }

    // Update active register shift totals
    if (activeShift && activeShift.status === 'open') {
      setActiveShift(shift => {
        if (!shift) return null;
        const isCash = details.paymentMethod === 'cash';
        const isCard = details.paymentMethod === 'card';
        return {
          ...shift,
          cashSales: shift.cashSales + (isCash ? grandTotal : 0),
          cardSales: shift.cardSales + (isCard ? grandTotal : 0),
          expectedCash: shift.expectedCash + (isCash ? grandTotal : 0)
        };
      });
    }

    setInvoices(prev => [newInvoice, ...prev]);
    setStockMovements(prev => [...newMovements, ...prev]);

    soundManager.playCheckoutChime();
    setCart([]);
    setSelectedInvoiceForPrint(newInvoice);

    // Enqueue offline/local-first sync mutation
    enqueueSyncMutation({
      action: 'CREATE_INVOICE',
      entity: 'invoice',
      entityId: newInvoice.id,
      description: `Billed sale ${invoiceNumber} (${details.paymentMethod.toUpperCase()}) at ${activeStore.name}`,
      payload: newInvoice
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });

    return newInvoice;
  }, [cart, invoices.length, selectedCustomer, activeStore, organization, activeShift, isOnline, syncPendingNow]);

  // Inventory Stock Adjustments
  const adjustStock = useCallback((
    productId: string,
    adjustmentQty: number,
    type: 'in' | 'out' | 'audit',
    reason: string,
    storeId?: string
  ) => {
    const targetStoreId = storeId || activeStoreId;
    const targetStore = stores.find(s => s.id === targetStoreId) || activeStore;
    const targetProd = products.find(p => p.id === productId);

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;

        const currentStoreStock = (p.storeStock && p.storeStock[targetStoreId] !== undefined)
          ? p.storeStock[targetStoreId]
          : p.stock;

        let newStoreStock = currentStoreStock;
        if (type === 'in') {
          newStoreStock = currentStoreStock + Math.abs(adjustmentQty);
        } else if (type === 'out') {
          newStoreStock = Math.max(0, currentStoreStock - Math.abs(adjustmentQty));
        } else if (type === 'audit') {
          newStoreStock = Math.max(0, adjustmentQty);
        }

        const delta = newStoreStock - currentStoreStock;
        const newTotalStock = Math.max(0, p.stock + delta);

        const updatedStoreStock = {
          ...(p.storeStock || {}),
          [targetStoreId]: newStoreStock
        };

        setStockMovements(moves => [
          {
            id: `sm-${Date.now()}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            storeId: targetStoreId,
            type,
            quantity: delta,
            previousStock: currentStoreStock,
            newStock: newStoreStock,
            reason: reason || 'Manual Stock Adjustment',
            date: new Date().toISOString()
          },
          ...moves
        ]);

        return {
          ...p,
          stock: newTotalStock,
          storeStock: updatedStoreStock,
          updatedAt: new Date().toISOString()
        };
      })
    );

    // Enqueue sync mutation in IndexedDB
    enqueueSyncMutation({
      action: 'UPDATE_STOCK',
      entity: 'product',
      entityId: productId,
      description: `Stock ${type.toUpperCase()} (${adjustmentQty > 0 ? '+' : ''}${adjustmentQty}) for ${targetProd?.name || productId} at ${targetStore.name}`,
      payload: { productId, adjustmentQty, type, reason, storeId: targetStoreId }
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });
  }, [activeStoreId, stores, activeStore, products, isOnline, syncPendingNow]);

  // Product CRUD
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'updatedAt'>): Product => {
    const initialStoreStock: Record<string, number> = {};
    stores.forEach(s => {
      initialStoreStock[s.id] = s.id === activeStoreId ? productData.stock : 0;
    });

    const newProduct: Product = {
      ...productData,
      storeStock: productData.storeStock || initialStoreStock,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.stock > 0) {
      setStockMovements(prev => [
        {
          id: `sm-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          storeId: activeStoreId,
          type: 'in',
          quantity: newProduct.stock,
          previousStock: 0,
          newStock: newProduct.stock,
          reason: 'Initial Product Intake',
          date: new Date().toISOString()
        },
        ...prev
      ]);
    }

    // Enqueue sync mutation
    enqueueSyncMutation({
      action: 'ADD_PRODUCT',
      entity: 'product',
      entityId: newProduct.id,
      description: `Created product ${newProduct.name} [${newProduct.sku}]`,
      payload: newProduct
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });

    return newProduct;
  }, [stores, activeStoreId, isOnline, syncPendingNow]);

  const updateProduct = useCallback((id: string, productData: Partial<Product>) => {
    const target = products.find(p => p.id === id);
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
    );

    enqueueSyncMutation({
      action: 'UPDATE_PRODUCT',
      entity: 'product',
      entityId: id,
      description: `Updated product ${target?.name || id}`,
      payload: { id, updates: productData }
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });
  }, [products, isOnline, syncPendingNow]);

  const deleteProduct = useCallback((id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));

    enqueueSyncMutation({
      action: 'DELETE_PRODUCT',
      entity: 'product',
      entityId: id,
      description: `Deleted product ${target?.name || id}`,
      payload: { id }
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });
  }, [products, isOnline, syncPendingNow]);

  // Inter-Store Stock Transfers
  const createStockTransfer = useCallback((data: {
    fromStoreId: string;
    toStoreId: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }): StockTransfer => {
    const fromStore = stores.find(s => s.id === data.fromStoreId) || stores[0];
    const toStore = stores.find(s => s.id === data.toStoreId) || stores[1] || stores[0];

    const transferItems = data.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : '',
        quantity: item.quantity
      };
    });

    const transferNumber = `TRF-2026-${(stockTransfers.length + 101).toString().padStart(3, '0')}`;
    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber,
      fromStoreId: fromStore.id,
      fromStoreName: fromStore.name,
      toStoreId: toStore.id,
      toStoreName: toStore.name,
      items: transferItems,
      status: 'in_transit',
      date: new Date().toISOString(),
      notes: data.notes || ''
    };

    // Deduct stock from source store immediately
    setProducts(prev =>
      prev.map(p => {
        const trfItem = data.items.find(i => i.productId === p.id);
        if (!trfItem) return p;
        const currentSrc = (p.storeStock && p.storeStock[fromStore.id] !== undefined)
          ? p.storeStock[fromStore.id]
          : p.stock;
        const newSrc = Math.max(0, currentSrc - trfItem.quantity);
        return {
          ...p,
          storeStock: {
            ...(p.storeStock || {}),
            [fromStore.id]: newSrc
          }
        };
      })
    );

    setStockTransfers(prev => [newTransfer, ...prev]);
    return newTransfer;
  }, [stores, products, stockTransfers.length]);

  const completeStockTransfer = useCallback((transferId: string) => {
    setStockTransfers(prevTransfers =>
      prevTransfers.map(trf => {
        if (trf.id !== transferId) return trf;
        if (trf.status === 'completed') return trf;

        // Add stock to destination store
        setProducts(prevProducts =>
          prevProducts.map(p => {
            const item = trf.items.find(i => i.productId === p.id);
            if (!item) return p;
            const currentDest = (p.storeStock && p.storeStock[trf.toStoreId] !== undefined)
              ? p.storeStock[trf.toStoreId]
              : 0;
            const newDest = currentDest + item.quantity;
            return {
              ...p,
              storeStock: {
                ...(p.storeStock || {}),
                [trf.toStoreId]: newDest
              }
            };
          })
        );

        return {
          ...trf,
          status: 'completed',
          completedAt: new Date().toISOString()
        };
      })
    );
  }, []);

  // Purchase Orders & Suppliers
  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`
    };
    setSuppliers(prev => [...prev, newSup]);
    return newSup;
  }, []);

  const createPurchaseOrder = useCallback((data: {
    supplierId: string;
    storeId: string;
    items: { productId: string; quantity: number; costPrice: number }[];
    notes?: string;
  }): PurchaseOrder => {
    const sup = suppliers.find(s => s.id === data.supplierId);
    const store = stores.find(s => s.id === data.storeId) || activeStore;

    const poItems = data.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Product',
        sku: prod ? prod.sku : '',
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.quantity * item.costPrice
      };
    });

    const totalAmount = poItems.reduce((sum, i) => sum + i.total, 0);
    const poNumber = `PO-2026-${(purchaseOrders.length + 101).toString().padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: data.supplierId,
      supplierName: sup ? sup.name : 'Supplier',
      storeId: store.id,
      storeName: store.name,
      items: poItems,
      totalAmount,
      status: 'ordered',
      orderDate: new Date().toISOString(),
      notes: data.notes || ''
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  }, [suppliers, stores, activeStore, products, purchaseOrders.length]);

  const receivePurchaseOrder = useCallback((poId: string) => {
    setPurchaseOrders(prevPOs =>
      prevPOs.map(po => {
        if (po.id !== poId) return po;
        if (po.status === 'received') return po;

        // Restock inventory at designated store
        setProducts(prevProducts =>
          prevProducts.map(p => {
            const item = po.items.find(i => i.productId === p.id);
            if (!item) return p;
            const currentStoreStock = (p.storeStock && p.storeStock[po.storeId] !== undefined)
              ? p.storeStock[po.storeId]
              : p.stock;
            const newStoreStock = currentStoreStock + item.quantity;
            const newTotalStock = p.stock + item.quantity;
            return {
              ...p,
              stock: newTotalStock,
              storeStock: {
                ...(p.storeStock || {}),
                [po.storeId]: newStoreStock
              }
            };
          })
        );

        // Record expense for goods purchase
        const newExp: Expense = {
          id: `exp-po-${Date.now()}`,
          date: new Date().toISOString(),
          storeId: po.storeId,
          category: 'Inventory Purchase',
          description: `Received Purchase Order ${po.poNumber} from ${po.supplierName}`,
          amount: po.totalAmount,
          paymentMethod: 'Supplier Credit / Invoice',
          receiptRef: po.poNumber
        };
        setExpenses(prev => [newExp, ...prev]);

        return {
          ...po,
          status: 'received',
          receivedDate: new Date().toISOString()
        };
      })
    );
  }, []);

  // Register Shift Operations
  const openShift = useCallback((openingFloat: number) => {
    const newShift: RegisterShift = {
      id: `shift-${Date.now()}`,
      storeId: activeStore.id,
      cashier: `${activeStore.manager} (POS)`,
      openedAt: new Date().toISOString(),
      openingFloat,
      cashSales: 0,
      cardSales: 0,
      cashPayouts: 0,
      expectedCash: openingFloat,
      status: 'open'
    };
    setActiveShift(newShift);
  }, [activeStore]);

  const closeShift = useCallback((actualCashCounted: number, notes?: string) => {
    if (!activeShift) return;
    const variance = actualCashCounted - activeShift.expectedCash;
    setActiveShift({
      ...activeShift,
      status: 'closed',
      closedAt: new Date().toISOString(),
      actualCashCounted,
      variance,
      notes: notes || activeShift.notes
    });
  }, [activeShift]);

  // Customers
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'totalPurchases'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalPurchases: 0,
      loyaltyPoints: 0
    };
    setCustomers(prev => [...prev, newCust]);
    return newCust;
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  // Expenses
  const addExpense = useCallback((expenseData: Omit<Expense, 'id'>): Expense => {
    const newExp: Expense = {
      ...expenseData,
      storeId: expenseData.storeId || activeStoreId,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  }, [activeStoreId]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // Refund invoice
  const refundInvoice = useCallback((invoiceId: string, reason: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id !== invoiceId) return inv;
        if (inv.status === 'refunded') return inv;

        // Restore stock at store where sold
        setProducts(currProducts =>
          currProducts.map(p => {
            const soldItem = inv.items.find(ci => ci.product.id === p.id);
            if (!soldItem) return p;

            const currentStoreStock = (p.storeStock && p.storeStock[inv.storeId] !== undefined)
              ? p.storeStock[inv.storeId]
              : p.stock;
            const newStoreStock = currentStoreStock + soldItem.quantity;
            const newTotalStock = p.stock + soldItem.quantity;

            return {
              ...p,
              stock: newTotalStock,
              storeStock: {
                ...(p.storeStock || {}),
                [inv.storeId]: newStoreStock
              },
              updatedAt: new Date().toISOString()
            };
          })
        );

        return {
          ...inv,
          status: 'refunded',
          notes: `${inv.notes ? inv.notes + ' | ' : ''}REFUNDED: ${reason}`
        };
      })
    );

    enqueueSyncMutation({
      action: 'REFUND_INVOICE',
      entity: 'invoice',
      entityId: invoiceId,
      description: `Refunded invoice ${invoiceId} (Reason: ${reason})`,
      payload: { invoiceId, reason }
    }).then(async () => {
      setSyncQueue(await getAllSyncQueue());
      setStorageStats(await getStorageStats());
      if (isOnline) syncPendingNow();
    });
  }, [isOnline, syncPendingNow]);

  // Database Backup / Reset
  const exportDatabase = useCallback(() => {
    const payload = {
      appName: 'Bijadex Desktop ERP & POS by Bijasa',
      exportedAt: new Date().toISOString(),
      organization,
      stores,
      activeStoreId,
      products,
      customers,
      invoices,
      expenses,
      stockMovements,
      stockTransfers,
      suppliers,
      purchaseOrders,
      activeShift
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bijadex-enterprise-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [organization, stores, activeStoreId, products, customers, invoices, expenses, stockMovements, stockTransfers, suppliers, purchaseOrders, activeShift]);

  const importDatabase = useCallback((jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.products) && Array.isArray(data.invoices)) {
        if (data.organization) setOrganization(data.organization);
        if (Array.isArray(data.stores)) setStores(data.stores);
        setProducts(data.products);
        if (Array.isArray(data.customers)) setCustomers(data.customers);
        setInvoices(data.invoices);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.stockMovements)) setStockMovements(data.stockMovements);
        if (Array.isArray(data.stockTransfers)) setStockTransfers(data.stockTransfers);
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
        if (Array.isArray(data.purchaseOrders)) setPurchaseOrders(data.purchaseOrders);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const resetToDemoData = useCallback(() => {
    setOrganization(INITIAL_ORGANIZATION);
    setStores(INITIAL_STORES);
    setActiveStoreId(INITIAL_STORES[0].id);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setStockTransfers(INITIAL_STOCK_TRANSFERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setActiveShift(INITIAL_REGISTER_SHIFT);
    setCart([]);
    setSelectedCustomer(INITIAL_CUSTOMERS[0] || null);
  }, [setActiveStoreId]);

  return (
    <AppContext.Provider
      value={{
        organization,
        updateOrganization,
        stores,
        activeStoreId,
        activeStore,
        setActiveStoreId,
        addStore,
        updateStore,
        deleteStore,

        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,

        products,
        getProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,

        stockTransfers,
        createStockTransfer,
        completeStockTransfer,

        suppliers,
        addSupplier,
        purchaseOrders,
        createPurchaseOrder,
        receivePurchaseOrder,

        activeShift,
        openShift,
        closeShift,

        customers,
        selectedCustomer,
        setSelectedCustomer,
        addCustomer,
        updateCustomer,

        cart,
        addToCart,
        updateCartItemQty,
        updateCartItemDiscount,
        updateCartItemPrice,
        removeFromCart,
        clearCart,
        checkout,

        invoices,
        refundInvoice,
        expenses,
        addExpense,
        deleteExpense,
        stockMovements,

        activeTab,
        setActiveTab,
        isScannerOpen,
        scannerTarget,
        openScanner,
        closeScanner,
        isSoundMuted,
        toggleSoundMuted,
        scanFeedback,
        handleBarcodeScan,
        selectedInvoiceForPrint,
        setSelectedInvoiceForPrint,
        isShortcutsOpen,
        setIsShortcutsOpen,

        // IndexedDB Local-First Engine & Sync Center
        isOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        isSyncing,
        syncPendingNow,
        syncQueue,
        clearSyncedQueue,
        lastSyncedAt,
        storageStats,
        isSyncCenterOpen,
        setIsSyncCenterOpen,

        // IAM & RBAC Access Management & Audit Logging
        currentUser,
        users,
        loginWithPin,
        logoutUser,
        addUser,
        updateUser,
        deleteUser,
        auditLogs,
        addAuditLog,
        clearAuditLogs,

        exportDatabase,
        importDatabase,
        resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
