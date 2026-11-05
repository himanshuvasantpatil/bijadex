import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/format';
import { Truck, Plus, CheckCircle2, Clock, ArrowRight, X, Boxes } from 'lucide-react';

export const StockTransferManager: React.FC = () => {
  const { 
    stockTransfers, 
    stores, 
    products, 
    createStockTransfer, 
    completeStockTransfer, 
    activeStoreId 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromStoreId, setFromStoreId] = useState(stores[1]?.id || stores[0]?.id || '');
  const [toStoreId, setToStoreId] = useState(activeStoreId || stores[0]?.id || '');
  const [notes, setNotes] = useState('');

  // Selected items for transfer
  const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 5 }
  ]);

  const handleAddItem = () => {
    setTransferItems(prev => [...prev, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, productId: string, quantity: number) => {
    setTransferItems(prev => {
      const updated = [...prev];
      updated[index] = { productId, quantity };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStoreId === toStoreId) {
      alert('Source and destination store must be different.');
      return;
    }
    if (transferItems.length === 0) return;

    createStockTransfer({
      fromStoreId,
      toStoreId,
      items: transferItems.filter(i => i.quantity > 0),
      notes
    });

    setIsModalOpen(false);
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Inter-Store Stock Transfers & Logistics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transfer merchandise between central warehouses and branch retail locations with automated stock rebalancing
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Transfers Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Transfer #</th>
              <th className="py-2.5 px-4 font-semibold">Date Dispatched</th>
              <th className="py-2.5 px-4 font-semibold">Source Location</th>
              <th className="py-2.5 px-4 font-semibold">Destination Location</th>
              <th className="py-2.5 px-4 font-semibold">Items Transferred</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {stockTransfers.map(trf => {
              const isCompleted = trf.status === 'completed';
              const totalQty = trf.items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <tr key={trf.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {trf.transferNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {formatDateTime(trf.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{trf.fromStoreName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span>{trf.toStoreName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">
                      {trf.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Total: {totalQty} units
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Delivered</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>In-Transit</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isCompleted && (
                      <button
                        onClick={() => completeStockTransfer(trf.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                      >
                        Receive & Restock →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {stockTransfers.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Truck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-300">No stock transfers recorded</p>
          </div>
        )}
      </div>

      {/* New Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Create Inter-Store Stock Dispatch</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    From (Source Warehouse / Store) *
                  </label>
                  <select
                    value={fromStoreId}
                    onChange={e => setFromStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    To (Destination Store Branch) *
                  </label>
                  <select
                    value={toStoreId}
                    onChange={e => setToStoreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Merchandise to Transfer
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {transferItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <select
                      value={item.productId}
                      onChange={e => handleItemChange(idx, e.target.value, item.quantity)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-emerald-500 truncate"
                    >
                      {products.map(p => {
                        const stockAtFrom = p.storeStock && p.storeStock[fromStoreId] !== undefined ? p.storeStock[fromStoreId] : 0;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} (Avail: {stockAtFrom})
                          </option>
                        );
                      })}
                    </select>

                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, item.productId, parseInt(e.target.value, 10) || 1)}
                      className="w-16 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs text-center px-2 py-1.5 rounded outline-none tabular-nums"
                    />

                    {transferItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dispatch Notes / Driver Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expedited courier dispatch for weekend sale"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Dispatch Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
