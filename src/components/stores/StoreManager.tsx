import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store } from '../../types';
import { Store as StoreIcon, Plus, CheckCircle2, Edit3, Trash2, MapPin, Phone, User, X } from 'lucide-react';

export const StoreManager: React.FC = () => {
  const { 
    stores, 
    activeStoreId, 
    setActiveStoreId, 
    addStore, 
    updateStore, 
    deleteStore,
    invoices,
    products
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    manager: '',
    type: 'retail' as Store['type'],
    isActive: true,
    taxRegistrationNumber: '',
    notes: ''
  });

  const handleOpenAdd = () => {
    setStoreToEdit(null);
    setFormData({
      name: '',
      code: `STR-${stores.length + 1}`.toUpperCase(),
      address: '',
      phone: '',
      manager: '',
      type: 'retail',
      isActive: true,
      taxRegistrationNumber: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Store) => {
    setStoreToEdit(st);
    setFormData({
      name: st.name,
      code: st.code,
      address: st.address,
      phone: st.phone,
      manager: st.manager,
      type: st.type,
      isActive: st.isActive,
      taxRegistrationNumber: st.taxRegistrationNumber || '',
      notes: st.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (storeToEdit) {
      updateStore(storeToEdit.id, formData);
    } else {
      addStore(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-emerald-400" />
            <span>Multi-Store & Branch Locations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage physical retail outlets, warehouses, and regional fulfillment centers
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Grid of Stores */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(st => {
            const isCurrent = st.id === activeStoreId;
            const storeInvoices = invoices.filter(inv => inv.storeId === st.id);
            const storeRevenue = storeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

            // Compute total stock units at this store
            const storeStockTotal = products.reduce((sum, p) => {
              const count = p.storeStock && p.storeStock[st.id] !== undefined ? p.storeStock[st.id] : 0;
              return sum + count;
            }, 0);

            return (
              <div
                key={st.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{st.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                            ACTIVE POS
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Code: <span className="text-slate-200">{st.code}</span> · <span className="capitalize">{st.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="Edit Store"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {stores.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete store "${st.name}"?`)) {
                              deleteStore(st.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Manager: <strong className="text-slate-300">{st.manager}</strong></span>
                    </div>
                    {st.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{st.address}</span>
                      </div>
                    )}
                    {st.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{st.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance & Stock Stats Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Store Stock on Hand</div>
                    <div className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                      {storeStockTotal} units
                    </div>
                  </div>

                  {!isCurrent ? (
                    <button
                      onClick={() => setActiveStoreId(st.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
                    >
                      Switch to this Store →
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Current Terminal</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <StoreIcon className="w-4 h-4 text-emerald-400" />
                <span>{storeToEdit ? 'Edit Store Location' : 'Register New Store Branch'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store / Branch Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport Terminal Concourse B"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Store Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-03, WH-01"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Location Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as Store['type'] })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  >
                    <option value="retail">Retail Storefront</option>
                    <option value="warehouse">Central Warehouse</option>
                    <option value="outlet">Express Outlet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store Manager
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={formData.manager}
                  onChange={e => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Store Phone & Tax Registration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Phone: +1 (555) 0122"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Branch Tax ID"
                    value={formData.taxRegistrationNumber}
                    onChange={e => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Physical Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State/Province, Postal Code"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500 resize-none"
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
                  {storeToEdit ? 'Save Changes' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
