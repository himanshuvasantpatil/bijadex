import { 
  Product, 
  Customer, 
  Invoice, 
  Expense, 
  StockMovement, 
  Store, 
  Organization, 
  Supplier, 
  PurchaseOrder, 
  StockTransfer,
  RegisterShift 
} from '../types';
import { DEFAULT_CURRENCY } from '../utils/format';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-main',
    name: 'Downtown Flagship Store',
    code: 'DT-01',
    address: '100 Technology Plaza, Suite 100, San Francisco, CA 94105',
    phone: '+1 (415) 555-0142',
    manager: 'Alex Chen',
    type: 'retail',
    isActive: true,
    taxRegistrationNumber: 'US-CA-9438291-01',
    notes: 'Primary retail storefront with high footfall POS checkout'
  },
  {
    id: 'store-west',
    name: 'Westside Logistics & Central Warehouse',
    code: 'WH-WEST',
    address: '450 Industrial Parkway, Bay 12, Oakland, CA 94607',
    phone: '+1 (510) 555-0188',
    manager: 'Marcus Vance',
    type: 'warehouse',
    isActive: true,
    taxRegistrationNumber: 'US-CA-9438291-02',
    notes: 'Central bulk intake facility, supplier receipt & pallet storage'
  },
  {
    id: 'store-north',
    name: 'North Airport Terminal Outlet',
    code: 'AP-03',
    address: 'SFO International Airport, Terminal 2 Concourse B',
    phone: '+1 (650) 555-0199',
    manager: 'Elena Rostova',
    type: 'outlet',
    isActive: true,
    taxRegistrationNumber: 'US-CA-9438291-03',
    notes: 'Express travel retail outlet with rapid barcode scanning'
  }
];

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-default',
  name: 'OmniStock Global Retail & Distribution',
  businessType: 'Electronics & Gadgets',
  country: 'United States',
  currency: DEFAULT_CURRENCY,
  taxId: 'US-EIN-94-3829104',
  taxName: 'Sales Tax',
  defaultTaxRate: 10,
  phone: '+1 (800) 555-0199',
  email: 'ops@omnistock.global',
  website: 'https://omnistock.global',
  address: '100 Technology Plaza, San Francisco, CA 94105',
  invoicePrefix: 'INV-2026-',
  receiptHeader: 'OMNISTOCK ENTERPRISE STORE',
  receiptFooter: 'Thank you for shopping with us! Returns accepted within 14 days with original receipt.',
  isSetupComplete: true,
  loyaltyPointsRate: 0.1, // 1 point per $10
  loyaltyRedemptionRate: 0.50, // 1 point = $0.50 discount
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    name: 'Apex Tech Distribution North America',
    contactPerson: 'David Miller',
    email: 'orders@apextech.com',
    phone: '+1 (800) 555-9012',
    address: '1200 Distribution Way, Fremont, CA',
    taxId: 'US-EIN-91-884201',
    paymentTerms: 'Net 30',
    leadTimeDays: 3
  },
  {
    id: 'sup-02',
    name: 'Pacific Outpost Goods Co',
    contactPerson: 'Karen Lindqvist',
    email: 'wholesale@pacificoutpost.com',
    phone: '+1 (206) 555-4412',
    address: '880 Harbor Ave, Seattle, WA',
    taxId: 'US-WA-602-991',
    paymentTerms: 'Net 15',
    leadTimeDays: 4
  },
  {
    id: 'sup-03',
    name: 'Industrial Fasteners & Tools Supply',
    contactPerson: 'Robert Hall',
    email: 'supply@industrialfasteners.com',
    phone: '+1 (312) 555-8821',
    address: '220 Foundry Road, Chicago, IL',
    taxId: 'US-IL-36-81920',
    paymentTerms: 'Net 30',
    leadTimeDays: 5
  },
  {
    id: 'sup-04',
    name: 'Bean & Roast Beverage Wholesalers',
    contactPerson: 'Maria Santos',
    email: 'sales@beanandroast.com',
    phone: '+1 (415) 555-7733',
    address: '740 Roastery Way, South San Francisco, CA',
    taxId: 'US-CA-94-22819',
    paymentTerms: 'Due on Receipt',
    leadTimeDays: 2
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'LOG-MXM3S',
    barcode: '097855175235',
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Electronics',
    costPrice: 58.00,
    sellingPrice: 99.99,
    taxRate: 10,
    stock: 44,
    storeStock: {
      'store-main': 16,
      'store-west': 22,
      'store-north': 6
    },
    minStockAlert: 8,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 2, Bin 14',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    description: 'Ergonomic performance wireless mouse with 8K DPI sensor.'
  },
  {
    id: 'prod-002',
    sku: 'ANK-737-PB',
    barcode: '194644098651',
    name: 'Anker 737 Power Bank (PowerCore 24K)',
    category: 'Electronics',
    costPrice: 85.00,
    sellingPrice: 149.99,
    taxRate: 10,
    stock: 24,
    storeStock: {
      'store-main': 8,
      'store-west': 12,
      'store-north': 4
    },
    minStockAlert: 5,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 2, Bin 18',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    description: '140W 3-port ultra-fast portable charger with digital smart display.'
  },
  {
    id: 'prod-003',
    sku: 'SONY-WH1000XM5',
    barcode: '027242923980',
    name: 'Sony WH-1000XM5 Noise Canceling Headphones',
    category: 'Audio',
    costPrice: 240.00,
    sellingPrice: 398.00,
    taxRate: 10,
    stock: 8,
    storeStock: {
      'store-main': 3,
      'store-west': 4,
      'store-north': 1
    },
    minStockAlert: 6,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 1, Cage 3',
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    description: 'Premium wireless industry-leading noise canceling headphones.'
  },
  {
    id: 'prod-004',
    sku: 'SAMS-T7-2TB',
    barcode: '887276433547',
    name: 'Samsung T7 Shield 2TB Portable SSD',
    category: 'Storage',
    costPrice: 110.00,
    sellingPrice: 189.99,
    taxRate: 10,
    stock: 30,
    storeStock: {
      'store-main': 12,
      'store-west': 14,
      'store-north': 4
    },
    minStockAlert: 5,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 2, Bin 05',
    updatedAt: new Date(Date.now() - 3600000 * 100).toISOString(),
    description: 'Rugged USB 3.2 Gen 2 external SSD with IP65 dust and water resistance.'
  },
  {
    id: 'prod-005',
    sku: 'DEW-DCD777C2',
    barcode: '885911475730',
    name: 'DeWalt 20V Max Cordless Drill Kit',
    category: 'Tools & Hardware',
    costPrice: 82.50,
    sellingPrice: 139.00,
    taxRate: 8,
    stock: 19,
    storeStock: {
      'store-main': 5,
      'store-west': 14,
      'store-north': 0
    },
    minStockAlert: 4,
    unit: 'box',
    supplier: 'Industrial Fasteners & Tools Supply',
    location: 'Aisle 4, Bay 01',
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    description: 'Compact brushless drill/driver with 2 lithium-ion battery packs and charger.'
  },
  {
    id: 'prod-006',
    sku: 'STAN-10-098',
    barcode: '076174100989',
    name: 'Stanley Classic 99 Retractable Utility Knife',
    category: 'Tools & Hardware',
    costPrice: 4.20,
    sellingPrice: 8.99,
    taxRate: 8,
    stock: 95,
    storeStock: {
      'store-main': 35,
      'store-west': 50,
      'store-north': 10
    },
    minStockAlert: 15,
    unit: 'pcs',
    supplier: 'Industrial Fasteners & Tools Supply',
    location: 'Aisle 4, Shelf 08',
    updatedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    description: 'Heavy duty zinc body retractable blade utility cutter.'
  },
  {
    id: 'prod-007',
    sku: 'NESP-ORIG-50',
    barcode: '761303698712',
    name: 'Nespresso Master Origin Colombia Capsules (50-Pack)',
    category: 'Food & Beverage',
    costPrice: 28.00,
    sellingPrice: 48.50,
    taxRate: 5,
    stock: 11,
    storeStock: {
      'store-main': 3,
      'store-west': 6,
      'store-north': 2
    },
    minStockAlert: 10,
    unit: 'box',
    supplier: 'Bean & Roast Beverage Wholesalers',
    location: 'Aisle 5, Shelf A2',
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    description: 'Fruity and vibrant single-origin Colombian Arabica coffee pods.'
  },
  {
    id: 'prod-008',
    sku: 'HYDRO-FLASK-32',
    barcode: '840133705912',
    name: 'Hydro Flask 32 oz Wide Mouth with Flex Cap',
    category: 'Lifestyle & Kitchen',
    costPrice: 22.00,
    sellingPrice: 44.95,
    taxRate: 8,
    stock: 45,
    storeStock: {
      'store-main': 18,
      'store-west': 20,
      'store-north': 7
    },
    minStockAlert: 10,
    unit: 'pcs',
    supplier: 'Pacific Outpost Goods Co',
    location: 'Aisle 3, Shelf D1',
    updatedAt: new Date(Date.now() - 3600000 * 80).toISOString(),
    description: 'TempShield double-wall vacuum insulated stainless steel water bottle.'
  },
  {
    id: 'prod-009',
    sku: 'BELK-THB4-DOCK',
    barcode: '745883818327',
    name: 'Belkin Connect Pro Thunderbolt 4 Dock 12-in-1',
    category: 'Electronics',
    costPrice: 195.00,
    sellingPrice: 329.99,
    taxRate: 10,
    stock: 14,
    storeStock: {
      'store-main': 5,
      'store-west': 7,
      'store-north': 2
    },
    minStockAlert: 3,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 2, Bin 01',
    updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    description: 'Dual 4K or single 8K display dock with 90W host Power Delivery.'
  },
  {
    id: 'prod-010',
    sku: 'ZEB-LP-LABEL',
    barcode: '662013140501',
    name: 'Direct Thermal 4x6 Shipping Labels (Roll of 500)',
    category: 'Packaging',
    costPrice: 6.50,
    sellingPrice: 14.50,
    taxRate: 8,
    stock: 80,
    storeStock: {
      'store-main': 25,
      'store-west': 50,
      'store-north': 5
    },
    minStockAlert: 20,
    unit: 'pack',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 6, Pallet R2',
    updatedAt: new Date(Date.now() - 3600000 * 90).toISOString(),
    description: 'Permanent adhesive direct thermal barcode labels for Zebra & Rollo printers.'
  },
  {
    id: 'prod-011',
    sku: 'PAT-TOR-JKT-L',
    barcode: '190696328491',
    name: 'Patagonia Torrentshell 3L Rain Jacket - Navy (L)',
    category: 'Apparel',
    costPrice: 85.00,
    sellingPrice: 179.00,
    taxRate: 8,
    stock: 4,
    storeStock: {
      'store-main': 0, // Out of stock at main store!
      'store-west': 4,  // Available at warehouse for transfer!
      'store-north': 0
    },
    minStockAlert: 5,
    unit: 'pcs',
    supplier: 'Pacific Outpost Goods Co',
    location: 'Aisle 3, Rack 12',
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    description: '3-layer H2No Performance Standard waterproof breathable jacket.'
  },
  {
    id: 'prod-012',
    sku: 'KSS-USB-C-6FT',
    barcode: '840080582914',
    name: 'Braided 240W USB-C to USB-C Cable (6.6ft / 2m)',
    category: 'Electronics',
    costPrice: 7.20,
    sellingPrice: 19.99,
    taxRate: 10,
    stock: 82,
    storeStock: {
      'store-main': 32,
      'store-west': 35,
      'store-north': 15
    },
    minStockAlert: 15,
    unit: 'pcs',
    supplier: 'Apex Tech Distribution North America',
    location: 'Aisle 2, Hook 4B',
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    description: 'Ultra-durable nylon braided USB 2.0 48V/5A 240W fast charging cable.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Retail Customer',
    phone: '555-0100',
    email: 'retail@pos.local',
    totalPurchases: 1840.50,
    loyaltyPoints: 184,
    notes: 'Default walk-in guest account'
  },
  {
    id: 'cust-techcorp',
    name: 'TechCorp Engineering LLC',
    phone: '+1 (415) 890-2341',
    email: 'purchasing@techcorp.io',
    taxId: 'US-EIN-94-3829104',
    address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
    totalPurchases: 8940.00,
    loyaltyPoints: 894,
    notes: 'Approved for corporate Net-30 purchase orders'
  },
  {
    id: 'cust-blueridge',
    name: 'Blue Ridge Architecture Studios',
    phone: '+1 (206) 555-7890',
    email: 'ops@blueridgestudio.com',
    taxId: 'US-WA-602-981-334',
    address: '1420 5th Avenue, Seattle, WA 98101',
    totalPurchases: 4620.25,
    loyaltyPoints: 462,
    notes: 'High-volume CAD workstation accessories'
  },
  {
    id: 'cust-sarah',
    name: 'Dr. Sarah Jenkins',
    phone: '+1 (312) 555-0199',
    email: 'sarah.jenkins@uchicago.edu',
    taxId: 'TAX-EXEMPT-EDU-992',
    address: '5801 S Ellis Ave, Chicago, IL 60637',
    totalPurchases: 1250.00,
    loyaltyPoints: 125,
    notes: 'Academic research equipment'
  }
];

function generateInitialInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  const saleSpecs = [
    { daysAgo: 0.1, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 0, qty: 1 }, { pIdx: 11, qty: 2 }], pay: 'cash' as const, tender: 160 },
    { daysAgo: 0.3, storeId: 'store-main', customerIdx: 1, items: [{ pIdx: 8, qty: 2 }, { pIdx: 3, qty: 4 }], pay: 'card' as const, tender: 1561.94 },
    { daysAgo: 0.8, storeId: 'store-north', customerIdx: 2, items: [{ pIdx: 2, qty: 1 }, { pIdx: 0, qty: 2 }], pay: 'upi' as const, tender: 657.78 },
    { daysAgo: 1.5, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 4, qty: 1 }, { pIdx: 5, qty: 2 }], pay: 'cash' as const, tender: 180 },
    { daysAgo: 2.2, storeId: 'store-north', customerIdx: 3, items: [{ pIdx: 1, qty: 2 }, { pIdx: 6, qty: 3 }], pay: 'card' as const, tender: 489.98 },
    { daysAgo: 3.0, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 7, qty: 2 }], pay: 'cash' as const, tender: 100 },
    { daysAgo: 4.5, storeId: 'store-west', customerIdx: 1, items: [{ pIdx: 8, qty: 3 }, { pIdx: 1, qty: 4 }], pay: 'bank_transfer' as const, tender: 1748.93 },
    { daysAgo: 6.0, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 9, qty: 4 }, { pIdx: 5, qty: 3 }], pay: 'card' as const, tender: 91.77 },
    { daysAgo: 7.2, storeId: 'store-main', customerIdx: 2, items: [{ pIdx: 3, qty: 3 }, { pIdx: 0, qty: 1 }], pay: 'card' as const, tender: 736.96 },
    { daysAgo: 9.0, storeId: 'store-north', customerIdx: 0, items: [{ pIdx: 11, qty: 4 }], pay: 'cash' as const, tender: 100 },
    { daysAgo: 11.5, storeId: 'store-west', customerIdx: 1, items: [{ pIdx: 2, qty: 2 }, { pIdx: 8, qty: 1 }], pay: 'bank_transfer' as const, tender: 1238.59 },
    { daysAgo: 13.0, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 4, qty: 2 }, { pIdx: 9, qty: 5 }], pay: 'card' as const, tender: 378.54 },
    { daysAgo: 15.2, storeId: 'store-main', customerIdx: 3, items: [{ pIdx: 6, qty: 4 }], pay: 'card' as const, tender: 203.70 },
    { daysAgo: 18.0, storeId: 'store-north', customerIdx: 0, items: [{ pIdx: 7, qty: 1 }, { pIdx: 11, qty: 1 }], pay: 'cash' as const, tender: 70 },
    { daysAgo: 21.0, storeId: 'store-main', customerIdx: 2, items: [{ pIdx: 1, qty: 3 }, { pIdx: 3, qty: 2 }], pay: 'card' as const, tender: 912.94 },
    { daysAgo: 24.5, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 0, qty: 1 }], pay: 'cash' as const, tender: 110 },
    { daysAgo: 27.0, storeId: 'store-west', customerIdx: 1, items: [{ pIdx: 8, qty: 2 }, { pIdx: 4, qty: 1 }], pay: 'bank_transfer' as const, tender: 878.97 },
    { daysAgo: 29.0, storeId: 'store-main', customerIdx: 0, items: [{ pIdx: 2, qty: 1 }], pay: 'card' as const, tender: 437.80 }
  ];

  let invCount = 101;
  for (const s of saleSpecs) {
    const cust = INITIAL_CUSTOMERS[s.customerIdx] || null;
    const invDate = new Date(now - s.daysAgo * dayMs).toISOString();
    const store = INITIAL_STORES.find(st => st.id === s.storeId) || INITIAL_STORES[0];

    const cartItems = s.items.map(({ pIdx, qty }) => {
      const p = INITIAL_PRODUCTS[pIdx];
      const itemSubtotal = p.sellingPrice * qty;
      const tax = (itemSubtotal * p.taxRate) / 100;
      return {
        product: p,
        quantity: qty,
        unitPrice: p.sellingPrice,
        discountPercent: 0,
        taxRate: p.taxRate,
        total: itemSubtotal + tax
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const taxTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity * item.taxRate) / 100, 0);
    const grandTotal = subtotal + taxTotal;

    const taxBreakdownMap: { [rate: number]: { taxable: number; tax: number } } = {};
    for (const item of cartItems) {
      const lineTaxable = item.unitPrice * item.quantity;
      const lineTax = (lineTaxable * item.taxRate) / 100;
      if (!taxBreakdownMap[item.taxRate]) {
        taxBreakdownMap[item.taxRate] = { taxable: 0, tax: 0 };
      }
      taxBreakdownMap[item.taxRate].taxable += lineTaxable;
      taxBreakdownMap[item.taxRate].tax += lineTax;
    }

    const taxBreakdown = Object.entries(taxBreakdownMap).map(([rate, vals]) => ({
      rate: Number(rate),
      taxableAmount: vals.taxable,
      taxAmount: vals.tax
    }));

    invoices.push({
      id: `inv-${invCount}`,
      invoiceNumber: `INV-2026-${invCount.toString().padStart(4, '0')}`,
      date: invDate,
      storeId: store.id,
      storeName: store.name,
      customer: cust,
      items: cartItems,
      subtotal,
      discountType: 'percent',
      discountValue: 0,
      discountAmount: 0,
      taxTotal,
      taxBreakdown,
      grandTotal,
      paymentMethod: s.pay,
      amountTendered: s.tender,
      changeDue: Math.max(0, s.tender - grandTotal),
      status: 'completed',
      cashier: `${store.manager} (POS)`,
      notes: ''
    });

    invCount++;
  }

  return invoices;
}

export const INITIAL_INVOICES: Invoice[] = generateInitialInvoices();

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-01',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    storeId: 'store-main',
    category: 'Packaging & Shipping',
    description: 'Direct thermal label rolls and heavy-duty bubble mailers',
    amount: 245.00,
    paymentMethod: 'Corporate Visa *4821',
    receiptRef: 'RCP-9812'
  },
  {
    id: 'exp-02',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    storeId: 'store-west',
    category: 'Utilities',
    description: 'Fiber internet connectivity & warehouse electric bill',
    amount: 380.00,
    paymentMethod: 'ACH Auto-debit',
    receiptRef: 'UTIL-0492'
  },
  {
    id: 'exp-03',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    storeId: 'store-main',
    category: 'Rent',
    description: 'Commercial facility & warehouse floor lease for November',
    amount: 2800.00,
    paymentMethod: 'Wire Transfer',
    receiptRef: 'LEASE-NOV26'
  },
  {
    id: 'exp-04',
    date: new Date(Date.now() - 86400000 * 16).toISOString(),
    storeId: 'store-main',
    category: 'Salaries',
    description: 'Staff payroll disbursement - biweekly cycle',
    amount: 3200.00,
    paymentMethod: 'Direct Deposit',
    receiptRef: 'PAYROLL-W46'
  },
  {
    id: 'exp-05',
    date: new Date(Date.now() - 86400000 * 20).toISOString(),
    storeId: 'store-west',
    category: 'Maintenance',
    description: 'High-speed conveyor roller maintenance & calibration',
    amount: 195.00,
    paymentMethod: 'Corporate Visa *4821',
    receiptRef: 'MAINT-332'
  },
  {
    id: 'exp-06',
    date: new Date(Date.now() - 86400000 * 25).toISOString(),
    storeId: 'store-north',
    category: 'Software & Subscriptions',
    description: 'Cloud backup security gateway & ERP license',
    amount: 149.00,
    paymentMethod: 'Corporate Visa *4821',
    receiptRef: 'SUB-2026'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-01',
    productId: 'prod-001',
    productName: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'LOG-MXM3S',
    storeId: 'store-west',
    type: 'in',
    quantity: 30,
    previousStock: 0,
    newStock: 30,
    reason: 'Initial purchase order restock from Apex Tech',
    date: new Date(Date.now() - 86400000 * 28).toISOString(),
    referenceId: 'PO-8812'
  },
  {
    id: 'sm-02',
    productId: 'prod-007',
    productName: 'Nespresso Master Origin Colombia Capsules (50-Pack)',
    sku: 'NESP-ORIG-50',
    storeId: 'store-main',
    type: 'audit',
    quantity: -2,
    previousStock: 5,
    newStock: 3,
    reason: 'Physical cycle count adjustment',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    referenceId: 'AUDIT-CYCLE-9'
  }
];

export const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: 'st-001',
    transferNumber: 'TRF-2026-001',
    fromStoreId: 'store-west',
    fromStoreName: 'Westside Logistics & Central Warehouse',
    toStoreId: 'store-main',
    toStoreName: 'Downtown Flagship Store',
    items: [
      {
        productId: 'prod-001',
        productName: 'Logitech MX Master 3S Wireless Mouse',
        sku: 'LOG-MXM3S',
        quantity: 5
      },
      {
        productId: 'prod-012',
        productName: 'Braided 240W USB-C to USB-C Cable (6.6ft / 2m)',
        sku: 'KSS-USB-C-6FT',
        quantity: 10
      }
    ],
    status: 'completed',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    notes: 'Restock for weekend rush'
  },
  {
    id: 'st-002',
    transferNumber: 'TRF-2026-002',
    fromStoreId: 'store-west',
    fromStoreName: 'Westside Logistics & Central Warehouse',
    toStoreId: 'store-north',
    toStoreName: 'North Airport Terminal Outlet',
    items: [
      {
        productId: 'prod-002',
        productName: 'Anker 737 Power Bank (PowerCore 24K)',
        sku: 'ANK-737-PB',
        quantity: 4
      }
    ],
    status: 'in_transit',
    date: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    notes: 'Airport terminal expedited dispatch'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-101',
    supplierId: 'sup-01',
    supplierName: 'Apex Tech Distribution North America',
    storeId: 'store-west',
    storeName: 'Westside Logistics & Central Warehouse',
    items: [
      {
        productId: 'prod-001',
        productName: 'Logitech MX Master 3S Wireless Mouse',
        sku: 'LOG-MXM3S',
        quantity: 20,
        costPrice: 58.00,
        total: 1160.00
      },
      {
        productId: 'prod-004',
        productName: 'Samsung T7 Shield 2TB Portable SSD',
        sku: 'SAMS-T7-2TB',
        quantity: 15,
        costPrice: 110.00,
        total: 1650.00
      }
    ],
    totalAmount: 2810.00,
    status: 'received',
    orderDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    receivedDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    notes: 'Q4 bulk tech replenishment'
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-102',
    supplierId: 'sup-02',
    supplierName: 'Pacific Outpost Goods Co',
    storeId: 'store-main',
    storeName: 'Downtown Flagship Store',
    items: [
      {
        productId: 'prod-011',
        productName: 'Patagonia Torrentshell 3L Rain Jacket - Navy (L)',
        sku: 'PAT-TOR-JKT-L',
        quantity: 10,
        costPrice: 85.00,
        total: 850.00
      }
    ],
    totalAmount: 850.00,
    status: 'ordered',
    orderDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    notes: 'Winter apparel restock'
  }
];

export const INITIAL_REGISTER_SHIFT: RegisterShift = {
  id: 'shift-today',
  storeId: 'store-main',
  cashier: 'Alex Chen',
  openedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  openingFloat: 250.00,
  cashSales: 410.00,
  cardSales: 1650.00,
  cashPayouts: 0.00,
  expectedCash: 660.00,
  status: 'open',
  notes: 'Morning shift station #01'
};
