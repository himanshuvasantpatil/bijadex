export interface CurrencyConfig {
  code: string; // e.g. 'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'AED', 'SAR'
  symbol: string; // '$', '€', '£', '₹', '¥', etc.
  name: string;
  position: 'prefix' | 'suffix';
  decimals: number;
  decimalSep: string;
  thousandSep: string;
}

export interface Store {
  id: string;
  name: string;
  code: string; // e.g. 'MAIN-01', 'DOWNTOWN-02', 'WAREHOUSE-WH'
  address: string;
  phone: string;
  manager: string;
  type: 'retail' | 'warehouse' | 'outlet';
  isActive: boolean;
  taxRegistrationNumber?: string;
  notes?: string;
}

export interface Organization {
  id: string;
  name: string;
  businessType: 'Retail Store' | 'Wholesale & Distribution' | 'Electronics & Gadgets' | 'Supermarket / Grocery' | 'Hardware & Industrial' | 'Pharmacy & Health' | 'Apparel & Fashion' | 'General Merchandise';
  country: string;
  currency: CurrencyConfig;
  taxId: string; // VAT / GSTIN / EIN / Tax Reg ID
  taxName: string; // 'Sales Tax', 'VAT', 'GST', 'HST'
  defaultTaxRate: number;
  phone: string;
  email: string;
  website?: string;
  address: string;
  invoicePrefix: string;
  receiptHeader: string;
  receiptFooter: string;
  isSetupComplete: boolean;
  loyaltyPointsRate: number; // e.g. 1 point per 10 currency units
  loyaltyRedemptionRate: number; // e.g. 1 point = 0.10 currency discount
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // percentage, e.g. 10 for 10%
  stock: number; // Total consolidated stock
  storeStock?: Record<string, number>; // Store-specific stock: { [storeId]: stockAtStore }
  minStockAlert: number;
  unit: 'pcs' | 'box' | 'kg' | 'pack' | 'meter' | 'liter';
  supplier: string;
  location: string;
  updatedAt: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxId?: string; // GST/VAT/Tax ID
  address?: string;
  totalPurchases: number;
  loyaltyPoints?: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'credit' | 'loyalty_points';

export interface TaxBreakdown {
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // ISO date
  storeId: string; // Multi-store identifier
  storeName?: string;
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  discountType: 'percent' | 'flat';
  discountValue: number;
  discountAmount: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscountAmount?: number;
  taxTotal: number;
  taxBreakdown: TaxBreakdown[];
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeDue: number;
  status: 'completed' | 'refunded' | 'void';
  cashier: string;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  storeId?: string; // Multi-store expense allocation
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Packaging & Shipping' | 'Marketing' | 'Maintenance' | 'Software & Subscriptions' | 'Inventory Purchase' | 'Other';
  description: string;
  amount: number;
  paymentMethod: string;
  receiptRef?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  storeId?: string;
  type: 'in' | 'out' | 'audit' | 'sale' | 'refund' | 'transfer_in' | 'transfer_out';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  referenceId?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  fromStoreName: string;
  toStoreId: string;
  toStoreName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
  }[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  date: string;
  completedAt?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  paymentTerms: string; // 'Net 15', 'Net 30', 'Due on Receipt', etc.
  leadTimeDays: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  storeId: string;
  storeName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    costPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  receivedDate?: string;
  notes?: string;
}

export interface RegisterShift {
  id: string;
  storeId: string;
  cashier: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  cashPayouts: number;
  expectedCash: number;
  actualCashCounted?: number;
  variance?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type NavigationTab = 
  | 'pos' 
  | 'inventory' 
  | 'handheld'
  | 'reports' 
  | 'invoices' 
  | 'transfers'
  | 'purchases'
  | 'shifts'
  | 'expenses' 
  | 'customers' 
  | 'stores'
  | 'labels'
  | 'staff'
  | 'settings';
