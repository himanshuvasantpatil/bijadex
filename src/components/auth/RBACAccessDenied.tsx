import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

interface Props {
  tab: NavigationTab;
}

const TAB_NAMES: Record<NavigationTab, string> = {
  pos: 'Billing & POS',
  inventory: 'Inventory Control',
  reports: 'Financial Reports',
  invoices: 'Sales Receipts',
  transfers: 'Stock Transfers',
  purchases: 'Purchase Orders',
  shifts: 'Register Shifts',
  expenses: 'Expenses Ledger',
  customers: 'Customer Loyalty',
  stores: 'Store Locations',
  staff: 'Staff & RBAC',
  labels: 'Barcode Studio',
  settings: 'Settings & Setup'
};

export const RBACAccessDenied: React.FC<Props> = ({ tab }) => {
  const { currentUser, setActiveTab, logoutUser } = useApp();

  const userRole = currentUser?.role?.toUpperCase() || 'CASHIER';

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900 p-6 select-none animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-300 border border-rose-800/60 px-3 py-1 rounded-full text-xs font-mono font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>ROLE RESTRICTION: {userRole}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight pt-2">
            Access Denied to "{TAB_NAMES[tab] || tab}"
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            Your current logged-in role (<strong className="text-slate-200">{currentUser?.name}</strong> as <strong className="text-amber-400">{userRole}</strong>) does not have authorization to view or execute operations in this workspace module.
          </p>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200 text-[11px] uppercase font-mono tracking-wider">Required Privileges:</div>
          <p className="text-[11px] text-slate-400">
            This module requires <strong className="text-emerald-400">STORE MANAGER</strong> or <strong className="text-purple-400">STORE OWNER</strong> authorization credentials.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Billing & POS</span>
          </button>

          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-amber-400" />
            <span>Switch User</span>
          </button>
        </div>
      </div>
    </div>
  );
};
