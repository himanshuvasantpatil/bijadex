import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scan, 
  Boxes, 
  Plus, 
  Minus, 
  Search, 
  Truck, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Building2,
  PackagePlus,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const MobileHandheldView: React.FC = () => {
  const { 
    products, 
    adjustStock, 
    activeStore, 
    openScanner, 
    currentUser, 
    logoutUser,
    isOnline,
    syncQueue,
    stockTransfers,
    createStockTransfer,
    purchaseOrders
  } = useApp();

  const [mobileTab, setMobileTab] = useState<'audit' | 'transfer' | 'po'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Storeroom Cycle Count');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Filter products for mobile view
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
  });

  const selectedProduct = products.find(p => p.id === selectedProductId) || filteredProducts[0];

  const handleStockAdjustSubmit = (type: 'in' | 'out' | 'audit') => {
    if (!selectedProduct || adjustQty <= 0) return;

    adjustStock(selectedProduct.id, adjustQty, type, adjustReason, activeStore.id);
    setShowSuccessToast(`Updated ${selectedProduct.name} (${type.toUpperCase()} ${adjustQty} units)`);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden h-full">
      {/* Mobile Top Header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-950 border border-emerald-700/60 rounded-lg text-emerald-400">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Bijadex Handheld</span>
              <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/60">
                STOREROOM
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {activeStore.name} [{activeStore.code}]
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Wi-Fi Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300">Offline IDB</span>
              </>
            )}
          </div>

          <button
            onClick={logoutUser}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
            title="Lock Workstation"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher Tabs */}
      <div className="grid grid-cols-3 bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-center shrink-0">
        <button
          onClick={() => setMobileTab('audit')}
          className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'audit' ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-850' : 'border-transparent text-slate-400'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stock Audit</span>
        </button>

        <button
          onClick={() => setMobileTab('transfer')}
          className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'transfer' ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-850' : 'border-transparent text-slate-400'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Transfers</span>
        </button>

        <button
          onClick={() => setMobileTab('po')}
          className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === 'po' ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-850' : 'border-transparent text-slate-400'
          }`}
        >
          <PackagePlus className="w-3.5 h-3.5" />
          <span>Receive Goods</span>
        </button>
      </div>

      {/* Main Handheld Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: STOREROOM STOCK AUDIT & LASER SCANNING */}
        {mobileTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Camera Scanner Trigger */}
            <button
              onClick={() => openScanner('inventory')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Scan className="w-5 h-5 text-white" />
              <span>Tap to Scan Item Barcode Camera</span>
            </button>

            {/* Quick Item Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stock item by SKU, barcode, or name..."
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            {/* Active Selected Item Panel */}
            {selectedProduct && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      SKU: {selectedProduct.sku} · {selectedProduct.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{selectedProduct.name}</h3>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-lg font-bold text-emerald-400 tabular-nums">
                      {selectedProduct.stock} {selectedProduct.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">Storeroom Stock</div>
                  </div>
                </div>

                {/* Stock Level Adjuster */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Adjustment Quantity:</span>
                    <div className="flex items-center border border-slate-700 rounded-lg bg-slate-950">
                      <button
                        type="button"
                        onClick={() => setAdjustQty(Math.max(1, adjustQty - 1))}
                        className="p-2 text-slate-300 hover:bg-slate-800 rounded-l-lg cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={adjustQty}
                        onChange={e => setAdjustQty(parseInt(e.target.value, 10) || 1)}
                        className="w-12 text-center text-xs font-mono font-bold text-white outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setAdjustQty(adjustQty + 1)}
                        className="p-2 text-slate-300 hover:bg-slate-800 rounded-r-lg cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStockAdjustSubmit('in')}
                      className="py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      + Stock In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockAdjustSubmit('out')}
                      className="py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      - Stock Out
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockAdjustSubmit('audit')}
                      className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Audit Set
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog List */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Catalog Items ({filteredProducts.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      selectedProduct?.id === p.id
                        ? 'bg-slate-850 border-emerald-500 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.sku} · {p.location || 'Bin A1'}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-400">{p.stock} {p.unit}</div>
                      <div className="text-[10px] text-slate-500">{formatCurrency(p.sellingPrice)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTER-STORE TRANSFERS */}
        {mobileTab === 'transfer' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Active Stock Transfers</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dispatch items from this storeroom to other retail branch locations.
              </p>
            </div>

            <div className="space-y-2">
              {stockTransfers.map(st => (
                <div key={st.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-400">{st.transferNumber}</span>
                    <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded">
                      {st.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Items: {st.items.reduce((s, i) => s + i.quantity, 0)} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECEIVE SHIPMENTS AGAINST PO */}
        {mobileTab === 'po' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                <span>Inbound Purchase Orders</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect supplier shipments arriving at the storeroom loading dock.
              </p>
            </div>

            <div className="space-y-2">
              {purchaseOrders.map(po => (
                <div key={po.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-400">{po.poNumber}</span>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded">
                      {po.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Total: {formatCurrency(po.totalAmount)} ({po.items.length} SKUs)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Success Toast */}
      {showSuccessToast && (
        <div className="p-3 bg-emerald-900/95 border-t border-emerald-500 text-emerald-100 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{showSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
