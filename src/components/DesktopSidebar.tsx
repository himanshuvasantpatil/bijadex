import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  ShoppingCart,
  Boxes,
  BarChart3,
  Receipt,
  Wallet,
  Users,
  Barcode,
  Store,
  Truck,
  PackagePlus,
  Coins,
  Settings,
  AlertTriangle,
  Database,
  WifiOff
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey?: string;
  badge?: number | string;
  badgeColor?: string;
}

export const DesktopSidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    cart, 
    products, 
    activeStore, 
    stockTransfers, 
    purchaseOrders,
    isOnline,
    syncQueue,
    setIsSyncCenterOpen
  } = useApp();

  const pendingSyncCount = syncQueue.filter(i => i.status === 'pending' || i.status === 'failed').length;

  const lowStockCount = products.filter(p => {
    const stockAtStore = p.storeStock && p.storeStock[activeStore.id] !== undefined
      ? p.storeStock[activeStore.id]
      : p.stock;
    return stockAtStore <= p.minStockAlert;
  }).length;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeTransfers = stockTransfers.filter(t => t.status === 'in_transit').length;
  const pendingPOs = purchaseOrders.filter(p => p.status === 'ordered').length;

  const navItems: NavItem[] = [
    {
      id: 'pos',
      label: 'Billing & POS',
      icon: ShoppingCart,
      hotkey: 'F1',
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold'
    },
    {
      id: 'inventory',
      label: 'Inventory Control',
      icon: Boxes,
      hotkey: 'F2',
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    },
    {
      id: 'reports',
      label: 'Financial Reports',
      icon: BarChart3,
      hotkey: 'F3',
    },
    {
      id: 'invoices',
      label: 'Sales Receipts',
      icon: Receipt,
      hotkey: 'F5',
    },
    {
      id: 'transfers',
      label: 'Stock Transfers',
      icon: Truck,
      badge: activeTransfers > 0 ? activeTransfers : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
    },
    {
      id: 'purchases',
      label: 'Purchase Orders',
      icon: PackagePlus,
      badge: pendingPOs > 0 ? pendingPOs : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
    },
    {
      id: 'shifts',
      label: 'Register Shifts',
      icon: Coins,
    },
    {
      id: 'expenses',
      label: 'Expenses Ledger',
      icon: Wallet,
    },
    {
      id: 'customers',
      label: 'Customer Loyalty',
      icon: Users,
    },
    {
      id: 'stores',
      label: 'Store Locations',
      icon: Store,
    },
    {
      id: 'labels',
      label: 'Barcode Studio',
      icon: Barcode,
    },
    {
      id: 'settings',
      label: 'Settings & Setup',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-56 bg-slate-950/80 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="py-2.5 px-2 space-y-0.5">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Enterprise ERP
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded font-mono tabular-nums ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hotkey && (
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-1 py-0.5 rounded border border-slate-800/80">
                    {item.hotkey}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Branch Status Bar */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950">
        <div className="text-[11px] leading-tight">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Current Store Location</div>
          <div className="font-semibold text-emerald-300 truncate mt-0.5">{activeStore?.name}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {activeStore?.code} · {activeStore?.manager}
          </div>
        </div>

        {lowStockCount > 0 && (
          <div
            onClick={() => setActiveTab('inventory')}
            className="mt-2 flex items-center gap-1.5 p-1.5 bg-amber-950/30 border border-amber-900/40 rounded cursor-pointer hover:bg-amber-950/50 transition-colors text-[10px]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300 truncate">
              {lowStockCount} items low here
            </span>
          </div>
        )}

        {/* IndexedDB Local Engine & Sync Widget */}
        <button
          onClick={() => setIsSyncCenterOpen(true)}
          className={`mt-2 w-full flex items-center justify-between p-1.5 rounded border text-[10px] transition-colors cursor-pointer ${
            !isOnline
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-950/60'
              : pendingSyncCount > 0
              ? 'bg-blue-950/40 border-blue-800/50 text-blue-300 hover:bg-blue-950/60'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="IndexedDB Local Engine · Click to view Sync Center"
        >
          <div className="flex items-center gap-1.5 truncate">
            {!isOnline ? (
              <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
            ) : (
              <Database className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{!isOnline ? 'Offline Mode' : 'IndexedDB Local'}</span>
          </div>
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 shrink-0">
            {pendingSyncCount > 0 ? `${pendingSyncCount} queued` : 'Synced'}
          </span>
        </button>

        <div className="mt-2.5 pt-2 border-t border-slate-900 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium text-slate-400">Bijadex ERP</span>
            <a
              href="https://bijasa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] text-emerald-400 hover:text-emerald-300 hover:underline transition-colors cursor-pointer"
              title="Visit official website: bijasa.com"
            >
              bijasa.com
            </a>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500">
            <span>Support:</span>
            <a
              href="mailto:hello@bijasa.com"
              className="text-slate-400 hover:text-emerald-300 hover:underline transition-colors font-mono cursor-pointer"
              title="Send email to hello@bijasa.com"
            >
              hello@bijasa.com
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};
