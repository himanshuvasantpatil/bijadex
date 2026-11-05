import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { 
  Search, 
  Receipt, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const InvoiceHistory: React.FC = () => {
  const { invoices, setSelectedInvoiceForPrint, refundInvoice } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'refunded'>('all');

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
      inv.paymentMethod.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefund = (invId: string, invNum: string) => {
    const reason = window.prompt(`Enter return/refund reason for ${invNum}:`);
    if (reason && reason.trim()) {
      refundInvoice(invId, reason.trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Sales Invoices & Transaction History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full audit trail of issued invoices, payments, and return reconciliations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 pl-8 rounded-lg outline-none focus:border-emerald-500 w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {(['all', 'completed', 'refunded'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium capitalize rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Invoice #</th>
              <th className="py-2.5 px-4 font-semibold">Date & Time</th>
              <th className="py-2.5 px-4 font-semibold">Customer</th>
              <th className="py-2.5 px-4 font-semibold text-center">Items</th>
              <th className="py-2.5 px-4 font-semibold">Payment</th>
              <th className="py-2.5 px-4 font-semibold text-right">Tax</th>
              <th className="py-2.5 px-4 font-semibold text-right">Grand Total</th>
              <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredInvoices.map(inv => {
              const isRefunded = inv.status === 'refunded';
              const itemCount = inv.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <tr key={inv.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] font-mono">
                    {formatDateTime(inv.date)}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-200 truncate max-w-[180px]">
                      {inv.customer?.name || 'Walk-in Retail Guest'}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono tabular-nums text-slate-300">
                    {itemCount}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[11px] uppercase text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                    {formatCurrency(inv.taxTotal)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                        isRefunded
                          ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                          : 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                      }`}
                    >
                      {isRefunded ? 'Refunded' : 'Completed'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        title="View & Print Receipt / Tax Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {!isRefunded && (
                        <button
                          onClick={() => handleRefund(inv.id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Process Return & Restock Inventory"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-300">No invoices match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
