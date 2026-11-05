export type SyncActionType =
  | 'UPDATE_STOCK'
  | 'ADD_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_INVOICE'
  | 'REFUND_INVOICE'
  | 'STOCK_TRANSFER'
  | 'PURCHASE_ORDER'
  | 'CREATE_CUSTOMER'
  | 'UPDATE_CUSTOMER'
  | 'RECORD_EXPENSE'
  | 'UPDATE_ORGANIZATION'
  | 'UPDATE_STORE';

export type SyncEntity =
  | 'product'
  | 'invoice'
  | 'store'
  | 'customer'
  | 'expense'
  | 'transfer'
  | 'purchase'
  | 'organization';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  action: SyncActionType;
  entity: SyncEntity;
  entityId: string;
  description: string;
  payload: any;
  timestamp: string;
  status: SyncStatus;
  retryCount: number;
  error?: string;
  syncedAt?: string;
}

export interface StorageStats {
  usedBytes: number;
  quotaBytes: number;
  percentage: number;
  productCount: number;
  invoiceCount: number;
  queueCount: number;
}
