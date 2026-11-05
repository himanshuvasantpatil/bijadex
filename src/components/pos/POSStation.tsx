import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/format';
import { BarcodeDisplay } from '../../utils/barcode';
import { 
  Search, 
  Scan, 
  Trash2, 
  Plus, 
  Minus, 
  UserCheck, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Receipt,
  RotateCcw,
  Sparkles,
  Percent,
  Zap,
  CheckCircle2,
  CornerDownLeft,
  Keyboard
} from 'lucide-react';

export const POSStation: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartItemQty,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    checkout,
    openScanner,
    handleBarcodeScan,
    activeStore,
    getProductStock,
    organization
  } = useApp();

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Billing & Payment States
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedInput, setTenderedInput] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-focus search on load
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Top 5 Express Fast-Moving Items for 1-click billing
  const expressFastItems = products.slice(0, 5);

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesText =
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query);
    return matchesCategory && matchesText;
  });

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount =
    discountType === 'percent'
      ? (subtotal * Math.min(100, Math.max(0, discountValue))) / 100
      : Math.min(subtotal, Math.max(0, discountValue));

  const loyaltyDiscount =
    useLoyaltyPoints > 0 && selectedCustomer
      ? useLoyaltyPoints * (organization.loyaltyRedemptionRate || 0.5)
      : 0;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount);

  // Tax calculation
  const taxTotal = cart.reduce((sum, item) => {
    const ratio = subtotal > 0 ? (item.quantity * item.unitPrice) / subtotal : 0;
    const lineDiscountedSub = discountedSubtotal * ratio;
    return sum + (lineDiscountedSub * item.taxRate) / 100;
  }, 0);

  const grandTotal = discountedSubtotal + taxTotal;
  const numericTendered = parseFloat(tenderedInput) || 0;
  const changeDue = Math.max(0, numericTendered - grandTotal);

  // Instant Barcode Submission via Search Box
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const scanRes = handleBarcodeScan(searchQuery.trim());
    if (scanRes.found) {
      setSearchQuery('');
    }
  };

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      checkout({
        paymentMethod,
        amountTendered: paymentMethod === 'cash' ? (numericTendered || grandTotal) : grandTotal,
        discountType,
        discountValue,
        useLoyaltyPoints,
        cashier: `${activeStore.manager} (POS)`,
        notes
      });
      setTenderedInput('');
      setDiscountValue(0);
      setUseLoyaltyPoints(0);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [cart, checkout, paymentMethod, numericTendered, grandTotal, discountType, discountValue, useLoyaltyPoints, activeStore, notes]);

  // Quick Tender helpers
  const handleQuickTender = (amount: number) => {
    setTenderedInput(amount.toFixed(2));
  };

  // Keyboard Shortcuts Listener for 10/10 Speed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcuts when user is typing in notes or custom text inputs unless F-keys
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      } else if (e.key === 'F8') {
        e.preventDefault();
        setPaymentMethod('cash');
        setTenderedInput(grandTotal.toFixed(2));
      } else if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else {
          searchInputRef.current?.focus();
        }
      } else if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout, searchQuery, grandTotal]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Product Catalog & Fast Barcode Lookup (65% width) */}
        <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0 bg-slate-950/40">
          {/* Search & Scanner Header Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Scan barcode, SKU, or search item... (Press '/' to focus, 'ESC' to clear)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 text-slate-100 text-xs px-3.5 py-2.5 pl-9 rounded-lg outline-none font-sans transition-all placeholder:text-slate-500 font-medium"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </form>

              <button
                onClick={() => openScanner('pos')}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Launch Camera Barcode Scanner [F4]"
              >
                <Scan className="w-4 h-4" />
                <span>Camera Scan [F4]</span>
              </button>
            </div>

            {/* Express Speed-Sell Row (Top 5 Items) */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Zap className="w-3 h-3 text-amber-400" />
                Express Fast-Sellers:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {expressFastItems.map((prod, idx) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => addToCart(prod, 1)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/80 rounded-md text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer group"
                    title={`Click to add ${prod.name} (${formatCurrency(prod.sellingPrice)})`}
                  >
                    <span className="text-emerald-400 font-mono font-bold">+{formatCurrency(prod.sellingPrice)}</span>
                    <span className="truncate max-w-[110px] group-hover:text-emerald-300">{prod.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar border-t border-slate-800/80 pt-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const storeStock = getProductStock(product.id, activeStore.id);
                const inStock = storeStock > 0;
                const isLowStock = storeStock <= product.minStockAlert && inStock;

                return (
                  <div
                    key={product.id}
                    onClick={() => inStock && addToCart(product, 1)}
                    className={`flex flex-col justify-between p-3 rounded-lg border text-left transition-all ${
                      inStock
                        ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 cursor-pointer group shadow-sm active:scale-[0.99]'
                        : 'bg-slate-950/60 border-slate-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]">
                          {product.sku}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1 rounded tabular-nums ${
                            !inStock
                              ? 'text-rose-400 bg-rose-950/40'
                              : isLowStock
                              ? 'text-amber-300 bg-amber-950/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {inStock ? `${storeStock} ${product.unit}` : 'Out at store'}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold font-mono text-white tabular-nums">
                          {formatCurrency(product.sellingPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          +{product.taxRate}% tax
                        </div>
                      </div>

                      <div className="w-6 h-6 rounded bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Sparkles className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs font-medium text-slate-300">No matching products found</p>
                <p className="text-[11px] text-slate-500 mt-1">Try another search keyword or scan a barcode</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: POS Billing Cart & Checkout Terminal (35% width, min 380px) */}
        <div className="w-[420px] bg-slate-900 flex flex-col shrink-0 border-l border-slate-800 shadow-xl">
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Current Sale Cart
              </h2>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Customer Select Bar */}
          <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer:</span>
            </div>

            <select
              value={selectedCustomer?.id || ''}
              onChange={e => {
                const cust = customers.find(c => c.id === e.target.value) || null;
                setSelectedCustomer(cust);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded outline-none focus:border-emerald-500 max-w-[220px] truncate"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.taxId ? `(${c.taxId})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-1">
            {cart.map(item => (
              <div key={item.product.id} className="p-3 hover:bg-slate-850/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-100 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>{item.product.sku}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatCurrency(item.unitPrice)} each</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-white tabular-nums">
                      {formatCurrency(item.total)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 text-[10px] mt-0.5 inline-block cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Quantity & Discount Adjuster */}
                <div className="flex items-center justify-between mt-2 pt-1">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-700 rounded bg-slate-950">
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateCartItemQty(item.product.id, parseInt(e.target.value, 10) || 1)}
                      className="w-10 text-center bg-transparent text-xs font-mono font-semibold text-white outline-none tabular-nums"
                    />
                    <button
                      onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Inline item discount */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Disc %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountPercent || ''}
                      placeholder="0"
                      onChange={e => updateCartItemDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                      className="w-12 bg-slate-950 border border-slate-700 text-center text-xs font-mono text-slate-200 px-1 py-0.5 rounded outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Scan className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-xs font-medium text-slate-300">Cart is empty</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                  Scan barcode, click express fast-sellers, or search items on the left to begin billing
                </p>
              </div>
            )}
          </div>

          {/* Financial Calculation Panel */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
            {/* Subtotal & Discount Row */}
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(subtotal)}</span>
              </div>

              {/* Bill Discount Input */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <span>Bill Discount:</span>
                  <button
                    type="button"
                    onClick={() => setDiscountType(prev => (prev === 'percent' ? 'flat' : 'percent'))}
                    className="px-1.5 py-0.2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono cursor-pointer"
                  >
                    {discountType === 'percent' ? '%' : '$'}
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={discountValue || ''}
                  placeholder="0"
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-slate-700 text-right text-xs font-mono text-slate-200 px-2 py-0.5 rounded outline-none tabular-nums"
                />
              </div>

              <div className="flex justify-between">
                <span>Sales Tax Total:</span>
                <span className="font-mono text-slate-200 tabular-nums">{formatCurrency(taxTotal)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-white border-t border-slate-800 pt-2 mt-1">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-400 tabular-nums">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'credit', label: 'Net-30', icon: Receipt },
              ].map(m => {
                const Icon = m.icon;
                const isSel = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-slate-800 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-1" />
                    <span className="text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* If Cash: Tender Input & Exact Change Calc */}
            {paymentMethod === 'cash' && (
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cash Tendered:</span>
                  <input
                    type="number"
                    step="any"
                    placeholder={grandTotal.toFixed(2)}
                    value={tenderedInput}
                    onChange={e => setTenderedInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCheckout();
                      }
                    }}
                    className="w-28 bg-slate-950 border border-slate-700 text-right text-xs font-mono font-semibold text-white px-2 py-1 rounded outline-none focus:border-emerald-500 tabular-nums"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex gap-1.5 justify-end">
                  {[
                    Math.ceil(grandTotal),
                    Math.ceil(grandTotal / 10) * 10,
                    Math.ceil(grandTotal / 50) * 50 || 50,
                    100
                  ].filter((val, idx, arr) => val >= grandTotal && arr.indexOf(val) === idx).slice(0, 3).map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickTender(amt)}
                      className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/80 cursor-pointer"
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTenderedInput(grandTotal.toFixed(2))}
                    className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold rounded border border-emerald-800/80 cursor-pointer"
                    title="Fill Exact Cash [F8]"
                  >
                    Exact [F8]
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Change Due:</span>
                  <span className={`font-mono font-bold tabular-nums ${changeDue > 0 ? 'text-amber-400 text-sm' : 'text-slate-400'}`}>
                    {formatCurrency(changeDue)}
                  </span>
                </div>
              </div>
            )}

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-lg shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Complete Sale & Print Receipt [F9]</span>
            </button>
          </div>
        </div>
      </div>

      {/* POS Hotkey HUD Bar (10/10 Speed Bar) */}
      <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <Keyboard className="w-3 h-3 text-emerald-400" />
            POS Speed Keys:
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <strong className="text-emerald-400">F9</strong> Complete Sale
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <strong className="text-emerald-400">F8</strong> Exact Cash
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <strong className="text-emerald-400">F4</strong> Scan Barcode
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <strong className="text-emerald-400">/</strong> Focus Search
          </span>
          <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            <strong className="text-emerald-400">ESC</strong> Reset Search
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-500 text-[10px]">
          <span>Cashier: <strong className="text-slate-300">{activeStore.manager}</strong></span>
          <span>·</span>
          <span>Terminal: <strong className="text-emerald-400">POS-TERM-01</strong></span>
        </div>
      </div>
    </div>
  );
};
