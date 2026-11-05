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

  // Initialize audio
  useEffect(() => {
    soundManager.initFromStorage();
    setIsSoundMuted(soundManager.getMuted());
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(organization));
    } catch { /* storage fallback */ }
  }, [organization]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    } catch { /* storage fallback */ }
  }, [stores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch { /* storage fallback */ }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch { /* storage fallback */ }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch { /* storage fallback */ }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch { /* storage fallback */ }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
    } catch { /* storage fallback */ }
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(stockTransfers));
    } catch { /* storage fallback */ }
  }, [stockTransfers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
    } catch { /* storage fallback */ }
  }, [purchaseOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT, JSON.stringify(activeShift));
    } catch { /* storage fallback */ }
  }, [activeShift]);

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

    return newInvoice;
  }, [cart, invoices.length, selectedCustomer, activeStore, organization, activeShift]);

  // Inventory Stock Adjustments
  const adjustStock = useCallback((
    productId: string,
    adjustmentQty: number,
    type: 'in' | 'out' | 'audit',
    reason: string,
    storeId?: string
  ) => {
    const targetStoreId = storeId || activeStoreId;

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
  }, [activeStoreId]);

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

    return newProduct;
  }, [stores, activeStoreId]);

  const updateProduct = useCallback((id: string, productData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

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
  }, []);

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
