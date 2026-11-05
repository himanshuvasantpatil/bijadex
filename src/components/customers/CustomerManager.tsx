import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Users, Plus, Search, X, Building, Phone, Mail } from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const { customers, addCustomer, setSelectedCustomer, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    taxId: '',
    address: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.taxId && c.taxId.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addCustomer(formData);
    setFormData({
      name: '',
      phone: '',
      email: '',
      taxId: '',
      address: '',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const handleStartBilling = (c: Customer) => {
    setSelectedCustomer(c);
    setActiveTab('pos');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Customer Accounts & Corporate Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage commercial client credit terms, GST/VAT tax identification, and purchasing history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, phone, Tax ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 pl-8 rounded-lg outline-none focus:border-emerald-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Grid of Customer Accounts */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCustomers.map(c => (
            <div
              key={c.id}
              className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-sm text-white truncate">{c.name}</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0">
                    Active
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {c.taxId && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Tax ID: {c.taxId}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {c.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Purchases</div>
                  <div className="text-sm font-bold font-mono text-white tabular-nums">
                    {formatCurrency(c.totalPurchases)}
                  </div>
                </div>

                <button
                  onClick={() => handleStartBilling(c)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded transition-colors"
                >
                  Bill Customer →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Create Customer Account
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
                  Full Customer / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Solutions Ltd."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 0192"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tax ID / GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. US-EIN-94-3829104"
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="accounts@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State, ZIP"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
