import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { PackagePlus, Plus, Sparkles, CheckCircle2, Clock, X, Building, Truck } from 'lucide-react';

export const PurchaseOrderManager: React.FC = () => {
  const { 
    purchaseOrders, 
    suppliers, 
    stores, 
    products, 
    activeStore, 
    createPurchaseOrder, 
    receivePurchaseOrder 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [targetStoreId, setTargetStoreId] = useState(activeStore.id);
  const [poNotes, setPoNotes] = useState('');

  // PO Line Items
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; costPrice: number }[]>([
    { productId: products[0]?.id || '', quantity: 10, costPrice: products[0]?.costPrice || 50 }
  ]);

  const handleAddItem = () => {
    const firstP = products[0];
    setPoItems(prev => [...prev, { productId: firstP.id, quantity: 10, costPrice: firstP.costPrice }]);
  };

  const handleRemoveItem = (index: number) => {
    setPoItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, productId: string, quantity: number, costPrice: number) => {
    setPoItems(prev => {
      const updated = [...prev];
      updated[index] = { productId, quantity, costPrice };
      return updated;
    });
  };

  // 1-Click Auto-Reorder Generator for Low Stock Items
  const handleAutoReorderLowStock = () => {
    const lowStockItems = products.filter(p => {
      const storeStock = p.storeStock && p.storeStock[activeStore.id] !== undefined
        ? p.storeStock[activeStore.id]
        : p.stock;
      return storeStock <= p.minStockAlert;
    });

    if (lowStockItems.length === 0) {
      alert(`No products are below minimum stock threshold at ${activeStore.name}!`);
      return;
    }

    const generatedItems = lowStockItems.map(p => ({
      productId: p.id,
      quantity: Math.max(10, p.minStockAlert * 3), // replenish to healthy buffer
      costPrice: p.costPrice
    }));

    setPoItems(generatedItems);
    setTargetStoreId(activeStore.id);
    setPoNotes(`Automated replenishment order for ${lowStockItems.length} low-stock items at ${activeStore.name}`);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplierId,
      storeId: targetStoreId,
      items: poItems.filter(i => i.quantity > 0),
      notes: poNotes
    });

    setIsModalOpen(false);
    setPoNotes('');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Supplier Purchase Orders & Restocking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Procure inventory replenishment from commercial vendors with automated expense logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 1-Click Auto Reorder */}
          <button
            onClick={handleAutoReorderLowStock}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 transition-colors shadow-sm"
            title="Auto-build replenishment PO for low stock items"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Reorder Low Stock</span>
          </button>

          <button
            onClick={() => {
              setPoItems([{ productId: products[0]?.id || '', quantity: 10, costPrice: products[0]?.costPrice || 50 }]);
              setPoNotes('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">PO Number</th>
              <th className="py-2.5 px-4 font-semibold">Date Ordered</th>
              <th className="py-2.5 px-4 font-semibold">Vendor / Supplier</th>
              <th className="py-2.5 px-4 font-semibold">Receiving Location</th>
              <th className="py-2.5 px-4 font-semibold">Items Ordered</th>
              <th className="py-2.5 px-4 font-semibold text-right">PO Total</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {purchaseOrders.map(po => {
              const isReceived = po.status === 'received';
              const totalUnits = po.items.reduce((sum, i) => sum + i.quantity, 0);

              return (
                <tr key={po.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {po.poNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {formatDateTime(po.orderDate)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    {po.supplierName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-emerald-300">{po.storeName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-medium">
                      {po.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {totalUnits} total units
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                        isReceived
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                          : 'text-indigo-300 bg-indigo-950/40 border border-indigo-800/40'
                      }`}
                    >
                      {isReceived ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Received</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>Ordered</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isReceived && (
                      <button
                        onClick={() => receivePurchaseOrder(po.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm transition-colors"
                        title="Accept shipment, restock store stock, and record expense"
                      >
                        Receive Goods →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Purchase Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-emerald-400" />
                <span>Issue Supplier Purchase Order</span>
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
                    Select Commercial Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name} ({sup.paymentTerms})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Receiving Store Location *
                  </label>
                  <select
                    value={targetStoreId}
                    onChange={e => setTargetStoreId(e.target.value)}
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
                    Line Items & Unit Cost
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line Item</span>
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <select
                      value={item.productId}
                      onChange={e => {
                        const p = products.find(prod => prod.id === e.target.value);
                        handleItemChange(idx, e.target.value, item.quantity, p ? p.costPrice : item.costPrice);
                      }}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-emerald-500 truncate"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, item.productId, parseInt(e.target.value, 10) || 1, item.costPrice)}
                        className="w-16 bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs text-center px-1.5 py-1.5 rounded outline-none tabular-nums"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Cost:</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.costPrice}
                        onChange={e => handleItemChange(idx, item.productId, item.quantity, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-slate-900 border border-slate-700 text-white font-mono text-xs text-right px-1.5 py-1.5 rounded outline-none tabular-nums"
                      />
                    </div>

                    <div className="w-20 text-right font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                      {formatCurrency(item.quantity * item.costPrice)}
                    </div>

                    {poItems.length > 1 && (
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

              {/* Total Calculation */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Purchase Commitment:</span>
                <span className="font-mono text-base font-bold text-white tabular-nums">
                  {formatCurrency(poItems.reduce((sum, i) => sum + i.quantity * i.costPrice, 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  PO Notes / Payment Terms
                </label>
                <input
                  type="text"
                  placeholder="e.g. Net 30 terms, delivery by Friday"
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
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
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
