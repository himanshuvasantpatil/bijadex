import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Plus, Trash2, Wallet, X } from 'lucide-react';

export const ExpenseManager: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManageExpenses = currentUser?.role === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [formData, setFormData] = useState({
    category: 'Packaging & Shipping' as Expense['category'],
    description: '',
    amount: 50.00,
    paymentMethod: 'Corporate Card *4821',
    receiptRef: ''
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.amount <= 0) return;

    addExpense({
      ...formData,
      date: new Date().toISOString()
    });

    setFormData({
      category: 'Packaging & Shipping',
      description: '',
      amount: 50.00,
      paymentMethod: 'Corporate Card *4821',
      receiptRef: ''
    });
    setIsModalOpen(false);
  };

  const categories: Expense['category'][] = [
    'Rent',
    'Utilities',
    'Salaries',
    'Packaging & Shipping',
    'Marketing',
    'Maintenance',
    'Software & Subscriptions',
    'Other'
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Operating Expenses & Overhead Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log overhead, utilities, packaging, and facility expenses that feed directly into P&L net income
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total OPEX Recorded</span>
            <div className="text-lg font-bold font-mono text-amber-300 tabular-nums">
              {formatCurrency(totalExpenses)}
            </div>
          </div>

          {canManageExpenses && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Date</th>
              <th className="py-2.5 px-4 font-semibold">Category</th>
              <th className="py-2.5 px-4 font-semibold">Description</th>
              <th className="py-2.5 px-4 font-semibold">Payment Method</th>
              <th className="py-2.5 px-4 font-semibold">Reference</th>
              <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {expenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors">
                <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                  {formatDateTime(exp.date)}
                </td>
                <td className="py-2.5 px-4">
                  <span className="text-xs font-medium text-slate-200">
                    {exp.category}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-300 font-medium max-w-xs truncate">
                  {exp.description}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                  {exp.paymentMethod}
                </td>
                <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                  {exp.receiptRef || '—'}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-300 tabular-nums">
                  {formatCurrency(exp.amount)}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {canManageExpenses ? (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this expense entry?')) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Delete Expense Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">View Only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Log Operating Expense
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expense Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly high-speed fiber internet"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Receipt / Invoice Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-8821"
                    value={formData.receiptRef}
                    onChange={e => setFormData({ ...formData, receiptRef: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
