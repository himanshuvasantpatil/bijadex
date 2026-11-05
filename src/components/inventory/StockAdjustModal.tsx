import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface StockAdjustModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { adjustStock } = useApp();

  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'audit'>('in');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Restock from Supplier');

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(product.id, quantity, adjustType, reason);
    onClose();
  };

  const calculatedNewStock =
    adjustType === 'in'
      ? product.stock + Math.abs(quantity)
      : adjustType === 'out'
      ? Math.max(0, product.stock - Math.abs(quantity))
      : Math.max(0, quantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Adjust Stock Level
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Product Summary */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold text-white">{product.name}</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
              <span>SKU: {product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>Current Stock: <strong className="text-emerald-400">{product.stock} {product.unit}</strong></span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'in', label: 'Stock In (+)', icon: ArrowUpRight, desc: 'Intake / Purchase' },
              { id: 'out', label: 'Stock Out (-)', icon: ArrowDownRight, desc: 'Damage / Return' },
              { id: 'audit', label: 'Cycle Audit', icon: CheckCircle2, desc: 'Exact Count' }
            ].map(m => {
              const Icon = m.icon;
              const isSel = adjustType === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setAdjustType(m.id as 'in' | 'out' | 'audit');
                    if (m.id === 'in') setReason('Restock from Supplier');
                    if (m.id === 'out') setReason('Damaged in transit / write-off');
                    if (m.id === 'audit') setReason('Quarterly physical inventory count');
                  }}
                  className={`p-2.5 rounded-lg border text-left flex flex-col items-start transition-colors ${
                    isSel
                      ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSel ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">{m.label}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {adjustType === 'audit' ? 'Audited Physical Stock Quantity' : 'Adjustment Units'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-sm font-mono font-bold px-3 py-2 rounded-lg outline-none focus:border-emerald-500 tabular-nums"
            />
          </div>

          {/* New Stock Preview */}
          <div className="flex items-center justify-between text-xs p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-slate-400">Resulting Stock Level:</span>
            <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
              {calculatedNewStock} {product.unit}
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Reason / Reference Note
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Purchase Order #8920 or Physical count variance"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
