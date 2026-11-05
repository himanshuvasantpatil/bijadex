import {
  Product,
  Store,
  Organization,
  Customer,
  Invoice,
  Expense,
  StockMovement,
  StockTransfer,
  Supplier,
  PurchaseOrder,
  RegisterShift
} from '../types';
import { SyncQueueItem, StorageStats } from '../types/sync';

const DB_NAME = 'bijadex_local_db';
const DB_VERSION = 1;

export const IDB_STORES = {
  PRODUCTS: 'products',
  STORES: 'stores',
  ORGANIZATION: 'organization',
  CUSTOMERS: 'customers',
  INVOICES: 'invoices',
  EXPENSES: 'expenses',
  STOCK_MOVEMENTS: 'stock_movements',
  STOCK_TRANSFERS: 'stock_transfers',
  SUPPLIERS: 'suppliers',
  PURCHASE_ORDERS: 'purchase_orders',
  ACTIVE_SHIFT: 'active_shift',
  SYNC_QUEUE: 'sync_queue',
  META: 'meta'
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens and initializes the IndexedDB database instance with all object stores and indices
 */
export function openBijadexDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Products store with barcode & sku indices
      if (!db.objectStoreNames.contains(IDB_STORES.PRODUCTS)) {
        const prodStore = db.createObjectStore(IDB_STORES.PRODUCTS, { keyPath: 'id' });
        prodStore.createIndex('barcode', 'barcode', { unique: false });
        prodStore.createIndex('sku', 'sku', { unique: false });
        prodStore.createIndex('category', 'category', { unique: false });
      }

      // Stores
      if (!db.objectStoreNames.contains(IDB_STORES.STORES)) {
        db.createObjectStore(IDB_STORES.STORES, { keyPath: 'id' });
      }

      // Organization
      if (!db.objectStoreNames.contains(IDB_STORES.ORGANIZATION)) {
        db.createObjectStore(IDB_STORES.ORGANIZATION, { keyPath: 'id' });
      }

      // Customers
      if (!db.objectStoreNames.contains(IDB_STORES.CUSTOMERS)) {
        const custStore = db.createObjectStore(IDB_STORES.CUSTOMERS, { keyPath: 'id' });
        custStore.createIndex('phone', 'phone', { unique: false });
      }

      // Invoices
      if (!db.objectStoreNames.contains(IDB_STORES.INVOICES)) {
        const invStore = db.createObjectStore(IDB_STORES.INVOICES, { keyPath: 'id' });
        invStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: true });
        invStore.createIndex('date', 'date', { unique: false });
      }

      // Expenses
      if (!db.objectStoreNames.contains(IDB_STORES.EXPENSES)) {
        db.createObjectStore(IDB_STORES.EXPENSES, { keyPath: 'id' });
      }

      // Stock Movements
      if (!db.objectStoreNames.contains(IDB_STORES.STOCK_MOVEMENTS)) {
        const moveStore = db.createObjectStore(IDB_STORES.STOCK_MOVEMENTS, { keyPath: 'id' });
        moveStore.createIndex('productId', 'productId', { unique: false });
        moveStore.createIndex('storeId', 'storeId', { unique: false });
      }

      // Stock Transfers
      if (!db.objectStoreNames.contains(IDB_STORES.STOCK_TRANSFERS)) {
        db.createObjectStore(IDB_STORES.STOCK_TRANSFERS, { keyPath: 'id' });
      }

      // Suppliers
      if (!db.objectStoreNames.contains(IDB_STORES.SUPPLIERS)) {
        db.createObjectStore(IDB_STORES.SUPPLIERS, { keyPath: 'id' });
      }

      // Purchase Orders
      if (!db.objectStoreNames.contains(IDB_STORES.PURCHASE_ORDERS)) {
        db.createObjectStore(IDB_STORES.PURCHASE_ORDERS, { keyPath: 'id' });
      }

      // Active Shift
      if (!db.objectStoreNames.contains(IDB_STORES.ACTIVE_SHIFT)) {
        db.createObjectStore(IDB_STORES.ACTIVE_SHIFT, { keyPath: 'id' });
      }

      // Local-first Sync Queue
      if (!db.objectStoreNames.contains(IDB_STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(IDB_STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Meta (last sync, app settings)
      if (!db.objectStoreNames.contains(IDB_STORES.META)) {
        db.createObjectStore(IDB_STORES.META, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

/**
 * Generic helper to get all items from an object store
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openBijadexDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IDB] Failed to get all from ${storeName}:`, err);
    return [];
  }
}

/**
 * Generic helper to put or update an item in an object store
 */
export async function putInStore<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openBijadexDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`[IDB] Failed to put into ${storeName}:`, err);
  }
}

/**
 * Generic helper to bulk replace/save an array of items into an object store
 */
export async function setAllInStore<T>(storeName: string, items: T[]): Promise<void> {
  try {
    const db = await openBijadexDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Clear existing records in store first to ensure exact state match
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        for (const item of items) {
          store.put(item);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[IDB] Failed to setAll in ${storeName}:`, err);
  }
}

/**
 * Saves all core application tables to IndexedDB in parallel
 */
export async function persistAllToIndexedDB(data: {
  products: Product[];
  stores: Store[];
  organization: Organization;
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  activeShift: RegisterShift | null;
}): Promise<void> {
  try {
    const db = await openBijadexDB();
    const storeNames = [
      IDB_STORES.PRODUCTS,
      IDB_STORES.STORES,
      IDB_STORES.ORGANIZATION,
      IDB_STORES.CUSTOMERS,
      IDB_STORES.INVOICES,
      IDB_STORES.EXPENSES,
      IDB_STORES.STOCK_MOVEMENTS,
      IDB_STORES.STOCK_TRANSFERS,
      IDB_STORES.SUPPLIERS,
      IDB_STORES.PURCHASE_ORDERS,
      IDB_STORES.ACTIVE_SHIFT
    ];

    const tx = db.transaction(storeNames, 'readwrite');

    // Products
    const prodStore = tx.objectStore(IDB_STORES.PRODUCTS);
    prodStore.clear();
    for (const p of data.products) prodStore.put(p);

    // Stores
    const storesStore = tx.objectStore(IDB_STORES.STORES);
    storesStore.clear();
    for (const s of data.stores) storesStore.put(s);

    // Organization
    const orgStore = tx.objectStore(IDB_STORES.ORGANIZATION);
    orgStore.clear();
    orgStore.put(data.organization);

    // Customers
    const custStore = tx.objectStore(IDB_STORES.CUSTOMERS);
    custStore.clear();
    for (const c of data.customers) custStore.put(c);

    // Invoices
    const invStore = tx.objectStore(IDB_STORES.INVOICES);
    invStore.clear();
    for (const inv of data.invoices) invStore.put(inv);

    // Expenses
    const expStore = tx.objectStore(IDB_STORES.EXPENSES);
    expStore.clear();
    for (const exp of data.expenses) expStore.put(exp);

    // Stock Movements
    const moveStore = tx.objectStore(IDB_STORES.STOCK_MOVEMENTS);
    moveStore.clear();
    for (const sm of data.stockMovements) moveStore.put(sm);

    // Stock Transfers
    const transStore = tx.objectStore(IDB_STORES.STOCK_TRANSFERS);
    transStore.clear();
    for (const st of data.stockTransfers) transStore.put(st);

    // Suppliers
    const supStore = tx.objectStore(IDB_STORES.SUPPLIERS);
    supStore.clear();
    for (const sup of data.suppliers) supStore.put(sup);

    // Purchase Orders
    const poStore = tx.objectStore(IDB_STORES.PURCHASE_ORDERS);
    poStore.clear();
    for (const po of data.purchaseOrders) poStore.put(po);

    // Active Shift
    const shiftStore = tx.objectStore(IDB_STORES.ACTIVE_SHIFT);
    shiftStore.clear();
    if (data.activeShift) shiftStore.put(data.activeShift);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Error persisting all tables to IndexedDB:', err);
  }
}

/**
 * Loads all core application tables from IndexedDB
 */
export async function loadAllFromIndexedDB(): Promise<{
  products: Product[];
  stores: Store[];
  organization: Organization | null;
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  stockTransfers: StockTransfer[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  activeShift: RegisterShift | null;
} | null> {
  try {
    const products = await getAllFromStore<Product>(IDB_STORES.PRODUCTS);
    // If no products cached yet, database hasn't been seeded into IDB
    if (!products || products.length === 0) {
      return null;
    }

    const [
      stores,
      orgs,
      customers,
      invoices,
      expenses,
      stockMovements,
      stockTransfers,
      suppliers,
      purchaseOrders,
      shifts
    ] = await Promise.all([
      getAllFromStore<Store>(IDB_STORES.STORES),
      getAllFromStore<Organization>(IDB_STORES.ORGANIZATION),
      getAllFromStore<Customer>(IDB_STORES.CUSTOMERS),
      getAllFromStore<Invoice>(IDB_STORES.INVOICES),
      getAllFromStore<Expense>(IDB_STORES.EXPENSES),
      getAllFromStore<StockMovement>(IDB_STORES.STOCK_MOVEMENTS),
      getAllFromStore<StockTransfer>(IDB_STORES.STOCK_TRANSFERS),
      getAllFromStore<Supplier>(IDB_STORES.SUPPLIERS),
      getAllFromStore<PurchaseOrder>(IDB_STORES.PURCHASE_ORDERS),
      getAllFromStore<RegisterShift>(IDB_STORES.ACTIVE_SHIFT)
    ]);

    return {
      products,
      stores,
      organization: orgs.length > 0 ? orgs[0] : null,
      customers,
      invoices,
      expenses,
      stockMovements,
      stockTransfers,
      suppliers,
      purchaseOrders,
      activeShift: shifts.length > 0 ? shifts[0] : null
    };
  } catch (err) {
    console.warn('[IDB] Failed to load data from IndexedDB:', err);
    return null;
  }
}

/**
 * Enqueues an offline inventory/business mutation into the IndexedDB sync queue
 */
export async function enqueueSyncMutation(
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>
): Promise<SyncQueueItem> {
  const syncItem: SyncQueueItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0
  };

  await putInStore<SyncQueueItem>(IDB_STORES.SYNC_QUEUE, syncItem);
  return syncItem;
}

/**
 * Retrieves all items in the sync queue
 */
export async function getAllSyncQueue(): Promise<SyncQueueItem[]> {
  const items = await getAllFromStore<SyncQueueItem>(IDB_STORES.SYNC_QUEUE);
  // Sort newest first
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Retrieves only pending items awaiting cloud synchronization
 */
export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const all = await getAllSyncQueue();
  return all.filter(item => item.status === 'pending' || item.status === 'failed');
}

/**
 * Updates a sync queue item's status (e.g. pending -> syncing -> synced)
 */
export async function updateSyncItemStatus(
  id: string,
  status: SyncQueueItem['status'],
  error?: string
): Promise<void> {
  try {
    const db = await openBijadexDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(IDB_STORES.SYNC_QUEUE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as SyncQueueItem | undefined;
        if (item) {
          item.status = status;
          if (error) item.error = error;
          if (status === 'synced') item.syncedAt = new Date().toISOString();
          store.put(item);
        }
        resolve();
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[IDB] Failed to update sync item status:', err);
  }
}

/**
 * Removes all completed 'synced' items from the queue to free space
 */
export async function clearSyncedItems(): Promise<void> {
  try {
    const db = await openBijadexDB();
    const all = await getAllSyncQueue();
    const completedIds = all.filter(i => i.status === 'synced').map(i => i.id);

    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(IDB_STORES.SYNC_QUEUE);
      for (const id of completedIds) {
        store.delete(id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[IDB] Failed to clear synced items:', err);
  }
}

/**
 * Estimates storage quota and usage
 */
export async function getStorageStats(): Promise<StorageStats> {
  let usedBytes = 0;
  let quotaBytes = 0;
  let percentage = 0;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usedBytes = estimate.usage || 0;
      quotaBytes = estimate.quota || 0;
      percentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
    } catch {
      // ignore
    }
  }

  const [products, invoices, queue] = await Promise.all([
    getAllFromStore<Product>(IDB_STORES.PRODUCTS),
    getAllFromStore<Invoice>(IDB_STORES.INVOICES),
    getAllFromStore<SyncQueueItem>(IDB_STORES.SYNC_QUEUE)
  ]);

  return {
    usedBytes,
    quotaBytes,
    percentage,
    productCount: products.length,
    invoiceCount: invoices.length,
    queueCount: queue.filter(q => q.status === 'pending').length
  };
}

/**
 * Meta Key-Value getters and setters
 */
export async function setMetaItem(key: string, value: any): Promise<void> {
  await putInStore(IDB_STORES.META, { key, value, updatedAt: new Date().toISOString() });
}

export async function getMetaItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openBijadexDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORES.META, 'readonly');
      const store = tx.objectStore(IDB_STORES.META);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? (req.result.value as T) : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}
