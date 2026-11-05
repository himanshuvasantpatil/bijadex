import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scan, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Database,
  RotateCcw,
  Store,
  Building2,
  ChevronDown,
  Globe
} from 'lucide-react';

export const DesktopHeader: React.FC = () => {
  const { 
    isSoundMuted, 
    toggleSoundMuted, 
    openScanner, 
    setIsShortcutsOpen,
    activeTab,
    exportDatabase,
    resetToDemoData,
    organization,
    stores,
    activeStoreId,
    setActiveStoreId,
    setIsOnboardingOpen
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeStore = stores.find(s => s.id === activeStoreId) || stores[0];

  const tabLabels: Record<string, string> = {
    pos: 'Point of Sale Terminal',
    inventory: 'Inventory & Multi-Store Stock',
    reports: 'Financial Reports & Accounting',
    invoices: 'Sales & Receipts Ledger',
    transfers: 'Inter-Store Transfers',
    purchases: 'Purchase Orders & Suppliers',
    shifts: 'Cash Register Shifts',
    expenses: 'Operating Expenses',
    customers: 'Customer Accounts & Loyalty',
    stores: 'Multi-Store Locations',
    labels: 'Barcode Label Studio',
    settings: 'Organization Settings'
  };

  return (
    <header className="flex items-center justify-between gap-6 px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-200 select-none shrink-0 z-20">
      {/* Zone 1: Organization & Multi-Store Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          onClick={() => setIsOnboardingOpen(true)}
          className="flex items-center gap-2 cursor-pointer group"
          title="Organization Settings"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 group-hover:bg-emerald-500 transition-colors flex items-center justify-center font-bold text-white text-xs tracking-wider shadow-sm">
            OS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap truncate max-w-[160px]">
              {organization.name || 'OmniStock ERP'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {organization.currency?.code || 'USD'} ({organization.currency?.symbol?.trim() || '$'})
            </span>
          </div>
        </div>

        {/* Multi-Store Fast Switcher Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            title="Switch Active Store Location"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[150px] font-semibold">{activeStore?.name}</span>
            <span className="text-[10px] font-mono text-slate-500">[{activeStore?.code}]</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isStoreMenuOpen && (
            <div 
              className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in duration-100"
              onMouseLeave={() => setIsStoreMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-800">
                Select Operating Store Location
              </div>
              {stores.map(st => {
                const isSelected = st.id === activeStoreId;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setActiveStoreId(st.id);
                      setIsStoreMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      isSelected ? 'bg-slate-800/80 text-emerald-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate">{st.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.code} · <span className="capitalize">{st.type}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">ACTIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Active Module Context */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap overflow-hidden">
        <span className="text-slate-200 font-medium">{tabLabels[activeTab] || 'Workspace'}</span>
        <span aria-hidden="true">·</span>
        <span className="text-emerald-400">Scanner Wedge Ready</span>
        <span aria-hidden="true">·</span>
        <span>Manager: {activeStore?.manager}</span>
      </div>

      {/* Zone 3: Hardware & Global System Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Real-time Barcode Scanner Launcher */}
        <button
          onClick={() => openScanner('pos')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 rounded-md hover:bg-emerald-900/60 transition-colors whitespace-nowrap shrink-0"
          title="Open Camera Barcode Scanner (Shortcut: F4)"
        >
          <Scan className="w-3.5 h-3.5 text-emerald-400" />
          <span>Scan [F4]</span>
        </button>

        {/* Database Export */}
        <button
          onClick={exportDatabase}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          title="Backup Enterprise Database (JSON Export)"
        >
          <Database className="w-4 h-4" />
        </button>

        {/* Reset to Demo */}
        <button
          onClick={() => {
            if (window.confirm('Reset local database to initial multi-store demo products, sales, and stores?')) {
              resetToDemoData();
            }
          }}
          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-md transition-colors"
          title="Reset to Demo Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Audio Mute / Unmute */}
        <button
          onClick={toggleSoundMuted}
          className={`p-1.5 rounded-md transition-colors ${
            isSoundMuted
              ? 'text-rose-400 hover:bg-rose-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isSoundMuted ? 'Scanner Audio Muted (Click to Unmute)' : 'Scanner Audio Enabled'}
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Shortcuts Help */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Live System Clock */}
        <div className="pl-2 border-l border-slate-800 text-xs font-mono font-medium text-slate-400 tabular-nums">
          {currentTime || '00:00:00'}
        </div>
      </div>
    </header>
  );
};
