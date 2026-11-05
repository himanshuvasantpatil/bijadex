import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { Coins, CheckCircle2, AlertCircle, Printer, RotateCcw, Lock, Unlock } from 'lucide-react';

export const RegisterShiftManager: React.FC = () => {
  const { activeShift, openShift, closeShift, activeStore } = useApp();

  const [openingFloatInput, setOpeningFloatInput] = useState('250.00');
  const [actualCashInput, setActualCashInput] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const float = parseFloat(openingFloatInput) || 0;
    openShift(float);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(actualCashInput) || 0;
    closeShift(counted, shiftNotes);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Cash Register Shift & Drawer Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift reconciliation, opening float control, and End-of-Day (Z-Report) cash drawer balancing
          </p>
        </div>

        {activeShift && activeShift.status === 'closed' && (
          <button
            onClick={handlePrintZReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Shift Z-Report</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          {/* Active Shift Card */}
          {activeShift && activeShift.status === 'open' ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-white">Active Shift in Progress</h2>
                    <p className="text-[11px] text-slate-400">
                      Opened at {formatDateTime(activeShift.openedAt)} · {activeStore.name}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  REGISTER OPEN
                </span>
              </div>

              {/* Shift Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Opening Cash Float</div>
                  <div className="text-lg font-bold text-white mt-1 tabular-nums">
                    {formatCurrency(activeShift.openingFloat)}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Cash Sales Accrued</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
                    {formatCurrency(activeShift.cashSales)}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected Cash in Drawer</div>
                  <div className="text-lg font-bold text-cyan-400 mt-1 tabular-nums">
                    {formatCurrency(activeShift.expectedCash)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex justify-between text-xs font-mono text-slate-300">
                <span>Card & Digital POS Sales:</span>
                <span className="font-bold text-white tabular-nums">{formatCurrency(activeShift.cardSales)}</span>
              </div>

              {/* Shift Close Form */}
              <form onSubmit={handleCloseShiftSubmit} className="pt-3 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Close Shift & Reconcile Physical Cash
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Actual Cash Counted in Drawer *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder={activeShift.expectedCash.toFixed(2)}
                      value={actualCashInput}
                      onChange={e => setActualCashInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500 tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Closing Shift Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. End of evening shift, exact count"
                      value={shiftNotes}
                      onChange={e => setShiftNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Close Register & Generate End-of-Day Z-Report</span>
                </button>
              </form>
            </div>
          ) : (
            /* Shift Closed or Need to Open New Shift */
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
              {/* Last Closed Summary if present */}
              {activeShift && activeShift.status === 'closed' && (
                <div id="printable-document" className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Last Shift Z-Report Summary
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Closed at {activeShift.closedAt ? formatDateTime(activeShift.closedAt) : 'N/A'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      CLOSED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Opening Cash Float:</span>
                      <span className="text-white tabular-nums">{formatCurrency(activeShift.openingFloat)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Total Cash Sales:</span>
                      <span className="text-white tabular-nums">{formatCurrency(activeShift.cashSales)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Expected in Drawer:</span>
                      <span className="text-white tabular-nums">{formatCurrency(activeShift.expectedCash)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Actual Cash Counted:</span>
                      <span className="text-white tabular-nums">{formatCurrency(activeShift.actualCashCounted || 0)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-xs">
                    <span className="font-semibold text-slate-300">Drawer Over / Short Variance:</span>
                    <span className={`font-bold tabular-nums text-sm ${
                      (activeShift.variance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {formatCurrency(activeShift.variance || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Open New Shift Form */}
              <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Open New Cash Register Shift</span>
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Opening Cash Float (Coins & Bills) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={openingFloatInput}
                    onChange={e => setOpeningFloatInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm px-3 py-2 rounded-lg outline-none focus:border-emerald-500 tabular-nums"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Cash placed in the register till before opening sales for change making
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Start New Register Shift
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
