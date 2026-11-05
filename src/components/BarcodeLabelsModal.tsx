import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarcodeDisplay } from '../utils/barcode';
import { formatCurrency } from '../utils/format';
import { Barcode, Printer, CheckSquare, Square, RefreshCw } from 'lucide-react';

export const BarcodeLabelsModal: React.FC = () => {
  const { products } = useApp();

  // State: product selection map with label counts
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>(() => {
    // Default select first 6 products with 2 labels each
    const initial: { [id: string]: number } = {};
    products.slice(0, 6).forEach(p => {
      initial[p.id] = 2;
    });
    return initial;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === products.length) {
      setSelectedItems({});
    } else {
      const all: { [id: string]: number } = {};
      products.forEach(p => {
        all[p.id] = 2;
      });
      setSelectedItems(all);
    }
  };

  const handleQtyChange = (productId: string, qty: number) => {
    if (qty <= 0) {
      const updated = { ...selectedItems };
      delete updated[productId];
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => ({ ...prev, [productId]: qty }));
    }
  };

  // Build flattened printable label array
  const printableLabels = Object.entries(selectedItems).flatMap(([prodId, qty]) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return [];
    return Array.from({ length: qty }).map((_, idx) => ({
      key: `${prodId}-${idx}`,
      product: prod
    }));
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-900 select-none">
      {/* Left: Product Selection & Batch Counts Sidebar (320px) */}
      <div className="w-80 bg-slate-950/80 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Label Generator
            </h2>
          </div>

          <button
            onClick={toggleSelectAll}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {Object.keys(selectedItems).length === products.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="p-2 border-b border-slate-800/80 text-[11px] text-slate-400">
          Configure printable barcode sticker labels for shelf placement or product tagging:
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {products.map(p => {
            const isSelected = selectedItems[p.id] !== undefined;
            const currentQty = selectedItems[p.id] || 0;

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50'
                    : 'bg-slate-950 border-slate-850 hover:bg-slate-900/60'
                }`}
              >
                <div
                  className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                  onClick={() => handleQtyChange(p.id, isSelected ? 0 : 2)}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {p.sku} · {formatCurrency(p.sellingPrice)}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={currentQty}
                      onChange={e => handleQtyChange(p.id, parseInt(e.target.value, 10) || 1)}
                      className="w-12 bg-slate-950 border border-slate-700 text-center text-xs font-mono text-white rounded px-1 py-0.5 outline-none tabular-nums"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Total Labels to Print:</span>
            <span className="font-mono font-bold text-white tabular-nums">{printableLabels.length}</span>
          </div>

          <button
            onClick={handlePrint}
            disabled={printableLabels.length === 0}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print {printableLabels.length} Barcode Sticker{printableLabels.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>

      {/* Right: Sheet Preview Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-slate-900/60">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Sticker Sheet Preview (Standard 3×N Grid)</h3>
              <p className="text-xs text-slate-400">
                Vector Code 128 barcodes optimized for laser and thermal sticker printers
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>

          {/* Printable Sheet Container */}
          <div
            id="printable-document"
            className="bg-white text-slate-900 rounded-lg p-6 shadow-xl border border-slate-200"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {printableLabels.map(item => (
                <div
                  key={item.key}
                  className="p-3 bg-white border border-dashed border-slate-300 rounded flex flex-col items-center justify-between text-center min-h-[140px]"
                >
                  <div className="w-full">
                    <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                      {item.product.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                      SKU: {item.product.sku}
                    </div>
                  </div>

                  <div className="my-1.5 w-full flex justify-center">
                    <BarcodeDisplay
                      value={item.product.barcode}
                      height={36}
                      showText={true}
                      barColor="#000000"
                      className="mx-auto scale-95"
                    />
                  </div>

                  <div className="w-full pt-1 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[9px] text-slate-500 font-normal">RETAIL</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {formatCurrency(item.product.sellingPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {printableLabels.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <Barcode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">No products selected</p>
                <p className="text-[11px] text-slate-400 mt-1">Select items on the left to preview barcode stickers</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
