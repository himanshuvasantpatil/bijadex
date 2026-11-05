import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { hasTabAccess } from '../../utils/rbac';
import { BijadexLogo } from '../brand/BijadexLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Boxes, 
  Smartphone, 
  BarChart3, 
  Receipt, 
  Truck, 
  PackagePlus, 
  Coins, 
  Wallet, 
  Users, 
  Store as StoreIcon, 
  Barcode, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Database,
  Wifi,
  WifiOff,
  Scan,
  Shield
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const MobileNavBar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    logoutUser,
    stores,
    activeStoreId,
    setActiveStoreId,
    isOnline,
    syncQueue,
    setIsSyncCenterOpen,
    openScanner
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false);

  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];
  const pendingSyncCount = syncQueue.filter(i => i.status === 'pending' || i.status === 'failed').length;

  const allNavItems: NavItem[] = [
    { id: 'pos', label: 'Billing & POS', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory Control', icon: Boxes },
    { id: 'handheld', label: 'Storeroom Handheld', icon: Smartphone },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'invoices', label: 'Sales Receipts', icon: Receipt },
    { id: 'transfers', label: 'Stock Transfers', icon: Truck },
    { id: 'purchases', label: 'Purchase Orders', icon: PackagePlus },
    { id: 'shifts', label: 'Register Shifts', icon: Coins },
    { id: 'expenses', label: 'Expenses Ledger', icon: Wallet },
    { id: 'customers', label: 'Customer Loyalty', icon: Users },
    { id: 'stores', label: 'Store Locations', icon: StoreIcon },
    { id: 'staff', label: 'Staff & RBAC', icon: Users },
    { id: 'labels', label: 'Barcode Studio', icon: Barcode },
    { id: 'settings', label: 'Settings & Setup', icon: Settings },
  ];

  const authorizedNavItems = allNavItems.filter(item => hasTabAccess(currentUser?.role, item.id));

  const handleTabSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-200 select-none shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Open Mobile Workspace Drawer"
          >
            {isOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <BijadexLogo size="sm" showByline={false} />

          {/* Active Store Indicator */}
          <div className="relative">
            <button
              onClick={() => setIsStoreSelectOpen(!isStoreSelectOpen)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-md text-[11px] font-semibold text-slate-200 max-w-[120px] truncate"
            >
              <StoreIcon className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{activeStore?.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isStoreSelectOpen && (
              <div 
                className="absolute left-0 top-full mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setIsStoreSelectOpen(false)}
              >
                <div className="px-3 py-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                  Switch Active Location
                </div>
                {stores.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setActiveStoreId(st.id);
                      setIsStoreSelectOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      st.id === activeStoreId ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{st.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">[{st.code}]</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton />

          <button
            onClick={() => openScanner('pos')}
            className="p-1.5 bg-emerald-950 border border-emerald-700/60 text-emerald-400 rounded-lg hover:bg-emerald-900 transition-colors"
            title="Scan Barcode Camera"
          >
            <Scan className="w-4 h-4" />
          </button>

          {currentUser && (
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-300 text-xs font-bold font-mono">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Sidebar Content */}
          <div className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 flex flex-col h-full z-50 animate-in slide-in-from-left duration-200 select-none">
            {/* Drawer Header & User IAM Card */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <BijadexLogo size="md" showByline={true} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentUser && (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 text-xs font-bold font-mono">
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-emerald-400 uppercase font-mono flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span>{currentUser.role}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logoutUser();
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="Switch User / Lock"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                Workspace Modules
              </div>

              {authorizedNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors ${
                      isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer: IndexedDB Sync & Enterprise Support */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 text-xs">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSyncCenterOpen(true);
                }}
                className="w-full flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isOnline ? 'IndexedDB Local Synced' : 'Offline Mode'}</span>
                </div>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded font-mono text-[9px]">
                    {pendingSyncCount} Q
                  </span>
                )}
              </button>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Bijadex by bijasa</span>
                <a
                  href="https://bijasa.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-mono"
                >
                  bijasa.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
